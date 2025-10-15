// src/app/api/redirect/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const service = new RedirectService();
    const item = await service.getOneById(id);
    if (!item) return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    return NextResponse.json(item, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}

const UpdateRedirectSchema = z.object({
  fromPath: z.string().min(1).regex(/^\/.*/, "fromPath باید با / شروع شود").optional(),
  toPath: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), "toPath باید مسیر داخلی یا URL معتبر باشد")
    .optional(),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const patch = UpdateRedirectSchema.parse(body);
    if (patch.fromPath && patch.toPath && patch.fromPath === patch.toPath) {
      return NextResponse.json({ error: "fromPath equals toPath" }, { status: 400 });
    }
    const service = new RedirectService();
    const updated = await service.update(id, patch as any);
    if (!updated) return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}
