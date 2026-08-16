import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AetherBlog — Modern Publishing & Tech Journal",
  description: "A world-class editorial blog engine and publishing platform for developers, architects, and technical writers.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white"
      >
        <AuthProvider>
          <NotificationProvider>
            <Toaster position="top-right" richColors />
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
