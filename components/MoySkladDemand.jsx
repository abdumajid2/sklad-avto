"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCcw, Truck, FileText } from "lucide-react";

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ru-RU");
}

function fmtMoney(value) {
  const num = Number(value ?? 0) / 100;
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function MoySkladDemand() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadDemand = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await fetch("/api/moysklad/demand", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка загрузки отгрузок");
      }

      setDemands(data.rows || []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Не удалось загрузить отгрузки");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDemand();
  }, []);

  const filteredDemand = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return demands;

    return demands.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const agent = String(item.agent?.name || "").toLowerCase();
      const store = String(item.store?.name || "").toLowerCase();
      return name.includes(q) || agent.includes(q) || store.includes(q);
    });
  }, [demands, search]);

  const totalDocs = filteredDemand.length;
  const totalSum = filteredDemand.reduce(
    (sum, item) => sum + Number(item.sum || 0),
    0
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 text-neutral-900 dark:text-white">
      <div className="rounded-3xl border border-black/10 bg-white/80 dark:bg-white/10 dark:border-white/15 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="border-b border-black/10 dark:border-white/10 p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-600/15 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Отгрузки из МойСклад
                </h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-white/70 mt-1">
                  Список документов расхода и отгрузки
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadDemand(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-60"
            >
              <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Обновление..." : "Обновить"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4">
              <div className="text-sm text-neutral-500 dark:text-white/60">
                Количество документов
              </div>
              <div className="text-2xl font-bold mt-1">{totalDocs}</div>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4">
              <div className="text-sm text-neutral-500 dark:text-white/60">
                Общая сумма
              </div>
              <div className="text-2xl font-bold mt-1">{fmtMoney(totalSum)}</div>
            </div>
          </div>

          <div className="mt-5 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-white/50"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру, контрагенту или складу..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/10 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin" />
              <p className="mt-4 text-neutral-600 dark:text-white/70">
                Загрузка отгрузок...
              </p>
            </div>
          ) : error ? (
            <div className="py-10 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300 text-center font-medium">
              {error}
            </div>
          ) : filteredDemand.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <FileText size={28} className="text-neutral-500 dark:text-white/60" />
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
                    <th className="px-4 py-4 font-semibold">Документ</th>
                    <th className="px-4 py-4 font-semibold">Дата</th>
                    <th className="px-4 py-4 font-semibold">Контрагент</th>
                    <th className="px-4 py-4 font-semibold">Склад</th>
                    <th className="px-4 py-4 font-semibold text-right">Сумма</th>
                    <th className="px-4 py-4 font-semibold text-center">Проведён</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDemand.map((item, index) => (
                    <tr
                      key={item.id || `${item.name}-${index}`}
                      className="border-t border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition"
                    >
                      <td className="px-4 py-4 text-neutral-500 dark:text-white/60">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {item.name || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {fmtDate(item.moment)}
                      </td>

                      <td className="px-4 py-4">
                        {item.agent?.name || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item.store?.name || "-"}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-primary-600 dark:text-primary-400">
                        {fmtMoney(item.sum)}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            item.applicable
                              ? "bg-green-500/15 text-green-600 dark:text-green-400"
                              : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {item.applicable ? "Да" : "Нет"}
                        </span>
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