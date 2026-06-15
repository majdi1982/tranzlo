import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CookieBanner } from "@/components/cookie-banner";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tranzlo.net"),
  title: "Tranzlo | Professional Translation Platform & Marketplace",
  description:
    "Connect with top freelance translators worldwide on the leading translation platform. Post translation projects, find work, and grow your business.",
  keywords: ["translation platform", "freelance translators", "translation marketplace", "language translation", "professional translators"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tranzlo.net",
    title: "Tranzlo | Professional Translation Platform",
    description: "Connect with top freelance translators worldwide on the leading translation platform. Post translation projects, find work, and grow your business.",
    siteName: "Tranzlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranzlo | Professional Translation Platform",
    description: "Connect with top freelance translators worldwide on the leading translation platform.",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MWSC7GJZ');
          `}
        </Script>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
              process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID.startsWith("ca-")
                ? process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                : `ca-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`
            }`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-80TSD8MLXB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-80TSD8MLXB');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MWSC7GJZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
