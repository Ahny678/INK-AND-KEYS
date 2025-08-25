import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIImageService } from './ai-image.service';

@Module({
  imports: [ConfigModule],
  providers: [AIImageService],
  exports: [AIImageService],
})
export class AIImageModule {}