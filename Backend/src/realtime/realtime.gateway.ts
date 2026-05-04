import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { REALTIME_EVENTS } from './realtime.events';
import { RealtimeService } from './realtime.service';

type AuthenticatedSocket = Socket & {
  data: {
    user?: JwtPayload;
    customerId?: string;
    workerId?: string;
  };
};

type JoinJobPayload = {
  jobId?: string;
};

type ChatSendPayload = {
  chatRoomId?: string;
  message?: string;
  tempId?: string;
};

type JoinChatPayload = {
  chatRoomId?: string;
};

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
    this.logger.log('Socket.IO gateway ready');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = await this.authenticate(client);
      client.data.user = user;

      client.join(this.realtime.userRoom(user.sub));
      client.join(this.realtime.roleRoom(user.role));

      if (user.role === Role.CUSTOMER) {
        const customer = await this.prisma.customer.findUnique({
          where: { userId: user.sub },
          select: { id: true },
        });
        if (customer) {
          client.data.customerId = customer.id;
          client.join(this.realtime.customerRoom(customer.id));
        }
      }

      if (user.role === Role.WORKER) {
        const worker = await this.prisma.worker.findUnique({
          where: { userId: user.sub },
          select: { id: true },
        });
        if (worker) {
          client.data.workerId = worker.id;
          client.join(this.realtime.workerRoom(worker.id));
        }
      }

      client.emit(REALTIME_EVENTS.CONNECTED, {
        userId: user.sub,
        role: user.role,
      });
    } catch (error) {
      client.emit(REALTIME_EVENTS.SOCKET_ERROR, {
        message:
          error instanceof Error ? error.message : 'Socket authentication failed',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage(REALTIME_EVENTS.JOB_JOIN)
  async joinJob(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinJobPayload,
  ) {
    const jobId = payload.jobId;
    if (!jobId || !client.data.user) {
      return { ok: false };
    }

    const canAccess = await this.canAccessJobRoom(jobId, client.data.user.sub);
    if (!canAccess) {
      return { ok: false };
    }

    client.join(this.realtime.jobRoom(jobId));
    return { ok: true };
  }

  @SubscribeMessage(REALTIME_EVENTS.JOB_LEAVE)
  leaveJob(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinJobPayload,
  ) {
    if (payload.jobId) {
      client.leave(this.realtime.jobRoom(payload.jobId));
    }
    return { ok: true };
  }

  @SubscribeMessage(REALTIME_EVENTS.CHAT_SEND)
  async sendChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ChatSendPayload,
  ) {
    const user = client.data.user;
    const chatRoomId = payload.chatRoomId;
    const message = payload.message?.trim();

    if (!user || !chatRoomId || !message) {
      return { ok: false };
    }

    const chatRoom = await this.getAccessibleChatRoom(chatRoomId, user.sub);
    if (!chatRoom) {
      return { ok: false };
    }

    const savedMessage = await this.prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderUserId: user.sub,
        message,
      },
      select: {
        id: true,
        chatRoomId: true,
        senderUserId: true,
        message: true,
        createdAt: true,
      },
    });

    const chatMessage = {
      ...savedMessage,
      tempId: payload.tempId ?? randomUUID(),
      jobId: chatRoom.jobId,
      senderRole: user.role,
      createdAt: savedMessage.createdAt.toISOString(),
    };

    this.server
      .to(this.realtime.chatRoom(chatRoomId))
      .emit(REALTIME_EVENTS.CHAT_MESSAGE, chatMessage);
    return { ok: true, message: chatMessage };
  }

  @SubscribeMessage(REALTIME_EVENTS.CHAT_JOIN)
  async joinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinChatPayload,
  ) {
    const user = client.data.user;
    const chatRoomId = payload.chatRoomId;

    if (!user || !chatRoomId) {
      return { ok: false };
    }

    const chatRoom = await this.getAccessibleChatRoom(chatRoomId, user.sub);
    if (!chatRoom) {
      return { ok: false };
    }

    client.join(this.realtime.chatRoom(chatRoomId));
    return { ok: true };
  }

  @SubscribeMessage(REALTIME_EVENTS.CHAT_LEAVE)
  leaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinChatPayload,
  ) {
    if (payload.chatRoomId) {
      client.leave(this.realtime.chatRoom(payload.chatRoomId));
    }
    return { ok: true };
  }

  private async authenticate(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      throw new UnauthorizedException('Missing socket auth token');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'replace-this-access-secret',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isActive: true,
        deletedAt: true,
        isBlacklisted: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt || user.isBlacklisted) {
      throw new UnauthorizedException('Socket user is not allowed');
    }

    return payload;
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' && token ? token : null;
  }

  private async canAccessJobRoom(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      select: {
        status: true,
        customer: { select: { userId: true } },
        worker: { select: { userId: true } },
        offers: {
          where: {
            status: 'ACCEPTED',
            worker: { userId },
          },
          select: { id: true },
        },
      },
    });

    if (!job) {
      return false;
    }

    return (
      job.customer.userId === userId ||
      job.worker?.userId === userId ||
      job.offers.length > 0
    );
  }

  private async getAccessibleChatRoom(chatRoomId: string, userId: string) {
    return this.prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        OR: [{ customer: { userId } }, { worker: { userId } }],
      },
      select: {
        id: true,
        jobId: true,
      },
    });
  }
}
