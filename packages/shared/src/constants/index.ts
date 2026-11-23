// API versioning
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Task limits
export const MAX_TASK_STEPS = 20;
export const MAX_TASK_EXECUTION_TIME_MS = 5 * 60 * 1000; // 5 minutes
export const APPROVAL_EXPIRY_MINUTES = 30;

// Queue names
export const QUEUE_AGENT = 'agent-planning';
export const QUEUE_BROWSER = 'browser-jobs';
export const QUEUE_DESKTOP = 'desktop-jobs';
export const QUEUE_EMAIL = 'email-jobs';
export const QUEUE_VOICE = 'voice-jobs';
export const QUEUE_NOTIFICATION = 'notification-jobs';

// Redis key patterns
export const REDIS_KEYS = {
  agentTask: (taskId: string) => `agent:task:${taskId}`,
  approval: (approvalId: string) => `approval:${approvalId}`,
  rateUser: (userId: string) => `rate:user:${userId}`,
  lockTask: (taskId: string) => `lock:task:${taskId}`,
  taskProgress: (taskId: string) => `task:progress:${taskId}`,
} as const;

// WebSocket events
export const WS_EVENTS = {
  TASK_CREATED: 'task.created',
  TASK_STARTED: 'task.started',
  TASK_STEP_STARTED: 'task.step.started',
  TOOL_STARTED: 'tool.started',
  TOOL_COMPLETED: 'tool.completed',
  APPROVAL_REQUIRED: 'approval.required',
  APPROVAL_APPROVED: 'approval.approved',
  APPROVAL_REJECTED: 'approval.rejected',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
} as const;
