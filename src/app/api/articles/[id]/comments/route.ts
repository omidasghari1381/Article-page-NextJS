// app/api/articles/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { User } from "@/server/modules/users/entities/user.entity";

export const runtime = "nodejs";
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const ds = await getDataSource();
    const commentRepo = ds.getRepository(CommentArticle);
    const articleRepo = ds.getRepository(Article);
    const replyRepo = ds.getRepository(ReplyComment);

    // اطمینان از وجود آرتیکل
    const articleExists = await articleRepo.exist({ where: { id } });
    if (!articleExists) {
      return NextResponse.json({ error: "ArticleNotFound" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const skip = Number(searchParams.get("skip") ?? 0);
    const take = Math.min(Number(searchParams.get("take") ?? 10), 50);
    const withReplies = searchParams.get("withReplies") === "1";

    // چون OneToMany تعریف نکرده‌ایم، ابتدا کامنت‌ها را می‌گیریم
    const [comments, total] = await commentRepo.findAndCount({
      where: { article: { id } },
      relations: ["user"], // نویسندهٔ کامنت
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    // اگر ریپلای هم خواستی، برای هر کامنت ریپلای‌ها را می‌گیریم
    if (withReplies && comments.length) {
      const commentIds = comments.map((c) => c.id);
      const replies = await replyRepo
        .createQueryBuilder("reply")
        .leftJoinAndSelect("reply.user", "user")
        .leftJoinAndSelect("reply.comment", "comment") // مهم: comment لود شود
        .where("comment.id IN (:...ids)", { ids: commentIds })
        .orderBy("reply.createdAt", "ASC")
        .getMany();

      // Map ریپلای‌ها به کامنت‌ها

      const grouped = replies.reduce<Record<string, ReplyComment[]>>(
        (acc, r) => {
          const cid = r.comment.id;
          (acc[cid] ??= []).push(r);
          return acc;
        },
        {}
      );

      const payload = comments.map((c) => ({
        ...c,
        replies: grouped[c.id] ?? [],
      }));

      return NextResponse.json({ data: payload, total, skip, take });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}

// POST /api/articles/:id/comments
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
    const articleRepo = ds.getRepository(Article);
    const userRepo = ds.getRepository(User);
    const commentRepo = ds.getRepository(CommentArticle);

    const [article, user] = await Promise.all([
      articleRepo.findOne({ where: { id } }),
      userRepo.findOne({ where: { id: userId } }),
    ]);

    if (!article)
      return NextResponse.json({ error: "ArticleNotFound" }, { status: 404 });
    if (!user)
      return NextResponse.json({ error: "UserNotFound" }, { status: 404 });

    const comment = commentRepo.create({
      text: String(text).trim(),
      user,
      article,
    });
    const saved = await commentRepo.save(comment);
    const withUser = await commentRepo.findOne({
      where: { id: saved.id },
      relations: ["user"],
    });
    return NextResponse.json({ data: withUser }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
