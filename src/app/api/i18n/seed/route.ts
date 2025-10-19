// src/app/api/dev/i18n/seed/route.ts
import { I18nService } from "@/server/modules/i18n/service/i18n.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const svc = new I18nService();
    await svc.ensureBaseLocales();
    return NextResponse.json({ ok: true, message: "Locales seeded: fa-IR, en" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "seed failed" }, { status: 500 });
  }
}