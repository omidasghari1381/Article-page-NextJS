// src/app/api/i18n/publish/route.ts
import { I18nPublishService } from "@/server/modules/i18n/service/i18n.service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await I18nPublishService.publishAllActiveLocales();
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "publish failed" }, { status: 500 });
  }
}