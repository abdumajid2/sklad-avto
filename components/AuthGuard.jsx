"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login") return;
    const s = localStorage.getItem("session");
    if (s !== "ok") router.replace("/login");
  }, [pathname, router]);

  return children;
}