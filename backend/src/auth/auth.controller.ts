import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) { // ใช้ any ชั่วคราว เดี๋ยวเรามาทำ DTO ทีหลัง
    return this.authService.login(body);
  }
}