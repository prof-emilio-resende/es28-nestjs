import { Module } from '@nestjs/common';
import { AuthzService } from './authz.service';

@Module({
  providers: [AuthzService],
  exports: [AuthzService],
})
export class AuthzModule {}
