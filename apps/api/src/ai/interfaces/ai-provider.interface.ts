import { AgentContext, AgentDecision } from '@devis/shared';

/**
 * AIProvider interface — all AI backends must implement this.
 * The Agent service depends on this interface, not a concrete provider.
 */
export interface AIProvider {
  /**
   * Given the current agent context, decide the next action:
   * either a structured tool call or a final response.
   */
  decideNextAction(context: AgentContext): Promise<AgentDecision>;
}
