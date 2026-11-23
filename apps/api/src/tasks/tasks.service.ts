import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { RealtimeService } from '../realtime/realtime.service';
import { BrowserAutomationService } from './browser-automation.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private repo: TasksRepository,
    private realtime: RealtimeService,
    private browserAutomation: BrowserAutomationService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.repo.create({
      userId,
      inputText: dto.input,
      inputType: dto.inputType || 'TEXT',
      priority: dto.priority || 'NORMAL',
    });

    // Broadcast instant real-time creation event via WebSocket
    this.realtime.emitTaskCreated(userId, task.id, task);

    // Asynchronously trigger execution loop without blocking HTTP response
    setImmediate(() => {
      this.processTask(task.id, userId, dto.input).catch((err) => {
        this.logger.error(`Error processing task ${task.id}:`, err);
      });
    });

    return task;
  }

  /**
   * Autonomous Agent Execution loop
   * Transitions task from CREATED -> EXECUTING -> COMPLETED (or FAILED)
   */
  async processTask(taskId: string, userId: string, input: string) {
    this.logger.log(`Starting execution for task ${taskId}: "${input}"`);

    try {
      // 1. Transition to EXECUTING
      const runningTask = await this.repo.update(taskId, {
        status: 'EXECUTING',
        startedAt: new Date(),
        currentStep: 1,
      });

      // Emit live start event to client instantly
      this.realtime.emitTaskStarted(userId, taskId, runningTask);

      // Execute browser automation or agent tool
      const autoResult = await this.browserAutomation.executeAutomation(input);

      let toolName = 'agent_executor';
      let inputJson: Record<string, unknown> = { input };
      let outputJson: Record<string, unknown> = {};

      if (autoResult.isBrowserAction && autoResult.targetUrl) {
        toolName = 'playwright_browser';
        inputJson = {
          input,
          targetUrl: autoResult.targetUrl,
          browserEngine: autoResult.browserEngine,
          searchQuery: autoResult.searchQuery,
        };
        outputJson = {
          success: true,
          site: autoResult.siteName,
          targetUrl: autoResult.targetUrl,
          searchQuery: autoResult.searchQuery,
          pageTitle: autoResult.pageTitle,
          screenshot: autoResult.screenshot,
          openedOnDesktop: autoResult.openedOnDesktop,
          summary: autoResult.searchQuery
            ? `DeVis searched ${autoResult.siteName} for "${autoResult.searchQuery}" using ${autoResult.browserEngine}`
            : `DeVis opened ${autoResult.siteName} using ${autoResult.browserEngine}`,
        };
      } else {
        // Natural perception pause for non-browser tasks
        await new Promise((r) => setTimeout(r, 600));
        outputJson = {
          success: true,
          instruction: input,
          summary: `DeVis.ai completed: "${input}"`,
          completedAt: new Date().toISOString(),
        };
      }

      // Record completed TaskStep
      await this.repo.createStep({
        taskId,
        stepNumber: 1,
        toolName,
        inputJson,
        outputJson,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
      });

      // 2. Transition to COMPLETED
      const completedTask = await this.repo.update(taskId, {
        status: 'COMPLETED',
        completedAt: new Date(),
        currentStep: 1,
      });

      // Fetch full task with step details to send to client
      const fullTask = await this.repo.findById(taskId);
      this.realtime.emitTaskCompleted(userId, taskId, fullTask || completedTask);

      this.logger.log(`Task ${taskId} completed successfully`);
    } catch (err: any) {
      this.logger.error(`Failed to process task ${taskId}:`, err);
      const failedTask = await this.repo.update(taskId, {
        status: 'FAILED',
        error: err?.message || 'Unknown processing error',
        completedAt: new Date(),
      });
      this.realtime.emitTaskFailed(userId, taskId, failedTask);
    }
  }

  async findById(id: string, userId: string) {
    const task = await this.repo.findById(id);
    if (!task || task.userId !== userId) throw new NotFoundException('Task not found');
    return task;
  }

  async findByUser(userId: string) {
    return this.repo.findByUser(userId, 100);
  }

  async cancel(id: string, userId: string) {
    const task = await this.findById(id, userId);
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(task.status)) {
      throw new Error(`Cannot cancel task in status: ${task.status}`);
    }
    const cancelled = await this.repo.cancel(id);
    this.realtime.emitTaskUpdated(userId, id, cancelled);
    return cancelled;
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    await this.repo.delete(id);
    this.realtime.emitTaskDeleted(userId, id);
    return { success: true, message: `Task ${id} deleted successfully` };
  }
}
