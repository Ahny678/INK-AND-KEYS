import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Prompt must be less than 1000 characters' })
  prompt: string;

  @IsString()
  @IsIn(['book', 'chapter'])
  type: 'book' | 'chapter';
}