// src/app/(main)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-dvh">{children}</main>
      <Footer />
    </>
  );
}