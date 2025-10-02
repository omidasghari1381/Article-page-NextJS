"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

type UserRole = "ADMIN" | "EDITOR" | "CLIENT" | number;
type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
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

export default function Page() {
  return (
    <main className="pb-24 pt-6 px-20">
      <Breadcrumb
        items={[
          { label: "مای پراپ", href: "/" },
          { label: "کاربران", href: "/users" },
          { label: "ویرایش کاربر", href: "" },
        ]}
      />
      <div className="mt-5">
        <UserEditForm />
      </div>
    </main>
  );
}

function UserEditForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const hasId = typeof id === "string" && id.length > 0;

  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    role: UserRole | "";
    phone: string;
    password: string;
  }>({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(hasId);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
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

  useEffect(() => {
    if (!hasId) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/users/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!active) return;
          setError("کاربر پیدا نشد");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات کاربر");

        const data: UserDTO = await res.json();
        if (!active) return;

        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          role: (data.role as any) ?? "",
          phone: data.phone ?? "",
          password: "",
        });
      } catch (e: any) {
        if (active) setError(e?.message || "خطا در دریافت اطلاعات کاربر");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [hasId, id]);

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
        typeof e === "string"
          ? e
          : (e.target as any).type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;

      setForm((f) => ({ ...f, [field]: val as any }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (problems.length) {
      alert(problems.join("\n"));
      return;
    }

    const payload: UserUpdatePayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: form.role as UserRole,
      phone: form.phone.trim(),
      ...(form.password.trim()
        ? { passwordHash: form.password.trim() }
        : {}),
    };

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در ذخیره اطلاعات کاربر");
      }

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

      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "خطا در حذف کاربر");
      }

      alert("کاربر حذف شد ✅");
      router.push("/users");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "خطا در حذف کاربر");
    } finally {
      setDeleting(false);
    }
  };

  if (!hasId) {
    return (
      <div className="mx-20 my-10 rounded border border-red-300 bg-red-50 p-3 text-red-700">
        شناسه کاربر نامعتبر است.
      </div>
    );
  }

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
          {/* ستون چپ */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">نام</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.firstName}
                onChange={handleChange("firstName")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">نام‌خانوادگی</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={form.lastName}
                onChange={handleChange("lastName")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">نقش</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
          <div className="md:col-span-6 space-y-6">
            <div>
              <label className="block text-sm text-black mb-2">شماره تلفن</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">پسورد (اختیاری)</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 text-black bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 ltr"
                placeholder="برای تغییر پسورد، اینجا بنویس"
                value={form.password}
                onChange={handleChange("password")}
              />
            </div>

            {/* اکشن‌ها */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() => setForm((f) => ({ ...f, password: "" }))}
              >
                پاک‌سازی پسورد
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "در حال ذخیره…" : "ثبت تغییرات"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? "در حال حذف…" : "حذف کاربر"}
              </button>
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
