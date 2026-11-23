import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_AGENT } from '@devis/shared';

@Processor(QUEUE_AGENT)
export class AgentProcessor extends WorkerHost {
  private readonly logger = new Logger(AgentProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing agent job: ${job.id} — Task: ${job.data.taskId}`);
    // TODO: call AgentService.run(taskId, userId) in Phase 4
    return { status: 'processed' };
  }
}
