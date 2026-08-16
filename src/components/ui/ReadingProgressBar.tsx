"use client";

import React, { useEffect, useState } from "react";

export const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 w-full h-1 z-40 bg-slate-200/50 dark:bg-slate-800/50">
      <div
        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
