import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SsrModule } from './ssr/ssr.module';
import { ApiModule } from './api/api.module';
import { FallbackFilter } from './fallback.filter';

@Module({
  imports: [PrismaModule, SsrModule, ApiModule],
  providers: [FallbackFilter],
})
export class AppModule {}
