import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
}
