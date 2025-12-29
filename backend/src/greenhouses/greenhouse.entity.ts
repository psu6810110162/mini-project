// src/greenhouses/greenhouse.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Device } from '../devices/device.entity';

@Entity('greenhouses') // ชื่อตารางใน Database
export class Greenhouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // ชื่อโรงเรือน

  @Column({ type: 'text', nullable: true })
  location: string; // สถานที่ตั้ง (ใส่หรือไม่ใส่ก็ได้)

  // ความสัมพันธ์: 1 โรงเรือน มีได้หลายอุปกรณ์ (One-to-Many)
  @OneToMany(() => Device, (device) => device.greenhouse)
  devices: Device[];
  
  // NOTE: ความสัมพันธ์กับ Users (Many-to-Many) เดี๋ยวรอ Person A สร้าง User Entity เสร็จค่อยมาเติมนะครับ
}