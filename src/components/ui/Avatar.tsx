"use client";

import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const GRADIENTS = [
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
];

function getGradient(name?: string): string {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

const SIZE_MAP = {
  xs: {
    container: "w-6 h-6 text-[10px]",
    dimension: 24,
  },
  sm: {
    container: "w-8 h-8 text-xs",
    dimension: 32,
  },
  md: {
    container: "w-10 h-10 text-sm",
    dimension: 40,
  },
  lg: {
    container: "w-12 h-12 text-base",
    dimension: 48,
  },
  xl: {
    container: "w-24 h-24 text-3xl",
    dimension: 96,
  },
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = "User",
  size = "sm",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.sm;
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  const gradient = getGradient(name);

  // If no source or error occurred, render fallback initial with rich gradient
  if (!src || hasError) {
    return (
      <div
        className={`rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center shadow-sm select-none flex-shrink-0 ${sizeConfig.container} ${className}`}
        title={name}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 select-none ${sizeConfig.container} ${className}`}
    >
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
