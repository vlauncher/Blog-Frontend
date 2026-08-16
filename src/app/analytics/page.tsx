"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AuthorDashboardData, Post } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
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
  ShieldCheck,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorAnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AuthorDashboardData | null>(null);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "moderation">("overview");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const fetchAnalytics = async () => {
    try {
      const promises: any[] = [api.get("/api/analytics/author/dashboard")];
      if (user?.role === "ADMIN") {
        promises.push(api.get("/api/posts/admin/pending"));
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === "fulfilled" && results[0].value.status === "success") {
        setData(results[0].value.data);
      }

      if (results[1] && results[1].status === "fulfilled" && results[1].value.status === "success") {
        setPendingPosts(results[1].value.data || []);
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
      fetchAnalytics();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleApprove = async (postId: string) => {
    setActionInProgress(postId);
    try {
      await api.post(`/api/posts/${postId}/approve`);
      toast.success("Story approved and published live!");
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      toast.error(err.message || "Failed to approve story");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (postId: string) => {
    const reason = prompt("Enter a reason or feedback for the author (optional):");
    setActionInProgress(postId);
    try {
      await api.post(`/api/posts/${postId}/reject`, { reason: reason || undefined });
      toast.success("Story rejected with feedback sent to author");
      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      toast.error(err.message || "Failed to reject story");
    } finally {
      setActionInProgress(null);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-sky-500" />
            <span>Author Studio & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500">
            Real-time reader engagement, reach metrics, and editorial queues.
          </p>
        </div>

        {/* Tab Selector (for Admins) */}
        {isAdmin && (
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Metrics Overview
            </button>
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "moderation"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Review Queue</span>
              {pendingPosts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingPosts.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === "moderation" && isAdmin ? (
        /* Admin Moderation Queue */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Community Moderation Queue
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                Stories submitted by community members require administrative approval before being published to the public feed.
              </p>
            </div>
          </div>

          {pendingPosts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-500">There are no pending stories awaiting review right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Pending Review
                      </span>
                      {post.category && (
                        <span className="text-xs text-slate-400">
                          in {post.category.name}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-lg font-bold text-slate-900 dark:text-white hover:text-sky-600 transition-colors block"
                    >
                      {post.title}
                    </Link>

                    {post.excerpt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Avatar
                        src={post.author?.profile?.profilePicture}
                        name={`${post.author?.firstName} ${post.author?.lastName}`}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                      <span className="text-xs text-slate-400">({(post.author as any)?.email})</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-center flex-shrink-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Preview Post
                    </Link>

                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={actionInProgress === post.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={actionInProgress === post.id}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {actionInProgress === post.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Overview Metrics */
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Views</span>
                <Eye className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {data?.totalViews?.toLocaleString() || 0}
              </p>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live Reader Tracking
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Published Stories</span>
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {data?.totalPosts || 0}
              </p>
              <span className="text-[11px] text-slate-400">Across topics</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Reactions</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {data?.totalReactions?.toLocaleString() || 0}
              </p>
              <span className="text-[11px] text-slate-400">Claps, Loves, Likes</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Comments</span>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {data?.totalComments?.toLocaleString() || 0}
              </p>
              <span className="text-[11px] text-slate-400">Engaged readers</span>
            </div>
          </div>

          {/* Top Performing Stories Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
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
        </>
      )}
    </div>
  );
}
