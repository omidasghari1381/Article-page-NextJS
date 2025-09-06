"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noHeaderFooter = ["/login", "/sign-in"];

  const hide = noHeaderFooter.includes(pathname);

  return (
    <html lang="fa" dir="rtl">
      <body>
        {!hide && <Header />}
        <main>{children}</main>
        {!hide && <Footer />}
      </body>
    </html>
  );
}