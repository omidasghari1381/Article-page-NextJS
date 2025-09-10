// app/api/comments/[id]/replies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { User } from "@/server/modules/users/entities/user.entity";

export const runtime = "nodejs";

// GET /api/comments/:id/replies
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const ds = await getDataSource();
    const commentRepo = ds.getRepository(CommentArticle);
    const replyRepo = ds.getRepository(ReplyComment);

    const commentExists = await commentRepo.exist({ where: { id } });
    if (!commentExists) {
      return NextResponse.json({ error: "CommentNotFound" }, { status: 404 });
    }

    const replies = await replyRepo.find({
      where: { comment: { id } },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    return NextResponse.json({ data: replies });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}

// POST /api/comments/:id/replies
// body: { userId: string; text: string; }
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { userId, text } = body ?? {};

    if (!userId || !text?.trim()) {
      return NextResponse.json({ error: "InvalidBody" }, { status: 400 });
    }

    const ds = await getDataSource();
    const commentRepo = ds.getRepository(CommentArticle);
    const userRepo = ds.getRepository(User);
    const replyRepo = ds.getRepository(ReplyComment);

    const [comment, user] = await Promise.all([
      commentRepo.findOne({ where: { id } }),
      userRepo.findOne({ where: { id: userId } }),
    ]);

    if (!comment) return NextResponse.json({ error: "CommentNotFound" }, { status: 404 });
    if (!user) return NextResponse.json({ error: "UserNotFound" }, { status: 404 });

    const reply = replyRepo.create({
      text: String(text).trim(),
      user,
      comment,
    });

    const saved = await replyRepo.save(reply);
    const withUser = await replyRepo.findOne({
      where: { id: saved.id },
      relations: ["user"],
    });

    return NextResponse.json({ data: withUser }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}