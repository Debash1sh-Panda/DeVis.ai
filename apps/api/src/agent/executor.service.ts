import { Injectable, Logger } from '@nestjs/common';
import { ToolRegistryService } from '../tools/registry/tool-registry.service';
import { PermissionService } from '../permissions/permission.service';
import { AgentToolCall } from '@devis/shared';
import { RiskLevel } from '../permissions/risk.types';

/**
 * ExecutorService validates tool calls against the registry + permission engine,
 * then executes the approved tool.
 */
@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  constructor(
    private registry: ToolRegistryService,
    private permissionService: PermissionService,
  ) {}

  async execute(
    call: AgentToolCall,
    userId: string,
    taskId: string,
    stepId: string,
  ): Promise<{ result: unknown; requiresApproval: boolean }> {
    // 1. Validate tool exists
    const tool = this.registry.get(call.tool);

    // 2. Check permissions
    const decision = this.permissionService.evaluate(call.tool, tool.riskLevel as RiskLevel, userId);

    if (decision === 'DENY') {
      throw new Error(`Tool ${call.tool} is denied for user ${userId}`);
    }

    if (decision === 'REQUIRE_APPROVAL') {
      this.logger.log(`Tool ${call.tool} requires approval for task ${taskId}`);
      return { result: null, requiresApproval: true };
    }

    // 3. Execute (SAFE or approved CONFIRM)
    this.logger.log(`Executing tool: ${call.tool}`);
    const result = await tool.execute(call.arguments, { taskId, userId, stepId });

    return { result, requiresApproval: false };
  }
}
