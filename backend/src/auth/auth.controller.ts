import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  // ✅ เพิ่ม Route สำหรับสมัครสมาชิก
  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    // รับ username, password ส่งต่อไปที่ register ใน AuthService
    return this.authService.register(registerData);
  }
}