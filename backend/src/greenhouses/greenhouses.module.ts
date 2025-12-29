import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhousesService } from './greenhouses.service';
import { GreenhousesController } from './greenhouses.controller';
import { Greenhouse } from './greenhouse.entity';
import { SensorData } from './sensor-data.entity'; // 👈 1. import

@Module({
  imports: [
    TypeOrmModule.forFeature([Greenhouse, SensorData]) // 👈 2. ใส่ SensorData เพิ่มเข้าไป
  ],
  controllers: [GreenhousesController],
  providers: [GreenhousesService],
  exports: [TypeOrmModule] // export ให้คนอื่นใช้ได้ถ้าจำเป็น
})
export class GreenhousesModule {}