import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { TagsService } from "@/server/modules/tags/services/tag.service";

const CreateTagSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(180),
  description: z.string().max(500).nullable().optional(),
});

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateTagSchema.parse(body);

    const ds = await getDataSource();
    const service = new TagsService(ds);

    const newTag = await service.createTag(parsed);

    return NextResponse.json(newTag, { status: 201 });
  } catch (err: any) {
    console.error("❌ Category create error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const ds = await getDataSource();
    const service = new TagsService(ds);
    const effect = await service.deleteTag(body.id);
    return NextResponse.json(effect, { status: 200 });
  } catch (err: any) {
    console.error("❌ tag delete error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;
    const parsed = ListQuerySchema.safeParse({
      page: sp.get("page") ?? undefined,
      perPage: sp.get("perPage") ?? undefined,
      q: sp.get("q") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new TagsService(ds);

    // انتظار می‌رود سرویس متدی شبیه به این داشته باشد؛
    // اگر اسمش فرق می‌کند همان را صدا بزن:
    // listTags({ page, perPage, q })
    const list = await service.listTags(parsed.data);

    return NextResponse.json(list, { status: 200 });
  } catch (err: any) {
    console.error("❌ tag list error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
