import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhousesModule } from './greenhouses/greenhouses.module';
import { DevicesModule } from './devices/devices.module';
import { Greenhouse } from './greenhouses/greenhouse.entity';
import { Device } from './devices/device.entity';
import { SensorData } from './greenhouses/sensor-data.entity';

@Module({
  imports: [
    // 1. ตั้งค่า Database (ตรงกับ Docker ด้านบน)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'agricontrol',
      entities: [Greenhouse, Device, SensorData], // ใส่ Entity ให้ครบ
      synchronize: true, // ห้ามใช้บน Production แต่ Dev ใช้ได้ (สร้างตารางให้อัตโนมัติ)
    }),
    
    // 2. โหลด Module ย่อย
    GreenhousesModule,
    DevicesModule,
  ],
})
export class AppModule {}