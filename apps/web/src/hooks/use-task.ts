'use client';

import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
    refetchInterval: 3000, // poll for status updates until WebSocket is wired
  });
}
