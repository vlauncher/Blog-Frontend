"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ReactionButtonProps {
  postId: string;
  initialCounts?: Record<string, number>;
  initialUserReaction?: string | null;
}

const REACTION_CONFIG = [
  { type: "CLAP", label: "Clap", emoji: "👏" },
  { type: "LOVE", label: "Love", emoji: "❤️" },
  { type: "INSIGHTFUL", label: "Insightful", emoji: "💡" },
  { type: "CELEBRATE", label: "Celebrate", emoji: "🎉" },
  { type: "LIKE", label: "Like", emoji: "👍" },
];

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  postId,
  initialCounts = {},
  initialUserReaction = null,
}) => {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReaction = async (type: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to react to this story");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const isRemoving = userReaction === type;
    const newReaction = isRemoving ? null : type;

    // Optimistic counts
    setCounts((prev) => {
      const copy = { ...prev };
      if (userReaction) {
        copy[userReaction] = Math.max(0, (copy[userReaction] || 1) - 1);
      }
      if (!isRemoving) {
        copy[type] = (copy[type] || 0) + 1;
      }
      return copy;
    });
    setUserReaction(newReaction);

    if (type === "CELEBRATE" || type === "CLAP") {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    try {
      const res: any = await api.post(`/api/reactions/post/${postId}`, { type });
      if (res.status === "success" && res.data) {
        // Confirmed
      }
    } catch {
      // Re-fetch latest reactions
      try {
        const latest: any = await api.get(`/api/reactions/post/${postId}`);
        if (latest.data) {
          setCounts(latest.data.counts || {});
          setUserReaction(latest.data.userReaction);
        }
      } catch {}
      toast.error("Failed to update reaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_CONFIG.map(({ type, emoji, label }) => {
        const count = counts[type] || 0;
        const isActive = userReaction === type;

        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            title={`${label} (${count})`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 ${
              isActive
                ? "bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 ring-2 ring-sky-500/40 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-base">{emoji}</span>
            <span className="text-xs font-semibold">{count > 0 ? count : ""}</span>
          </button>
        );
      })}
    </div>
  );
};
