import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { GreenhousesService } from './greenhouses.service';
import { SensorData } from './sensor-data.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('greenhouses')
export class GreenhousesController {
  constructor(private readonly greenhousesService: GreenhousesService) {}

  @Get()
  getAll() {
    return this.greenhousesService.findAll();
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body('name') name: string) {
    return this.greenhousesService.create(name);
  }

  @UseGuards(AdminGuard)
  @Post(':id/sync')
  syncSensor(@Param('id') id: string) {
    return this.greenhousesService.syncSensorData(+id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string): Promise<SensorData[]> {
    return this.greenhousesService.getHistory(+id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.greenhousesService.remove(+id);
  }
}
