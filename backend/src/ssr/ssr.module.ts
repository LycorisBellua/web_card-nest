import { Module } from '@nestjs/common';
import { SsrService } from './ssr.service';

@Module({
  providers: [SsrService],
  exports: [SsrService],
})
export class SsrModule {}
