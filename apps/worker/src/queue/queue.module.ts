import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly worker: Worker;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is required for the worker');
    }

    this.worker = new Worker(
      'forma-default',
      async (job) => {
        this.logger.log(`Processing job ${job.id ?? 'unknown'} (${job.name})`);
        return { ok: true };
      },
      {
        connection: {
          url: redisUrl,
          maxRetriesPerRequest: null,
        },
      },
    );

    this.worker.on('ready', () => {
      this.logger.log(
        'Worker connected to Redis and listening on forma-default',
      );
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Job ${job?.id ?? 'unknown'} failed: ${error.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}

@Module({
  providers: [QueueService],
})
export class QueueModule {}
