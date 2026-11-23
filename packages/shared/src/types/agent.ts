import { RiskLevel } from '../enums/risk-level';

export interface AgentPlan {
  taskId: string;
  steps: AgentStep[];
  reasoning: string;
}

export interface AgentStep {
  stepNumber: number;
  toolName: string;
  arguments: Record<string, unknown>;
  riskLevel: RiskLevel;
  reasoning: string;
}

export interface AgentToolCall {
  type: 'TOOL_CALL';
  tool: string;
  arguments: Record<string, unknown>;
}

export interface AgentFinalResponse {
  type: 'FINAL';
  message: string;
}

export type AgentDecision = AgentToolCall | AgentFinalResponse;

export interface AgentContext {
  taskId: string;
  userId: string;
  userRequest: string;
  currentStep: number;
  previousResults: Array<{
    tool: string;
    result: unknown;
  }>;
  availableTools: string[];
  memories: string[];
}
