import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/templates/LayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Tranzlo | Global Translation Marketplace",
  description: "The professional platform for high-quality translation services. Hire expert translators or find global projects.",
  keywords: ["translation", "marketplace", "translators", "global business", "localization"],
  authors: [{ name: "Tranzlo Team" }],
  openGraph: {
    title: "Tranzlo | Global Translation Marketplace",
    description: "The professional platform for high-quality translation services.",
    url: "https://tranzlo.com",
    siteName: "Tranzlo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground flex flex-col">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
