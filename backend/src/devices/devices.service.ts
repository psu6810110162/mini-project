import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity'; 
import { Greenhouse } from '../greenhouses/greenhouse.entity';
import { async } from 'rxjs';

@Injectable()
export class DevicesService {
  [x: string]: any;
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    
    @InjectRepository(Greenhouse)
    private greenhouseRepository: Repository<Greenhouse>,
  ) {}

  async create(name: string, type: string, greenhouseId: number): Promise<Device> {
    const greenhouse = await this.greenhouseRepository.findOneBy({ id: greenhouseId });
    
    if (!greenhouse) {
      throw new NotFoundException(`ไม่พบโรงเรือน ID: ${greenhouseId}`);
    }

    const device = new Device();
    device.name = name;
    
    device.type = type.toUpperCase(); 
    
    device.is_active = false; 
    
    device.greenhouse = greenhouse;

    return this.deviceRepository.save(device);
  }

  findAll(): Promise<Device[]> {
    return this.deviceRepository.find({ relations: ['greenhouse'] });
  }

  async toggle(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOneBy({ id });
    
    if (!device) {
      throw new NotFoundException(`ไม่พบอุปกรณ์ ID: ${id}`);
    }

    device.is_active = !device.is_active;

    return this.deviceRepository.save(device);
  }
  async remove(id: number): Promise<void> {
  await this.deviceRepository.delete(id);
  }
}