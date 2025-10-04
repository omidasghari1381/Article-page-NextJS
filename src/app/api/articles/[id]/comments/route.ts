import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { ArticleService } from "@/server/modules/articles/services/article.service";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

/** ---------- Schemas ---------- */
const IdSchema = z.object({ id: z.string().uuid("Invalid article id") });

const ListQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(50).default(10),
  withReplies: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => (v === "1" ? true : v === "0" ? false : Boolean(v))),
});

const CreateCommentSchema = z.object({
  userId: z.string().uuid(),
  text: z.string().trim().min(1),
});

/** ---------- Handlers ---------- */

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const raw = await ctx.params;
    const idParsed = IdSchema.safeParse(raw);
    if (!idParsed.success) {
      return NextResponse.json({ error: "ValidationError" }, { status: 400 });
    }

    const sp = new URL(req.url).searchParams;
    const qp = {
      skip: sp.get("skip") ?? undefined,
      take: sp.get("take") ?? undefined,
      withReplies: sp.get("withReplies") ?? undefined,
    };
    const parsed = ListQuerySchema.safeParse(qp);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const svc = new ArticleService(ds);

    const out = await svc.listComments(idParsed.data.id, parsed.data);
    return NextResponse.json(out, { status: 200 });
  } catch (err: any) {
    if (err?.message === "ArticleNotFound") {
      return NextResponse.json({ error: "ArticleNotFound" }, { status: 404 });
    }
    console.error("GET /api/articles/[id]/comments error:", err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const raw = await ctx.params;
    const idParsed = IdSchema.safeParse(raw);
    if (!idParsed.success) {
      return NextResponse.json({ error: "ValidationError" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "InvalidBody", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const svc = new ArticleService(ds);

    const saved = await svc.addComment(
      idParsed.data.id,
      parsed.data.userId,
      parsed.data.text
    );

    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (err: any) {
    if (err?.message === "ArticleNotFound")
      return NextResponse.json({ error: "ArticleNotFound" }, { status: 404 });
    if (err?.message === "UserNotFound")
      return NextResponse.json({ error: "UserNotFound" }, { status: 404 });
    console.error("POST /api/articles/[id]/comments error:", err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
