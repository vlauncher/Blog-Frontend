"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { Bookmark, ArrowRight, Loader2 } from "lucide-react";

export default function BookmarksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get("/api/bookmarks?limit=30");
      if (res.status === "success" && res.data) {
        setBookmarks(res.data);
      }
    } catch {
      // Fail open
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated, authLoading, router]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-amber-500 fill-amber-500" />
          <span>Saved Stories</span>
        </h1>
        <p className="text-sm text-slate-500">Your personal reading list of bookmarked articles.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No saved stories yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any article card or reading page to save it here for later reading.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-xs font-semibold px-5 py-2.5 rounded-full"
          >
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((post) => (
            <PostCard key={post.id} post={{ ...post, isBookmarked: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
