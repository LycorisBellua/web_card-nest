import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SsrModule } from './ssr/ssr.module';
import { ApiModule } from './api/api.module';
import { FallbackFilter } from './fallback.filter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, SsrModule, ApiModule, ScheduleModule.forRoot()],
  providers: [FallbackFilter],
})
export class AppModule {}
