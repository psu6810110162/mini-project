import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service'; // 👈 ต้องมีบรรทัดนี้!
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ส่งออกไปให้ Auth เรียกใช้
})
export class UsersModule {}