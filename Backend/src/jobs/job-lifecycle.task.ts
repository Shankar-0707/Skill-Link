import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Injectable()
export class JobLifecycleTask {
  private readonly logger = new Logger(JobLifecycleTask.name);

  constructor(private readonly jobsService: JobsService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleStaleJobs(): Promise<void> {
    this.logger.debug('Running stale job lifecycle check...');

    try {
      const count = await this.jobsService.cancelStaleOpenJobs();
      if (count > 0) {
        this.logger.log(`Cancelled ${count} stale open job(s)`);
      }
    } catch (err) {
      this.logger.error(`Stale job check failed: ${(err as Error).message}`);
    }
  }
}
