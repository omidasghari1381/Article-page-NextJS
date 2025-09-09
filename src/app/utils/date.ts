// utils/date.ts

// پارس امن DATE/TIMESTAMP مای‌اس‌کیوال با یا بدون اعشار
export function parseMySQLDate(str: string): Date {
  if (!str) return new Date(NaN);

  // "YYYY-MM-DD HH:MM:SS" یا "YYYY-MM-DD HH:MM:SS.ssssss"
  const m = str.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
  );
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    // ساخت تاریخ به صورت UTC (اگر سرور UTC ذخیره می‌کند، این درست است)
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  }

  // اگر ISO بود یا فرمت معتبر دیگر
  return new Date(str);
}

// نمایش نسبی فارسی (دقیقه/ساعت/روز)
export function timeAgoFa(mysqlDate: string): string {

  const date = parseMySQLDate(mysqlDate);
  if (isNaN(date.getTime())) return "تاریخ نامعتبر";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "به‌زودی"; // تاریخ آینده

  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (mins < 1) return "همین حالا";
  if (mins < 60) return `${mins} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days === 1) return "دیروز";
  return `${days} روز پیش`;
}