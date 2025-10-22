import Header from "@/components/Header";
import Footer from "@/components/footer/Footer";
import { clampLang, type Lang } from "@/lib/i18n/settings";

export default async function MainLayout({
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
      <Header />
      <main className="min-h-dvh">{children}</main>
      <Footer lang={lang} />
    </>
  );
}