import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Greenhouse } from './greenhouse.entity';

@Injectable()
export class GreenhousesService {
  constructor(
    @InjectRepository(Greenhouse)
    private greenhouseRepository: Repository<Greenhouse>,
  ) {}

  // ดึงข้อมูลโรงเรือนทั้งหมด
  findAll(): Promise<Greenhouse[]> {
    return this.greenhouseRepository.find({ relations: ['devices'] });
  }

  // สร้างโรงเรือนใหม่
  create(name: string): Promise<Greenhouse> {
    const greenhouse = new Greenhouse();
    greenhouse.name = name;
    return this.greenhouseRepository.save(greenhouse);
  }
}