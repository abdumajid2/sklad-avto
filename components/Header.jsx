"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  Truck,
  User,
  Warehouse,
  Menu,
  X,
  Package,
} from "lucide-react";

const navItems = [
  { label: "Сотрудники", path: "/sotrudniki", icon: User },
  { label: "Товары", path: "/goods", icon: Package },
  { label: "Остатки", path: "/stocks", icon: Warehouse },
  { label: "Отгрузки", path: "/otgruzki", icon: Truck },
];

export default function Header() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  const goTo = (path) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Warehouse size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Warehouse</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Управление складом
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="h-full w-[280px] bg-white p-4 shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Меню</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Переход по разделам
                </p>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => goTo(item.path)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <div className="rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
                      <Icon size={18} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}