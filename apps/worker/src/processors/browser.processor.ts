import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_BROWSER } from '@devis/shared';

@Processor(QUEUE_BROWSER)
export class BrowserProcessor extends WorkerHost {
  private readonly logger = new Logger(BrowserProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing browser job: ${job.id}`);
    // TODO: use Playwright to execute browser actions in Phase 6
    return { status: 'processed' };
  }
}
