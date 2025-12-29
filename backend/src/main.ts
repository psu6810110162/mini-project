import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('CHECK DB HOST:', process.env.POSTGRES_HOST);
  console.log('CHECK DB PASSWORD:', process.env.POSTGRES_PASSWORD);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();