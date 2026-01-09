// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. Register (สมัครสมาชิก)
  // POST http://localhost:3000/auth/register
  @Post('register')
  async register(@Body() userDto: any) { // (ควรใช้ DTO จริง แต่ใช้ any ไปก่อน)
    return this.authService.register(userDto);
  }

  // 2. Login (เข้าสู่ระบบ)
  // POST http://localhost:3000/auth/login
  @HttpCode(HttpStatus.OK) // ปกติ POST จะคืน 201 แต่ Login ควรคืน 200 OK
  @Post('login')
  async login(@Body() loginDto: any) {
    // ต้องตรวจสอบ username/password ก่อน
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      // ถ้าไม่เจอ หรือรหัสผิด ให้โยน Error ออกไป
      throw new Error('Invalid credentials'); 
      // (จริงๆ ควรใช้ UnauthorizedException แต่นี่แบบย่อ)
    }

    // ถ้าผ่าน ก็ออก Token ให้
    return this.authService.login(user);
  }
}