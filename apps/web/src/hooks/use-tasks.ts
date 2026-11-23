'use client';

import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  });
}
