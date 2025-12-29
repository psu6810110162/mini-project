import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Greenhouse } from './greenhouse.entity';
import { GreenhousesService } from './greenhouses.service';
import { GreenhousesController } from './greenhouses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Greenhouse])],
  controllers: [GreenhousesController],
  providers: [GreenhousesService],
  exports: [GreenhousesService], // export เผื่อ DevicesModule อยากใช้
})
export class GreenhousesModule {}