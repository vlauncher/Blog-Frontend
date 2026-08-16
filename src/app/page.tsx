"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Post, Category, Tag } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { Sparkles, Flame, Layers, Hash, ArrowRight, Loader2 } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchFeed = async (catSlug?: string | null) => {
    setIsLoading(true);
    try {
      let endpoint = "/api/posts?limit=10";
      if (catSlug) {
        endpoint += `&category=${encodeURIComponent(catSlug)}`;
      }

      const [postsRes, trendingRes, categoriesRes, tagsRes]: any = await Promise.allSettled([
        api.get(endpoint),
        api.get("/api/analytics/trending?limit=4"),
        api.get("/api/categories"),
        api.get("/api/tags?limit=12"),
      ]);

      if (postsRes.status === "fulfilled" && postsRes.value.status === "success") {
        setPosts(postsRes.value.data);
        setNextCursor(postsRes.value.pagination?.nextCursor || null);
      }

      if (trendingRes.status === "fulfilled" && trendingRes.value.status === "success") {
        setTrendingPosts(trendingRes.value.data || []);
      }

      if (categoriesRes.status === "fulfilled" && categoriesRes.value.status === "success") {
        setCategories(categoriesRes.value.data || []);
      }

      if (tagsRes.status === "fulfilled" && tagsRes.value.status === "success") {
        setTags(tagsRes.value.data || []);
      }
    } catch {
      // Fail open
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(selectedCategory);
  }, [selectedCategory]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      let endpoint = `/api/posts?limit=10&cursor=${nextCursor}`;
      if (selectedCategory) {
        endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res: any = await api.get(endpoint);
      if (res.status === "success" && res.data) {
        setPosts((prev) => [...prev, ...res.data]);
        setNextCursor(res.pagination?.nextCursor || null);
      }
    } catch {
      // Fail open
    } finally {
      setIsLoadingMore(false);
    }
  };

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="space-y-12">
      {/* Category Pills Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === null
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-slate-200/70 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          }`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.slug
                ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                : "bg-slate-200/70 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-72 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            <div className="h-72 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            <div className="h-72 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No published stories yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Be the pioneer author! Sign in with your author credentials to write and publish your first article.
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-sky-500/20"
          >
            <span>Write a Story</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Hero Featured Story */}
          {featuredPost && <PostCard post={featuredPost} featured={true} />}

          {/* Daily Trending Banner */}
          {trendingPosts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Trending on AetherBlog Today</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingPosts.map((tp, idx) => (
                  <Link
                    key={tp.id}
                    href={`/posts/${tp.slug}`}
                    className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-sm transition-all flex items-start gap-4"
                  >
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-sky-500 transition-colors">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400">
                        {tp.author.firstName} {tp.author.lastName}
                      </p>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-sky-600 transition-colors">
                        {tp.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Main Feed Grid & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Feed List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedCategory ? `Topic: ${selectedCategory}` : "Latest Published Stories"}
                </h3>
                <span className="text-xs text-slate-400">{posts.length} articles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Load More Trigger */}
              {nextCursor && (
                <div className="text-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <span>Load More Stories</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar (Tags, Categories, About) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Popular Tags */}
              {tags.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Hash className="w-4 h-4 text-sky-500" />
                    <span>Popular Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Tree */}
              {categories.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Explore Categories</span>
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="flex items-center justify-between text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1"
                        >
                          <span>{cat.name}</span>
                          {cat._count && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                              {cat._count.posts}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
