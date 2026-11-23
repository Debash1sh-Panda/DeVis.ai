import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_DESKTOP } from '@devis/shared';

@Processor(QUEUE_DESKTOP)
export class DesktopProcessor extends WorkerHost {
  private readonly logger = new Logger(DesktopProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing desktop job: ${job.id}`);
    // TODO: Desktop controller integration in Phase 7 (v0.5)
    return { status: 'processed' };
  }
}
