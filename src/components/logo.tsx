"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <Image
        src="/logo.png"
        alt="Tranzlo Logo"
        width={size}
        height={size}
        className="object-contain"
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
