import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../../permissions/permission.entity';
import { Greenhouse } from 'src/greenhouses/greenhouse.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string; // 👈 เราจะใช้ชื่อนี้เป็นหลักนะครับ

  // เชื่อมกับ Role
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  @JoinTable()
  @ManyToMany(() => Greenhouse, (greenhouse) => greenhouse.users)
  greenhouses: Greenhouse[];
}