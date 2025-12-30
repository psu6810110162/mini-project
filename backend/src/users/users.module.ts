import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
// เรายังไม่มี UsersService/Controller ในรูป แต่ใส่ TypeOrm ไว้ก่อนได้ครับ
// ถ้าคุณจะสร้าง UsersService ด้วย ให้เพิ่มใน providers และ exports
@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  exports: [TypeOrmModule], // ส่งออกไปให้ Auth เรียกใช้
})
export class UsersModule {}