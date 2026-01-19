import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Greenhouse } from '../greenhouses/greenhouse.entity'; // 👈 import

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string; // 'FAN', 'PUMP', 'LIGHT'

  @Column({ default: false })
  is_active: boolean;

  // 👇 ต้องมีท่อนนี้
  @ManyToOne(() => Greenhouse, (greenhouse) => greenhouse.devices, {
    onDelete: 'CASCADE', // ถ้าลบโรงเรือน อุปกรณ์หายด้วย
  })
  greenhouse: Greenhouse;
}