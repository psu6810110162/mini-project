import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // API Endpoint: PATCH /devices/:id/toggle
  // Body: { "isActive": true }
  @Patch(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.devicesService.toggleDevice(id, isActive);
  }
}