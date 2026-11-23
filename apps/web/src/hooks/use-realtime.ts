'use client';

import { useEffect, useRef } from 'react';
import { subscribeToTask } from '@/lib/websocket';

export function useRealtime(taskId: string | null, onEvent: (event: string, data: unknown) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!taskId) return;

    const unsubscribe = subscribeToTask(taskId, (event, data) => {
      onEventRef.current(event, data);
    });

    return unsubscribe;
  }, [taskId]);
}
