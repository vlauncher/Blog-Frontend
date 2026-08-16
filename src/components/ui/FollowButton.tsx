"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing?: boolean;
  onToggle?: (isFollowing: boolean) => void;
  size?: "sm" | "md";
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  authorId,
  initialIsFollowing = false,
  onToggle,
  size = "sm",
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Cannot follow oneself
  if (user?.id === authorId) return null;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to follow authors");
      return;
    }

    setIsLoading(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    try {
      const res: any = await api.post(`/api/follows/user/${authorId}`);
      if (res.status === "success" && res.data) {
        setIsFollowing(res.data.isFollowing);
        onToggle?.(res.data.isFollowing);
        toast.success(res.data.isFollowing ? "Author followed" : "Author unfollowed");
      }
    } catch {
      setIsFollowing(!nextState); // Rollback
      toast.error("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full transition-all active:scale-95 ${
        isSmall ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5"
      } ${
        isFollowing
          ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          : "bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-500/20"
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};
