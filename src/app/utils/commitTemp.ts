import { promises as fsp } from "node:fs";
import path from "node:path";

const UPLOAD_BASE = process.env.UPLOAD_BASE_DIR || "public/uploads";

export async function commitTempUrlToPermanent(tempUrl: string) {
  // فقط اگر داخل tmp باشد
  if (!tempUrl.startsWith("/uploads/tmp/")) return { url: tempUrl, path: path.join("public", tempUrl) };

  const absTempPath = path.join("public", tempUrl); // چون URL از public سرو می‌شود
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const mediaDir = path.join(UPLOAD_BASE, "media", yyyy, mm);
  await fsp.mkdir(mediaDir, { recursive: true });

  const filename = path.basename(absTempPath); // <tempId>.<ext>
  const destPath = path.join(mediaDir, filename);
  const url = destPath.replace(/^public/, ""); // "/uploads/media/..."
  await fsp.rename(absTempPath, destPath);

  return { url, path: destPath };
}
