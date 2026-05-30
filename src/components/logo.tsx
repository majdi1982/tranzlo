"use client";

import Image from "next/image";
import Link from "next/link";

const LOGO_URL = "https://appwrite.tranzlo.net/v1/storage/buckets/site_assets/files/6a1af2c4000c47f6e828/view";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <Image
        src={LOGO_URL}
        alt="Tranzlo Logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      {showText && (
        <span className="font-bold text-xl tracking-tight">
          <span className="text-primary">Tranz</span>lo
        </span>
      )}
    </Link>
  );
}
