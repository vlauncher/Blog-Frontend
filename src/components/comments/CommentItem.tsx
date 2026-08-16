"use client";

import React, { useState } from "react";
import { Comment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquare, Edit2, Trash2, CornerDownRight, Check, X } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onReply,
  onEdit,
  onDelete,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const isOwner = user && (user.id === (comment.author as any).id || (user.firstName === comment.author.firstName && user.lastName === comment.author.lastName));

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editText);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Avatar
              src={comment.author.profile?.profilePicture}
              name={authorName}
              size="xs"
            />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {authorName}
              </span>
              <span className="text-[10px] text-slate-400 ml-2">
                {new Date(comment.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {comment.isEdited && (
                <span className="text-[10px] text-slate-400 italic ml-1.5">(edited)</span>
              )}
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                title="Edit Comment"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Delete Comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSendEdit} className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Reply Trigger */}
        {isAuthenticated && !isEditing && (
          <div className="pt-1">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        )}
      </div>

      {/* Reply input form */}
      {isReplying && (
        <form onSubmit={handleSendReply} className="pl-6 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${authorName}...`}
              autoFocus
              className="flex-1 text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
