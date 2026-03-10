"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session");
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
      if (session === "ok") {
        router.replace("/products");
      } else {
        setAllowed(true);
        setChecked(true);
      }
    } else {
      if (session === "ok") {
        setAllowed(true);
        setChecked(true);
      } else {
        router.replace("/login");
      }
    }
  }, [pathname]); // ✅ только pathname

  if (!checked) return null;
  if (!allowed) return null;

  return children;
}