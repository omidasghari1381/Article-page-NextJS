import { promises as fsp } from "node:fs";
import path from "node:path";

const RAW_UPLOAD_BASE = process.env.UPLOAD_BASE_DIR || "public/uploads";
const PUBLIC_DIR = path.join(process.cwd(), "public");

// مسیر پایه‌ی آپلود (absolute)
const UPLOAD_BASE = path.isAbsolute(RAW_UPLOAD_BASE)
  ? RAW_UPLOAD_BASE
  : path.join(process.cwd(), RAW_UPLOAD_BASE);

/**
 * tempUrl چیزی شبیه "/uploads/tmp/<uuid>.<ext>" است.
 * فایل را از tmp به "/uploads/media/YYYY/MM/<filename>" منتقل می‌کند.
 */
export async function commitTempUrlToPermanent(tempUrl: string) {
  // اگر اصلاً temp نیست، همون رو برگردون
  if (!tempUrl.startsWith("/uploads/tmp/")) {
    const absPath = path.join(PUBLIC_DIR, tempUrl.replace(/^\/+/, ""));
    return { url: tempUrl, path: absPath };
  }

  // امن‌سازی/نرمال‌سازی URL
  const relFromPublic = tempUrl.replace(/^\/+/, ""); // "uploads/tmp/.."
  if (!relFromPublic.startsWith("uploads/tmp/")) {
    throw new Error("Invalid temp URL");
  }

  const absTempPath = path.join(PUBLIC_DIR, relFromPublic); // abs to public/uploads/tmp/...

  // چک وجود فایل
  try {
    await fsp.access(absTempPath);
  } catch {
    throw new Error("فایل موقت پیدا نشد یا قبلاً منتقل شده است");
  }

  // مقصد دائمی: public/uploads/media/YYYY/MM/<filename>
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const mediaDir = path.join(UPLOAD_BASE, "media", yyyy, mm);
  await fsp.mkdir(mediaDir, { recursive: true });

  const filename = path.basename(absTempPath);
  const destPath = path.join(mediaDir, filename);

  // تلاش برای جابه‌جایی
  try {
    await fsp.rename(absTempPath, destPath);
  } catch (err: any) {
    // در صورت EXDEV یا برخی محدودیت‌ها، به copy+unlink برگرد
    if (err && (err.code === "EXDEV" || err.code === "EPERM")) {
      await fsp.copyFile(absTempPath, destPath);
      await fsp.unlink(absTempPath);
    } else {
      throw err;
    }
  }

  // ساخت URL نهایی از مسیر نسبی به public/
  const relToPublic = path.relative(PUBLIC_DIR, destPath); // e.g. "uploads/media/2025/10/file.jpg"
  // تبدیل به URL با / (حتی روی ویندوز)
  const url = "/" + relToPublic.split(path.sep).join("/");

  return { url, path: destPath };
}
