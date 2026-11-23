import { Injectable } from '@nestjs/common';

/**
 * PolicyService determines if a specific tool requires explicit user approval
 * for the CONFIRM risk level (SAFE is auto-approved, CRITICAL is always approved).
 */
@Injectable()
export class PolicyService {
  /** Tools in CONFIRM risk level that always need user approval */
  private readonly defaultApprovalRequired = new Set([
    'download_file',
    'create_calendar_event',
    'delete_file',
    'change_settings',
  ]);

  requiresApproval(toolName: string, _userId: string): boolean {
    // Default policy: check if the tool is in the approval-required set
    // In future: load per-user policies from DB
    return this.defaultApprovalRequired.has(toolName);
  }
}
