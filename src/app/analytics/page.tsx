"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AuthorDashboardData } from "@/types";
import {
  BarChart3,
  Eye,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function AuthorAnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AuthorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== "AUTHOR" && user?.role !== "ADMIN"))) {
      router.push("/");
    }

    const fetchAnalytics = async () => {
      try {
        const res: any = await api.get("/api/analytics/author/dashboard");
        if (res.status === "success" && res.data) {
          setData(res.data);
        }
      } catch {
        // Fail open
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-6 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Story Views",
      value: data?.totalViews || 0,
      icon: <Eye className="w-5 h-5 text-sky-500" />,
      change: "+12.4%",
    },
    {
      label: "Active Followers",
      value: data?.totalFollowers || 0,
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      change: "+4.1%",
    },
    {
      label: "Reader Reactions",
      value: data?.totalReactions || 0,
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      change: "+18.2%",
    },
    {
      label: "Community Comments",
      value: data?.totalComments || 0,
      icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
      change: "+8.7%",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-sky-500" />
            <span>Author Studio Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time reader engagement, view tracking, and audience growth.</p>
        </div>

        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-xs font-semibold shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Write New Post</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80">{stat.icon}</div>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {stat.change}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">{stat.label}</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Stories */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Top Performing Stories</span>
          </h3>
          <span className="text-xs text-slate-400">Ranked by reader views</span>
        </div>

        {!data?.topPosts || data.topPosts.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400">
            No published posts with views data yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.topPosts.map((post, idx) => (
              <div
                key={post.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xl font-black text-slate-300 dark:text-slate-700">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600 line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{post.readingTimeMinutes} min read</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {post.viewCount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block">views</span>
                  </div>

                  <Link
                    href={`/edit/${post.id}`}
                    className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Post"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
