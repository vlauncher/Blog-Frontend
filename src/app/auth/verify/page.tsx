"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, CheckCircle2, RotateCw, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function VerifyOtpContent() {
  const { verifyEmail, resendOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit numeric OTP");
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(email, otp);
      toast.success("Email verified successfully!", {
        description: "You can now sign in with your credentials.",
      });
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await resendOtp(email);
      setCountdown(60);
      toast.success("New 6-digit OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Email</h1>
          <p className="text-xs text-slate-500">
            We sent a 6-digit verification code to <span className="font-semibold text-slate-800 dark:text-slate-200">{email || "your email"}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {!emailParam && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Confirm & Verify</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Didn&apos;t receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="font-semibold text-sky-600 dark:text-sky-400 hover:underline disabled:text-slate-400 flex items-center gap-1"
          >
            <RotateCw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
            <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
