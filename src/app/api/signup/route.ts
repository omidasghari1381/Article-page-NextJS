import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { User } from '@/server/modules/users/entities/user.entity';
import { AppDataSource } from '@/server/db/typeorm.datasource';

export const runtime = 'nodejs';

const schema = z.object({
  firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر'),
  phone: z.string().regex(/^\+\d{10,14}$/, 'شماره باید با + شروع شود، مثل +98912...'),
  password: z.string().min(6, 'حداقل ۶ کاراکتر'),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const { firstName, lastName, phone, password } = schema.parse(raw);

    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);

    const exists = await repo.exists({ where: { phone } });
    if (exists) {
      return NextResponse.json({ ok: false, message: 'این شماره قبلاً ثبت شده است.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({ firstName, lastName, phone, passwordHash });
    await repo.save(user);

    return NextResponse.json(
      { ok: true, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone } },
      { status: 201 }
    );
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || 'خطای سرور';
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }
}