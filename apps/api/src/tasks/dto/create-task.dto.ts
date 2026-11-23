import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskInputTypeDto {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
}

export enum TaskPriorityDto {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Open YouTube and search Node.js streams' })
  @IsString()
  input: string;

  @ApiProperty({ enum: TaskInputTypeDto, default: TaskInputTypeDto.TEXT })
  @IsEnum(TaskInputTypeDto)
  @IsOptional()
  inputType?: TaskInputTypeDto = TaskInputTypeDto.TEXT;

  @ApiProperty({ enum: TaskPriorityDto, default: TaskPriorityDto.NORMAL })
  @IsEnum(TaskPriorityDto)
  @IsOptional()
  priority?: TaskPriorityDto = TaskPriorityDto.NORMAL;
}
