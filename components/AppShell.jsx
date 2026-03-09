"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import AuthGuard from "./AuthGuard";

export default function AppShell({ children }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <AuthGuard>
        <div className="relative w-full h-[100dvh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/bgs.jpg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/40 to-black/50" />
          <div className="absolute inset-0 backdrop-blur-sm" />

          <main className="relative z-10 min-h-screen flex items-center justify-center px-4">
            {children}
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="relative w-full h-[100dvh] md:h-[calc(100dvh-32px)] md:rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/40 to-black/50" />
        <div className="absolute inset-0 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 overflow-auto px-3 md:px-6 py-4">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}