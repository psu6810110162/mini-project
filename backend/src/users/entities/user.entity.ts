import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';
// ต้องมีไฟล์ Greenhouse อยู่ที่ path นี้นะครับ
import { Greenhouse } from '../../greenhouses/greenhouse.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToMany(() => Greenhouse)
  @JoinTable({
    name: 'user_greenhouses',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'greenhouse_id', referencedColumnName: 'id' },
  })
  greenhouses: Greenhouse[];
}