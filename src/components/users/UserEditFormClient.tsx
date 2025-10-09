"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { absolute } from "@/app/utils/base-url";

export type UserRole = "ADMIN" | "EDITOR" | "CLIENT" | number;

export type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: number;
};

type UserUpdatePayload = Partial<{
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  passwordHash: string;
}>;

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "EDITOR", value: "EDITOR" },
  { label: "CLIENT", value: "CLIENT" },
];

export default function UserEditFormClient({
  userId,
  initialUser,
}: {
  userId: string;
  initialUser: UserDTO | null;
}) {
  const router = useRouter();
  const hasId = typeof userId === "string" && userId.length > 0;

  const [form, setForm] = useState({
    firstName: initialUser?.firstName ?? "",
    lastName: initialUser?.lastName ?? "",
    role: (initialUser?.role as UserRole | "") ?? "",
    phone: initialUser?.phone ?? "",
    password: "",
    isDeleted:
      typeof initialUser?.isDeleted === "number" ? initialUser!.isDeleted : 0,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const problems = useMemo(() => {
    const errs: string[] = [];
    if (!hasId) errs.push("شناسه کاربر یافت نشد.");
    if (!form.firstName.trim()) errs.push("نام الزامی است.");
    if (!form.lastName.trim()) errs.push("نام‌خانوادگی الزامی است.");
    if (!form.role) errs.push("نقش کاربر را انتخاب کنید.");
    if (!form.phone.trim()) errs.push("شماره تلفن الزامی است.");
    return errs;
  }, [form, hasId]);

  const handleChange =
    (field: keyof typeof form) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string
    ) => {
      const val =
        typeof e === "string" ? e : (e.target as HTMLInputElement).value;
      setForm((f) => ({ ...f, [field]: val as any }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problems.length) return alert(problems.join("\n"));

    const payload: UserUpdatePayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: form.role as UserRole,
      phone: form.phone.trim(),
      ...(form.password.trim() ? { passwordHash: form.password.trim() } : {}),
    };

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(absolute(`/api/users/${userId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error((await res.text()) || "خطا در ذخیره اطلاعات کاربر");
      alert("تغییرات کاربر ثبت شد ✅");
      router.push("/users");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hasId) return;
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      setDeleting(true);
      setError(null);
      const res = await fetch(absolute(`/api/users/${userId}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.text()) || "خطا در حذف کاربر");
      alert("کاربر حذف شد ✅");
      setForm((f) => ({ ...f, isDeleted: 1 }));
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "خطا در حذف کاربر");
    } finally {
      setDeleting(false);
    }
  };

  async function handleRestore() {
    if (!hasId) return;
    setLoading(true);
    try {
      const res = await fetch(absolute(`/api/users/${userId}/restore`), {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error((data as any)?.error ?? "خطا در بازگردانی کاربر");
      alert("کاربر با موفقیت بازیابی شد ✅");
      setForm((f) => ({ ...f, isDeleted: 0 }));
      router.refresh();
    } catch (err: any) {
      alert(err.message ?? "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  if (!hasId) {
    return (
      <div className="mx-20 my-10 rounded border border-red-300 bg-red-50 p-3 text-red-700">
        شناسه کاربر نامعتبر است.
      </div>
    );
  }

  return (
    <section className="w-full" dir="rtl">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 2xl:p-8 w-full mx-auto"
      >
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 2xl:gap-8">
          {/* ستون چپ */}
          <div className="md:col-span-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">نام</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.firstName}
                onChange={handleChange("firstName")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                نام‌خانوادگی
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.lastName}
                onChange={handleChange("lastName")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">نقش</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={String(form.role)}
                onChange={(e) => handleChange("role")(e.target.value)}
              >
                <option value="" disabled>
                  انتخاب نقش…
                </option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={String(r.value)} value={String(r.value)}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ستون راست */}
          <div className="md:col-span-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">
                شماره تلفن
              </label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                پسورد (اختیاری)
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                placeholder="برای تغییر پسورد، اینجا بنویس"
                value={form.password}
                onChange={handleChange("password")}
              />
            </div>

            {/* اکشن‌ها — موبایل زیر هم فول‌عرض، از sm کنار هم؛ ارتفاع ثابت */}
{/* اکشن‌ها — موبایل زیر هم فول‌عرض، از sm کنار هم؛ روی تبلت wrap با هم‌تراز راست */}
<div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-2 md:gap-3 pt-2">
  <button
    type="button"
    onClick={() => setForm((f) => ({ ...f, password: "" }))}
    className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg border text-gray-700 hover:bg-gray-50 text-sm md:text-base whitespace-nowrap leading-none"
  >
    پاک‌سازی پسورد
  </button>

  <button
    type="submit"
    disabled={saving}
    className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 text-sm md:text-base whitespace-nowrap leading-none"
  >
    {saving ? "در حال ذخیره…" : "ثبت تغییرات"}
  </button>

  <button
    type="button"
    onClick={handleDelete}
    disabled={deleting || form.isDeleted === 1}
    title={form.isDeleted === 1 ? "این کاربر قبلاً حذف شده است" : ""}
    className={`h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg text-white disabled:opacity-50 text-sm md:text-base whitespace-nowrap leading-none ${
      form.isDeleted === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-red-700 hover:bg-red-800"
    }`}
  >
    {deleting ? "در حال حذف…" : "حذف کاربر"}
  </button>

  {form.isDeleted === 1 ? (
    <button
      type="button"
      onClick={handleRestore}
      disabled={loading}
      className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm md:text-base whitespace-nowrap leading-none"
    >
      {loading ? "در حال بازگردانی..." : "بازیابی کاربر"}
    </button>
  ) : (
    <button
      type="button"
      disabled
      className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed text-sm md:text-base whitespace-nowrap leading-none"
      title="این کاربر حذف نشده است"
    >
      بازیابی کاربر
    </button>
  )}
</div>


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
