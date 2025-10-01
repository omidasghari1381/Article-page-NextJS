// src/app/api/categories/route.ts
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CategoryService } from "@/server/modules/articles/services/category.service";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, "نام الزامی است"),
  slug: z.string().trim().min(1, "اسلاگ الزامی است"),
  description: z.string().trim().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function GET(_req: NextRequest) {
  try {
    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const items = await service.listCategories();
    return NextResponse.json(items, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category list error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const created = await service.createCategory(parsed);

    return NextResponse.json({ created }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Category create error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
