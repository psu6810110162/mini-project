import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ เปิดให้ Frontend (Port อื่น) ยิงเข้ามาได้
  app.enableCors(); 

  // เพิ่ม ValidationPipe เพื่อให้ DTO validation ทำงาน
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  await app.listen(3000);
  console.log('🚀 Server is running on http://localhost:3000');
}
bootstrap();