// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  MediaService,
  UpdateMediaInput,
} from "@/server/modules/media/services/media.service";
import { commitTempUrlToPermanent } from "@/app/utils/commitTemp";
import path from "path";
import { promises as fsp } from "node:fs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const item = await svc.getMediaById((await params).id);
    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: 400 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const ds = await getDataSource();
    const svc = new MediaService(ds);

    // رکورد فعلی
    const current = await svc.getMediaById(id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ورودی خام
    const raw = (await req.json()) as Record<string, any>;

    // اگر url نیومده، یعنی قصد تغییر فایل نداریم → فقط سایر فیلدها
    if (typeof raw.url === "undefined") {
      const updates = UpdateMediaInput.parse(raw);
      const updated = await svc.updateMedia(id, updates);
      return NextResponse.json(updated);
    }

    // اگر url اومده:
    let nextUrl: string | undefined = raw.url;
    let deleteOldAfterSuccess: string | null = null;

    // اگر همونه که قبلاً ثبت شده، دست نزنیم به فایل
    if (typeof raw.url === "string" && raw.url === current.url) {
      // همون URL فعلی؛ لازم نیست چیزی تغییر بدیم
      // از updates، فیلد url رو حذف می‌کنیم که بیخودی ذخیره نشه
      delete raw.url;
    } else if (
      typeof raw.url === "string" &&
      raw.url.startsWith("/uploads/tmp/")
    ) {
      // فقط در این حالت (ویرایش + فایل جدید temp) منتقل کن
      try {
        const { url } = await commitTempUrlToPermanent(raw.url);
        nextUrl = url;
        // بعد از موفقیت ذخیره، فایل قدیمی رو پاک کن (اختیاری)
        // فقط اگر قبلی مسیر دائمی بود
        if (current.url && current.url.startsWith("/uploads/media/")) {
          deleteOldAfterSuccess = current.url;
        }
      } catch (err: any) {
        // اگر فایل temp پیدا نشد یا قبلاً منتقل شده بود
        return NextResponse.json(
          { error: err?.message || "انتقال فایل موقت ناموفق بود" },
          { status: 400 }
        );
      }
    } else {
      // URL جدید ولی temp نیست؛ همون رو ذخیره کن (مثلاً کاربر دستی آدرس CDN داده)
      // nextUrl = raw.url (از بالا مقدار گرفته)
    }

    // ساخت updates با URL نهایی (اگر لازم بود)
    const payload = {
      ...raw,
      ...(typeof nextUrl === "string" ? { url: nextUrl } : {}), // اگر url حذف شده بود، دست نزن
    };

    // اعتبارسنجی
    const updates = UpdateMediaInput.parse(payload);

    // ذخیره در DB
    const updated = await svc.updateMedia(id, updates);

    // پاکسازی فایل قبلی بعد از موفقیت (اختیاری)
    if (deleteOldAfterSuccess) {
      // path واقعی روی دیسک
      const absOldPath = path.join(
        process.cwd(),
        "public",
        deleteOldAfterSuccess.replace(/^\/+/, "")
      );
      fsp.unlink(absOldPath).catch(() => {
        // Silent; می‌تونی لاگ کنی
      });
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    const msg = e?.message ?? "Bad Request";
    const status = /not found/i.test(msg) ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const service = new MediaService(ds);
    await service.deleteMedia((await params).id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e.message ?? "Bad Request";
    const status = /not found/i.test(msg) ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}