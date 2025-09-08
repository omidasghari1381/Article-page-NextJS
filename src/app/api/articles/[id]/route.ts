import { NextResponse } from "next/server";

import { ArticlesService } from "@/server/modules/articles/services/articles.service";
import { UploadsService } from "@/server/modules/uploads/services/uploads.service";
import { AppDataSource } from "@/server/lib/datasource";
import { ArticleRepository } from "@/server/modules/articles/repository/article.repository";

let _service: ArticlesService | null = null;
async function getService(): Promise<ArticlesService> {
  if (_service) return _service;
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  const repo = new ArticleRepository(AppDataSource);
  const uploads = new UploadsService();
  _service = new ArticlesService(repo, uploads);
  return _service;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getService();
    const result = await service.getArticle(1, params.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getService();
    const result = await service.deleteArticle(params.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to delete article" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getService();
    const result = await service.changeArticleStatus(params.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to change status" },
      { status: 500 }
    );
  }
}
