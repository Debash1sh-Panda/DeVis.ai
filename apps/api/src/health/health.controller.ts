import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
    ]);
  }
}
