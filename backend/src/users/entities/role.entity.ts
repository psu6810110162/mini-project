import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';   // เดี๋ยวเราจะสร้างไฟล์นี้ใน Step ต่อไป (ตอนนี้มันจะแดงๆ หน่อย ช่างมันครับ)

@Entity('roles') // ชื่อตารางใน Database
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // เช่น 'ADMIN', 'USER'

  @Column({ nullable: true })
  description: string;

  // ความสัมพันธ์: 1 Role มี User ได้หลายคน
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}