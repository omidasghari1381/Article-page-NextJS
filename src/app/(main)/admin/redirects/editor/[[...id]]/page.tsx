import Breadcrumb from "@/components/Breadcrumb";
import RedirectFormClient from "@/components/redirects/RedirectFormClient";
import type { RedirectStatus } from "@/server/modules/redirects/enums/RedirectStatus.enum";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatus;
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
    const svc = new RedirectService();
    const rec = await svc.getOneById(id);
    if (rec) {
      initialRecord = {
        id: String(rec.id),
        fromPath: String(rec.fromPath),
        toPath: String(rec.toPath),
        statusCode: Number(rec.statusCode) as 301 | 302 | 307 | 308,
        isActive: !!rec.isActive,
      };
    }
  }

  return (
    <main className="pb-24 pt-6">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "ریدایرکت‌ها", href: "/admin/redirects" },
            {
              label: "افزودن/ویرایش ریدایرکت",
              href: "/admin/redirects/new-redirect",
            },
          ]}
        />
        <div className="mt-5">
          <RedirectFormClient id={id} initialRecord={initialRecord} />
        </div>
      </div>
    </main>
  );
}
