import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AgentContext } from '@devis/shared';

/**
 * ContextService assembles the agent context from:
 * - User request
 * - Current task state
 * - Previous step results
 * - Relevant memory (future: pgvector similarity search)
 * - Available tools list
 */
@Injectable()
export class ContextService {
  constructor(private prisma: PrismaService) {}

  async build(taskId: string, userId: string): Promise<AgentContext> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
          include: { toolExecutions: true },
        },
      },
    });

    if (!task) throw new Error(`Task ${taskId} not found`);

    // Build previous results from completed steps
    const previousResults = task.steps
      .filter(s => s.status === 'COMPLETED')
      .map(s => ({
        tool: s.toolName,
        result: s.outputJson,
      }));

    return {
      taskId,
      userId,
      userRequest: task.inputText,
      currentStep: task.currentStep,
      previousResults,
      availableTools: [], // will be populated by AgentService
      memories: [], // will be populated from MemoryService
    };
  }
}
