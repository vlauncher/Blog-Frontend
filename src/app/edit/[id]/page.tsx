"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Category, Post, PostRevision } from "@/types";
import {
  PenSquare,
  Eye,
  Image as ImageIcon,
  Save,
  Send,
  History,
  Archive,
  RotateCcw,
  Loader2,
  Trash2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [revisions, setRevisions] = useState<PostRevision[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== "AUTHOR" && user?.role !== "ADMIN"))) {
      router.push("/");
    }

    const fetchData = async () => {
      try {
        const [postRes, catRes, revRes]: any = await Promise.allSettled([
          api.get(`/api/posts/${id}`),
          api.get("/api/categories"),
          api.get(`/api/posts/${id}/revisions`),
        ]);

        if (postRes.status === "fulfilled" && postRes.value.status === "success") {
          const p = postRes.value.data;
          setTitle(p.title);
          setContent(p.content);
          setExcerpt(p.excerpt || "");
          setCoverImage(p.coverImage || null);
          setCoverImageId(p.coverImageId || null);
          setCategoryId(p.categoryId || "");
          setTagsInput(p.tags ? p.tags.map((t: any) => t.name).join(", ") : "");
        }

        if (catRes.status === "fulfilled" && catRes.value.status === "success") {
          setCategories(catRes.value.data || []);
        }

        if (revRes.status === "fulfilled" && revRes.value.status === "success") {
          setRevisions(revRes.value.data || []);
        }
      } catch {
        // Fail open
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authLoading, user, router]);

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
        toast.success("Cover image updated & optimized!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return;

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
      };

      const res: any = await api.put(`/api/posts/${id}`, body);
      toast.success("Story updated & new revision saved!");
      router.push(`/posts/${res.data.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreRevision = async (revId: string, version: number) => {
    if (!confirm(`Are you sure you want to rollback to Version ${version}?`)) return;

    try {
      const res: any = await api.post(`/api/posts/${id}/revisions/${revId}/restore`);
      if (res.status === "success") {
        toast.success(`Successfully rolled back to Version ${version}!`);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to restore revision");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this post?")) return;

    try {
      await api.post(`/api/posts/${id}/archive`);
      toast.success("Post archived");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to archive post");
    }
  };

  if (isLoadingPost) {
    return <div className="text-center py-20">Loading story editor...</div>;
  }

  const previewHtml = marked.parse(content || "") as string;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Edit Story</h1>
        </div>

        <div className="flex items-center gap-2">
          {revisions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRevisions(!showRevisions)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History ({revisions.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleArchive}
            className="p-2 text-slate-400 hover:text-amber-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Archive Story"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? "Editor" : "Preview"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleUpdate}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Version History Drawer */}
      {showRevisions && (
        <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Version History & Rollbacks</span>
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400">
              Each edit creates a safe snapshot.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Version #{rev.version}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{rev.title}</p>
                <button
                  type="button"
                  onClick={() => handleRestoreRevision(rev.id, rev.version)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Snapshot</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Body */}
      {previewMode ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-500">Live Preview</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
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
              <label className="cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 text-center transition-colors">
                <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {isUploadingCover ? "Uploading & Optimizing with Sharp..." : "Upload Cover Image (Max 250KB WebP)"}
                </span>
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
              className="w-full text-2xl sm:text-3xl font-extrabold bg-transparent text-slate-900 dark:text-white focus:outline-none"
            />
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Subtitle / Short Excerpt..."
              className="w-full text-sm bg-transparent text-slate-600 dark:text-slate-300 focus:outline-none pt-2 border-t border-slate-100 dark:border-slate-800"
            />
          </div>

          {/* Markdown Content */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold uppercase tracking-wider">Markdown Editor</span>
              <span>Edits will auto-generate a new version revision</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full font-mono text-sm leading-relaxed p-2 bg-transparent text-slate-900 dark:text-white focus:outline-none resize-y"
            />
          </div>

          {/* Taxonomy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
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

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="TypeScript, Architecture"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
