import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Tranzlo - Translation Marketplace",
  description:
    "Connect with top freelance translators worldwide. Post translation projects, find work, and grow your translation business.",
  icons: {
    icon: "https://appwrite.tranzlo.net/v1/storage/buckets/site_assets/files/6a1af2c4000c47f6e828/view",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
