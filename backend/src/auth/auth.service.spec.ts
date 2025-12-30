import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

// 1. สร้าง Mock (ตัวปลอม) ของ UsersService
// เพราะเราแค่อยากเทส Auth ไม่ได้อยากไปยุ่งกับ Database จริง
const mockUsersService = {
  findOne: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // 2. บอกให้ระบบใช้ตัวปลอมแทนตัวจริง
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ เทสกรณี Login สำเร็จ
  describe('login', () => {
    it('should return token and user info if validation is successful', async () => {
      // จำลองว่า usersService.findOne ไปเจอ user ชื่อ admin
      const mockUser = {
        id: 1,
        username: 'admin',
        password: 'password123',
        role: { name: 'ADMIN' },
      };
      
      // สั่งให้ mock ทำงานตามที่เรากำหนด
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      // ลองเรียกฟังก์ชัน login จริงๆ
      const result = await service.login({ username: 'admin', password: 'password123' });

      // ตรวจสอบผลลัพธ์
      expect(result).toHaveProperty('access_token');
      expect(result.user.role).toEqual('ADMIN');
    });

    // ❌ เทสกรณีรหัสผ่านผิด
    it('should throw UnauthorizedException if password is wrong', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: 'password123',
        role: { name: 'ADMIN' },
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      // ลองล็อกอินด้วยรหัสผิด 'wrongpass' -> ต้อง Error
      await expect(service.login({ username: 'admin', password: 'wrongpass' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    // ❌ เทสกรณีหา User ไม่เจอ
    it('should throw UnauthorizedException if user not found', async () => {
      // จำลองว่าหาไม่เจอ (return null)
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ username: 'ghost', password: 'any' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});