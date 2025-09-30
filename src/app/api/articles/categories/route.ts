import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CategoryService } from "@/server/modules/articles/services/category.service";

const CreateCategorySchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(180),
  description: z.string().max(500).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new CategoryService(ds);

    const newCategory = await service.createCategory(parsed);

    return NextResponse.json(newCategory, { status: 201 });
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

export async function GET(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new CategoryService(ds);

    const newCategory = await service.createCategory(parsed);

    return NextResponse.json(newCategory, { status: 201 });
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
