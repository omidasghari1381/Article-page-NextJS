export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Breadcrumb from "@/components/Breadcrumb";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  UserService,
  type UserDTO,
} from "@/server/modules/users/services/users.service";
import PendingButton from "@/components/users/PendingButton";
import { clampLang, type Lang } from "@/lib/i18n/settings";
import { getServerT } from "@/lib/i18n/get-server-t";

export type UserRole = "ADMIN" | "EDITOR" | "CLIENT" | number;

function withLangPath(lang: Lang, path: string) {
  return `/${lang}${path}`;
}

async function getUser(id: string) {
  const svc = new UserService();
  return (await svc.getOneByIdDTO(id, { withDeleted: true })) as UserDTO | null;
}

async function updateAction(formData: FormData) {
  "use server";
  const lang = (formData.get("lang") as Lang) || "fa";
  const id = String(formData.get("id") || "");
  const firstName = String(formData.get("firstName") || "");
  const lastName = String(formData.get("lastName") || "");
  const roleRaw = String(formData.get("role") || "");
  const phone = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  if (!id || !firstName.trim() || !lastName.trim() || !roleRaw || !phone.trim()) return;

  const role: UserRole =
    roleRaw === "ADMIN" || roleRaw === "EDITOR" || roleRaw === "CLIENT"
      ? roleRaw
      : Number(roleRaw);

  const payload: any = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role,
    phone: phone.trim(),
  };
  if (password.trim()) payload.passwordHash = password.trim();

  const svc = new UserService();
  await svc.update(id, payload);
  revalidatePath(withLangPath(lang, `/admin/users/${id}`));
  redirect(withLangPath(lang, "/admin/users"));
}

async function deleteAction(formData: FormData) {
  "use server";
  const lang = (formData.get("lang") as Lang) || "fa";
  const id = String(formData.get("id") || "");
  if (!id) return;
  const svc = new UserService();
  await svc.remove(id);
  revalidatePath(withLangPath(lang, "/admin/users"));
  redirect(withLangPath(lang, "/admin/users"));
}

async function restoreAction(formData: FormData) {
  "use server";
  const lang = (formData.get("lang") as Lang) || "fa";
  const id = String(formData.get("id") || "");
  if (!id) return;
  const svc = new UserService();
  await svc.restore(id);
  revalidatePath(withLangPath(lang, `/admin/users/${id}`));
  redirect(withLangPath(lang, `/admin/users/${id}`));
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  const lang: Lang = clampLang(raw);
  const t = await getServerT(lang, "admin");

  const user = await getUser(id);
  const hasId = typeof id === "string" && id.length > 0;

  return (
    <main className="pb-24 pt-6 text-skin-base">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[110rem]">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.brand"), href: withLangPath(lang, "/") },
            { label: t("nav.users"), href: withLangPath(lang, "/admin/users") },
            { label: t("users.edit.title"), href: "" },
          ]}
        />

        {!hasId ? (
          <div
            className="mx-20 my-10 rounded border p-3
                        border-red-300 bg-red-50 text-red-700
                        dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
          >
            {t("users.edit.invalidId")}
          </div>
        ) : (
          <section className="w-full mt-5 space-y-3">
            <form
              action={updateAction}
              className="bg-skin-card rounded-2xl shadow-sm border border-skin-border p-4 sm:p-6 2xl:p-8 w-full mx-auto"
            >
              <input type="hidden" name="id" defaultValue={id} />
              <input type="hidden" name="lang" defaultValue={lang} />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 2xl:gap-8">
                <div className="md:col-span-6 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm text-skin-muted mb-2">
                      {t("users.form.firstName")}
                    </label>
                    <input
                      name="firstName"
                      defaultValue={user?.firstName ?? ""}
                      className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base
                                 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-skin-muted mb-2">
                      {t("users.form.lastName")}
                    </label>
                    <input
                      name="lastName"
                      defaultValue={user?.lastName ?? ""}
                      className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base
                                 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-skin-muted mb-2">
                      {t("users.form.role")}
                    </label>
                    <select
                      name="role"
                      defaultValue={String(user?.role ?? "")}
                      className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base
                                 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border"
                    >
                      <option value="" disabled>
                        {t("users.form.rolePlaceholder")}
                      </option>
                      <option value="ADMIN">{t("roles.ADMIN")}</option>
                      <option value="EDITOR">{t("roles.EDITOR")}</option>
                      <option value="CLIENT">{t("roles.CLIENT")}</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm text-skin-muted mb-2">
                      {t("users.form.phone")}
                    </label>
                    <input
                      name="phone"
                      defaultValue={user?.phone ?? ""}
                      className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base
                                 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-skin-muted mb-2">
                      {t("users.form.password")}
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder={t("users.form.passwordPlaceholder")}
                      className="w-full rounded-lg border border-skin-border bg-skin-bg text-skin-base
                                 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-skin-border ltr"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-2 md:gap-3 pt-2">
                    <button
                      type="reset"
                      className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg
                                 border border-skin-border text-skin-base
                                 hover:bg-skin-card/60 text-sm md:text-base whitespace-nowrap leading-none"
                    >
                      {t("actions.clearPassword")}
                    </button>
                    <PendingButton variant="primary">{t("actions.saveChanges")}</PendingButton>
                  </div>

                  <ul className="mt-4 text-xs text-skin-muted list-disc pr-5 space-y-1">
                    {!user?.firstName && <li>{t("users.form.required.firstName")}</li>}
                    {!user?.lastName && <li>{t("users.form.required.lastName")}</li>}
                    {!(user?.role || user?.role === 0) && (
                      <li>{t("users.form.required.role")}</li>
                    )}
                    {!user?.phone && <li>{t("users.form.required.phone")}</li>}
                  </ul>
                </div>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-2 md:gap-3">
              <form action={deleteAction}>
                <input type="hidden" name="id" defaultValue={id} />
                <input type="hidden" name="lang" defaultValue={lang} />
                <PendingButton variant="danger">{t("users.edit.deleteUser")}</PendingButton>
              </form>

              {user?.isDeleted === 1 ? (
                <form action={restoreAction}>
                  <input type="hidden" name="id" defaultValue={id} />
                  <input type="hidden" name="lang" defaultValue={lang} />
                  <PendingButton variant="success">{t("users.edit.restoreUser")}</PendingButton>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  title={t("users.edit.notDeleted")}
                  className="h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg
                             bg-skin-border/60 text-skin-muted cursor-not-allowed
                             text-sm md:text-base whitespace-nowrap leading-none"
                >
                  {t("users.edit.restoreUser")}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}