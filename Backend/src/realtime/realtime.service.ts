import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { REALTIME_EVENTS, RealtimeEvent } from './realtime.events';

type EligibleWorkerNotification = {
  jobId: string;
  offerId?: string;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  scheduledAt: Date | null;
  customerName?: string | null;
};

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server?: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, event: RealtimeEvent, payload: unknown) {
    this.server?.to(this.userRoom(userId)).emit(event, payload);
  }

  emitToUsers(userIds: string[], event: RealtimeEvent, payload: unknown) {
    const uniqueUserIds = Array.from(new Set(userIds));

    for (const userId of uniqueUserIds) {
      this.emitToUser(userId, event, payload);
    }
  }

  emitToRole(role: string, event: RealtimeEvent, payload: unknown) {
    this.server?.to(this.roleRoom(role)).emit(event, payload);
  }

  emitToJob(jobId: string, event: RealtimeEvent, payload: unknown) {
    this.server?.to(this.jobRoom(jobId)).emit(event, payload);
  }

  notifyEligibleWorkers(
    workerUserIds: string[],
    notification: EligibleWorkerNotification,
  ) {
    if (workerUserIds.length === 0) {
      this.logger.debug(`No eligible workers online for job ${notification.jobId}`);
      return;
    }

    this.emitToUsers(workerUserIds, REALTIME_EVENTS.JOB_NOTIFICATION, {
      ...notification,
      scheduledAt: notification.scheduledAt?.toISOString() ?? null,
    });
  }

  userRoom(userId: string) {
    return `user:${userId}`;
  }

  roleRoom(role: string) {
    return `role:${role}`;
  }

  workerRoom(workerId: string) {
    return `worker:${workerId}`;
  }

  customerRoom(customerId: string) {
    return `customer:${customerId}`;
  }

  jobRoom(jobId: string) {
    return `job:${jobId}`;
  }

  chatRoom(chatRoomId: string) {
    return `chat:${chatRoomId}`;
  }
}
