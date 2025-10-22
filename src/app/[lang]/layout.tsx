import { clampLang, type Lang } from "@/lib/i18n/settings";
import LanguageAttributes from "@/components/providers/LanguageAttributes";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;     
  const lang: Lang = clampLang(raw);   

  return (
    <>
      <LanguageAttributes lang={lang} />
      {children}
    </>
  );
}