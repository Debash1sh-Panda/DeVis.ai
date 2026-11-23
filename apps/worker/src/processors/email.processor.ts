import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_EMAIL } from '@devis/shared';

@Processor(QUEUE_EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing email job: ${job.id}`);
    // TODO: Gmail API integration in Phase 3 (v0.3)
    return { status: 'processed' };
  }
}
