import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // Import UsersModule เพื่อเช็ค user ใน DB
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}