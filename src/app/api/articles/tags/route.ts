import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource"; // همونی که قبلاً ساختی
import { TagsService } from "@/server/modules/articles/services/tag.service";

const CreateTagSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(180),
  description: z.string().max(500).nullable().optional(),
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

    return NextResponse.json({ error: err.message ?? "Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req:NextRequest,
) {
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