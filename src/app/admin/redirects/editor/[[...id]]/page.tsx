import Breadcrumb from "@/components/Breadcrumb";
import { absolute } from "@/app/utils/base-url";
import RedirectFormClient from "@/components/redirects/RedirectFormClient";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
};

export const dynamic = "force-dynamic"; 

export default async function Page({
  params,
}: {
  params: Promise<{ id?: string[] }>;
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
    } catch {
    }
  }

  return (
    <main className="pb-24 pt-6">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "ریدایرکت‌ها", href: "/admin/redirects" },
            { label: "افزودن/ویرایش ریدایرکت", href: "/admin/redirects/new-redirect" },
          ]}
        />

        <div className="mt-5">
          <RedirectFormClient id={id} initialRecord={initialRecord} />
        </div>
      </div>
    </main>
  );
}