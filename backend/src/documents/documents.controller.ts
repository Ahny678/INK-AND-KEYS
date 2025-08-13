import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.create(user.id, createDocumentDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.update(id, user.id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.documentsService.remove(id, user.id);
  }
}