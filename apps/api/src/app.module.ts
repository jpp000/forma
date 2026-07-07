import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { I18nModule } from './i18n/i18n.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { StudentModule } from './modules/student/student.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    I18nModule,
    CommonModule,
    HealthModule,
    IdentityModule,
    StudentModule,
  ],
})
export class AppModule {}
