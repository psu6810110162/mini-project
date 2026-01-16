import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

// 1. Mock bcrypt เพื่อไม่ให้มีปัญหากับ native bindings เวลาเทส
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    // 2. Mock Dependencies
    usersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: mockJwtService }, // ใช้ class โดยตรงแทน require
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if username exists', async () => {
      // จำลองว่าเจอ user ซ้ำ
      (usersService.findOne as jest.Mock).mockResolvedValue({ id: 1, username: 'taken' });

      await expect(service.register({ username: 'taken', password: 'pw' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should call usersService.create if username is free', async () => {
      // จำลองว่าไม่เจอ user ซ้ำ
      (usersService.findOne as jest.Mock).mockResolvedValue(null);
      // จำลองการสร้าง user สำเร็จ
      (usersService.create as jest.Mock).mockResolvedValue({ id: 2, username: 'newuser' });

      const res = await service.register({ username: 'newuser', password: 'pw' });

      // เช็คว่ามีการเรียก create จริงไหม
      expect(usersService.create).toHaveBeenCalled(); 
      expect(res).toEqual({ id: 2, username: 'newuser' });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ username: 'no', password: 'x' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // เจอ user แต่รหัสผิด
      (usersService.findOne as jest.Mock).mockResolvedValue({ 
        id: 1, username: 'u', password: 'hashed_password', role: { name: 'USER' } 
      });
      // 3. แก้ไขจุดที่ผิด: ต้องใส่ค่า return true/false ให้ compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); 

      await expect(service.login({ username: 'u', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user data when credentials are valid', async () => {
      // เจอ user และรหัสถูก
      const mockUser = { id: 3, username: 'u3', password: 'hashed', role: { name: 'ADMIN' } };
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      
      // 4. แก้ไขจุดที่ผิด: จำลองว่ารหัสผ่านถูกต้อง (true)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.login({ username: 'u3', password: 'secret' });

      // เช็คว่ามีการสร้าง Token
      expect(jwtService.sign).toHaveBeenCalled();
      // เช็คผลลัพธ์
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res.user).toEqual({ id: 3, username: 'u3', role: 'ADMIN' });
    });
  });
});