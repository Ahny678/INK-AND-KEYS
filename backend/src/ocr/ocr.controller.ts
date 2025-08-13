import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OcrService } from './ocr.service';
import { ProcessOcrDto, OcrStatusDto } from './dto';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('process')
  @HttpCode(HttpStatus.ACCEPTED)
  async processOcr(
    @Body() processOcrDto: ProcessOcrDto,
    @CurrentUser() user: any,
  ): Promise<{ message: string; jobId: string }> {
    // Start OCR processing asynchronously
    this.ocrService.processImage(
      processOcrDto.fileId,
      processOcrDto.filePath,
      user.id,
      processOcrDto.originalFileName,
    ).catch(error => {
      // Error is already handled in the service, this is just for logging
      // Note: This console.error will appear in test output when testing error scenarios
      console.error('OCR processing failed:', error);
    });

    return {
      message: 'OCR processing started',
      jobId: processOcrDto.fileId,
    };
  }

  @Get('status/:fileId')
  async getOcrStatus(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ): Promise<OcrStatusDto> {
    return this.ocrService.getOcrStatus(fileId);
  }

  @Post('retry/:fileId')
  @HttpCode(HttpStatus.ACCEPTED)
  async retryOcrProcessing(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string; jobId: string }> {
    // Start retry processing asynchronously
    this.ocrService.retryOcrProcessing(fileId, user.id).catch(error => {
      console.error('OCR retry failed:', error);
    });

    return {
      message: 'OCR retry started',
      jobId: fileId,
    };
  }
}