"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { ReadingProgressBar } from "@/components/ui/ReadingProgressBar";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { ReactionButton } from "@/components/ui/ReactionButton";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { FollowButton } from "@/components/ui/FollowButton";
import { CommentSection } from "@/components/comments/CommentSection";
import { Avatar } from "@/components/ui/Avatar";
import { Clock, Eye, Calendar, Share2, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res: any = await api.get(`/api/posts/slug/${slug}`);
        if (res.status === "success" && res.data) {
          setPost(res.data);

          // Track view analytics
          try {
            await api.post(`/api/analytics/view/${res.data.id}`, {
              readPercent: 100,
              referrer: typeof document !== "undefined" ? document.referrer : "",
            });
          } catch {
            // Analytics fail open
          }
        } else {
          setPost(null);
        }
      } catch {
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested article may have been archived, moved, or deleted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <ReadingProgressBar />

      <article className="max-w-4xl mx-auto space-y-10 py-6">
        {/* Back Link & Category */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </Link>
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-200/60 dark:border-sky-800/60 hover:bg-sky-100 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
        </div>

        {/* Title & Excerpt */}
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Author Card & Metrics Bar */}
        <div className="py-4 border-y border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link href={`/authors/${post.author.id}`} className="flex-shrink-0">
              <Avatar
                src={post.author.profile?.profilePicture}
                name={authorName}
                size="md"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/authors/${post.author.id}`}
                  className="text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600 transition-colors"
                >
                  {authorName}
                </Link>
                <FollowButton authorId={post.author.id} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTimeMinutes} min read ({post.wordCount} words)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount} views</span>
            </div>
            <button
              onClick={handleShare}
              title="Share Link"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <BookmarkButton postId={post.id} initialIsBookmarked={post.isBookmarked} />
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-72 sm:h-96 md:h-[480px] w-full rounded-3xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-800">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Article Body & Sidebar TOC Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Prose */}
          <div className="lg:col-span-8">
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{
                __html: post.contentHtml || `<p>${post.content}</p>`,
              }}
            />

            {/* Tags Footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 text-xs font-medium transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Reactions Bar */}
            <div className="py-6 mt-6 border-y border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <ReactionButton
                postId={post.id}
                initialCounts={post.reactionCounts}
                initialUserReaction={post.userReaction}
              />
              <BookmarkButton postId={post.id} initialIsBookmarked={post.isBookmarked} />
            </div>

            {/* Author Spotlight Box */}
            <div className="my-8 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start space-x-4">
              <Link href={`/authors/${post.author.id}`} className="flex-shrink-0">
                <Avatar
                  src={post.author.profile?.profilePicture}
                  name={authorName}
                  size="lg"
                />
              </Link>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">Written by {authorName}</h4>
                  <FollowButton authorId={post.author.id} />
                </div>
                {post.author.profile?.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {post.author.profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Threaded Comments */}
            <CommentSection postId={post.id} />
          </div>

          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <TableOfContents items={post.tableOfContents} />
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
