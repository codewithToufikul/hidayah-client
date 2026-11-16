import React from "react";

export const Logo = ({ size = "default", showText = true, className = "" }) => {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  const iconSizes = {
    sm: "w-8 h-8",
    default: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Handcrafted Vector Icon: Islamic Crescent, Mihrab Arch & Star of Noor */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 p-2 shadow-lg shadow-emerald-900/20 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300 ${iconSizes[size] || iconSizes.default}`}>
        {/* Ambient subtle glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-emerald-400/10 to-transparent opacity-75"></div>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-md"
        >
          <defs>
            {/* Emerald Gradient */}
            <linearGradient id="hidayahEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Gold Metallic Gradient */}
            <linearGradient id="hidayahGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Soft Glow Radial */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Noor Aura */}
          <circle cx="50" cy="50" r="32" fill="url(#centerGlow)" />

          {/* Mihrab Arch Contour */}
          <path
            d="M50 14 C35 14, 24 26, 24 42 L24 82 L76 82 L76 42 C76 26, 65 14, 50 14 Z"
            stroke="url(#hidayahEmerald)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 3"
            opacity="0.4"
          />

          {/* Elegant Crescent Moon */}
          <path
            d="M58 22 C42 24 30 38 32 54 C34 70 48 80 64 78 C52 74 44 64 43 51 C42 38 49 28 58 22 Z"
            fill="url(#hidayahEmerald)"
          />

          {/* 8-Pointed Star of Noor (Rub el Hizb) */}
          <g transform="translate(62, 34) scale(0.7)">
            {/* Square 1 */}
            <rect
              x="-12"
              y="-12"
              width="24"
              height="24"
              rx="2"
              fill="url(#hidayahGold)"
            />
            {/* Square 2 (rotated 45deg) */}
            <rect
              x="-12"
              y="-12"
              width="24"
              height="24"
              rx="2"
              transform="rotate(45)"
              fill="url(#hidayahGold)"
            />
            {/* Inner Star Jewel */}
            <circle cx="0" cy="0" r="4.5" fill="#064e3b" />
          </g>

          {/* Open Book of Wisdom / Quran Base Waves */}
          <path
            d="M26 76 C36 71, 46 73, 50 78 C54 73, 64 71, 74 76"
            stroke="url(#hidayahGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M29 82 C38 78, 46 79, 50 83 C54 79, 62 78, 71 82"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className={`font-outfit font-extrabold tracking-tight bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent ${
              isSmall ? "text-lg" : isLarge ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}>
              Hidayah
            </span>
            <span className="font-arabic text-amber-600 font-bold tracking-normal text-sm sm:text-base leading-none">
              هِـدَايَة
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-emerald-800/60 -mt-0.5">
            Personalized Quranic Guidance
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

