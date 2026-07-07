import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, CommonModule, HealthModule],
})
export class AppModule {}
