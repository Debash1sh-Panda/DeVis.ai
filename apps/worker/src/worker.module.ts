import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AgentProcessor } from './processors/agent.processor';
import { BrowserProcessor } from './processors/browser.processor';
import { EmailProcessor } from './processors/email.processor';
import { DesktopProcessor } from './processors/desktop.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QUEUE_AGENT, QUEUE_BROWSER, QUEUE_DESKTOP, QUEUE_EMAIL, QUEUE_NOTIFICATION } from '@devis/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_AGENT },
      { name: QUEUE_BROWSER },
      { name: QUEUE_DESKTOP },
      { name: QUEUE_EMAIL },
      { name: QUEUE_NOTIFICATION },
    ),
  ],
  providers: [
    AgentProcessor,
    BrowserProcessor,
    EmailProcessor,
    DesktopProcessor,
    NotificationProcessor,
  ],
})
export class WorkerModule {}
