import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // ฟังก์ชัน login จำลอง
  async login(body: any) {
    // ในอนาคต: เช็ค username/password จาก Database ตรงนี้
    return {
      message: 'Login successful (Mockup)',
      user: body.username,
      token: 'mock_token_123456'
    };
  }
}