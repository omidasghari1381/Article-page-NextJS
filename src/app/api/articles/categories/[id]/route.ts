import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CategoryService } from "@/server/modules/articles/services/category.service";

const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(150).optional(),
  slug: z.string().min(2).max(180).optional(),
  description: z.string().max(500).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = UpdateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new CategoryService(ds);

    const updated = await service.updateCategory(params.id, parsed);

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("❌ Category update error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json({ error: err.message ?? "Server Error" }, { status: 500 });
  }
}
