import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Greenhouse } from './greenhouse.entity';

@Entity()
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  temp: number;

  @Column('float')
  humidity: number;

  @CreateDateColumn() // บันทึกเวลาอัตโนมัติ
  timestamp: Date;

  @ManyToOne(() => Greenhouse, (gh) => gh.sensorData, { onDelete: 'CASCADE' })
  greenhouse: Greenhouse;
}