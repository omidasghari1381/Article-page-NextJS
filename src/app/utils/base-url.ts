// Sync + امن برای استفاده در Server Components
export function getBaseUrl(): string {
  // اولویت با NEXT_PUBLIC_BASE_URL (تو dev: http://localhost:3000)
  const fromPublic = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromPublic) return fromPublic.replace(/\/+$/, "");

  // اگر روی Vercel هستی، VERCEL_URL ست می‌شه (بدون پروتکل)
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/+$/, "");

  // fallback dev
  return "http://localhost:3000";
}

// ساخت URL مطلق از مسیر نسبی
export function absolute(path: string): string {
  return new URL(path, getBaseUrl()).toString();
}
