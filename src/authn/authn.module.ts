import { Module } from '@nestjs/common';
import { AuthnService } from './authn.service';
import { AuthnController } from './authn.controller';
import { UsersService } from './users/users.service';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthnService, UsersService],
  controllers: [AuthnController],
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  exports: [AuthnService],
})
export class AuthnModule {}
