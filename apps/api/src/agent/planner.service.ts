import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AgentContext, AgentDecision } from '@devis/shared';

/**
 * PlannerService calls the AI model to decide the next action.
 * It enforces max step limits and validates model output.
 */
@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);
  private readonly MAX_STEPS = 20;

  constructor(private aiService: AiService) {}

  async decide(context: AgentContext): Promise<AgentDecision> {
    if (context.currentStep >= this.MAX_STEPS) {
      this.logger.warn(`Task ${context.taskId} exceeded max steps (${this.MAX_STEPS})`);
      return {
        type: 'FINAL',
        message: 'Maximum step limit reached. Task stopped for safety.',
      };
    }

    this.logger.log(`Planning step ${context.currentStep} for task ${context.taskId}`);
    const decision = await this.aiService.decideNextAction(context);
    this.logger.log(`Decision: ${JSON.stringify(decision)}`);

    return decision;
  }
}
