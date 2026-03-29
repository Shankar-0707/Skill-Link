import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { MockAuthGuard } from '../common/guards/mock-auth.guard';
import { RolesGuard } from '../common/guards/roles.guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ─────────────────────────────────────────────
  // WORKER — Job Discovery
  // ─────────────────────────────────────────────

  /**
   * GET /jobs/available
   * Worker browses all open (POSTED) jobs.
   */
  @Get('available')
  @Roles('WORKER')
  getAvailableJobs() {
    return this.jobsService.getAvailableJobs();
  }

  /**
   * GET /jobs/available/category/:category
   * Worker filters open jobs by skill category.
   */
  @Get('available/category/:category')
  @Roles('WORKER')
  getAvailableJobsByCategory(@Param('category') category: string) {
    return this.jobsService.getAvailableJobsByCategory(category);
  }

  /**
   * GET /jobs/my-assignments
   * Worker views all jobs currently assigned to them.
   */
  @Get('my-assignments')
  @Roles('WORKER')
  getMyAssignments(@CurrentUser('sub') userId: string) {
    return this.jobsService.getMyAssignments(userId);
  }

  // ─────────────────────────────────────────────
  // CUSTOMER — Job Posting
  // ─────────────────────────────────────────────

  /**
   * POST /jobs
   * Customer creates a new job posting.
   * Status defaults to POSTED.
   */
  @Post()
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.CREATED)
  createJob(@CurrentUser('sub') userId: string, @Body() dto: CreateJobDto) {
    console.log(userId);
    return this.jobsService.createJob(userId, dto);
  }

  /**
   * GET /jobs/my
   * Customer views all their own job postings.
   */
  @Get('my')
  @Roles('CUSTOMER')
  getMyJobs(@CurrentUser('sub') userId: string) {
    return this.jobsService.getMyJobs(userId);
  }

  /**
   * GET /jobs/:id
   * Get full details of a single job.
   * Accessible by the customer who posted it and the assigned worker.
   */
  @Get(':id')
  @Roles('CUSTOMER', 'WORKER')
  getJobById(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.getJobById(jobId, userId);
  }

  /**
   * PATCH /jobs/:id
   * Customer edits a job — only allowed while status = POSTED.
   * title, description, category, budget, scheduledAt are editable.
   */
  @Patch(':id')
  @Roles('CUSTOMER')
  updateJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(jobId, userId, dto);
  }

  /**
   * DELETE /jobs/:id
   * Customer cancels a job — only allowed while status = POSTED.
   */
  @Delete(':id')
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancelJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.cancelJob(jobId, userId);
  }

  // ─────────────────────────────────────────────
  // JOB LIFECYCLE — Status Transitions
  // ─────────────────────────────────────────────

  /**
   * PATCH /jobs/:id/assign/:workerId
   * Customer directly assigns a worker to their job.
   * Job status: POSTED → ASSIGNED
   * Side effect: creates Escrow record with status HELD.
   */
  @Patch(':id/assign/:workerId')
  @Roles('CUSTOMER')
  assignWorker(
    @Param('id', ParseUUIDPipe) jobId: string,
    @Param('workerId', ParseUUIDPipe) workerId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.assignWorker(jobId, workerId, userId);
  }

  /**
   * PATCH /jobs/:id/start
   * Assigned worker marks the job as started.
   * Job status: ASSIGNED → IN_PROGRESS
   */
  @Patch(':id/start')
  @Roles('WORKER')
  startJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.startJob(jobId, userId);
  }

  /**
   * PATCH /jobs/:id/complete
   * Worker marks job as done — awaiting customer confirmation.
   * Job status: IN_PROGRESS → COMPLETED
   */
  @Patch(':id/complete')
  @Roles('WORKER')
  completeJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.completeJob(jobId, userId);
  }

  /**
   * PATCH /jobs/:id/confirm
   * Customer confirms job is done.
   * Escrow: HELD → RELEASED
   * Creates Payment record (type: 'JOB_PAYOUT') for the worker.
   */
  @Patch(':id/confirm')
  @Roles('CUSTOMER')
  confirmJob(
    @Param('id', ParseUUIDPipe) jobId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.jobsService.confirmJobCompletion(jobId, userId);
  }
}
