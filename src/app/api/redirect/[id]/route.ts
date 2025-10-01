import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";

// نکته: params اینجا Promise است
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params; // ⬅️ حتما await
    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const item = await service.getOneById(id);
    if (!item) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 }); // ⬅️ 200 به‌جای 201
  } catch (err: any) {
    console.error("❌ redirect GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

const UpdateRedirectSchema = z.object({
  fromPath: z
    .string()
    .min(1, "fromPath الزامی است")
    .regex(/^\/.*/, "fromPath باید با / شروع شود")
    .optional(),
  toPath: z
    .string()
    .min(1, "toPath الزامی است")
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
      "toPath باید مسیر داخلی یا URL معتبر باشد"
    )
    .optional(),
  statusCode: z
    .union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params; // ⬅️ حتما await
    const body = await req.json();
    const parsed = UpdateRedirectSchema.parse(body);

    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const updated = await service.update(id, parsed);
    if (!updated) {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("❌ Redirect update error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
