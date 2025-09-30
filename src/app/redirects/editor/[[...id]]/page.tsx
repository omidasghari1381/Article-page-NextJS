"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
};

type RedirectCreatePayload = {
  fromPath: string;
  toPath: string;
  statusCode?: RedirectDTO["statusCode"];
  isActive?: boolean;
};

const STATUS_OPTIONS: Array<RedirectDTO["statusCode"]> = [301, 302, 307, 308];

export default function Page() {
  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "ریدایرکت‌ها", href: "/redirects" },
          { label: "افزودن/ویرایش ریدایرکت", href: "/redirects/new-redirect" },
        ]}
      />
      <div className="mt-5">
        <RedirectForm />
      </div>
    </main>
  );
}

function RedirectForm() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();

  // اگر مسیرت /redirects/new-redirect/[id] باشد:
  const id = params?.id?.[0] ?? null;
  const isEdit = !!id;

  const [form, setForm] = useState<{
    fromPath: string;
    toPath: string;
    statusCode: RedirectDTO["statusCode"];
    isActive: boolean;
  }>({
    fromPath: "",
    toPath: "",
    statusCode: 301,
    isActive: true,
  });

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Utils ---
  const isUrl = (s: string) => /^https?:\/\//i.test(s);
  const isPath = (s: string) => /^\//.test(s);
  const validFrom = (s: string) => isPath(s);
  const validTo = (s: string) => isPath(s) || isUrl(s);

  const problems = useMemo(() => {
    const errs: string[] = [];
    if (!form.fromPath.trim()) errs.push("fromPath الزامی است.");
    if (!form.toPath.trim()) errs.push("toPath الزامی است.");
    if (form.fromPath.trim() && !validFrom(form.fromPath.trim()))
      errs.push("fromPath باید با / شروع شود (مسیر داخلی).");
    if (form.toPath.trim() && !validTo(form.toPath.trim()))
      errs.push("toPath باید مسیر داخلی یا URL معتبر باشد.");
    if (
      form.fromPath.trim() &&
      form.toPath.trim() &&
      form.fromPath.trim() === form.toPath.trim()
    )
      errs.push("fromPath و toPath نباید یکسان باشند.");
    return errs;
  }, [form]);

  // ---- Load redirect if edit mode ----
  useEffect(() => {
    if (!isEdit) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // انتظار: GET /api/redirects/:id → RedirectDTO
        const res = await fetch(`/api/redirect/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!active) return;
          setError("ریدایرکت پیدا نشد");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت ریدایرکت");

        const data: RedirectDTO = await res.json();
        if (!data?.id) {
          if (!active) return;
          setError("ریدایرکت پیدا نشد");
          setLoading(false);
          return;
        }

        if (!active) return;

        setForm({
          fromPath: data.fromPath ?? "",
          toPath: data.toPath ?? "",
          statusCode: (data.statusCode as any) ?? 301,
          isActive: !!data.isActive,
        });
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در دریافت ریدایرکت");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // --- Handlers ---
  const handleChange =
    (field: keyof typeof form) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string
        | number
        | boolean
    ) => {
      const val =
        typeof e === "string" || typeof e === "number" || typeof e === "boolean"
          ? e
          : (e.target as any).type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;

      setForm((f) => ({ ...f, [field]: val as any }));
    };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!confirm("آیا از حذف این ریدایرکت مطمئن هستید؟")) return;

    try {
      setDeleting(true);
      // انتظار: DELETE /api/redirects  با body: { id }
      const res = await fetch("/api/redirect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "حذف ریدایرکت ناموفق بود.");
        return;
      }

      alert("ریدایرکت با موفقیت حذف شد.");
      router.push("/redirects");
      router.refresh();
    } catch {
      alert("مشکل در ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (problems.length) {
      alert(problems.join("\n"));
      return;
    }

    const payload: RedirectCreatePayload = {
      fromPath: form.fromPath.trim(),
      toPath: form.toPath.trim(),
      statusCode: form.statusCode ?? 301,
      isActive: !!form.isActive,
    };

    try {
      setSaving(true);
      setError(null);

      const url = isEdit ? `/api/redirect/${id}` : `/api/redirect`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره ریدایرکت");
      }

      alert(isEdit ? "تغییرات ثبت شد ✅" : "ریدایرکت با موفقیت ایجاد شد ✅");
      router.push("/redirects");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-20 my-10">در حال بارگذاری…</div>;
  }

  return (
    <section className="w-full">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 w-full mx-auto"
        dir="rtl"
      >
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">fromPath</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                placeholder="/old-url"
                value={form.fromPath}
                onChange={handleChange("fromPath")}
              />
              <p className="text-xs text-gray-400 mt-1">
                باید با <code>/</code> شروع شود (مسیر داخلی).
              </p>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">toPath</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                placeholder="/new-url یا https://example.com/new-url"
                value={form.toPath}
                onChange={handleChange("toPath")}
              />
              <p className="text-xs text-gray-400 mt-1">
                می‌تواند داخلی (<code>/…</code>) یا URL خارجی باشد.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">
                  کد وضعیت
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.statusCode}
                  onChange={(e) =>
                    handleChange("statusCode")(Number(e.target.value))
                  }
                >
                  {STATUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  301 (دائمی)، 302/307 (موقتی)، 308 (دائمی با روش ثابت)
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm text-black">
                  فعال باشد
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setForm({
                    fromPath: "",
                    toPath: "",
                    statusCode: 301,
                    isActive: true,
                  });
                }}
              >
                پاک‌سازی
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={saving}
              >
                {saving
                  ? "در حال ذخیره…"
                  : isEdit
                  ? "ثبت تغییرات"
                  : "ثبت ریدایرکت"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={deleting || !isEdit}
              >
                {deleting ? "در حال حذف..." : "حذف ریدایرکت"}
              </button>
            </div>

            {/* نمایش خطاهای اعتبارسنجی سمت کلاینت */}
            {problems.length > 0 && (
              <ul className="mt-4 text-xs text-red-600 list-disc pr-5 space-y-1">
                {problems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
