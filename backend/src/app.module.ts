import { Module } from '@nestjs/common';
import { SsrModule } from './ssr/ssr.module';
import { ApiModule } from './api/api.module';
import { FallbackFilter } from './fallback.filter';

@Module({
  imports: [SsrModule, ApiModule],
  providers: [FallbackFilter],
})
export class AppModule {}
