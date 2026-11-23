export enum RiskLevel {
  SAFE = 'SAFE',
  CONFIRM = 'CONFIRM',
  CRITICAL = 'CRITICAL',
}

export type PermissionDecision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
