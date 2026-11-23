'use client';

import { useEffect, useRef } from 'react';
import { subscribeToUserTasks } from '@/lib/websocket';

/**
 * useTasksRealtime — Listens to real-time Socket.io events and updates tasks state instantly!
 * Replaces periodic polling with sub-millisecond push updates.
 */
export function useTasksRealtime(
  userId: string | undefined,
  setTasks: React.Dispatch<React.SetStateAction<any[]>>
) {
  const setTasksRef = useRef(setTasks);
  setTasksRef.current = setTasks;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = subscribeToUserTasks(userId, (event: string, data: any) => {
      if (!data) return;

      if (event === 'task.created') {
        setTasksRef.current((prev) => {
          if (prev.some((t) => t.id === data.id)) return prev;
          return [data, ...prev];
        });
      } else if (
        event === 'task.started' ||
        event === 'task.updated' ||
        event === 'task.completed' ||
        event === 'task.failed'
      ) {
        setTasksRef.current((prev) => {
          const idx = prev.findIndex((t) => t.id === data.id);
          if (idx === -1) {
            return [data, ...prev];
          }
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        });
      } else if (event === 'task.deleted') {
        const deletedId = data?.id || data;
        setTasksRef.current((prev) => prev.filter((t) => t.id !== deletedId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);
}
