"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { Search, Loader2, Sparkles, X } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res: any = await api.get(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.status === "success" && res.data) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, topic, tags, or content..."
          autoFocus
          className="w-full text-base sm:text-lg pl-14 pr-12 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {results.length} {results.length === 1 ? "result" : "results"} for &quot;{query}&quot;
          </span>
        </div>
      )}

      {/* Status States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <span className="text-sm text-slate-400">Searching the knowledge base...</span>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with broader keywords, author names, or explore categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
