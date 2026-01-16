import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // ✅ เพิ่มฟังก์ชันสร้าง User ใหม่ (ตอนนี้ใช้ bcrypt.hash เพื่อความปลอดภัย)

  async create(username: string, password: string) {
    // ดึง Role 'USER' มากำหนดให้ผู้สมัครใหม่
    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    // Hash password ก่อนบันทึก (ใช้ saltRounds = 10)
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      username,
      password: hashed,
      role: userRole,
    });

    return await this.usersRepository.save(newUser);
  }

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    // สร้าง role ADMIN และ USER ถ้ายังไม่มี และสร้าง admin user ถ้ายังไม่มี
    let adminRole = await this.rolesRepository.findOne({ where: { name: 'ADMIN' } });
    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });

    if (!adminRole) {
      adminRole = this.rolesRepository.create({ name: 'ADMIN', description: 'ผู้ดูแลระบบ' });
      await this.rolesRepository.save(adminRole);
    }
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    // สร้าง admin user ถ้ายังไม่มี (username: admin / password: admin) — จะถูก hash
    const adminUser = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const saltRounds = 10;
      const hashed = await (await import('bcrypt')).hash('admin', saltRounds);
      const newAdmin = this.usersRepository.create({ username: 'admin', password: hashed, role: adminRole });
      await this.usersRepository.save(newAdmin);
      console.log('Seeded admin user: username=admin password=admin');
    }
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
        where: { username },
        relations: ['role'] 
    });
  }

  // คืนรายการผู้ใช้ทั้งหมด (ไม่ส่ง password กลับ)
  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({ relations: ['role'], order: { id: 'ASC' } });
    return users.map(u => ({ id: u.id, username: u.username, role: u.role }));
  }

  // ลบผู้ใช้ตาม id
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }


}
