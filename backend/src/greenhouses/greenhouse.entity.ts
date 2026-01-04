import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Device } from '../devices/device.entity';
import { SensorData } from './sensor-data.entity';

@Entity()
export class Greenhouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float', { default: 25.0 })
  temp: number;

  @Column('float', { default: 60.0 })
  humidity: number;

  @OneToMany(() => Device, (device) => device.greenhouse, { cascade: true })
  devices: Device[]; // 👈 ต้องมีบรรทัดนี้

  @OneToMany(() => SensorData, (data) => data.greenhouse)
  sensorData: SensorData[];

  
}