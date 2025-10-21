// src/app/api/dev/i18n/seed-text/route.ts
import { I18nService } from "@/server/modules/i18n/service/i18n.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const svc = new I18nService();

    // اطمینان از وجود لوکال‌ها
    await svc.ensureBaseLocales();

    // چند کلید تستی
    await svc.upsertValue("common", "hello", "fa-IR", "سلام دنیا");
    await svc.upsertValue("common", "hello", "en", "Hello world");

    await svc.upsertValue("nav", "home", "fa-IR", "خانه");
    await svc.upsertValue("nav", "home", "en", "Home");

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}