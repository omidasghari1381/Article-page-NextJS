import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_BASE = process.env.UPLOAD_BASE_DIR || "public/uploads";
const TMP_DIR = path.join(UPLOAD_BASE, "tmp");

export async function DELETE(_req: NextRequest, { params }: { params: { tempId: string } }) {
  const { tempId } = params;
  if (!tempId) return NextResponse.json({ error: "tempId required" }, { status: 400 });

  // فایل با هر پسوندی که باشد، حذفش می‌کنیم
  // (چون نام‌گذاری ما tempId + ext بود)
  try {
    const files = await fsp.readdir(TMP_DIR);
    const targets = files.filter(f => f.startsWith(tempId));
    await Promise.all(targets.map(f => fsp.unlink(path.join(TMP_DIR, f))));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // اگر نبود، ok بدهیم تا idempotent باشد
    if (e?.code === "ENOENT") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: e?.message || "Delete failed" }, { status: 500 });
  }
}
