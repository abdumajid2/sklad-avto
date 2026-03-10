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
          <Header />
          <div className="min-h-[80dvh] md:w-460 mx-auto p-4">

            {children}
          </div>
         
          <Footer />
       
  
    </AuthGuard>
  );
}