import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { Article } from "@/server/modules/articles/entities/article.entity";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    console.log(ctx.params);
    const { id } = await ctx.params;
    const ds = await getDataSource();
    const repo = ds.getRepository(Article);
    const item = await repo.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!item) {
      return NextResponse.json({ error: "NotFound" }, { status: 404 });
    }

    return NextResponse.json({
      id: item.id,
      title: item.title,
      subject: item.subject, 
      category: item.category,
      readingPeriod: item.readingPeriod,
      showStatus: item.showStatus,
      viewCount: item.viewCount,
      thumbnail: item.thumbnail,
      Introduction: item.Introduction,
      mainText: item.mainText,
      secondryText: item.secondryText,
      author: item.author
        ? {
            id: (item.author as any).id,
            firstName: (item.author as any).firstName,
            lastName: (item.author as any).lastName,
          }
        : null,
      createdAt: item.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
