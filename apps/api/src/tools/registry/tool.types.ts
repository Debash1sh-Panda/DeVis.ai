import { RiskLevel } from '../../permissions/risk.types';

export interface AgentTool<TInput = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  inputSchema: Record<string, unknown>;
  execute(input: TInput, context: ToolContext): Promise<TResult>;
}

export interface ToolContext {
  taskId: string;
  userId: string;
  stepId: string;
}
