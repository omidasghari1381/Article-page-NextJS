import { IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @MinLength(8)
  title!: string;

  @IsNotEmpty()
  @MinLength(8)
  text!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}