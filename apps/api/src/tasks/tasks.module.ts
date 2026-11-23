import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { BrowserAutomationService } from './browser-automation.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, BrowserAutomationService],
  exports: [TasksService, BrowserAutomationService],
})
export class TasksModule {}
