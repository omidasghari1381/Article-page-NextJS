import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import Busboy from "busboy";
import mime from "mime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_BASE = process.env.UPLOAD_BASE_DIR || "public/uploads";
const TMP_DIR = path.join(UPLOAD_BASE, "tmp");

function headersToObject(headers: Headers) {
  const obj: Record<string, string> = {};
  headers.forEach((v, k) => {
    obj[k.toLowerCase()] = v;
  });
  return obj;
}

async function ensureDir(p: string) {
  await fsp.mkdir(p, { recursive: true });
}

function errMessage(err: unknown, fallback = "Error") {
  return err instanceof Error ? err.message : String(err ?? fallback);
}

export async function POST(req: NextRequest) {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("multipart/")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 415 }
    );
  }

  // در برخی درخواست‌ها ممکنه body استریم نباشه/null باشه
  if (!req.body) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  await ensureDir(TMP_DIR);

  const bb = Busboy({ headers: headersToObject(req.headers) });
  const nodeStream = Readable.fromWeb(req.body as any);

  let responded = false;

  // Promise با تایپ مشخص
  const done = new Promise<NextResponse>((resolve, reject) => {
    const safeResolve = (res: NextResponse) => {
      if (!responded) {
        responded = true;
        resolve(res);
      }
    };
    const safeReject = (res: NextResponse) => {
      if (!responded) {
        responded = true;
        resolve(res); // به جای reject، با Response خطا resolve کن تا هندل ساده بماند
      }
    };

    bb.on("file", async (_name, file, info) => {
      const tempId = randomUUID();
      const orig = info.filename || "upload.bin";
      const ext =
        path.extname(orig) ||
        `.${mime.getExtension(info.mimeType || "") || "bin"}`;
      const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "") || ".bin";
      const filename = `${tempId}${safeExt}`;
      const tmpPath = path.join(TMP_DIR, filename);
      const url = `/uploads/tmp/${filename}`;
      const mimeType =
        info.mimeType || mime.getType(safeExt) || "application/octet-stream";

      let size = 0;

      const ws = (await import("node:fs")).createWriteStream(tmpPath);
      file.on("data", (chunk: Buffer) => {
        size += chunk.length;
      });
      file.on("error", (err: unknown) => {
        try {
          ws.destroy();
        } catch {}
        safeReject(
          NextResponse.json(
            { error: errMessage(err, "Stream error") },
            { status: 500 }
          )
        );
      });

      ws.on("error", (err: unknown) => {
        try {
          ws.destroy();
        } catch {}
        safeReject(
          NextResponse.json(
            { error: errMessage(err, "Write error") },
            { status: 500 }
          )
        );
      });

      ws.on("finish", () => {
        safeResolve(
          NextResponse.json(
            {
              tempId,
              url,
              path: tmpPath,
              mime: mimeType,
              size,
              originalName: orig,
            },
            { status: 201 }
          )
        );
      });

      file.pipe(ws);
    });

    bb.on("error", (err: unknown) => {
      safeReject(
        NextResponse.json(
          { error: errMessage(err, "Parse error") },
          { status: 400 }
        )
      );
    });

    bb.on("finish", () => {
      // اگر هیچ eventِ file رخ نداده بود
      if (!responded) {
        safeReject(
          NextResponse.json(
            { error: "No file field provided" },
            { status: 400 }
          )
        );
      }
    });

    nodeStream.pipe(bb);
  });

  return done;
}
