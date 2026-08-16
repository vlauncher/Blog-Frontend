"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Category } from "@/types";
import { Layers, ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res: any = await api.get("/api/categories");
        if (res.status === "success" && res.data) {
          setCategories(res.data);
        }
      } catch {
        // Fail open
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Layers className="w-8 h-8 text-sky-500" />
          <span>Explore All Topics & Categories</span>
        </h1>
        <p className="text-sm text-slate-500">
          Discover hand-crafted stories, architecture deep-dives, and technical tutorials categorized by topic.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-slate-400">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-sky-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  {cat._count && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
                      {cat._count.posts} stories
                    </span>
                  )}
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                {/* Subcategories / Children */}
                {cat.children && cat.children.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      >
                        ↳ {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`/categories/${cat.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
              >
                <span>Browse {cat.name} archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
