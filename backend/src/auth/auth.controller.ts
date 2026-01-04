import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: any) {
    return this.authService.login(loginData);
  }

  // ✅ เพิ่ม Route สำหรับสมัครสมาชิก
  @Post('register')
  async register(@Body() registerData: any) {
    // รับ username, password ส่งต่อไปที่ register ใน AuthService
    return this.authService.register(registerData);
  }
}