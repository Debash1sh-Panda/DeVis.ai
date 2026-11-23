import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001') + '/realtime';
    socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to DeVis.ai Realtime WebSocket:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from DeVis.ai Realtime WebSocket:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('Realtime WebSocket connection error:', err.message);
    });
  }
  return socket;
}

/**
 * Subscribes to all real-time events for a specific task.
 */
export function subscribeToTask(taskId: string, onEvent: (event: string, data: unknown) => void) {
  const s = getSocket();
  s.emit('join-task', taskId);

  const events = [
    'task.created',
    'task.started',
    'task.step.started',
    'task.updated',
    'tool.started',
    'tool.completed',
    'approval.required',
    'approval.approved',
    'approval.rejected',
    'task.completed',
    'task.failed',
    'task.deleted',
  ];

  const listeners = events.map((event) => {
    const fn = (data: unknown) => onEvent(event, data);
    s.on(event, fn);
    return { event, fn };
  });

  return () => {
    listeners.forEach(({ event, fn }) => s.off(event, fn));
  };
}

/**
 * Subscribes to all task lifecycle events for the current authenticated user.
 * Replaces periodic HTTP polling with instant push notifications!
 */
export function subscribeToUserTasks(
  userId: string | undefined,
  onEvent: (event: string, data: any) => void
) {
  const s = getSocket();

  if (userId) {
    s.emit('join-user', userId);
  }

  const events = [
    'task.created',
    'task.started',
    'task.step.started',
    'task.updated',
    'task.completed',
    'task.failed',
    'task.deleted',
  ];

  const listeners = events.map((event) => {
    const fn = (data: any) => {
      onEvent(event, data);
    };
    s.on(event, fn);
    return { event, fn };
  });

  return () => {
    listeners.forEach(({ event, fn }) => s.off(event, fn));
  };
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
