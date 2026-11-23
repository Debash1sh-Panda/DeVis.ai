import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { PlannerService } from './planner.service';
import { ExecutorService } from './executor.service';
import { ContextService } from './context.service';
import { ToolsModule } from '../tools/tools.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { AiModule } from '../ai/ai.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    ToolsModule,
    PermissionsModule,
    ApprovalsModule,
    AiModule,
    MemoryModule,
  ],
  providers: [AgentService, PlannerService, ExecutorService, ContextService],
  exports: [AgentService],
})
export class AgentModule {}
