import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_AGENT, QUEUE_BROWSER, QUEUE_DESKTOP, QUEUE_EMAIL, QUEUE_NOTIFICATION } from '@devis/shared';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_AGENT },
      { name: QUEUE_BROWSER },
      { name: QUEUE_DESKTOP },
      { name: QUEUE_EMAIL },
      { name: QUEUE_NOTIFICATION },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
