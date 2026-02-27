"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, User, Warehouse } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "dark" : prefersDark;
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
  };

  return (
    <header className="bg-linear-to-r from-neutral-800 to-neutral-800/50 border-b border-neutral-700 rounded-t-2xl flex justify-between items-center text-neutral-0 p-6 shadow-lg">
      <nav className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary-600/20 text-primary-400">
          <Warehouse size={24} />
        </div>
        <span className="text-sm font-medium text-neutral-400 hidden sm:inline">Навигация</span>
      </nav>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/sotrudniki")}
          className="flex items-center gap-2 hover:bg-neutral-700 rounded-lg px-3 py-2 transition-colors text-neutral-400 hover:text-neutral-200"
          title="Сотрудники"
        >
          <User size={28} />
          <span className="text-sm hidden sm:inline">Сотрудники</span>
        </button>
      </div>

      <button 
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-neutral-200"
        title={isDark ? "Светлая тема" : "Тёмная тема"}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}