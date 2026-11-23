import { TaskStatus, TaskInputType, TaskPriority } from '../enums/task-status';

export interface Task {
  id: string;
  userId: string;
  inputText: string;
  inputType: TaskInputType;
  status: TaskStatus;
  priority: TaskPriority;
  currentStep: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface TaskStep {
  id: string;
  taskId: string;
  stepNumber: number;
  toolName: string;
  inputJson: Record<string, unknown>;
  outputJson?: Record<string, unknown>;
  status: TaskStatus;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ToolExecution {
  id: string;
  taskStepId: string;
  toolName: string;
  argumentsJson: Record<string, unknown>;
  resultJson?: Record<string, unknown>;
  status: string;
  idempotencyKey: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateTaskDto {
  input: string;
  inputType: TaskInputType;
  priority?: TaskPriority;
}
