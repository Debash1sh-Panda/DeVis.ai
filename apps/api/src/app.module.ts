import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AgentModule } from './agent/agent.module';
import { AiModule } from './ai/ai.module';
import { ToolsModule } from './tools/tools.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { MemoryModule } from './memory/memory.module';
import { QueuesModule } from './queues/queues.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Configuration (must be first)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      // Look for .env in the monorepo root first, then api/ as fallback
      envFilePath: [
        require('path').resolve(__dirname, '../../..', '.env'),  // root .env
        require('path').resolve(__dirname, '../..', '.env'),     // apps/api/.env
        '.env',                                                   // cwd fallback
      ],
    }),

    // Core infrastructure
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
    AgentModule,
    AiModule,
    ToolsModule,
    PermissionsModule,
    ApprovalsModule,
    MemoryModule,
    QueuesModule,
    RealtimeModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
