import Breadcrumb from "@/components/Breadcrumb";
import { absolute } from "@/app/utils/base-url";
import RedirectFormClient from "@/components/redirects/RedirectFormClient";

// ---------- Types ----------
export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
};

export const dynamic = "force-dynamic"; // ادیتور بهتره تازه باشه

export default async function Page({
  params,
}: {
  params: Promise<{ id?: string[] }>; // NOTE: async params pattern
}) {
  const p = await params;
  const id = Array.isArray(p?.id) && p.id.length ? p.id[0] : null;

  let initialRecord: RedirectDTO | null = null;

  if (id) {
    try {
      const res = await fetch(absolute(`/api/redirect/${id}`), { cache: "no-store" });
      if (res.ok) {
        initialRecord = (await res.json()) as RedirectDTO;
      }
      // 404 or non-ok → بگذار کلاینت پیام مناسب نمایش بده
    } catch {
      // سکوت: کلاینت خودش خطا/وضعیت را هندل می‌کند
    }
  }

  return (
    <main className="pb-24 pt-6 px-4 sm:px-6 lg:px-16 xl:px-20 2xl:px-28" dir="rtl">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "ریدایرکت‌ها", href: "/redirects" },
            { label: "افزودن/ویرایش ریدایرکت", href: "/redirects/new-redirect" },
          ]}
        />

        <div className="mt-5">
          <RedirectFormClient id={id} initialRecord={initialRecord} />
        </div>
      </div>
    </main>
  );
}