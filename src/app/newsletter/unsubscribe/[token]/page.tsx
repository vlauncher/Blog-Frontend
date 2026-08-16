"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function NewsletterUnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const res: any = await api.get(`/api/newsletter/unsubscribe/${token}`);
        if (res.status === "success") {
          setStatus("success");
          setMessage(res.message || "You have been unsubscribed from the newsletter.");
        } else {
          setStatus("error");
          setMessage(res.message || "Failed to unsubscribe.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Invalid unsubscribe link.");
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-3 py-6">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Processing unsubscribe request...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Unsubscribed</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Unsubscribe Failed</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
