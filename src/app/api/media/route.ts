// app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { CreateMediaInput, MediaService } from "@/server/modules/media/services/media.service";
import { commitTempUrlToPermanent } from "@/app/utils/commitTemp";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const type = (searchParams.get("type") as "image" | "video" | null) || undefined;
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const result = await svc.listMedia({ q, type, limit, offset });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 400 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1) ورودی خام
    const json = await req.json();

    // 2) اگر url موقت است، اول به دائمی منتقل کن
    if (typeof json?.url === "string" && json.url.startsWith("/uploads/tmp/")) {
      const { url } = await commitTempUrlToPermanent(json.url);
      json.url = url;
    }

    // 3) اعتبارسنجی
    const data = CreateMediaInput.parse(json); // { name, url, type, description? }

    // 4) ذخیره در DB
    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const saved = await svc.createMedia(data);

    return NextResponse.json(saved, { status: 201 });
  } catch (e: any) {
    // اگر move/rename یا validate خطا داد، به کلاینت برگردون
    return NextResponse.json({ error: e?.message ?? "Bad Request" }, { status: 400 });
  }
}