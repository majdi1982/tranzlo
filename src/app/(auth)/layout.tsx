import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute top-8 left-8">
        <Logo size={28} showText={true} />
      </div>
      <div className="relative w-full max-w-md animate-in">
        {children}
      </div>
    </div>
  );
}
