import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://YOUR_PROJECT.supabase.co",
  "sb_publishable_XXXXXXXXXXXX"
);

export async function POST(req) {
  try {
    const { password } = await req.json();

    // 1) берём единственного юзера (или по username)
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password")
      .eq("username", "imcontrade") // <-- как у тебя в таблице
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.password !== password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) ставим cookie "session"
    const res = NextResponse.json({ ok: true });

    res.cookies.set("session", "ok", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false, // локально false, на Vercel станет true
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}