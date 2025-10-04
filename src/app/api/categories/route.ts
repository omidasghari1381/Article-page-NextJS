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

const ListQuerySchema = z.object({
  q: z.string().trim().optional(),
  parentId: z.string().uuid().optional(),
  hasParent: z.enum(["yes", "no"]).optional(),
  depthMin: z.coerce.number().int().min(0).optional(),
  depthMax: z.coerce.number().int().min(0).optional(),
  createdFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  createdTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "slug", "depth"])
    .optional(),
  sortDir: z.enum(["ASC", "DESC"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = ListQuerySchema.parse(Object.fromEntries(url.searchParams));

    const ds = await getDataSource();
    const svc = new CategoryService(ds);

    const data = await svc.listWithFilters(parsed);

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error("❌ categories list error:", err);
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

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const ok = await service.deleteCategory(body.id);
    return NextResponse.json(ok, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category delete error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
