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

  async onModuleInit() {
    console.log('🌱 Checking seed data...');
    await this.seedData();
  }

  private async seedData() {
    // 1. ROLE ADMIN
    let adminRole = await this.rolesRepository.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      adminRole = this.rolesRepository.create({ name: 'ADMIN', description: 'ผู้ดูแลระบบสูงสุด' });
      await this.rolesRepository.save(adminRole);
    }

    // 2. ROLE USER
    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    // 3. USER ADMIN
    const adminUser = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const newAdmin = this.usersRepository.create({
        username: 'admin',
        password: 'password123',
        role: adminRole,
      });
      await this.usersRepository.save(newAdmin);
    }

    // 4. USER NORMAL
    const normalUser = await this.usersRepository.findOne({ where: { username: 'user' } });
    if (!normalUser) {
      const newUser = this.usersRepository.create({
        username: 'user',
        password: 'password123',
        role: userRole,
      });
      await this.usersRepository.save(newUser);
    }
  }

  // 👇 แก้ Type ตรงนี้ให้รองรับ null
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
        where: { username },
        relations: ['role'] 
    });
  }
}