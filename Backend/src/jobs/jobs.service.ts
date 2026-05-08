import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycGateService } from '../kyc/kyc-gate.service';
import { PaymentsService } from '../payments/payments.service';
import { EscrowService } from '../escrow/escrow.service';
import { RealtimeService } from '../realtime/realtime.service';
import { REALTIME_EVENTS } from '../realtime/realtime.events';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobContractDto } from './dto/create-job-contract.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kycGate: KycGateService,
    private readonly paymentsService: PaymentsService,
    private readonly escrowService: EscrowService,
    private readonly realtime: RealtimeService,
  ) {}

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  /**
   * Resolves a User.id → Customer.id
   * Customer is a separate model linked to User via userId.
   */
  private async getCustomerId(userId: string): Promise<string> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer)
      throw new ForbiddenException('No customer profile found for this user');
    return customer.id;
  }

  /**
   * Resolves a User.id → Worker.id
   * Worker is a separate model linked to User via userId.
   */
  private async getWorkerId(userId: string): Promise<string> {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!worker)
      throw new ForbiddenException('No worker profile found for this user');
    return worker.id;
  }

  private normalizeSkill(value: string) {
    return value.toLowerCase().trim().replace(/s$/, '');
  }

  private async getEligibleWorkers(category: string) {
    const normalizedCategory = this.normalizeSkill(category);
    const workers = await this.prisma.worker.findMany({
      where: {
        isAvailable: true,
        kycStatus: 'VERIFIED',
        deletedAt: null,
        user: {
          isActive: true,
          isBlacklisted: false,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
        skills: true,
      },
    });

    return workers
      .filter((worker) =>
        worker.skills.some((skill) => {
          const normalizedSkill = this.normalizeSkill(skill);
          return (
            normalizedSkill.includes(normalizedCategory) ||
            normalizedCategory.includes(normalizedSkill)
          );
        }),
      )
      .map((worker) => ({ workerId: worker.id, userId: worker.userId }));
  }

  private buildContractTemplate(params: {
    jobTitle: string;
    customerName?: string | null;
    workerName?: string | null;
    cost: number;
    timing: string;
    scheduledAt: Date;
    scope: string;
    notes?: string;
  }) {
    const date = params.scheduledAt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return [
      `Skill-Link Job Contract`,
      `Job: ${params.jobTitle}`,
      `Customer: ${params.customerName || 'Customer'}`,
      `Worker: ${params.workerName || 'Worker'}`,
      `Cost: Rs ${params.cost.toLocaleString('en-IN')}`,
      `Date and time: ${date}`,
      `Timing details: ${params.timing}`,
      `Scope: ${params.scope}`,
      params.notes ? `Notes: ${params.notes}` : null,
      `The job can start only after the worker accepts this contract.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // ─────────────────────────────────────────────
  // JOB POSTING
  // ─────────────────────────────────────────────

  /**
   * Customer creates a new job.
   * Resolves User → Customer, then creates Job with status POSTED.
   */
  async createJob(userId: string, dto: CreateJobDto) {
    const customerId = await this.getCustomerId(userId);
    const eligibleWorkers = await this.getEligibleWorkers(dto.category);

    // Block if there are unpaid completed jobs
    const unpaidCompletedJob = await this.prisma.job.findFirst({
      where: {
        customerId,
        status: 'COMPLETED',
        escrow: null,
      },
    });

    if (unpaidCompletedJob) {
      throw new BadRequestException(
        'You have an unpaid completed job. Please pay for it before creating a new one.'
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          customerId,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          budget: dto.budget ?? null,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          budget: true,
          status: true,
          scheduledAt: true,
          createdAt: true,
          customer: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      });

      if (eligibleWorkers.length > 0) {
        await tx.jobOffer.createMany({
          data: eligibleWorkers.map((worker) => ({
            jobId: job.id,
            workerId: worker.workerId,
          })),
          skipDuplicates: true,
        });
      }

      return job;
    });

    const offers = await this.prisma.jobOffer.findMany({
      where: { jobId: result.id },
      select: {
        id: true,
        worker: { select: { userId: true } },
      },
    });

    for (const offer of offers) {
      this.realtime.notifyEligibleWorkers([offer.worker.userId], {
        offerId: offer.id,
        jobId: result.id,
        title: result.title,
        description: result.description,
        category: result.category,
        budget: result.budget,
        scheduledAt: result.scheduledAt,
        customerName: result.customer.user.name,
      });
    }

    this.realtime.emitToUser(userId, REALTIME_EVENTS.JOB_CREATED, {
      jobId: result.id,
      title: result.title,
      eligibleWorkerCount: offers.length,
    });

    const { customer, ...job } = result;
    return job;
  }

  /**
   * Returns all jobs posted by the logged-in customer.
   * Includes assigned worker's basic info if present.
   */
  async getMyJobs(userId: string) {
    const customerId = await this.getCustomerId(userId);

    return this.prisma.job.findMany({
      where: {
        customerId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        budget: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        worker: {
          select: {
            id: true,
            user: {
              select: { id: true, name: true, phone: true, profileImage: true },
            },
          },
        },
        offers: {
          select: {
            id: true,
            status: true,
            workerId: true,
            chatRoom: { select: { id: true } },
            worker: {
              select: {
                id: true,
                skills: true,
                ratingAvg: true,
                ratingCount: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
        contracts: {
          select: {
            id: true,
            workerId: true,
            status: true,
            cost: true,
            scheduledAt: true,
          },
        },
      },
    });
  }

  /**
   * Returns full details of a job.
   * Access: only the customer who posted it OR the assigned worker.
   */
  async getJobById(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      include: {
        customer: {
          select: {
            id: true,
            user: { select: { id: true, phone: true, profileImage: true } },
          },
        },
        worker: {
          select: {
            id: true,
            skills: true,
            ratingAvg: true,
            user: { select: { id: true, phone: true, profileImage: true } },
          },
        },
        offers: {
          select: {
            id: true,
            status: true,
            respondedAt: true,
            workerId: true,
            chatRoom: { select: { id: true } },
            worker: {
              select: {
                id: true,
                skills: true,
                ratingAvg: true,
                ratingCount: true,
                experience: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        contracts: {
          select: {
            id: true,
            workerId: true,
            cost: true,
            timing: true,
            scheduledAt: true,
            scope: true,
            notes: true,
            template: true,
            status: true,
            sentAt: true,
            acceptedAt: true,
            rejectedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        escrow: {
          select: { id: true, amount: true, status: true },
        },
      },
    });

    if (!job) throw new NotFoundException('Job not found');

    // Ensure access:
    // 1. The customer who posted it
    // 2. The assigned worker
    // 3. Any verified worker if the job is still POSTED (open for discovery)
    const isCustomer = job.customer.user.id === userId;
    const isAssignedWorker = job.worker?.user.id === userId;
    const isOpenJob = job.status === 'POSTED';

    if (!isCustomer && !isAssignedWorker && !isOpenJob)
      throw new ForbiddenException('You do not have access to this job');

    return job;
  }

  /**
   * Customer updates a job.
   * Only allowed while status = POSTED.
   */
  async updateJob(jobId: string, userId: string, dto: UpdateJobDto) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');
    if (job.status !== 'POSTED')
      throw new BadRequestException('Only POSTED jobs can be edited');

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
        ...(dto.scheduledAt !== undefined && {
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        budget: true,
        status: true,
        scheduledAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Customer soft-deletes (cancels) a job.
   * Only allowed while status = POSTED (not yet assigned).
   */
  async cancelJob(jobId: string, userId: string) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');
    if (job.status !== 'POSTED')
      throw new BadRequestException(
        'Only POSTED jobs can be cancelled. Contact support for assigned jobs.',
      );

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        deletedAt: new Date(),
      },
    });
  }

  // ─────────────────────────────────────────────
  // JOB DISCOVERY — Worker
  // ─────────────────────────────────────────────

  /**
   * Returns all open (POSTED) jobs — visible to all workers.
   */
  async getAvailableJobs() {
    return this.prisma.job.findMany({
      where: {
        status: 'POSTED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        budget: true,
        scheduledAt: true,
        createdAt: true,
        // expose customer's public info only
        customer: {
          select: {
            user: { select: { profileImage: true } },
          },
        },
      },
    });
  }

  /**
   * Returns open jobs filtered by category.
   */
  async getAvailableJobsByCategory(category: string) {
    return this.prisma.job.findMany({
      where: {
        category,
        status: 'POSTED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        budget: true,
        scheduledAt: true,
        createdAt: true,
        customer: {
          select: {
            user: { select: { profileImage: true } },
          },
        },
      },
    });
  }

  /**
   * Returns all jobs assigned to the logged-in worker.
   */
  async getMyAssignments(userId: string) {
    const workerId = await this.getWorkerId(userId);

    return this.prisma.job.findMany({
      where: {
        workerId,
        deletedAt: null,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        budget: true,
        status: true,
        scheduledAt: true,
        updatedAt: true,
        customer: {
          select: {
            user: { select: { phone: true, profileImage: true } },
          },
        },
        escrow: {
          select: { amount: true, status: true },
        },
      },
    });
  }

  // ─────────────────────────────────────────────
  // JOB LIFECYCLE
  // ─────────────────────────────────────────────

  async getMyJobOffers(userId: string) {
    const workerId = await this.getWorkerId(userId);

    return this.prisma.jobOffer.findMany({
      where: {
        workerId,
        job: { deletedAt: null, status: 'POSTED' },
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        respondedAt: true,
        createdAt: true,
        chatRoom: { select: { id: true } },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            budget: true,
            scheduledAt: true,
            createdAt: true,
            customer: {
              select: {
                user: {
                  select: { id: true, name: true, profileImage: true },
                },
              },
            },
            contracts: {
              where: { workerId },
              select: {
                id: true,
                cost: true,
                timing: true,
                scheduledAt: true,
                scope: true,
                notes: true,
                template: true,
                status: true,
                sentAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  async getJobOffers(jobId: string, userId: string) {
    const customerId = await this.getCustomerId(userId);
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      select: { customerId: true },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');

    return this.prisma.jobOffer.findMany({
      where: { jobId },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        status: true,
        respondedAt: true,
        createdAt: true,
        chatRoom: { select: { id: true } },
        worker: {
          select: {
            id: true,
            skills: true,
            experience: true,
            ratingAvg: true,
            ratingCount: true,
            user: {
              select: { id: true, name: true, phone: true, profileImage: true },
            },
          },
        },
      },
    });
  }

  async acceptJobOffer(jobId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    // Try to find existing offer, or find the job to create an offer on the fly
    let offer = await this.prisma.jobOffer.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            customerId: true,
            customer: { select: { userId: true } },
          },
        },
        worker: { select: { user: { select: { name: true } } } },
      },
    });

    if (!offer) {
      // If no offer exists, the worker is discovering the job via search/browsing
      const job = await this.prisma.job.findUnique({
        where: { id: jobId, deletedAt: null },
        include: {
          customer: { select: { userId: true } },
        },
      });

      if (!job) throw new NotFoundException('Job not found');
      if (job.status !== 'POSTED')
        throw new BadRequestException('This job is no longer open');

      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        include: { user: { select: { name: true } } },
      });
      if (!worker) throw new NotFoundException('Worker profile not found');

      // Create the offer record on the fly
      offer = (await this.prisma.jobOffer.create({
        data: {
          jobId,
          workerId,
          status: 'PENDING',
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              customerId: true,
              customer: { select: { userId: true } },
            },
          },
          worker: { select: { user: { select: { name: true } } } },
        },
      })) as any;
    }

    if (!offer) throw new NotFoundException('Job offer not found');

    if (offer.job.status !== 'POSTED')
      throw new BadRequestException('This job is no longer open');
    if (offer.status === 'REJECTED')
      throw new BadRequestException('You already rejected this job');

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.jobOffer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
        select: {
          id: true,
          status: true,
          jobId: true,
          workerId: true,
        },
      });

      const chatRoom = await tx.chatRoom.upsert({
        where: { jobId_workerId: { jobId, workerId } },
        create: {
          jobId,
          workerId,
          customerId: offer.job.customerId,
          jobOfferId: offer.id,
        },
        update: { jobOfferId: offer.id },
        select: { id: true },
      });

      return { ...updatedOffer, chatRoom };
    });

    this.realtime.emitToUser(
      offer.job.customer.userId,
      REALTIME_EVENTS.JOB_OFFER_ACCEPTED,
      {
        jobId,
        offerId: offer.id,
        workerId,
        workerName: offer.worker.user.name,
      },
    );

    return result;
  }

  async rejectJobOffer(jobId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    let offer = await this.prisma.jobOffer.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
      include: {
        job: { select: { customer: { select: { userId: true } } } },
      },
    });

    if (!offer) {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId, deletedAt: null },
        select: { customer: { select: { userId: true } } },
      });
      if (!job) throw new NotFoundException('Job not found');

      // Create the offer record on the fly so we can mark it as REJECTED
      offer = (await this.prisma.jobOffer.create({
        data: { jobId, workerId, status: 'PENDING' },
        include: {
          job: { select: { customer: { select: { userId: true } } } },
        },
      })) as any;
    }

    if (!offer) throw new NotFoundException('Job offer not found');

    if (offer.status !== 'PENDING')
      throw new BadRequestException('Only pending offers can be rejected');

    const updatedOffer = await this.prisma.jobOffer.update({
      where: { id: offer.id },
      data: { status: 'REJECTED', respondedAt: new Date() },
      select: { id: true, status: true, jobId: true, workerId: true },
    });

    this.realtime.emitToUser(
      offer.job.customer.userId,
      REALTIME_EVENTS.JOB_OFFER_REJECTED,
      { jobId, offerId: offer.id, workerId },
    );

    return updatedOffer;
  }

  async getChatRoomsForJob(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      select: {
        customer: { select: { userId: true } },
        worker: { select: { userId: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');

    const isCustomer = job.customer.userId === userId;
    const workerId = isCustomer ? null : await this.getWorkerId(userId);

    return this.prisma.chatRoom.findMany({
      where: {
        jobId,
        ...(isCustomer ? {} : { workerId: workerId ?? undefined }),
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        jobId: true,
        workerId: true,
        worker: {
          select: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
        customer: {
          select: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            senderUserId: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getChatMessages(chatRoomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        OR: [{ customer: { userId } }, { worker: { userId } }],
      },
      select: { id: true },
    });

    if (!chatRoom)
      throw new ForbiddenException('You do not have access to this chat');

    return this.prisma.chatMessage.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        chatRoomId: true,
        senderUserId: true,
        message: true,
        createdAt: true,
        sender: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async createContract(
    jobId: string,
    workerId: string,
    userId: string,
    dto: CreateJobContractDto,
  ) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      include: {
        customer: { select: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');
    if (job.status !== 'POSTED')
      throw new BadRequestException('Contracts can only be sent for open jobs');

    // Prevent sending multiple active contracts to different workers
    const activeContract = await this.prisma.jobContract.findFirst({
      where: {
        jobId,
        status: 'SENT',
        workerId: { not: workerId },
      },
    });

    if (activeContract) {
      throw new BadRequestException(
        'You already have an active contract sent to another worker for this job. You must wait for them to reject it or withdraw it before sending a contract to another worker.',
      );
    }

    const offer = await this.prisma.jobOffer.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
      include: {
        worker: {
          select: {
            userId: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!offer || offer.status !== 'ACCEPTED')
      throw new BadRequestException(
        'The worker must accept the job request before you can send a contract',
      );

    const scheduledAt = new Date(dto.scheduledAt);
    const template = this.buildContractTemplate({
      jobTitle: job.title,
      customerName: job.customer.user.name,
      workerName: offer.worker.user.name,
      cost: dto.cost,
      timing: dto.timing,
      scheduledAt,
      scope: dto.scope,
      notes: dto.notes,
    });

    const contract = await this.prisma.jobContract.upsert({
      where: { jobId_workerId: { jobId, workerId } },
      create: {
        jobId,
        workerId,
        customerId,
        cost: dto.cost,
        timing: dto.timing,
        scheduledAt,
        scope: dto.scope,
        notes: dto.notes,
        template,
      },
      update: {
        cost: dto.cost,
        timing: dto.timing,
        scheduledAt,
        scope: dto.scope,
        notes: dto.notes,
        template,
        status: 'SENT',
        sentAt: new Date(),
        acceptedAt: null,
        rejectedAt: null,
      },
    });

    this.realtime.emitToUser(
      offer.worker.userId,
      REALTIME_EVENTS.JOB_CONTRACT_SENT,
      { jobId, workerId, contractId: contract.id },
    );

    return contract;
  }

  async acceptContract(contractId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    const contract = await this.prisma.jobContract.findUnique({
      where: { id: contractId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            customer: { select: { userId: true } },
          },
        },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.workerId !== workerId)
      throw new ForbiddenException('This contract is not assigned to you');
    if (contract.status !== 'SENT')
      throw new BadRequestException('Only sent contracts can be accepted');
    if (contract.job.status !== 'POSTED')
      throw new BadRequestException('This job is no longer open');

    const result = await this.prisma.$transaction(async (tx) => {
      const acceptedContract = await tx.jobContract.update({
        where: { id: contractId },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      const updatedJob = await tx.job.update({
        where: { id: contract.jobId },
        data: {
          workerId,
          status: 'ASSIGNED',
          budget: acceptedContract.cost,
          scheduledAt: acceptedContract.scheduledAt,
        },
        select: {
          id: true,
          title: true,
          status: true,
          workerId: true,
          budget: true,
          scheduledAt: true,
        },
      });

      await tx.worker.update({
        where: { id: workerId },
        data: { isAvailable: false },
      });

      await tx.jobOffer.updateMany({
        where: {
          jobId: contract.jobId,
          workerId: { not: workerId },
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        data: { status: 'WITHDRAWN' },
      });

      await tx.jobContract.updateMany({
        where: {
          jobId: contract.jobId,
          workerId: { not: workerId },
          status: 'SENT',
        },
        data: { status: 'CANCELLED' },
      });

      return { contract: acceptedContract, job: updatedJob };
    });

    this.realtime.emitToUser(
      contract.job.customer.userId,
      REALTIME_EVENTS.JOB_CONTRACT_ACCEPTED,
      { jobId: contract.jobId, workerId, contractId },
    );
    this.realtime.emitToUser(userId, REALTIME_EVENTS.JOB_CONTRACT_ACCEPTED, {
      jobId: contract.jobId,
      workerId,
      contractId,
    });

    return result;
  }

  async rejectContract(contractId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    const contract = await this.prisma.jobContract.findUnique({
      where: { id: contractId },
      include: {
        job: { select: { customer: { select: { userId: true } } } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.workerId !== workerId)
      throw new ForbiddenException('This contract is not assigned to you');
    if (contract.status !== 'SENT')
      throw new BadRequestException('Only sent contracts can be rejected');

    const updatedContract = await this.prisma.jobContract.update({
      where: { id: contractId },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });

    this.realtime.emitToUser(
      contract.job.customer.userId,
      REALTIME_EVENTS.JOB_CONTRACT_REJECTED,
      { jobId: contract.jobId, workerId, contractId },
    );

    return updatedContract;
  }

  /**
   * Customer assigns a worker to their POSTED job.
   * Validates:
   *   - Job exists and belongs to this customer
   *   - Job is still POSTED
   *   - Target worker exists and is verified
   * Side effect: creates Escrow record with status HELD.
   */
  async assignWorker(jobId: string, workerId: string, userId: string) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');
    if (job.status !== 'POSTED')
      throw new BadRequestException(
        'Job is no longer available for assignment',
      );

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, isAvailable: true },
    });

    if (!worker) throw new NotFoundException('Worker not found');
    if (!worker.isAvailable)
      throw new BadRequestException('This worker is currently unavailable');

    await this.kycGate.assertWorkerKycVerified(workerId);

    return this.prisma.$transaction(async (tx) => {
      // Assign worker and move job to ASSIGNED
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          workerId,
          status: 'ASSIGNED',
        },
        select: {
          id: true,
          title: true,
          status: true,
          budget: true,
          workerId: true,
        },
      });

      // Mark worker as unavailable
      await tx.worker.update({
        where: { id: workerId },
        data: { isAvailable: false },
      });

      // NOTE: Escrow is created by the payment webhook (simulatePaymentSuccess),
      // NOT here. Only create if there was no budget (free job).
      // If budget exists, customer should have already paid via mock checkout.

      return updatedJob;
    });
  }

  /**
   * Worker marks assigned job as started.
   * Job status: ASSIGNED → IN_PROGRESS
   */
  async startJob(jobId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.workerId !== workerId)
      throw new ForbiddenException('You are not assigned to this job');
    if (job.status !== 'ASSIGNED')
      throw new BadRequestException('Job must be in ASSIGNED status to start');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'IN_PROGRESS' },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Worker marks job as completed.
   * Job status: IN_PROGRESS → COMPLETED
   * Escrow stays HELD until customer confirms.
   */
  async completeJob(jobId: string, userId: string) {
    const workerId = await this.getWorkerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.workerId !== workerId)
      throw new ForbiddenException('You are not assigned to this job');
    if (job.status !== 'IN_PROGRESS')
      throw new BadRequestException('Job must be IN_PROGRESS to mark complete');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Customer confirms job completion.
   * Releases escrow: HELD → RELEASED.
   * Creates a Payment record for the worker payout.
   */
  async confirmJobCompletion(jobId: string, userId: string) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      include: { escrow: true },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');
    if (job.status !== 'COMPLETED')
      throw new BadRequestException(
        'Worker must mark the job complete before you can confirm',
      );

    return this.prisma.$transaction(async (tx) => {
      // Release escrow → worker virtual wallet credited via EscrowService
      if (job.escrow) {
        await this.escrowService.releaseEscrow(job.escrow.id, tx);
      }

      // Make worker available again
      if (job.workerId) {
        await tx.worker.update({
          where: { id: job.workerId },
          data: { isAvailable: true },
        });
      }

      // Cleanup temporary negotiation data (no longer needed after payment)
      // Deletion order: ChatMessage → ChatRoom → JobContract (FK constraints)
      await tx.chatMessage.deleteMany({
        where: { chatRoom: { jobId } },
      });
      await tx.chatRoom.deleteMany({
        where: { jobId },
      });
      await tx.jobContract.deleteMany({
        where: { jobId },
      });

      return {
        message: 'Job confirmed. Escrow released to worker wallet.',
        jobId,
        escrowReleased: !!job.escrow,
      };
    });
  }

  /**
   * Customer initiates payment for a job.
   * Typically called when the job is COMPLETED or during contract negotiation.
   */
  async createJobPayment(jobId: string, userId: string) {
    const customerId = await this.getCustomerId(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      include: { escrow: true },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId)
      throw new ForbiddenException('You do not own this job');

    if (job.escrow) {
      throw new BadRequestException('This job already has an active payment or has been completed.');
    }

    // Cleanup any existing failed/stale payment records for this jobId to avoid unique constraint error
    await this.prisma.payment.deleteMany({
      where: {
        jobId: job.id,
        status: { not: 'SUCCESS' }
      }
    });

    const budget = job.budget;
    if (!budget || budget <= 0) {
      throw new BadRequestException('Job has no budget set');
    }

    const paymentOrder = await this.paymentsService.createPaymentOrder({
      userId,
      amount: budget,
      type: 'JOB',
      jobId: job.id,
    });

    return {
      checkoutUrl: paymentOrder.checkoutUrl,
      providerPaymentId: paymentOrder.providerPaymentId,
      amount: budget,
    };
  }
}
