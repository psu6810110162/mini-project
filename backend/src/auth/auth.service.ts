// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. ฟังก์ชันตรวจสอบ Username และ Password
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  // 2. ฟังก์ชัน Login (สร้าง Token)
  async login(loginData: LoginDto) {
    // ตรวจสอบ user ก่อน
    const user = await this.validateUser(loginData.username, loginData.password);
    
    if (!user) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

    const roleName = user.role ? user.role.name : 'USER';
    const payload = { sub: user.id, username: user.username, role: roleName };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: roleName,
      }
    };
  }

  // 3. Register
  async register(userDto: any) {
    return this.usersService.create(userDto);
  }
}