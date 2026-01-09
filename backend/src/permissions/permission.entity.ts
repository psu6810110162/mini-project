import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity'; // เช็ค path ให้ถูก
import { Greenhouse } from '../greenhouses/greenhouse.entity'; // เช็ค path ให้ถูก

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  // Access Level: 'OWNER' (เจ้าของ), 'STAFF' (คนงาน), 'VIEWER' (ดูได้อย่างเดียว)
  @Column({ default: 'VIEWER' })
  accessLevel: string;

  // เชื่อมกับ User (Many Permissions -> One User)
  @ManyToOne(() => User, (user) => user.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // เชื่อมกับ Greenhouse (Many Permissions -> One Greenhouse)
  @ManyToOne(() => Greenhouse, (gh) => gh.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'greenhouse_id' })
  greenhouse: Greenhouse;
}