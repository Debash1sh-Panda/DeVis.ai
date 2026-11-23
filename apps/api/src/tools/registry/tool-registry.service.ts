import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentTool } from './tool.types';
import { RiskLevel } from '../../permissions/risk.types';

/**
 * ToolRegistryService maintains all registered tools.
 * The AI model sees tool descriptions; the server validates every call again.
 */
@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool) {
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered tool: ${tool.name} [${tool.riskLevel}]`);
  }

  get(name: string): AgentTool {
    const tool = this.tools.get(name);
    if (!tool) throw new NotFoundException(`Tool not found: ${name}`);
    return tool;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  /** Returns tool descriptions for the AI context */
  getDescriptionsForAI(allowedTools?: string[]): Array<{ name: string; description: string; riskLevel: RiskLevel }> {
    return Array.from(this.tools.values())
      .filter(t => !allowedTools || allowedTools.includes(t.name))
      .map(t => ({ name: t.name, description: t.description, riskLevel: t.riskLevel }));
  }

  getAll() {
    return Array.from(this.tools.values());
  }
}
