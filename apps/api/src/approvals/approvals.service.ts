import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    taskId: string;
    toolExecutionId: string;
    riskLevel: string;
    payloadJson: Record<string, unknown>;
    expiresInMinutes?: number;
  }) {
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data.payloadJson))
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes || 30));

    return this.prisma.approval.create({
      data: {
        taskId: data.taskId,
        toolExecutionId: data.toolExecutionId,
        riskLevel: data.riskLevel as any,
        payloadHash,
        payloadJson: data.payloadJson as any,
        status: 'PENDING' as any,
        expiresAt,
      },
    });
  }

  async findById(id: string, userId?: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: { task: true },
    });
    if (!approval) throw new NotFoundException(`Approval ${id} not found`);
    if (userId && approval.task.userId !== userId) {
      throw new NotFoundException(`Approval ${id} not found`);
    }
    return approval;
  }

  async approve(id: string, userId?: string) {
    const approval = await this.findById(id, userId);
    if (approval.status !== 'PENDING') throw new BadRequestException('Approval is not pending');
    if (new Date() > approval.expiresAt) throw new BadRequestException('Approval has expired');

    return this.prisma.approval.update({
      where: { id },
      data: { status: 'APPROVED' as any, approvedAt: new Date() },
    });
  }

  async reject(id: string, userId?: string) {
    const approval = await this.findById(id, userId);
    if (approval.status !== 'PENDING') throw new BadRequestException('Approval is not pending');

    return this.prisma.approval.update({
      where: { id },
      data: { status: 'REJECTED' as any, rejectedAt: new Date() },
    });
  }

  async findPendingByTask(taskId: string) {
    return this.prisma.approval.findMany({
      where: { taskId, status: 'PENDING' as any },
    });
  }
}
