// src/components/redirects/RedirectFormClient.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ActiveCheckbox from "./ActiveCheckbox";
import ProblemsList from "./ProblemsList";
import StatusSelect, { STATUS_OPTIONS } from "./StatusSelect";
import TextInput from "./TextInput";
import type { RedirectDTO } from "./RedirectCard";

export type RedirectCreatePayload = {
  fromPath: string;
  toPath: string;
  statusCode?: RedirectDTO["statusCode"];
  isActive?: boolean;
};

export default function RedirectFormClient({
  id,
  initialRecord,
}: {
  id: string | null;
  initialRecord: RedirectDTO | null;
}) {
  const router = useRouter();
  const isEdit = !!id;

  const [form, setForm] = useState({
    fromPath: initialRecord?.fromPath ?? "",
    toPath: initialRecord?.toPath ?? "",
    statusCode: (initialRecord?.statusCode as RedirectDTO["statusCode"]) ?? 301,
    isActive: initialRecord?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUrl = (s: string) => /^https?:\/\//i.test(s);
  const isPath = (s: string) => /^\//.test(s);
  const validFrom = (s: string) => isPath(s);
  const validTo = (s: string) => isPath(s) || isUrl(s);

  const problems = useMemo(() => {
    const errs: string[] = [];
    if (!form.fromPath.trim()) errs.push("fromPath الزامی است.");
    if (!form.toPath.trim()) errs.push("toPath الزامی است.");
    if (form.fromPath.trim() && !validFrom(form.fromPath.trim())) errs.push("fromPath باید با / شروع شود.");
    if (form.toPath.trim() && !validTo(form.toPath.trim())) errs.push("toPath باید مسیر داخلی یا URL معتبر باشد.");
    if (form.fromPath.trim() && form.toPath.trim() && form.fromPath.trim() === form.toPath.trim())
      errs.push("fromPath و toPath نباید یکسان باشند.");
    return errs;
  }, [form]);

  const handleChange = (field: keyof typeof form) => (e: any) => {
    const val =
      typeof e === "object" && e.target
        ? e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value
        : e;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!confirm("آیا از حذف این ریدایرکت مطمئن هستید؟")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/redirect/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("حذف ناموفق بود");
      alert("حذف شد ✅");
      router.push("/admin/redirects");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
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
      statusCode: form.statusCode,
      isActive: form.isActive,
    };
    try {
      setSaving(true);
      const url = isEdit ? `/api/redirect/${id}` : `/api/redirect`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("ذخیره ناموفق بود");
      alert(isEdit ? "ویرایش شد ✅" : "ایجاد شد ✅");
      router.push("/admin/redirects");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full text-skin-base">
      <form
        onSubmit={onSubmit}
        className="bg-skin-card rounded-2xl shadow-sm border border-skin-border p-4 sm:p-6 2xl:p-8 w-full mx-auto"
      >
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 p-3 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 2xl:gap-8">
          <div className="md:col-span-6 space-y-4 sm:space-y-6">
            <TextInput
              label="fromPath"
              placeholder="/old-url"
              value={form.fromPath}
              onChange={handleChange("fromPath")}
              inputClassName="bg-skin-bg text-skin-base border-skin-border focus:ring-skin-border/70"
              labelClassName="text-skin-muted"
            />
            <TextInput
              label="toPath"
              placeholder="/new-url یا https://example.com/new-url"
              value={form.toPath}
              onChange={handleChange("toPath")}
              inputClassName="bg-skin-bg text-skin-base border-skin-border focus:ring-skin-border/70"
              labelClassName="text-skin-muted"
            />
          </div>

          <div className="md:col-span-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <StatusSelect
                label="کد وضعیت"
                value={form.statusCode}
                onChange={(n) => handleChange("statusCode")(n)}
                options={STATUS_OPTIONS}
                selectClassName="bg-skin-bg text-skin-base border-skin-border focus:ring-skin-border/70"
                labelClassName="text-skin-muted"
              />
              <ActiveCheckbox
                id="isActive"
                label="فعال باشد"
                checked={form.isActive}
                onChange={handleChange("isActive")}
                labelClassName="text-skin-muted"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setForm({ fromPath: "", toPath: "", statusCode: 301, isActive: true })
                }
                className="h-[44px] w-full sm:w-auto px-4 rounded-lg border border-skin-border bg-skin-card text-skin-base hover:bg-skin-card/60 text-center"
              >
                پاکسازی
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-[44px] w-full sm:w-auto px-4 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 disabled:opacity-50 text-center"
                >
                  حذف
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="h-[44px] w-full sm:w-auto px-6 rounded-lg bg-skin-accent hover:bg-skin-accent-hover text-white disabled:opacity-50 text-center"
              >
                {saving ? "در حال ذخیره…" : isEdit ? "ثبت تغییرات" : "ثبت ریدایرکت"}
              </button>
            </div>

            <ProblemsList
              problems={problems}
              className="text-skin-muted"
              itemClassName="text-skin-base"
            />

            <div className="h-16 md:h-0" />
          </div>
        </div>
      </form>
    </section>
  );
}