// src/app/api/categories/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CategoryService } from "@/server/modules/articles/services/category.service";
import { z } from "zod";

// در Next 15، params باید awaited شود
type ParamsPromise = Promise<{ id: string }>;

const UpdateCategorySchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function GET(_req: NextRequest, ctx: { params: ParamsPromise }) {
  const { id } = await ctx.params;
  try {
    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const item = await service.getCategoryById(id);
    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(item, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category get error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: ParamsPromise }) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const parsed = UpdateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const updated = await service.updateCategory(id, parsed);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category update error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: ParamsPromise }) {
  const { id } = await ctx.params;
  try {
    const ds = await getDataSource();
    const service = new CategoryService(ds);
    const ok = await service.deleteCategory(id);
    return NextResponse.json(ok, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category delete error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}
