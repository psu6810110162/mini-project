import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { GreenhousesService } from './greenhouses.service';
import { SensorData } from './sensor-data.entity';

@Controller('greenhouses')
export class GreenhousesController {
  constructor(private readonly greenhousesService: GreenhousesService) {}

  @Get()
  getAll() {
    return this.greenhousesService.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.greenhousesService.create(name);
  }
  @Post(':id/sync')
  syncSensor(@Param('id') id: string) {
    return this.greenhousesService.syncSensorData(+id);
  }
  @Get(':id/history')
  getHistory(@Param('id') id: string): Promise<SensorData[]> {
    return this.greenhousesService.getHistory(+id);
  }
  @Delete(':id')
remove(@Param('id') id: string) {
  return this.greenhousesService.remove(+id);
  }
}
