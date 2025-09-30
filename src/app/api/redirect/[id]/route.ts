import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    console.log("redirect id", params);
    const ds = await getDataSource();
    const service = new RedirectService(ds);
    const newCategory = await service.getOneById(params.id);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err: any) {
    console.error("❌ redirect GET create error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message ?? "Server Error" },
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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = UpdateRedirectSchema.parse(body);

    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const updated = await service.update(params.id, parsed);
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
