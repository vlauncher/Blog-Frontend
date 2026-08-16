"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Bell, Check, CheckCircle2, UserPlus, MessageSquare, Heart, Sparkles } from "lucide-react";

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, isLoading } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, router, fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_FOLLOWER":
        return <UserPlus className="w-4 h-4 text-sky-500" />;
      case "COMMENT":
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case "REACTION":
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-sky-500" />
            <span>Activity & Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for new followers, comments, and story reactions.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">You&apos;re all caught up!</h3>
          <p className="text-xs text-slate-500">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-4 ${
                !n.isRead ? "bg-sky-50/40 dark:bg-sky-950/20" : ""
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {n.message}
                </p>
                <span className="text-xs text-slate-400 block">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
