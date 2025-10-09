import Breadcrumb from "@/components/Breadcrumb";
import { absolute } from "@/app/utils/base-url";
import { headers } from "next/headers";
import UserEditFormClient from "@/components/users/UserEditFormClient";

export const dynamic = "force-dynamic";
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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialUser: UserDTO | null = null;
  try {
    const cookie = (await headers()).get("cookie") ?? "";
    const res = await fetch(absolute(`/api/users/${id}?withDeleted=1`), {
      cache: "no-store",
      headers: { cookie },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const normalizedRole: UserRole =
        typeof data.role === "string" && ["ADMIN", "EDITOR", "CLIENT"].includes(data.role)
          ? (data.role as UserRole)
          : (Number(data.role) as number);

      initialUser = {
        id: String(data.id),
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        role: normalizedRole,
        phone: data.phone ?? "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isDeleted: typeof data.isDeleted === "number" ? data.isDeleted : 0,
      } satisfies UserDTO;
    }
  } catch {}

  return (
    <main className="pb-24 pt-6 px-4 sm:px-6 lg:px-16 xl:px-20 2xl:px-28" dir="rtl">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: "مای پراپ", href: "/" },
            { label: "کاربران", href: "/users" },
            { label: "ویرایش کاربر", href: "" },
          ]}
        />
        <div className="mt-5">
          <UserEditFormClient userId={id} initialUser={initialUser} />
        </div>
      </div>
    </main>
  );
}
