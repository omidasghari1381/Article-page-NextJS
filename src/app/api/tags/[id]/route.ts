import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { TagsService } from "@/server/modules/tags/services/tag.service";

const UpdateTagSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  slug: z.string().min(2).max(180).optional(),
  description: z.string().max(500).nullable().optional(),
});

type Params = { params: { id: string } };

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id?: string; name?: string }> }
) {
  try {
    const { id, name } = await context.params;
    const ds = await getDataSource();
    const service = new TagsService(ds);
    const tags = await service.getTags(id, name);
    return NextResponse.json(tags, { status: 200 });
  } catch (err: any) {
    console.error("❌ tag get error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}



export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = UpdateTagSchema.parse(body);

    const ds = await getDataSource();
    const service = new TagsService(ds);

    const updated = await service.updateTag(params.id, parsed);

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("❌ tag update error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
