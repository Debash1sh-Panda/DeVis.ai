import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NOTIFICATION } from '@devis/shared';

@Processor(QUEUE_NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing notification job: ${job.id}`);
    // TODO: Telegram notification in Phase 8 (v0.3)
    return { status: 'processed' };
  }
}
