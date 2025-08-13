import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessOcrDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  originalFileName: string;
}