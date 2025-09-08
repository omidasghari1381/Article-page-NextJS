// src/server/modules/faq/dto/faq.dto.ts
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { faqCategory } from "../enums/faqCategory.enum";

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  question!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;

  @IsEnum(faqCategory)
  category!: faqCategory;
}