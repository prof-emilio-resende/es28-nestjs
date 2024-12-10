import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthnService } from './authn.service';
import { AuthnGuard } from './authn.guard';

@Controller('authn')
export class AuthnController {
  constructor(private authService: AuthnService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthnGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
