import { Injectable, Logger } from '@nestjs/common';
import { ContextService } from './context.service';
import { PlannerService } from './planner.service';
import { ExecutorService } from './executor.service';
import { ToolRegistryService } from '../tools/registry/tool-registry.service';
import { AgentToolCall } from '@devis/shared';

/**
 * AgentService — the main orchestration loop.
 * User Request → Context → LLM Plan → Permission Check → Tool Execute → Loop
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private context: ContextService,
    private planner: PlannerService,
    private executor: ExecutorService,
    private registry: ToolRegistryService,
  ) {}

  async run(taskId: string, userId: string): Promise<string> {
    this.logger.log(`Starting agent loop for task: ${taskId}`);

    for (let step = 0; step < 20; step++) {
      // Build context for this step
      const ctx = await this.context.build(taskId, userId);
      ctx.availableTools = this.registry.getDescriptionsForAI().map(t => t.name);

      // Ask AI what to do next
      const decision = await this.planner.decide(ctx);

      if (decision.type === 'FINAL') {
        this.logger.log(`Task ${taskId} completed: ${decision.message}`);
        return decision.message;
      }

      // Execute the tool call
      const toolCall = decision as AgentToolCall;
      const { result, requiresApproval } = await this.executor.execute(
        toolCall,
        userId,
        taskId,
        `step-${step}`,
      );

      if (requiresApproval) {
        // Approval flow — task pauses, waiting for user approval via Telegram/web
        this.logger.log(`Task ${taskId} waiting for approval on tool: ${toolCall.tool}`);
        return `WAITING_APPROVAL:${toolCall.tool}`;
      }

      this.logger.log(`Step ${step} completed with tool: ${toolCall.tool}`);
    }

    return 'Max steps reached';
  }
}
