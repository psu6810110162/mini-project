import { Controller, Get, Post, Body } from '@nestjs/common';
import { GreenhousesService } from './greenhouses.service';

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
}