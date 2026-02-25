"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", "imcontrade")
      .eq("password", password)
      .maybeSingle();

    setLoading(false);

    console.log("data:", data, "error:", error);

    if (data && !error) {
      localStorage.setItem("session", "ok");
      router.push("/products");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[420px] rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6"
      >
        <h1 className="text-xl font-semibold mb-2">Вход</h1>
        <p className="text-sm opacity-70 mb-5">
          Введите пароль, чтобы открыть склад
        </p>

        <label className="grid gap-2 mb-4">
          <span className="text-sm opacity-80">Пароль</span>

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={`w-full px-3 py-3 rounded-xl bg-white/10 border border-white/20 outline-none pr-12 ${
                shake ? "ring-2 ring-red-500 shake" : ""
              }`}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 disabled:opacity-60"
        >
          {loading ? "..." : "Войти"}
        </button>
      </form>
    </div>
  );
}