import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') // 👈 นี่คือจุดที่ Frontend ยิงเข้ามา (/auth/login)
  async login(@Body() req) {
    return this.authService.login(req);
  }
}