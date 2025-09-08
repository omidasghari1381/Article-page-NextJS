import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "@/server/modules/users/entities/user.entity";
import { AppDataSource } from "@/server/db/typeorm.datasource";

export const runtime = "nodejs";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  password: z.string().min(6),
});

function normalizeIranPhone(input: string): string {
  const v = String(input).trim();
  if (/^\+98\d{10}$/.test(v)) return v;
  if (/^0098\d{10}$/.test(v)) return "+" + v.slice(2);
  if (/^0?9\d{9}$/.test(v)) return "+98" + v.replace(/^0/, "");
  throw new Error("شماره موبایل نامعتبر است. فرمت درست مثل +98912xxxxxxx");
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();

    const mapped = {
      firstName: raw.firstName ?? raw.firstname ?? raw.fname,
      lastName: raw.lastName ?? raw.surname ?? raw.lname,
      phone: raw.phone,
      password: raw.password,
    };

    const { firstName, lastName, phone, password } = schema.parse(mapped);
    const normPhone = normalizeIranPhone(phone);

    // DataSource
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repo = AppDataSource.getRepository(User);

    const exists = await repo.exists({ where: { phone: normPhone } });
    if (exists) {
      return NextResponse.json(
        { message: "این شماره قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = repo.create({
      firstName,
      lastName,
      phone: normPhone,
      passwordHash,
    });
    await repo.save(user);

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "خطای سرور" },
      { status: 400 }
    );
  }
}
