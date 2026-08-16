"use client";

import React, { useEffect, useState } from "react";
import { TocItem } from "@/types";
import { ListFilter } from "lucide-react";

interface TableOfContentsProps {
  items: TocItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <ListFilter className="w-4 h-4" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = activeSlug === item.slug;
          const paddingLeft = item.level === 3 ? "pl-4" : item.level === 4 ? "pl-6" : "";

          return (
            <li key={item.slug} className={`${paddingLeft}`}>
              <a
                href={`#${item.slug}`}
                className={`block transition-colors py-0.5 line-clamp-1 ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400 font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
