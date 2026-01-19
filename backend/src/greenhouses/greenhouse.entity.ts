import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Device } from '../devices/device.entity';
import { SensorData } from './sensor-data.entity';
import { Permission } from '../permissions/permission.entity';

@Entity('greenhouses')
export class Greenhouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('float', { default: 0.0 })
  temp: number;

  @Column('float', { default: 0.0 })
  humidity: number;

  @Column({ type: 'float', default: 0.0 })
  light: number;

  @OneToMany(() => Device, (device) => device.greenhouse, { cascade: true })
  devices: Device[]; // 👈 ต้องมีบรรทัดนี้

  @OneToMany(() => SensorData, (data) => data.greenhouse)
  sensorData: SensorData[];

  @OneToMany(() => Permission, (permission) => permission.greenhouse)
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.greenhouses)
  users: User[];

}