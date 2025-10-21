// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F7F8FA] text-[#1C2121]">
      {children}
    </div>
  );
}
