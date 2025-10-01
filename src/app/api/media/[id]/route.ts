// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  MediaService,
  UpdateMediaInput,
} from "@/server/modules/media/services/media.service";
import { commitTempUrlToPermanent } from "@/app/utils/commitTemp";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const item = await svc.getMediaById(params.id);
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

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const ds = await getDataSource();
    const svc = new MediaService(ds);

    // رکورد فعلی را بگیر تا اگر URL عوض شد، بتونیم بعداً فایل قدیمی را پاک کنیم (اختیاری)
    const current = await svc.getMediaById(params.id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 1) ورودی خام
    const raw = await req.json();

    // 2) اگر url جدید موقت است، اول انتقال بده
    if (typeof raw?.url === "string" && raw.url.startsWith("/uploads/tmp/")) {
      const { url } = await commitTempUrlToPermanent(raw.url);
      raw.url = url;
    }

    // 3) اعتبارسنجی
    const updates = UpdateMediaInput.parse(raw); // name?, url?, type?, description?

    // 4) بروزرسانی DB
    const updated = await svc.updateMedia(params.id, updates);

    // 5) (اختیاری) اگر URL تغییر کرده و خواستی فایل قدیمی را پاک کنی:
    //    این کار را پس از موفقیت ذخیره انجام بده. مراقب باش فایل قدیمی tmp نبود.
    // if (updates.url && current.url && current.url !== updates.url && !current.url.startsWith("/uploads/tmp/")) {
    //   try {
    //     // اینجا سرویس حذف فایل دائمی خودت را صدا بزن (مثلاً fs.unlink)
    //     // await deletePhysicalFileByPublicUrl(current.url);
    //   } catch {
    //     // silent (لاگ کن)
    //   }
    // }

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
    const svc = new MediaService(ds);
    await svc.deleteMedia(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e.message ?? "Bad Request";
    const status = /not found/i.test(msg) ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
