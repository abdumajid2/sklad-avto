"use client";

import { useMemo, useState } from "react";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../store/services/productsApi";
import { useGetLogsByGoodQuery, useAddLogMutation } from "../../store/services/userApi";

import {
  CirclePlus,
  CircleUser,
  EllipsisVertical,
  FileText,
  MessageCircle,
  Mic,
  OctagonMinus,
  PencilLine,
  Send,
  Trash2,
  PackagePlus,
  PackageMinus,
  LogOut,
} from "lucide-react";

// ---------- helpers ----------
function toNumberQty(v) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function toQtyString(n) {
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toFixed(2);
}

// ---------- telegram message helpers ----------
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const makeIssueMessage = ({ product, qty, toPerson, fromPerson, comment }) => {
  const dt = new Date().toLocaleString();
  return (
    `📤 <b>ОТГРУЗКА (расход)</b>\n` +
    `🕒 <i>${esc(dt)}</i>\n\n` +
    `📦 Товар: <b>${esc(product?.name)}</b>\n` +
    `🔖 Код: <b>${esc(product?.code)}</b>\n` +
    `📍 Место: <b>Зона ${esc(product?.zona)} / Ряд ${esc(product?.ryad)} / Поз ${esc(
      product?.pozisiya
    )}</b>\n` +
    `➖ Кол-во: <b>${esc(qty)}</b>\n` +
    `👤 Брал: <b>${esc(toPerson)}</b>\n` +
    (fromPerson?.trim() ? `🧑‍💼 Выдал: <b>${esc(fromPerson)}</b>\n` : "") +
    (comment?.trim() ? `💬 Коммент: <i>${esc(comment)}</i>\n` : "") +
    `\n✅ Записано в журнал`
  );
};

const makeReturnMessage = ({ product, qty, fromPerson, toPerson, comment }) => {
  const dt = new Date().toLocaleString();
  return (
    `📥 <b>ПРИХОД</b>\n` +
    `🕒 <i>${esc(dt)}</i>\n\n` +
    `📦 Товар: <b>${esc(product?.name)}</b>\n` +
    `🔖 Код: <b>${esc(product?.code)}</b>\n` +
    `📍 Место: <b>Зона ${esc(product?.zona)} / Ряд ${esc(product?.ryad)} / Поз ${esc(
      product?.pozisiya
    )}</b>\n` +
    `➕ Кол-во: <b>${esc(qty)}</b>\n` +
    (fromPerson?.trim() ? `👤 Принял: <b>${esc(fromPerson)}</b>\n` : "") +
    (toPerson?.trim() ? `📦 От: <b>${esc(toPerson)}</b>\n` : "") +
    (comment?.trim() ? `💬 Коммент: <i>${esc(comment)}</i>\n` : "") +
    `\n✅ Записано в журнал`
  );
};

// ---------- ui helpers ----------
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border transition ${
        active
          ? "bg-white text-black border-white"
          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-80">{label}</span>
      {children}
    </label>
  );
}

export default function ProductsPage() {
  const { data = [], isLoading, isError } = useGetProductsQuery();

  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // search + filters
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [zona, setZona] = useState("ALL");

  // add/edit product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [active, setActive] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    zona: "",
    ryad: "",
    pozisiya: "",
    quant: "0.00",
  });

  // actions modal (⋮)
  const [actionModal, setActionModal] = useState(false);
  const [actionProduct, setActionProduct] = useState(null);
  const [tab, setTab] = useState("history"); // history | issue | return
  const [logForm, setLogForm] = useState({
    fromPerson: "", // кто выдал / кто принял
    toPerson: "",   // кто брал / от кого пришло
    qty: "1",
    comment: "",
  });

  const busy = isAdding || isUpdating || isDeleting;

  // logs for selected product
  const { data: logs = [], isLoading: logsLoading } = useGetLogsByGoodQuery(actionProduct?.id, {
    skip: !actionProduct,
  });
  const [addLog, { isLoading: logSaving }] = useAddLogMutation();

  // zones list
  const zones = useMemo(() => {
    const set = new Set(data.map((p) => String(p.zona || "").trim()).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  // filter + search
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data
      .filter((p) => (zona === "ALL" ? true : String(p.zona ?? "") === zona))
      .filter((p) => {
        if (!s) return true;
        return (
          String(p.code || "").toLowerCase().includes(s) ||
          String(p.name || "").toLowerCase().includes(s)
        );
      });
  }, [data, q, zona]);

  const logOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // telegram notify
  const tgNotify = async (text, chatId) => {
    try {
      await fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, chatId }),
      });
    } catch (e) {
      console.error("tgNotify error:", e);
    }
  };

  // ---------- product CRUD ----------
  const openAdd = () => {
    setMode("add");
    setActive(null);
    setForm({
      name: "",
      code: "",
      zona: "",
      ryad: "",
      pozisiya: "",
      quant: "0.00",
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setMode("edit");
    setActive(p);
    setForm({
      name: p.name ?? "",
      code: p.code ?? "",
      zona: p.zona ?? "",
      ryad: p.ryad ?? "",
      pozisiya: p.pozisiya ?? "",
      quant: String(p.quant ?? "0.00"),
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) return alert("Введите name");
    if (!form.code.trim()) return alert("Введите code");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      zona: String(form.zona ?? "").trim(),
      ryad: String(form.ryad ?? "").trim(),
      pozisiya: String(form.pozisiya ?? "").trim(),
      quant: Number(String(form.quant ?? "0").replace(",", ".") || 0).toFixed(2),
    };

    try {
      if (mode === "add") {
        await addProduct(payload).unwrap();
      } else {
        await updateProduct({ id: active.id, ...payload }).unwrap();
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert(e?.data || e?.error || "Ошибка сохранения");
    }
  };

  const remove = async (p) => {
    const ok = confirm(`Удалить товар: ${p.name}?`);
    if (!ok) return;
    try {
      await deleteProduct(p.id).unwrap();
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    }
  };

  const changeQty = async (p, delta) => {
    const current = toNumberQty(p.quant);
    const next = Math.max(0, current + delta);
    try {
      await updateProduct({ id: p.id, quant: toQtyString(next) }).unwrap();
    } catch (e) {
      console.error(e);
      alert("Не удалось обновить количество");
    }
  };

  // ---------- voice search ----------
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Голосовой поиск не поддерживается (нужен Chrome).");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    setListening(true);
    rec.start();

    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      setQ(text);
    };

    rec.onerror = (e) => {
      console.error(e);
      alert("Ошибка микрофона");
    };

    rec.onend = () => setListening(false);
  };

  // ---------- actions modal (⋮) ----------
  const openActionsModal = (p) => {
    setActionProduct(p);
    setTab("history");
    setLogForm({ fromPerson: "", toPerson: "", qty: "1", comment: "" });
    setActionModal(true);
  };

  const closeActionsModal = () => {
    setActionModal(false);
    setActionProduct(null);
  };

  // ---------- ISSUE (выдача) ----------
  const issue = async () => {
    if (!actionProduct) return;

    const qty = Number(String(logForm.qty).replace(",", ".")) || 0;
    if (!qty) return alert("Введи количество");
    if (!logForm.toPerson.trim()) return alert("Напиши кто брал товар");

    const current = toNumberQty(actionProduct.quant);
    if (qty > current) return alert(`На складе только ${current}`);

    try {
      // 1) log
      await addLog({
        goodId: String(actionProduct.id),
        data: new Date().toISOString(),
        qty: String(qty),
        comment: logForm.comment || "",
        fromPerson: (logForm.fromPerson || "").trim(),
        toPerson: logForm.toPerson.trim(),
        userName: logForm.toPerson.trim(),
        userJob: "ISSUE",
      }).unwrap();

      // 2) update product
      const next = Math.max(0, current - qty);
      await updateProduct({ id: actionProduct.id, quant: toQtyString(next) }).unwrap();

      // 3) telegram
      const msg = makeIssueMessage({
        product: actionProduct,
        qty,
        toPerson: logForm.toPerson,
        fromPerson: logForm.fromPerson,
        comment: logForm.comment,
      });
      await tgNotify(msg);

      setTab("history");
    } catch (e) {
      console.error(e);
      alert(e?.data || e?.error || "Ошибка выдачи");
    }
  };

  // ---------- RETURN (приход) ----------
  const receive = async () => {
    if (!actionProduct) return;

    const qty = Number(String(logForm.qty).replace(",", ".")) || 0;
    if (!qty) return alert("Введи количество");
    if (!logForm.fromPerson.trim()) return alert("Напиши кто принял приход");

    try {
      // 1) log
      await addLog({
        goodId: String(actionProduct.id),
        data: new Date().toISOString(),
        qty: String(qty),
        comment: logForm.comment || "",
        fromPerson: logForm.fromPerson.trim(), // кто принял
        toPerson: (logForm.toPerson || "").trim(), // от кого (можно пусто)
        userName: logForm.fromPerson.trim(),
        userJob: "RETURN",
      }).unwrap();

      // 2) update product (+qty)
      const current = toNumberQty(actionProduct.quant);
      const next = current + qty;
      await updateProduct({ id: actionProduct.id, quant: toQtyString(next) }).unwrap();

      // 3) telegram
      const msg = makeReturnMessage({
        product: actionProduct,
        qty,
        fromPerson: logForm.fromPerson,
        toPerson: logForm.toPerson,
        comment: logForm.comment,
      });
      await tgNotify(msg);

      setTab("history");
    } catch (e) {
      console.error(e);
      alert(e?.data || e?.error || "Ошибка прихода");
    }
  };

  // ---------- render ----------
  if (isLoading) return <div className="p-6 text-white">Загрузка...</div>;
  if (isError) return <div className="p-6 text-white">Ошибка загрузки</div>;

  return (
    <div className="text-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по коду или имени..."
            className="w-full md:w-[250px] px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none placeholder:text-white/60"
          />

          <button
            onClick={startVoice}
            className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            title="Голосовой поиск"
            disabled={listening}
          >
            <Mic className={listening ? "animate-pulse" : ""} />
          </button>

          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="ml-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none text-white"
          >
            {zones.map((z) => (
              <option key={z} value={z} className="bg-gray-900 text-white">
                {z === "ALL" ? "Все зоны" : `Зона ${z}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          {busy && <span className="text-sm opacity-70"> Сохраняю...</span>}

          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
          >
            + Добавить
          </button>

          <button
            onClick={logOut}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
          >
            <LogOut/>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <div className="font-semibold truncate">{p.name}</div>

              <div className="text-sm opacity-80 flex flex-wrap gap-4 items-center">
                <p>
                  Code: <span className="font-bold">{p.code}</span>
                </p>
                <p>
                  Zona: <span className="font-bold">{p.zona}</span>
                </p>
                <p>
                  Ryad: <span className="font-bold">{p.ryad}</span>
                </p>
                <p>
                  Poz: <span className="font-bold">{p.pozisiya}</span>
                </p>
                <p>
                  Кол-во: <span className="font-bold">{p.quant}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              

              

              <button
                onClick={() => openEdit(p)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
                title="Редактировать"
              >
                <PencilLine />
              </button>

              <button
                onClick={() => remove(p)}
                className="px-3 py-2 rounded-xl bg-red-500/30 border border-red-400/30 hover:bg-red-500/40"
                title="Удалить"
              >
                <Trash2 />
              </button>

              <button
                onClick={() => openActionsModal(p)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
                title="История / Выдать / Приход"
              >
                <EllipsisVertical />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-[520px] rounded-2xl bg-gray-900/70 border border-white/20 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {mode === "add" ? "Добавить товар" : "Редактировать товар"}
              </h2>
              <button
                onClick={closeModal}
                className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                />
              </Field>

              <Field label="Code">
                <input
                  value={form.code}
                  onChange={(e) => onChange("code", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Zona">
                  <input
                    value={form.zona}
                    onChange={(e) => onChange("zona", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                    placeholder="A / B / C / D"
                  />
                </Field>

                <Field label="Ryad">
                  <input
                    value={form.ryad}
                    onChange={(e) => onChange("ryad", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                    placeholder="1..9"
                  />
                </Field>
              </div>

              <Field label="Pozisiya">
                <input
                  value={form.pozisiya}
                  onChange={(e) => onChange("pozisiya", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                  placeholder="1..4"
                />
              </Field>

              <Field label="Quant (количество)">
                <input
                  value={form.quant}
                  onChange={(e) => onChange("quant", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                  inputMode="decimal"
                />
              </Field>
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
                disabled={busy}
              >
                Отмена
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200"
                disabled={busy}
              >
                {busy ? "..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal (⋮) */}
      {actionModal && actionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeActionsModal} />
          <div className="relative w-full max-w-[720px] rounded-2xl bg-gray-900/70 border border-white/20 backdrop-blur-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-semibold">{actionProduct.name}</div>
                <div className="text-sm opacity-80">
                  code: <b>{actionProduct.code}</b> • остаток: <b>{actionProduct.quant}</b>
                </div>
              </div>

              <button
                onClick={closeActionsModal}
                className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
                История
              </TabBtn>

              <TabBtn active={tab === "issue"} onClick={() => setTab("issue")}>
                Выдать
              </TabBtn>

              <TabBtn active={tab === "return"} onClick={() => setTab("return")}>
                Приход
              </TabBtn>
            </div>

            {tab === "history" ? (
              <div className="max-h-[360px] overflow-auto space-y-2">
                {logsLoading ? (
                  <div className="opacity-70">Загрузка...</div>
                ) : logs.length === 0 ? (
                  <div className="opacity-70">История пустая</div>
                ) : (
                  logs.map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-white/10 border border-white/20">
                      <div className="flex justify-between gap-3">
                        <div className="font-semibold flex items-center gap-2">
                          {l.userJob === "ISSUE" ? (
                            <>
                              <Send size={24} className="text-white/80" />
                              <span className="text-red-500">Выдача</span>
                            </>
                          ) : l.userJob === "RETURN" ? (
                            <>
                              <PackagePlus size={24} className="text-white/80" />
                              <span className="text-green-500">Приход</span>
                            </>
                          ) : (
                            <>
                              <FileText size={28} className="text-white/80" />
                              <span>Запись</span>
                            </>
                          )}
                        </div>

                        <div className="text-sm opacity-70">
                          {l.data ? new Date(l.data).toLocaleString() : ""}
                        </div>
                      </div>

                      <div className="mt-1 text-sm opacity-90">
                        Кол-во: <b>{l.qty}</b>
                      </div>

                      <div className="text-sm flex gap-2 items-center opacity-90 mt-1">
                        <CircleUser />

                        {l.userJob === "RETURN" ? (
                          <>
                            Принял: <b>{l.fromPerson || "-"}</b>
                            {l.toPerson ? (
                              <>
                                {" "}
                                • От: <b>{l.toPerson}</b>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <>
                            Брал: <b>{l.toPerson || "-"}</b>
                            {l.fromPerson ? (
                              <>
                                {" "}
                                • Выдал: <b>{l.fromPerson}</b>
                              </>
                            ) : null}
                          </>
                        )}
                      </div>

                      {l.comment ? (
                        <div className="text-sm opacity-85 mt-2">
                          <div className="border border-white/15 bg-white/5 rounded-xl p-3 flex gap-2 items-start">
                            <MessageCircle className="mt-0.5" size={18} />
                            <div className="leading-snug">{l.comment}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : tab === "issue" ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Кто выдал (не обязательно)">
                    <input
                      value={logForm.fromPerson}
                      onChange={(e) => setLogForm((p) => ({ ...p, fromPerson: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Напр: Маджид"
                    />
                  </Field>

                  <Field label="Кто брал (обязательно)">
                    <input
                      value={logForm.toPerson}
                      onChange={(e) => setLogForm((p) => ({ ...p, toPerson: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Напр: Али"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Сколько (qty)">
                    <input
                      value={logForm.qty}
                      onChange={(e) => setLogForm((p) => ({ ...p, qty: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      inputMode="decimal"
                    />
                  </Field>

                  <Field label="Комментарий">
                    <input
                      value={logForm.comment}
                      onChange={(e) => setLogForm((p) => ({ ...p, comment: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Напр: для объекта №12"
                    />
                  </Field>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    disabled={logSaving}
                    onClick={issue}
                    className="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Send size={18} />
                    {logSaving ? "..." : "Выдать"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Кто принял (обязательно)">
                    <input
                      value={logForm.fromPerson}
                      onChange={(e) => setLogForm((p) => ({ ...p, fromPerson: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Напр: Маджид"
                    />
                  </Field>

                  <Field label="От кого (не обязательно)">
                    <input
                      value={logForm.toPerson}
                      onChange={(e) => setLogForm((p) => ({ ...p, toPerson: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Поставщик / водитель"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Сколько (qty)">
                    <input
                      value={logForm.qty}
                      onChange={(e) => setLogForm((p) => ({ ...p, qty: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      inputMode="decimal"
                    />
                  </Field>

                  <Field label="Комментарий">
                    <input
                      value={logForm.comment}
                      onChange={(e) => setLogForm((p) => ({ ...p, comment: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none"
                      placeholder="Напр: накладная №..."
                    />
                  </Field>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    disabled={logSaving}
                    onClick={receive}
                    className="px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 flex items-center gap-2"
                  >
                    <CirclePlus size={18} />
                    {logSaving ? "..." : "Приход"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}