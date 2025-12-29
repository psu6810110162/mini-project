import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API: POST /auth/register
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  // API: POST /auth/login
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }
}