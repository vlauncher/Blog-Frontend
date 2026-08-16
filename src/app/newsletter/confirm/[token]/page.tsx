"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function NewsletterConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const res: any = await api.get(`/api/newsletter/confirm/${token}`);
        if (res.status === "success") {
          setStatus("success");
          setMessage(res.message || "Your newsletter subscription has been confirmed!");
        } else {
          setStatus("error");
          setMessage(res.message || "Failed to confirm subscription.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Invalid or expired confirmation link.");
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-3 py-6">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Confirming your subscription...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Subscription Confirmed!</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-xs font-semibold shadow-md"
              >
                <span>Browse Stories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Confirmation Failed</h1>
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
