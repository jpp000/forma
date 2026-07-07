import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { RolesGuard } from '../../common/roles.guard';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [IdentityModule],
  controllers: [StudentController],
  providers: [StudentService, RolesGuard],
  exports: [StudentService],
})
export class StudentModule {}
