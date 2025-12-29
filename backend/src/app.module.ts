import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import Modules ของเรา (เดี๋ยวเราค่อยสร้างไฟล์พวกนี้ทีหลัง)
import { GreenhousesModule } from './greenhouses/greenhouses.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',        
        port: 5432,                
        username: 'admin',         
        password: 'password123', 
        database: 'agricontrol',    
      
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    GreenhousesModule,
    DevicesModule,
  ],
})
export class AppModule {}