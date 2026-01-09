import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../../permissions/permission.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // 👈 เราจะใช้ชื่อนี้เป็นหลักนะครับ

  // เชื่อมกับ Role
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];
}