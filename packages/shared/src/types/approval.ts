import { ApprovalStatus } from '../enums/approval-status';
import { RiskLevel } from '../enums/risk-level';

export interface Approval {
  id: string;
  taskId: string;
  toolExecutionId: string;
  riskLevel: RiskLevel;
  payloadHash: string;
  payloadJson: Record<string, unknown>;
  status: ApprovalStatus;
  expiresAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface ApprovalPayload {
  tool: string;
  arguments: Record<string, unknown>;
}
