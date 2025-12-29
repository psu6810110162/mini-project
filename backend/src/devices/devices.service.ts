import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceType } from './device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  // ฟังก์ชันสำหรับเปิด-ปิดอุปกรณ์
  async toggleDevice(deviceId: number, shouldTurnOn: boolean): Promise<Device> {
    // 1. ค้นหาอุปกรณ์จาก ID และดึงข้อมูลโรงเรือนมาด้วย (relations)
    const device = await this.devicesRepository.findOne({
      where: { id: deviceId },
      relations: ['greenhouse'], 
    });

    if (!device) {
      throw new NotFoundException(`ไม่พบอุปกรณ์ ID: ${deviceId}`);
    }

    // 2. Logic: ถ้าเป็นการ "เปิด" และอุปกรณ์เป็น "ปั๊มน้ำ"
    if (shouldTurnOn && device.type === DeviceType.PUMP) {
      // นับจำนวนปั๊มที่เปิดอยู่ ในโรงเรือนเดียวกัน
      const activePumps = await this.devicesRepository.count({
        where: {
          greenhouse: { id: device.greenhouse.id }, // เช็คเฉพาะโรงเรือนนี้
          type: DeviceType.PUMP,
          is_active: true,
        },
      });

      // ถ้าเปิดอยู่แล้ว 2 ตัว และกำลังจะเปิดเพิ่ม -> ห้าม!
      if (activePumps >= 2) {
        throw new BadRequestException(
          'ไม่สามารถเปิดปั๊มน้ำเพิ่มได้: อนุญาตให้เปิดพร้อมกันสูงสุดแค่ 2 ตัวในโรงเรือนเดียวกัน',
        );
      }
    }

    // 3. ถ้าผ่านเงื่อนไข ก็บันทึกสถานะใหม่
    device.is_active = shouldTurnOn;
    return await this.devicesRepository.save(device);
  }
}