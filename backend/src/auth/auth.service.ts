import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerData: any) {
    const { username, password } = registerData;

    // 1. ตรวจสอบว่าชื่อผู้ใช้งานซ้ำหรือไม่
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว');
    }

    // 2. สั่งให้ UsersService สร้าง User ใหม่ลงฐานข้อมูล (UsersService จะ hash รหัสผ่าน)
    return await this.usersService.create(username, password);
  }

  async login(loginData: any) {
    const user = await this.usersService.findOne(loginData.username);

    if (!user) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

    const match = await bcrypt.compare(loginData.password, user.password);
    if (!match) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

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
}