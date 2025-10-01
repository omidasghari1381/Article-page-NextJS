// app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  CreateMediaInput,
  MediaService,
} from "@/server/modules/media/services/media.service";
import { commitTempUrlToPermanent } from "@/app/utils/commitTemp";
import type { SimpleMediaType } from "@/server/modules/media/enums/media.enums";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const type =
      (searchParams.get("type") as SimpleMediaType | null) || undefined;
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const result = await svc.listMedia({ q, type, limit, offset });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: 400 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    if (typeof json?.url === "string" && json.url.startsWith("/uploads/tmp/")) {
      const { url } = await commitTempUrlToPermanent(json.url);
      json.url = url;
    }

    const data = CreateMediaInput.parse(json);

    const ds = await getDataSource();
    const svc = new MediaService(ds);
    const saved = await svc.createMedia(data);

    return NextResponse.json(saved, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Bad Request" },
      { status: 400 }
    );
  }
}
