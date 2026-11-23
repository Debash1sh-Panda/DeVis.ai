import { Module } from '@nestjs/common';
import { ToolRegistryService } from './registry/tool-registry.service';

@Module({
  providers: [ToolRegistryService],
  exports: [ToolRegistryService],
})
export class ToolsModule {}
