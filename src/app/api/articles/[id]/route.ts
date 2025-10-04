import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { ArticleService } from "@/server/modules/articles/services/article.service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const IdSchema = z.object({ id: z.string().uuid("Invalid article id") });

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const raw = await ctx.params;
    const parsed = IdSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "ValidationError" }, { status: 400 });
    }

    const ds = await getDataSource();
    const svc = new ArticleService(ds);

    const dto = await svc.getByIdAndIncrementView(parsed.data.id);
    if (!dto) return NextResponse.json({ error: "NotFound" }, { status: 404 });

    return NextResponse.json(dto, { status: 200 });
  } catch (e) {
    console.error("GET /api/articles/[id] error:", e);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
