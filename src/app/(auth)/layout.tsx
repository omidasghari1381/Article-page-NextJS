export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-neutral-100">
        {/* فقط محتوای صفحه ثبت‌نام */}
        {children}
      </body>
    </html>
  );
}