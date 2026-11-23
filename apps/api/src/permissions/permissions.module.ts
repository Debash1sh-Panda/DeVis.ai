import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PolicyService } from './policy.service';

@Module({
  providers: [PermissionService, PolicyService],
  exports: [PermissionService],
})
export class PermissionsModule {}
