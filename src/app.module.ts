import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './modules/client/client.module';
import { FieldsModule } from './core/fields/fields.module';
import { UserModule } from './modules/user/user.module';
import { CarModule } from './modules/car/car.module';
import { CallRequestModule } from './modules/call-request/call-request.module';
import { PhoneCallModule } from './modules/phone-call/phone-call.module';
import { RoleModule } from './modules/role/role.module';
import { ChangeLogModule } from './modules/change-log/change-log.module';
import { FilesModule } from './core/files/files.module';
import { TokenService } from './core/auth/token.service';
import { AuthModule } from './core/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '/ui/', ''),
    }),
    ClientModule,
    FieldsModule,
    UserModule,
    CarModule,
    CallRequestModule,
    PhoneCallModule,
    RoleModule,
    ChangeLogModule,
    FilesModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TokenService],
})
export class AppModule {}
