import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule'; // ใช้สำหรับตั้งเวลาทำงานอัตโนมัติ
import { Greenhouse } from './greenhouse.entity';
import { SensorData } from './sensor-data.entity'; // อย่าลืม import Entity นี้

@Injectable()
export class GreenhousesService {
  constructor(
    @InjectRepository(Greenhouse)
    private greenhouseRepository: Repository<Greenhouse>,

    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>, // Inject เข้ามาเพื่อบันทึกประวัติ
  ) {}

  // 1. สร้างโรงเรือน
  async create(name: string): Promise<Greenhouse> {
    const greenhouse = new Greenhouse();
    greenhouse.name = name;
    return this.greenhouseRepository.save(greenhouse);
  }

  // 2. ดึงข้อมูลทั้งหมด (รวมอุปกรณ์ข้างใน)
  findAll(): Promise<Greenhouse[]> {
    return this.greenhouseRepository.find({
      relations: ['devices'], 
      order: { id: 'ASC' },
    });
  }

  // 3. ⏰ นาฬิกาปลุก: ทำงานเองทุกๆ 5 วินาที
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    // ดึงโรงเรือนทั้งหมดมาเช็ค
    const greenhouses = await this.greenhouseRepository.find();
    
    // วนลูปอัปเดตทีละหลัง
    for (const gh of greenhouses) {
      await this.syncSensorData(gh.id);
    }
  }

  // 4. 🔥 ฟังก์ชันหลัก: จำลอง Sensor + สั่งงานอุปกรณ์ + บันทึกประวัติ
  async syncSensorData(id: number): Promise<Greenhouse> {
    const greenhouse = await this.greenhouseRepository.findOne({ 
      where: { id },
      relations: ['devices'] 
    });

    if (!greenhouse) throw new NotFoundException('ไม่เจอโรงเรือน');

    // --- (A) จำลองค่าสภาพอากาศ (Random) ---
    // อุณหภูมิ: 25 - 40 องศา
    greenhouse.temp = parseFloat((Math.random() * (40 - 25) + 25).toFixed(1));
    // ความชื้น: 30 - 80 %
    greenhouse.humidity = parseFloat((Math.random() * (80 - 30) + 30).toFixed(1));

    console.log(`[Auto] GH:${id} | Temp: ${greenhouse.temp}°C | Humid: ${greenhouse.humidity}%`);

    // --- (B) 🤖 Automation Logic (สั่งงานอัตโนมัติ) ---
    greenhouse.devices.forEach(device => {
      
      // ✅ กฎพัดลม (FAN): ถ้าเกิน 35 องศา -> เปิด
      if (device.type === 'FAN') {
        if (greenhouse.temp > 35.0) {
          device.is_active = true;
          console.log(`   -> 🔥 ร้อนจัด (${greenhouse.temp}°C)! เปิดพัดลม: ${device.name}`);
        } else {
          device.is_active = false;
        }
      }

      // ✅ กฎปั๊มน้ำ (PUMP): ถ้าความชื้นต่ำกว่า 40% -> เปิด
      if (device.type === 'PUMP') {
        if (greenhouse.humidity < 40.0) {
          device.is_active = true;
          console.log(`   -> 🌵 ดินแห้ง (${greenhouse.humidity}%)! เปิดปั๊ม: ${device.name}`);
        } else {
          device.is_active = false;
        }
      }

    });

    // --- (C) บันทึกข้อมูล ---
    
    // 1. บันทึกสถานะปัจจุบัน (เอาไว้โชว์หน้าเว็บ Real-time)
    const savedGh = await this.greenhouseRepository.save(greenhouse);

    // 2. บันทึกประวัติ (Log) ลงตาราง SensorData (เอาไว้ทำกราฟย้อนหลัง)
    const log = new SensorData();
    log.temp = greenhouse.temp;
    log.humidity = greenhouse.humidity;
    log.greenhouse = savedGh;
    
    await this.sensorDataRepository.save(log);

    return savedGh;
  }
  async getHistory(id: number): Promise<SensorData[]> {
    return this.sensorDataRepository.find({
      where: { greenhouse: { id } }, // หาตาม ID โรงเรือน
      order: { timestamp: 'DESC' },  // เอาล่าสุดขึ้นก่อน
      take: 20, // ดึงแค่ 20 รายการล่าสุด (เดี๋ยวรก)
    });
  }
}