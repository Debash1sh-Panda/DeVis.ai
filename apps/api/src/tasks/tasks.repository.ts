import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    inputText: string;
    inputType: string;
    priority?: string;
  }) {
    return this.prisma.task.create({
      data: {
        userId: data.userId,
        inputText: data.inputText,
        inputType: data.inputType as any,
        priority: (data.priority || 'NORMAL') as any,
        status: 'CREATED',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { steps: { include: { toolExecutions: true } }, approvals: true },
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.task.findMany({
      where: { userId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async update(id: string, data: Partial<{
    status: any;
    startedAt: Date;
    completedAt: Date;
    error: string;
    currentStep: number;
  }>) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async createStep(data: {
    taskId: string;
    stepNumber: number;
    toolName: string;
    inputJson: any;
    outputJson?: any;
    status: any;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    return this.prisma.taskStep.create({
      data,
    });
  }

  async cancel(id: string) {
    return this.updateStatus(id, 'CANCELLED');
  }
}
