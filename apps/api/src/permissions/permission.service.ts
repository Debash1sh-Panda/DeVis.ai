import { Injectable } from '@nestjs/common';
import { RiskLevel, PermissionDecision } from './risk.types';
import { PolicyService } from './policy.service';

@Injectable()
export class PermissionService {
  constructor(private policy: PolicyService) {}

  /**
   * Given a tool risk level and user ID, decide whether to allow, require approval, or deny.
   * SAFE → ALLOW
   * CONFIRM → REQUIRE_APPROVAL (based on policy)
   * CRITICAL → REQUIRE_APPROVAL always
   */
  evaluate(toolName: string, riskLevel: RiskLevel, userId: string): PermissionDecision {
    if (riskLevel === RiskLevel.SAFE) return 'ALLOW';
    if (riskLevel === RiskLevel.CRITICAL) return 'REQUIRE_APPROVAL';

    // CONFIRM level — check user policy
    const requiresApproval = this.policy.requiresApproval(toolName, userId);
    return requiresApproval ? 'REQUIRE_APPROVAL' : 'ALLOW';
  }
}
