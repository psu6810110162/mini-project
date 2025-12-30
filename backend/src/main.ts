import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ เปิดให้ Frontend (Port อื่น) ยิงเข้ามาได้
  app.enableCors(); 
  
  await app.listen(3000);
  console.log('🚀 Server is running on http://localhost:3000');
}
bootstrap();