import i18next from "@/lib/i18n/i18n";
import LanguageAttributes from "@/components/providers/LanguageAttributes";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: "fa" | "en" }>;
}) {
  const { lang } = await params;
  await i18next.changeLanguage(lang); 

  return (
    <>
      <LanguageAttributes lang={lang} />
      {children}
    </>
  );
}