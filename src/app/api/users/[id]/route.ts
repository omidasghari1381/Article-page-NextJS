// src/app/api/users/[id]/route.ts  (یا app/users/[id]/route.ts بسته به ساختار پروژه‌ات)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import type { userRoleEnum } from "@/server/modules/users/enums/userRoleEnum";
import { UserService, type UpdateUserDto } from "@/server/modules/users/services/users.service";

type Ctx = { params: { id: string } };

// اسکیما برای PATCH — دقیقاً همون فیلدهایی که در سرویس مجازند
const UpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().min(3).max(20).optional(),
  passwordHash: z.string().trim().min(1).max(255).optional(),
  role: z.union([z.string(), z.number()]).optional() as unknown as z.ZodType<userRoleEnum | undefined>,
});

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const svc = new UserService(ds);
    const user = await svc.getOneById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err: any) {
    console.error("❌ user get error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const raw = await req.json();
    const parsed = UpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // اگر role به صورت number/ string اومده، بدون سختگیری پاس می‌دیم
    const dto: UpdateUserDto = { ...parsed.data } as UpdateUserDto;

    const ds = await getDataSource();
    const svc = new UserService(ds);
    const updated = await svc.update(params.id, dto);

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ user patch error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const svc = new UserService(ds);
    const ok = await svc.remove(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ user delete error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}
