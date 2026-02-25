import { NextResponse } from "next/server";

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signHmacSha256(value, secret) {
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return toHex(sig);
}

export async function middleware(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // разрешаем доступ к логину и API
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session")?.value;
  const SECRET = process.env.SESSION_SECRET || "";

  if (!cookie || !SECRET) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const parts = cookie.split(".");
  if (parts.length < 3) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const sig = parts.slice(2).join(".");

  const expected = await signHmacSha256(payload, SECRET);

  if (sig !== expected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};