import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task (text or voice command)' })
  create(@Request() req: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current user' })
  findAll(@Request() req: any) {
    return this.tasksService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task with its steps and approvals' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.findById(id, req.user.userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running or queued task' })
  cancel(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.cancel(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.delete(id, req.user.userId);
  }
}
