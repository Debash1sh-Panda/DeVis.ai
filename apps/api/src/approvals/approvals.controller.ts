import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'approvals', version: '1' })
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.findById(id, req.user.userId);
  }

  @Post(':id/approve')
  approve(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.approve(id, req.user.userId);
  }

  @Post(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.approvalsService.reject(id, req.user.userId);
  }
}
