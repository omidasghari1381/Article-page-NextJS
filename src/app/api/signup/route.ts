import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getDS } from "@/lib/datasource";
import { User } from "@/entities/User";
import { error } from "console";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstname: z.string().min(30),
  surname: z.string().min(60),
  phone: z.string().min(11),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstname, surname, phone } =
      schema.parse(body);

    const ds = await getDS();
    const repo = ds.getRepository(User);

    const exists = await repo.exists({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { message: "ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({
      email,
      passwordHash,
      firstname,
      surname,
      phone,
    });
    await repo.save(user);

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "خطای سرور" },
      { status: 400 }
    );
  }
}
