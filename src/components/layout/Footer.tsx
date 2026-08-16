"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Rss, FileCode, Map, Check, ArrowRight } from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res: any = await api.post("/api/newsletter/subscribe", { email });
      setIsSubscribed(true);
      toast.success("Subscription initiated!", {
        description: res.message || "Please check your inbox to confirm.",
      });
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe to newsletter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Aether<span className="text-sky-400">Blog</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md">
              A modern publishing platform and editorial blog engine engineered for high-performance software architects, engineers, and creators. Real-time notifications, rich markdown, and verified analytics.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-white mb-2">Subscribe to our newsletter</h4>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-4 py-2.5 rounded-xl">
                  <Check className="w-4 h-4" />
                  <span>Check your email to confirm your subscription!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Feed
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search Stories
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-white transition-colors">
                  Saved Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Feeds & Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Developer & Feeds</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`${API_BASE_URL}/feed.xml`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-500" />
                  <span>RSS 2.0 Feed</span>
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL}/feed.json`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>JSON Feed 1.1</span>
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL}/sitemap.xml`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Map className="w-3.5 h-3.5 text-emerald-400" />
                  <span>XML Sitemap</span>
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Swagger OpenAPI Docs
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ReDoc Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AetherBlog Engine. Production-Grade Editorial Platform.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              API Services Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
