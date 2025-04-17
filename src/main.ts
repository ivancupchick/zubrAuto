import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common/interfaces';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './core/filters/http-exception/http-exception.filter';

(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

async function bootstrap() {
  let app: INestApplication<any> = null;

  if (process.env.NODE_ENV !== 'production') {
    app = await NestFactory.create(AppModule, { cors: {
      credentials: true,
      origin: 'http://localhost:4200' // delete in dev and nice to have if client and server have dirent adreses
    } });
  } else {
    app = await NestFactory.create(AppModule, { cors: true });
  }

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());

  await app.listen(process.env.PORT);
}
bootstrap();
