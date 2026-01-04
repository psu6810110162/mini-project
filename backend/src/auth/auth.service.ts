import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(registerData: any) {
    const { username, password } = registerData;

    // 1. ตรวจสอบว่าชื่อผู้ใช้งานซ้ำหรือไม่
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว');
    }

    // 2. สั่งให้ UsersService สร้าง User ใหม่ลงฐานข้อมูล
    return await this.usersService.create(username, password);
  }

  async login(loginData: any) {
    const user = await this.usersService.findOne(loginData.username);

    if (user && user.password === loginData.password) {
      const roleName = user.role ? user.role.name : 'USER';
      return {
        access_token: 'fake-jwt-token-' + user.id, // ในงานจริงควรใช้ JwtService
        user: {
          id: user.id,
          username: user.username,
          role: roleName 
        }
      };
    }
    throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }
}