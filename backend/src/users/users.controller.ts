import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';// ยามเฝ้าประตู (Phase 2)
import { AdminGuard } from '../auth/admin.guard';

@Controller('users') // API จะขึ้นต้นด้วย /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // แปะ Guard ไว้ตรงนี้! ใครไม่มี Token ห้ามเข้า
  // 1. ดึงรายชื่อ User ทั้งหมด (Admin ใช้)
  // เรียก: GET http://localhost:3000/users
  @UseGuards(JwtAuthGuard) 
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  // 2. ดูข้อมูล User คนเดียว
  // เรียก: GET http://localhost:3000/users/admin
  // API: GET /users/:username
  // สำหรับดูข้อมูล user ตาม username
  @UseGuards(JwtAuthGuard)
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }
  // 3. ลบ User (สำหรับให้ Admin ใช้ กรณีต้องการลบ user ออก)
  // เรียก: DELETE http://localhost:3000/users/2
  // API: DELETE /users/:id
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}