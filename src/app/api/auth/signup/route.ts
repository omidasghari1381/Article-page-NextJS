import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";

function normalizePhoneToE164Iran(input: string): string {
  const v = String(input).trim();
  if (/^\+98\d{10}$/.test(v)) return v;
  if (/^0098\d{10}$/.test(v)) return "+" + v.slice(2);
  if (/^0?9\d{9}$/.test(v)) return "+98" + v.replace(/^0/, "");
  throw new Error("Invalid Iranian phone");
}

export async function POST(req: Request) {
  try {
    const { getDataSource } = await import("@/server/db/typeorm.datasource");
    const ds = await getDataSource();
    const { User } = await import(
      "@/server/modules/users/entities/user.entity"
    );

    const repo = ds.getRepository(User);
    const body = await req.json();
    const phone = normalizePhoneToE164Iran(body.phone);

    const exitingUser = await repo.findOne({ where: { phone } });
    if (exitingUser)
      return { status: 409, message: "Phone already registered", ok: 0 };
    const passwordHash = await bcrypt.hash(body.password, 10);

    const newUser = repo.create({
      firstName: body.firstName,
      lastName: body.lastName,
      phone: phone,
      passwordHash: passwordHash,
    });

    await repo.save(newUser);
    const { passwordHash: _, ...safe } = newUser as any;

    console.log(newUser);
    return NextResponse.json({ ok: 1, userId: safe });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "server error" },
      { status: 500 }
    );
  }
}
