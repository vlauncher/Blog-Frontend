"use client";

import React, { useState, useEffect } from "react";
import { Comment } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CommentItem } from "./CommentItem";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res: any = await api.get(`/api/comments/post/${postId}`);
      if (res.status === "success" && res.data) {
        setComments(res.data);
      }
    } catch {
      // Fail open
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res: any = await api.post(`/api/comments/post/${postId}`, {
        content: newComment,
      });
      if (res.status === "success" && res.data) {
        setNewComment("");
        await fetchComments();
        toast.success("Comment posted!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const res: any = await api.post(`/api/comments/post/${postId}`, {
        content,
        parentId,
      });
      if (res.status === "success") {
        await fetchComments();
        toast.success("Reply posted!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to post reply");
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const res: any = await api.put(`/api/comments/${commentId}`, { content });
      if (res.status === "success") {
        await fetchComments();
        toast.success("Comment updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to edit comment");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res: any = await api.delete(`/api/comments/${commentId}`);
      if (res.status === "success") {
        await fetchComments();
        toast.success("Comment deleted");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const totalCommentCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  return (
    <section className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <span>Responses ({totalCommentCount})</span>
        </h3>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleCreateComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts on this story?"
            rows={3}
            className="w-full text-sm p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-sm font-semibold rounded-full shadow-sm disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Respond</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in to join the conversation and leave a comment.
          </p>
          <a
            href="/auth/login"
            className="inline-block text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Sign in to your account →
          </a>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4 py-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Be the first to share your thoughts on this story!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};
