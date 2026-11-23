import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { WS_EVENTS } from '@devis/shared';

@Injectable()
export class RealtimeService {
  constructor(private gateway: RealtimeGateway) {}

  emitTaskCreated(userId: string, taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TASK_CREATED, taskId, data);
    this.gateway.emitToUser(WS_EVENTS.TASK_CREATED, userId, data);
  }

  emitTaskStarted(userId: string, taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TASK_STARTED, taskId, data);
    this.gateway.emitToUser(WS_EVENTS.TASK_STARTED, userId, data);
  }

  emitTaskUpdated(userId: string, taskId: string, data: unknown) {
    this.gateway.emit('task.updated', taskId, data);
    this.gateway.emitToUser('task.updated', userId, data);
  }

  emitToolStarted(taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TOOL_STARTED, taskId, data);
  }

  emitToolCompleted(taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TOOL_COMPLETED, taskId, data);
  }

  emitApprovalRequired(taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.APPROVAL_REQUIRED, taskId, data);
  }

  emitTaskCompleted(userId: string, taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TASK_COMPLETED, taskId, data);
    this.gateway.emitToUser(WS_EVENTS.TASK_COMPLETED, userId, data);
  }

  emitTaskFailed(userId: string, taskId: string, data: unknown) {
    this.gateway.emit(WS_EVENTS.TASK_FAILED, taskId, data);
    this.gateway.emitToUser(WS_EVENTS.TASK_FAILED, userId, data);
  }

  emitTaskDeleted(userId: string, taskId: string) {
    this.gateway.emit('task.deleted', taskId, { id: taskId });
    this.gateway.emitToUser('task.deleted', userId, { id: taskId });
  }
}
