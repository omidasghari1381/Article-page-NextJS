import { NextResponse } from "next/server";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { ArticlesService } from "@/server/modules/articles/services/articles.service";
import { UploadsService } from "@/server/modules/uploads/services/uploads.service";
import { AppDataSource } from "@/server/lib/datasource";
import { ArticleRepository } from "@/server/modules/articles/repository/article.repository";
import { CreateArticleDto } from "@/server/modules/articles/dto/createArticle.dto";

let _service: ArticlesService | null = null;
async function getService(): Promise<ArticlesService> {
  if (_service) return _service;
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  const repo = new ArticleRepository(AppDataSource);
  const uploads = new UploadsService();
  _service = new ArticlesService(repo, uploads);
  return _service;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dto = plainToInstance(CreateArticleDto, body);
    const errors = await validate(dto);
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const service = await getService();
    const result = await service.createArticle(dto, dto.thumbnail);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create article" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");

    const service = await getService();
    const result = await service.getArticle(page);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
