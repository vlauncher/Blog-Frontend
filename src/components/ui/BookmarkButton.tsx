"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  postId,
  initialIsBookmarked = false,
  onToggle,
  className = "",
}) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark articles");
      return;
    }

    setIsLoading(true);
    // Optimistic toggle
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      const res: any = await api.post(`/api/bookmarks/post/${postId}`);
      if (res.status === "success" && res.data) {
        setIsBookmarked(res.data.isBookmarked);
        onToggle?.(res.data.isBookmarked);
        toast.success(res.data.isBookmarked ? "Saved to your bookmarks" : "Removed from bookmarks");
      }
    } catch {
      setIsBookmarked(!nextState); // Rollback
      toast.error("Failed to update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isBookmarked ? "Remove Bookmark" : "Save Story"}
      className={`p-2 rounded-full transition-all duration-200 ${
        isBookmarked
          ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 transition-transform active:scale-90 ${
          isBookmarked ? "fill-current" : ""
        }`}
      />
    </button>
  );
};
