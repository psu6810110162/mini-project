// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. ฟังก์ชันตรวจสอบ Username และ Password
  async validateUser(username: string, pass: string): Promise<any> {
    // หา User จาก Database
    const user = await this.usersService.findOne(username);
    
    // ถ้าเจอ User และ Password (ที่ Hash แล้ว) ตรงกัน
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // ตัด field password ทิ้งเพื่อความปลอดภัย
      return result; // คืนค่า User ที่ไม่มี password
    }
    
    return null; // ถ้าไม่ผ่าน คืนค่า null
  }

  // 2. ฟังก์ชัน Login (สร้าง Token)
  async login(user: any) {
    // สร้าง Payload ให้ตรงกับ interface JwtPayload ที่คุณเขียนใน Strategy
    const payload = { 
      username: user.username, 
      sub: user.id, // sub คือ Subject (มักใช้ ID)
      role: user.role?.name || 'USER' // ดึงชื่อ Role ออกมา (ระวัง! ถ้า user.role เป็น Object ต้อง .name)
    };

    return {
      access_token: this.jwtService.sign(payload), // สร้าง JWT String
      user: { // ส่งข้อมูล user กลับไปให้ Frontend ใช้ด้วยก็ได้
        id: user.id,
        username: user.username,
        role: user.role?.name
      }
    };
  }

  // 3. Register (เรียกใช้ UsersService)
  async register(userDto: any) {
    return this.usersService.create(userDto);
  }
}