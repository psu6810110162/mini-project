import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // เชื่อมต่อกับตาราง User
    private jwtService: JwtService, // เรียกใช้ JWT
  ) {}

  // 📝 ฟังก์ชันสมัครสมาชิก
  async register(registerDto: any) {
    const { username, password } = registerDto;

    // 1. เช็คว่ามี Username นี้หรือยัง
    const existingUser = await this.usersRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username นี้ถูกใช้ไปแล้ว');
    }

    // 2. เข้ารหัส Password (Hash)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. บันทึกลง Database
    const user = this.usersRepository.create({
      username,
      password_hash: hashedPassword,
      // role: ใส่ Default Role ทีหลังได้ (ตอนนี้ปล่อย null หรือไปแก้ Entity ให้มี default)
    });

    await this.usersRepository.save(user);
    return { message: 'สมัครสมาชิกสำเร็จเรียบร้อย' };
  }

  // 🔐 ฟังก์ชันเข้าสู่ระบบ
  async login(loginDto: any) {
    const { username, password } = loginDto;

    // 1. ค้นหา User
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // 2. ตรวจสอบรหัสผ่าน (เทียบ Hash)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // 3. สร้าง Token (JWT)
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken };
  }
}