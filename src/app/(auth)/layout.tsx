export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] p-4 sm:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
