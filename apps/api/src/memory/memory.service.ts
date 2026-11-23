import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MemoryService {
  constructor(private prisma: PrismaService) {}

  async store(userId: string, type: string, content: string, metadata?: Record<string, unknown>) {
    return this.prisma.memory.create({
      data: {
        userId,
        type,
        content,
        metadataJson: (metadata ?? null) as any,
        importance: 0.5,
      },
    });
  }

  async search(userId: string, query: string, limit = 10) {
    // Basic text search — pgvector semantic search will be added in Phase 11
    return this.prisma.memory.findMany({
      where: {
        userId,
        content: { contains: query, mode: 'insensitive' },
      },
      orderBy: { importance: 'desc' },
      take: limit,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.memory.delete({ where: { id } });
  }
}
