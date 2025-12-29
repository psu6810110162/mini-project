import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity'; // นำเข้า User Entity
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    // 1. ให้ Auth Module เข้าถึงตาราง Users ได้
    TypeOrmModule.forFeature([User]),

    // 2. เปิดใช้งาน Passport
    PassportModule,

    // 3. ตั้งค่า JWT (บัตรผ่าน)
    JwtModule.register({
      secret: 'SECRET_KEY_NA_JA', // ⚠️ ของจริงควรเก็บใน .env (แต่ตอนนี้ Hardcode ไปก่อนเพื่อความง่าย)
      signOptions: { expiresIn: '1h' }, // Token หมดอายุใน 1 ชั่วโมง
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // เผื่อ Module อื่นอยากเรียกใช้
})
export class AuthModule {}
