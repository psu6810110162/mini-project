import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Device])], // ลงทะเบียน Entity Device
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService], // export เผื่อ Module อื่นอยากเรียกใช้
})
export class DevicesModule {}