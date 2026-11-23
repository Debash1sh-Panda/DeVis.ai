import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: string;
    taskId?: string;
    toolExecutionId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        toolExecutionId: data.toolExecutionId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadataJson: (data.metadata ?? null) as any,
      },
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
