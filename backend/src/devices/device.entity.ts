// src/devices/device.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Greenhouse } from '../greenhouses/greenhouse.entity';

// Enum เพื่อบังคับว่า device_type ต้องเป็นค่าที่เรากำหนดเท่านั้น (Strict Typing)
export enum DeviceType {
  FAN = 'FAN',
  PUMP = 'PUMP',
  LIGHT = 'LIGHT',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // ชื่ออุปกรณ์ เช่น "พัดลมตัวที่ 1"

  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.FAN
  })
  type: DeviceType; // ประเภทอุปกรณ์

  @Column({ default: false })
  is_active: boolean; // สถานะการทำงาน (เปิด/ปิด)

  // ความสัมพันธ์: หลายอุปกรณ์ อยู่ใน 1 โรงเรือน (Many-to-One)
  @ManyToOne(() => Greenhouse, (greenhouse) => greenhouse.devices, {
    onDelete: 'CASCADE', // ถ้าลบโรงเรือน อุปกรณ์ข้างในหายหมด
  })
  @JoinColumn({ name: 'greenhouse_id' }) // ชื่อ Foreign Key ในตาราง
  greenhouse: Greenhouse;
}