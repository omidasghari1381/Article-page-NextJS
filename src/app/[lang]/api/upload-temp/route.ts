// app/api/upload-temp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fsp } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import mime from "mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_BASE = process.env.UPLOAD_BASE_DIR || "public/uploads";
const TMP_DIR = path.join(UPLOAD_BASE, "tmp");

async function ensureDir(p: string) {
  await fsp.mkdir(p, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    // 1) فرم را مستقیماً از Next بگیر (بدون Busboy)
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file field provided" },
        { status: 400 }
      );
    }

    await ensureDir(TMP_DIR);

    // 2) نام/پسوند/نوع
    const tempId = randomUUID();
    const orig = file.name || "upload.bin";
    const ext =
      path.extname(orig) || `.${mime.getExtension(file.type || "") || "bin"}`;
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "") || ".bin";
    const filename = `${tempId}${safeExt}`;
    const tmpPath = path.join(TMP_DIR, filename);
    const url = `/uploads/tmp/${filename}`;
    const mimeType =
      file.type || mime.getType(safeExt) || "application/octet-stream";

    // 3) استریم وب فایل → استریم نودی و نوشتن روی دیسک
    const webStream = file.stream(); // ReadableStream<Uint8Array>
    const nodeStream = Readable.fromWeb(webStream as any); // تبدیل به Node Readable
    const ws = fs.createWriteStream(tmpPath);

    // اندازه: می‌تونی از file.size استفاده کنی، ولی ما برای دقت حین استریم می‌شماریم
    let size = 0;
    nodeStream.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
    });

    // Promise تا پایان نوشتن
    await new Promise<void>((resolve, reject) => {
      nodeStream.on("error", reject);
      ws.on("error", reject);
      ws.on("finish", resolve);
      nodeStream.pipe(ws);
    });

    return NextResponse.json(
      {
        tempId,
        url,
        path: tmpPath,
        mime: mimeType,
        size, // یا file.size
        originalName: orig,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
