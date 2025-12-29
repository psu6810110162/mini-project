import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('users') // ชื่อตารางใน Database
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password_hash: string;

  // ความสัมพันธ์: User หลายคน มี Role เดียวกันได้ (เช่น เป็น Admin เหมือนกัน)
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' }) // ตั้งชื่อคอลัมน์ใน DB ว่า role_id
  role: Role;
}