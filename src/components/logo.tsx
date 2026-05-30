"use client";

import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoSvg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#logoSvg)" opacity="0.15" />
        <circle cx="50" cy="50" r="46" stroke="url(#logoSvg)" strokeWidth="5" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#logoSvg)"
          fontSize="56"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
        >
          T
        </text>
      </svg>
      {showText && (
        <span className="font-bold text-xl tracking-tight">
          <span className="text-primary">Tranz</span>lo
        </span>
      )}
    </Link>
  );
}
