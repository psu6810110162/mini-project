import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // ถ้ามี
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity'; // Import Role

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]), // ใส่ Role เข้าไปในลิสต์
  ],
  providers: [UsersService],
  exports: [UsersService], // Export ให้ AuthModule ใช้ต่อ
  controllers: [UsersController],
})
export class UsersModule {}