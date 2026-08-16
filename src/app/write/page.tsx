"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Category, Tag } from "@/types";
import {
  PenSquare,
  Eye,
  Image as ImageIcon,
  Save,
  Send,
  Calendar,
  Layers,
  Hash,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";

export default function WritePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to write stories");
      router.push("/auth/login");
    }

    const fetchCategories = async () => {
      try {
        const res: any = await api.get("/api/categories");
        if (res.status === "success" && res.data) {
          setCategories(res.data);
        }
      } catch {}
    };

    fetchCategories();
  }, [isAuthenticated, authLoading, user, router]);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("picture", file);

    try {
      const res: any = await api.post("/api/media/upload", formData);
      if (res.status === "success" && res.data) {
        setCoverImage(res.data.url);
        setCoverImageId(res.data.publicId);
        toast.success("Cover image uploaded & optimized (Sharp WebP)!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (action: "publish" | "draft" | "schedule") => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required");
      return;
    }

    if (action === "schedule" && !scheduledDate) {
      toast.error("Please choose a scheduled publish date and time");
      return;
    }

    setIsSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const body: any = {
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        coverImageId: coverImageId || undefined,
        categoryId: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
      };

      const res: any = await api.post("/api/posts", body);
      const post = res.data;

      if (action === "publish") {
        const publishRes: any = await api.post(`/api/posts/${post.id}/publish`);
        if (publishRes.data?.status === "PENDING_REVIEW") {
          toast.success("Story submitted! An administrator has been notified and will review your post shortly.");
        } else {
          toast.success("Story published successfully!");
        }
      } else if (action === "schedule") {
        await api.post(`/api/posts/${post.id}/schedule`, {
          scheduledPublishAt: new Date(scheduledDate).toISOString(),
        });
        toast.success("Story scheduled for publishing!");
      } else {
        toast.success("Story saved as draft!");
      }

      router.push(`/posts/${post.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewHtml = marked.parse(content || "*No content written yet...*") as string;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <PenSquare className="w-6 h-6 text-sky-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Author Studio</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? "Editor Mode" : "Live Preview"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("publish")}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{user?.role === "READER" ? "Submit for Review" : "Publish Now"}</span>
          </button>
        </div>
      </div>

      {/* Editor or Preview Mode */}
      {previewMode ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-500">Live Preview</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{title || "Untitled Story"}</h1>
          {coverImage && (
            <div className="relative h-80 w-full rounded-2xl overflow-hidden">
              <Image src={coverImage} alt="Cover" fill className="object-cover" />
            </div>
          )}
          <div
            className="prose prose-lg dark:prose-invert max-w-none pt-4"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cover Image Upload Area */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {coverImage ? (
              <div className="relative h-64 w-full rounded-2xl overflow-hidden group">
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImageId(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 text-center transition-colors">
                <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {isUploadingCover ? "Uploading & Optimizing with Sharp..." : "Upload Cover Image (Max 250KB WebP)"}
                </span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP, GIF supported</span>
                <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
              </label>
            )}
          </div>

          {/* Title & Excerpt */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title..."
              className="w-full text-2xl sm:text-3xl font-extrabold bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Subtitle / Short Excerpt (optional)..."
              className="w-full text-sm bg-transparent text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-none pt-2 border-t border-slate-100 dark:border-slate-800"
            />
          </div>

          {/* Markdown Content Area */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold uppercase tracking-wider">Markdown Content</span>
              <span>Supports # Headings, ```code, tables, lists</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story in Markdown here..."
              rows={16}
              className="w-full font-mono text-sm leading-relaxed p-2 bg-transparent text-slate-900 dark:text-white focus:outline-none resize-y"
            />
          </div>

          {/* Taxonomy & Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Category</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select Topic</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-500" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="TypeScript, Architecture, React"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Scheduling */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Schedule Publishing</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Advanced SEO Drawer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full p-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Advanced SEO & Metadata Options</span>
              </span>
              {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSeo && (
              <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Custom SEO Title"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Search engine snippet description"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://original-source.com/post"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action bar */}
          {scheduledDate && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("schedule")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Post for {new Date(scheduledDate).toLocaleDateString()}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
