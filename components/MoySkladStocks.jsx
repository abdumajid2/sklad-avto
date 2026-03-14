"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Package2, RefreshCcw, Warehouse } from "lucide-react";

function fmtNumber(value) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

function fmtPrice(value) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "TJS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function MoySkladProducts() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadStocks = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch("/api/moysklad/stocks", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Ошибка загрузки");
      }

      setStocks(data.rows || []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Не удалось загрузить остатки");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const filteredStocks = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return stocks;

    return stocks.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const code = String(item.code || "").toLowerCase();
      const article = String(item.externalCode || "").toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        article.includes(q)
      );
    });
  }, [stocks, search]);

  const totalItems = filteredStocks.length;
  const totalStock = filteredStocks.reduce(
    (sum, item) => sum + Number(item.stock || 0),
    0
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 text-neutral-900 dark:text-white">
      <div className="rounded-3xl border border-black/10 bg-white/80 dark:bg-white/10 dark:border-white/15 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-black/10 dark:border-white/10 p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-600/15 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Warehouse size={24} />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Остатки из МойСклад
                </h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-white/70 mt-1">
                  Таблица товаров, остатков и цен из системы МойСклад
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadStocks(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-60"
            >
              <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Обновление..." : "Обновить"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4">
              <div className="text-sm text-neutral-500 dark:text-white/60">
                Количество позиций
              </div>
              <div className="text-2xl font-bold mt-1">{fmtNumber(totalItems)}</div>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4">
              <div className="text-sm text-neutral-500 dark:text-white/60">
                Общий остаток
              </div>
              <div className="text-2xl font-bold mt-1">{fmtNumber(totalStock)}</div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-white/50"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, коду или externalCode..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/10 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin" />
              <p className="mt-4 text-neutral-600 dark:text-white/70">
                Загрузка остатков...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300 text-center font-medium">
              {error}
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <Package2 size={28} className="text-neutral-500 dark:text-white/60" />
              </div>
              <p className="mt-4 text-lg font-semibold">Ничего не найдено</p>
              <p className="text-neutral-600 dark:text-white/70 mt-1">
                Попробуй изменить запрос поиска
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-black/[0.03] dark:bg-white/[0.05]">
                  <tr className="text-left">
                    <th className="px-4 py-4 font-semibold">№</th>
                    <th className="px-4 py-4 font-semibold min-w-[280px]">Название</th>
                    <th className="px-4 py-4 font-semibold">Код</th>
                    <th className="px-4 py-4 font-semibold">Артикул</th>
                    <th className="px-4 py-4 font-semibold text-right">Остаток</th>
                    <th className="px-4 py-4 font-semibold text-right">Резерв</th>
                    <th className="px-4 py-4 font-semibold text-right">В пути</th>
                    <th className="px-4 py-4 font-semibold text-right">Себестоимость</th>
                    <th className="px-4 py-4 font-semibold text-right">Цена продажи</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStocks.map((item, index) => (
                    <tr
                      key={item.id || `${item.name}-${index}`}
                      className="border-t border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition"
                    >
                      <td className="px-4 py-4 text-neutral-500 dark:text-white/60">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold">{item.name || "-"}</div>
                        {item.folder?.name ? (
                          <div className="text-xs mt-1 text-neutral-500 dark:text-white/50">
                            Папка: {item.folder.name}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 text-neutral-700 dark:text-white/80">
                        {item.code || "-"}
                      </td>

                      <td className="px-4 py-4 text-neutral-700 dark:text-white/80">
                        {item.externalCode || "-"}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold">
                        {fmtNumber(item.stock)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {fmtNumber(item.reserve)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {fmtNumber(item.inTransit)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {fmtPrice(item.price)}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-primary-600 dark:text-primary-400">
                        {fmtPrice(item.salePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}