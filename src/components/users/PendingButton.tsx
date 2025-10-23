"use client";

import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";

export default function PendingButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
}) {
  const { pending } = useFormStatus();
  const { t } = useTranslation("admin");

  const base =
    "h-[44px] w-full sm:w-auto px-4 md:px-5 rounded-lg text-sm md:text-base whitespace-nowrap leading-none disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-800"
      : variant === "secondary"
      ? "border text-gray-700 hover:bg-gray-50"
      : variant === "danger"
      ? "bg-red-700 text-white hover:bg-red-800"
      : "bg-green-600 text-white hover:bg-green-700";

  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {pending ? t("actions.pending") : children}
    </button>
  );
}