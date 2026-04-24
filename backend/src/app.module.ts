import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SsrModule } from './ssr/ssr.module';
import { ApiModule } from './api/api.module';
import { FallbackFilter } from './fallback.filter';
import { ScheduleModule } from '@nestjs/schedule';
import { InitService } from './init/init.service';

@Module({
  imports: [PrismaModule, SsrModule, ApiModule, ScheduleModule.forRoot()],
  providers: [FallbackFilter, InitService],
})
export class AppModule {}
