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

  // 1. สร้างโรงเรือน
  async create(name: string): Promise<Greenhouse> {
    const greenhouse = new Greenhouse();
    greenhouse.name = name;
    greenhouse.temp = 25.0; // ค่าเริ่มต้น
    greenhouse.humidity = 50.0; // ค่าเริ่มต้น
    return this.greenhouseRepository.save(greenhouse);
  }

  // 2. ดึงข้อมูลทั้งหมด
  findAll(): Promise<Greenhouse[]> {
    return this.greenhouseRepository.find({
      relations: ['devices'],
      order: { id: 'ASC' },
    });
  }

  // 3. ⏰ ระบบสุ่มค่าอัตโนมัติ (ทำงานทุก 5 วินาที)
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    console.log('--- 🎲 Auto Syncing Data ---');
    const greenhouses = await this.greenhouseRepository.find({ relations: ['devices'] });

    for (const gh of greenhouses) {
      // สุ่มค่าแบบเนียนๆ (บวกหรือลบจากค่าเดิมนิดหน่อย)
      const tempChange = (Math.random() * 5 - 4); 
      const humidChange = (Math.random() * 20 - 10);

      gh.temp = parseFloat(Math.min(Math.max(gh.temp + tempChange, 30), 45).toFixed(1));
      gh.humidity = parseFloat(Math.min(Math.max(gh.humidity + humidChange, 40), 95).toFixed(1));

      // 🤖 Logic สั่งงานอุปกรณ์อัตโนมัติตามค่าที่สุ่มได้
      gh.devices.forEach(device => {
        if (device.type === 'FAN') {
          if (gh.temp > 35) device.is_active = true;
          else if (gh.temp < 32) device.is_active = false;
        }
        if (device.type === 'PUMP') {
          if (gh.humidity < 45) device.is_active = true;
          else if (gh.humidity > 60) device.is_active = false;
        }
      });

      // เซฟสถานะปัจจุบัน
      const savedGh = await this.greenhouseRepository.save(gh);

      // บันทึก Log ลง SensorData เพื่อให้กราฟวิ่ง
      const log = new SensorData();
      log.temp = savedGh.temp;
      log.humidity = savedGh.humidity;
      log.greenhouse = savedGh;
      await this.sensorDataRepository.save(log);

      console.log(`GH:${gh.name} | Temp: ${gh.temp}°C | Humid: ${gh.humidity}%`);
    }
  }

  // 4. ดึงประวัติย้อนหลัง (ใช้โชว์กราฟ)
  async getHistory(id: number): Promise<SensorData[]> {
    return this.sensorDataRepository.find({
      where: { greenhouse: { id } },
      order: { timestamp: 'DESC' },
      take: 20,
    });
  }

  // 5. กรณีอยากกด Sync เองจากหน้าเว็บ (ถ้ามีปุ่ม)
  async syncSensorData(id: number): Promise<Greenhouse> {
    await this.handleCron(); // เรียกใช้ logic เดียวกับตัวสุ่ม
    const updated = await this.greenhouseRepository.findOne({ where: { id }, relations: ['devices'] });
    if (!updated) throw new NotFoundException('ไม่พบโรงเรือน');
    return updated;
  }
}