import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // ✅ เพิ่มฟังก์ชันสร้าง User ใหม่ (แทนที่ตัวเก่าที่มี Error)
  async create(username: string, password: string) {
    // ดึง Role 'USER' มากำหนดให้ผู้สมัครใหม่
    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    const newUser = this.usersRepository.create({
      username,
      password, // แนะนำให้ใช้ bcrypt.hash ภายหลัง
      role: userRole,
    });

    return await this.usersRepository.save(newUser);
  }

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    // ... โค้ด seedData เดิมของน้อง (ADMIN/USER/admin user) ไว้เหมือนเดิมได้เลยครับ ...
    // พี่ขอละไว้เพื่อให้โค้ดสั้นลงแต่ห้ามลบของเดิมนะ
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
        where: { username },
        relations: ['role'] 
    });
  }
}