"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { NotificationItem } from "@/types";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get("/api/notifications/unread-count");
      if (res.status === "success" && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Fail open
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res: any = await api.get("/api/notifications?limit=30");
      if (res.status === "success" && res.data) {
        setNotifications(res.data);
      }
      await fetchUnreadCount();
    } catch {
      // Fail open
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Connect to SSE Stream
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    fetchNotifications();

    let eventSource: EventSource | null = null;
    try {
      // Standard EventSource does not support custom headers, but we can pass token via query if needed or standard cookie/token
      // In our Express SSE endpoint, let's connect if bearer header or standard fetch stream
      // Let's use Fetch stream for SSE with Authorization header
      const abortController = new AbortController();

      fetch(`${API_BASE_URL}/api/notifications/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: abortController.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) return;
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.replace("data: ", ""));
                  if (data.id && data.message) {
                    setNotifications((prev) => [data, ...prev]);
                    setUnreadCount((c) => c + 1);
                    toast.info("New Notification", {
                      description: data.message,
                    });
                  }
                } catch {
                  // heartbeat or non-json message
                }
              }
            }
          }
        })
        .catch(() => {
          // SSE stream closed or aborted
        });

      return () => {
        abortController.abort();
      };
    } catch {
      // SSE setup error
    }
  }, [isAuthenticated, user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
