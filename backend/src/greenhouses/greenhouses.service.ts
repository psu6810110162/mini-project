import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule'; 
import { Greenhouse } from './greenhouse.entity';
import { SensorData } from './sensor-data.entity';

@Injectable()
export class GreenhousesService {
  constructor(
    @InjectRepository(Greenhouse)
    private greenhouseRepository: Repository<Greenhouse>,
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
  ) {}

  // 1. สร้างโรงเรือน (เพิ่มค่าเริ่มต้นของแสง)
  async create(name: string): Promise<Greenhouse> {
    const greenhouse = new Greenhouse();
    greenhouse.name = name;
    greenhouse.temp = 25.0;
    greenhouse.humidity = 50.0;
    // @ts-ignore
    greenhouse.light = 500; // ค่าเริ่มต้น
    return this.greenhouseRepository.save(greenhouse);
  }

  findAll(): Promise<Greenhouse[]> {
    return this.greenhouseRepository.find({
      relations: ['devices'],
      order: { id: 'ASC' },
    });
  }

  // ⏰ ระบบสุ่มค่าอัตโนมัติ (แก้ไขให้ปีกกาถูกต้อง)
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const greenhouses = await this.greenhouseRepository.find({ relations: ['devices'] });

    for (const gh of greenhouses) {
      // --- 🎲 1. สุ่มค่า ---
      const tempChange = (Math.random() * 4 - 2); 
      const humidChange = (Math.random() * 6 - 3);
      const lightChange = (Math.random() * 100 - 50); 

      gh.temp = parseFloat(Math.min(Math.max(gh.temp + tempChange, 20), 45).toFixed(1));
      gh.humidity = parseFloat(Math.min(Math.max(gh.humidity + humidChange, 30), 90).toFixed(1));
      // @ts-ignore
      gh.light = parseFloat(Math.min(Math.max((gh.light || 500) + lightChange, 100), 1000).toFixed(0));

      // --- 🤖 2. Logic สั่งงานอุปกรณ์ (Auto Mode) ---
      gh.devices.forEach(device => {
        if (device.type === 'FAN') {
          if (gh.temp > 80) device.is_active = true;
          else if (gh.temp < 20) device.is_active = false;
        }
        if (device.type === 'PUMP') {
          if (gh.humidity < 45) device.is_active = true;
          else if (gh.humidity > 65) device.is_active = false;
        }
        if (device.type === 'LIGHT') {
          // @ts-ignore
          if (gh.light < 400) device.is_active = true;
          // @ts-ignore
          else if (gh.light > 300) device.is_active = false;
        }
      });

      // --- 💾 3. บันทึกข้อมูล ---
      const savedGh = await this.greenhouseRepository.save(gh);

      const log = new SensorData();
      log.temp = parseFloat(((gh.temp / 50) * 100).toFixed(1));
      log.humidity = gh.humidity;
      log.light = parseFloat(((gh.light / 500) * 100).toFixed(1));
    
    log.greenhouse = gh;
    await this.sensorDataRepository.save(log);

    // @ts-ignore
    console.log(`[🎲 Sync] ${gh.name} | Temp: ${gh.temp}°C (${log.temp}%) | Light: ${gh.light}lx (${log.light}%)`);
  }
}

  async getHistory(id: number): Promise<SensorData[]> {
    return this.sensorDataRepository.find({
      where: { greenhouse: { id: id } },
      order: { timestamp: 'DESC' },
      take: 20,
    });
  }

  async remove(id: number): Promise<void> {
    await this.greenhouseRepository.delete(id);
  }

  async syncSensorData(id: number): Promise<Greenhouse> {
    await this.handleCron();
    const updated = await this.greenhouseRepository.findOne({ where: { id }, relations: ['devices'] });
    if (!updated) throw new NotFoundException('ไม่พบโรงเรือน');
    return updated;
  }
}