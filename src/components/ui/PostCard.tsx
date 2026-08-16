"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { Clock, Eye, MessageSquare } from "lucide-react";
import { BookmarkButton } from "./BookmarkButton";
import { Avatar } from "./Avatar";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, featured = false }) => {
  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const authorName = `${post.author.firstName} ${post.author.lastName}`;

  if (featured) {
    return (
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Cover Image */}
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-600/20 via-indigo-600/20 to-purple-600/20 flex items-center justify-center p-8">
              <span className="text-2xl font-bold text-slate-400/40 text-center line-clamp-3">
                {post.title}
              </span>
            </div>
          )}
          {post.category && (
            <span className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-sky-600 dark:text-sky-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTimeMinutes} min read
              </span>
            </div>

            <Link href={`/posts/${post.slug}`} className="block group">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-3">
                {post.title}
              </h2>
            </Link>

            {post.excerpt && (
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              href={`/authors/${post.author.id}`}
              className="flex items-center space-x-3 group/author"
            >
              <Avatar
                src={post.author.profile?.profilePicture}
                name={authorName}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover/author:text-sky-600 transition-colors">
                  {authorName}
                </p>
                <p className="text-[11px] text-slate-400">Author</p>
              </div>
            </Link>

            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1 text-xs text-slate-400 mr-2">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.viewCount}</span>
              </div>
              <BookmarkButton postId={post.id} initialIsBookmarked={post.isBookmarked} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Cover Image Thumbnail */}
        <Link
          href={`/posts/${post.slug}`}
          className="relative block h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 flex items-center justify-center p-4">
              <span className="text-sm font-semibold text-slate-400/60 text-center line-clamp-2">
                {post.title}
              </span>
            </div>
          )}
          {post.category && (
            <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-sky-600 dark:text-sky-400 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {post.category.name}
            </span>
          )}
        </Link>

        {/* Body */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTimeMinutes} min
            </span>
          </div>

          <Link href={`/posts/${post.slug}`} className="block">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {post.excerpt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <Link
          href={`/authors/${post.author.id}`}
          className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-colors"
        >
          <Avatar
            src={post.author.profile?.profilePicture}
            name={authorName}
            size="xs"
          />
          <span className="truncate max-w-[110px]">{authorName}</span>
        </Link>

        <div className="flex items-center space-x-1 text-slate-400 text-xs">
          <span className="flex items-center gap-1 mr-1">
            <Eye className="w-3 h-3" />
            {post.viewCount}
          </span>
          <BookmarkButton postId={post.id} initialIsBookmarked={post.isBookmarked} />
        </div>
      </div>
    </article>
  );
};
