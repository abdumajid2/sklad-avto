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
  const [errorText, setErrorText] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setErrorText("Введите пароль");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", "imcontrade")
      .eq("password", password)
      .maybeSingle();

    setLoading(false);

    if (data && !error) {
      localStorage.setItem("session", "ok");
      router.push("/products");
    } else {
      setErrorText("Неверный пароль");
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Вход в систему</h1>
          <p className="text-neutral-300">
            Введите пароль для доступа к складу
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-neutral-200">
            Пароль
          </label>

          <div className={`${shake ? "shake" : ""}`}>
            <div className="relative">
              <input
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorText) setErrorText("");
                }}
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                disabled={loading}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-white outline-none transition-all placeholder:text-neutral-400
                  ${
                    errorText
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                      : "border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  }
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}
                `}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorText && (
            <p className="text-sm text-red-400">{errorText}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Вход..." : "Войти"}
        </button>

        <p className="text-center text-xs text-neutral-400">
          Защищённая система доступа
        </p>
      </form>
    </div>
  );
}