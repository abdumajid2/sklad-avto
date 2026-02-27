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
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md glass-elevated p-8 space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Вход в систему</h1>
          <p className="text-neutral-400">
            Введите пароль для доступа к складу
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>

          <div className="relative">
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={`input pr-12 ${shake ? "input-error shake" : ""}`}
              placeholder="Введите пароль"
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-lg w-full"
        >
          {loading ? "Вход..." : "Войти"}
        </button>

        <p className="text-center text-xs text-neutral-500">
          Защищённая система доступа
        </p>
      </form>
    </div>
  );
}