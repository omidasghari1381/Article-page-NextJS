export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
