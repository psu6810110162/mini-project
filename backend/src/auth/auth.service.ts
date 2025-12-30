import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // 👈 เรียกข้ามโฟลเดอร์ต้องมี ..

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService // 👈 ใช้ Service แทน Repository
  ) {}

  async login(loginData: any) {
    // เรียกใช้ฟังก์ชัน findOne จาก UsersService
    const user = await this.usersService.findOne(loginData.username);

    // เช็ค password
    if (user && user.password === loginData.password) {
      // ดึง role name ออกมา
      const roleName = user.role ? user.role.name : 'USER';

      return {
        access_token: 'fake-jwt-token-' + user.id,
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