import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class GenerateCoverDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Prompt must be less than 1000 characters' })
  prompt: string;
}