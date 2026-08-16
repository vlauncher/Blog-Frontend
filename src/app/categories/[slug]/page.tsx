"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Post, Category } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { Layers, ArrowLeft } from "lucide-react";

export default function CategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        const [catRes, postsRes]: any = await Promise.allSettled([
          api.get(`/api/categories/${slug}`),
          api.get(`/api/posts?category=${encodeURIComponent(slug)}&limit=20`),
        ]);

        if (catRes.status === "fulfilled" && catRes.value.status === "success") {
          setCategory(catRes.value.data);
        }

        if (postsRes.status === "fulfilled" && postsRes.value.status === "success") {
          setPosts(postsRes.value.data || []);
        }
      } catch {
        // Fail open
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndPosts();
  }, [slug]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Categories</span>
      </Link>

      <header className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {category ? category.name : slug}
            </h1>
            {category?.description && (
              <p className="text-sm text-slate-500 mt-1">{category.description}</p>
            )}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-slate-400">No published articles found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
