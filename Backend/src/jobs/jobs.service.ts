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
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kycGate: KycGateService,
    private readonly paymentsService: PaymentsService,
    private readonly escrowService: EscrowService,
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

  // ─────────────────────────────────────────────
  // JOB POSTING
  // ─────────────────────────────────────────────

  /**
   * Customer creates a new job.
   * Resolves User → Customer, then creates Job with status POSTED.
   */
  async createJob(userId: string, dto: CreateJobDto) {
    console.log(userId);
    const customerId = await this.getCustomerId(userId);

    return this.prisma.$transaction(async (tx) => {
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
        },
      });

      // If a budget is set, create a payment order so customer can pay via mock checkout
      if (dto.budget && dto.budget > 0) {
        const paymentOrder = await this.paymentsService.createPaymentOrder({
          userId,
          amount: dto.budget,
          type: 'JOB',
          jobId: job.id,
        }, tx);

        return {
          ...job,
          checkoutUrl: paymentOrder.checkoutUrl,
          providerPaymentId: paymentOrder.providerPaymentId,
        };
      }

      return job;
    });
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
            user: { select: { id: true, phone: true, profileImage: true } },
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

      return {
        message: 'Job confirmed. Escrow released to worker wallet.',
        jobId,
        escrowReleased: !!job.escrow,
      };
    });
  }
}
