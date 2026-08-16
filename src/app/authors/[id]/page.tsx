"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Post, User } from "@/types";
import { PostCard } from "@/components/ui/PostCard";
import { FollowButton } from "@/components/ui/FollowButton";
import { Users, BookOpen, ArrowLeft } from "lucide-react";

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [author, setAuthor] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const [followersRes, postsRes]: any = await Promise.allSettled([
          api.get(`/api/follows/user/${id}/followers`),
          api.get(`/api/posts?authorId=${id}&limit=20`),
        ]);

        if (followersRes.status === "fulfilled" && followersRes.value.status === "success") {
          setFollowerCount(followersRes.value.pagination?.total || followersRes.value.data?.length || 0);
        }

        if (postsRes.status === "fulfilled" && postsRes.value.status === "success") {
          const list = postsRes.value.data || [];
          setPosts(list);
          if (list.length > 0) {
            setAuthor(list[0].author as any);
          }
        }
      } catch {
        // Fail open
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthorData();
  }, [id]);

  const authorName = author ? `${author.firstName} ${author.lastName}` : "Author";

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </Link>

      {/* Author Header Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {author?.profile?.profilePicture ? (
          <Image
            src={author.profile.profilePicture}
            alt={authorName}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md">
            {author?.firstName?.[0] || "A"}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{authorName}</h1>
              <p className="text-xs text-slate-400 mt-0.5">Author & Creator</p>
            </div>
            <FollowButton authorId={id} onToggle={(isF) => setFollowerCount((c) => isF ? c + 1 : Math.max(0, c - 1))} />
          </div>

          {author?.profile?.bio && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {author.profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>{posts.length} published stories</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{followerCount} followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Author Stories */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Published Stories</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-400">
            No published stories yet by this author.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
