import { Injectable, OnModuleInit, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/createuser.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    try {
      await this.seedData();
    } catch (err) {
      this.logger.error('Seed data failed', err as any);
    }
  }

  private async seedData() {
    // ensure roles exist
    let adminRole = await this.rolesRepository.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      adminRole = this.rolesRepository.create({ name: 'ADMIN', description: 'Administrator' });
      await this.rolesRepository.save(adminRole);
    }

    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    // ensure admin user exists
    const existingAdmin = await this.usersRepository.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash('admin', salt);
      const role = await this.rolesRepository.findOne({ where: { name: 'ADMIN' } });
      if (!role) {
        throw new Error('ADMIN role not found during seeding');
      }
      const admin = this.usersRepository.create({ username: 'admin', password: hashed, role });
      await this.usersRepository.save(admin);
      this.logger.log('Admin user created during seed');
    }
  }

  // use DTO
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password } = createUserDto;

    // Prevent duplicate username early
    const existing = await this.usersRepository.findOne({ where: { username } });
    if (existing) {
      throw new BadRequestException('Username is already taken');
    }

    // find or create USER role
    let userRole = await this.rolesRepository.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      userRole = this.rolesRepository.create({ name: 'USER', description: 'ผู้ใช้งานทั่วไป' });
      await this.rolesRepository.save(userRole);
    }

    // hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role: userRole,
    });

    return this.usersRepository.save(user);
  }

  async findOne(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username }, relations: ['role'] });
    return user ?? null;
  }

  // return sanitized users (no password)
  async findAll(): Promise<Array<{ id: number; username: string; role?: { id: number; name: string } | null }>> {
    const users = await this.usersRepository.find({ relations: ['role'] });
    return users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role ? { id: u.role.id, name: u.role.name } : null,
    }));
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}