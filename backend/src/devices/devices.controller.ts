import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('greenhouseId') greenhouseId: number,
  ) {
    return this.devicesService.create(name, type, greenhouseId);
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }
  
  @Patch(':id/toggle') 
  toggleDevice(@Param('id') id: string) {
    return this.devicesService.toggle(+id); 
  }
}