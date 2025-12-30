import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// 👇 แก้บรรทัดนี้: เติม s ต่อท้าย
import { GreenhousesModule } from './greenhouses/greenhouses.module'; 
import { DevicesModule } from './devices/devices.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Greenhouse } from './greenhouses/greenhouse.entity';
import { Device } from './devices/device.entity';
import { SensorData } from './greenhouses/sensor-data.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ... config เดิมของน้อง ...
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'agricontrol',
      entities: [User, Role, Greenhouse, Device, SensorData],
      synchronize: true,
    }),
    GreenhousesModule, // 👈 แก้ตรงนี้ด้วย: เติม s ให้ตรงกับข้างบน
    DevicesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}