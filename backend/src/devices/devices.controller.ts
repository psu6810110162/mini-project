import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(AdminGuard)
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

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}