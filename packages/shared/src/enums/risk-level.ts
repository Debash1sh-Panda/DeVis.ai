export enum RiskLevel {
  /** No confirmation needed — safe read/open actions */
  SAFE = 'SAFE',
  /** Confirmation may be required based on user policy */
  CONFIRM = 'CONFIRM',
  /** Always requires explicit user approval */
  CRITICAL = 'CRITICAL',
}
