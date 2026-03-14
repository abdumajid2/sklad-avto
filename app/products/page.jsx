"use client";

import { useMemo, useState } from "react";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../store/services/productsApi";
import {
  useGetLogsByGoodQuery,
  useAddLogMutation,
} from "../../store/services/userApi";

import {
  CircleUser,
  EllipsisVertical,
  FileText,
  MessageCircle,
  Mic,
  PencilLine,
  Send,
  Trash2,
  PackagePlus,
  LogOut,
  CirclePlus,
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
    `📍 Место: <b>Зона ${esc(product?.zona)} / Ряд ${esc(
      product?.ryad,
    )} / Поз ${esc(product?.pozisiya)}</b>\n` +
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
    `📍 Место: <b>Зона ${esc(product?.zona)} / Ряд ${esc(
      product?.ryad,
    )} / Поз ${esc(product?.pozisiya)}</b>\n` +
    `➕ Кол-во: <b>${esc(qty)}</b>\n` +
    (fromPerson?.trim() ? `👤 Принял: <b>${esc(fromPerson)}</b>\n` : "") +
    (toPerson?.trim() ? `📦 От: <b>${esc(toPerson)}</b>\n` : "") +
    (comment?.trim() ? `💬 Коммент: <i>${esc(comment)}</i>\n` : "") +
    `\n✅ Записано в журнал`
  );
};

// ---------- UI small components ----------
function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
        active
          ? "bg-primary-600 text-white shadow-md"
          : "bg-white border border-black/10 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
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
    fromPerson: "",
    toPerson: "",
    qty: "1",
    comment: "",
  });

  const busy = isAdding || isUpdating || isDeleting;

  const { data: logs = [], isLoading: logsLoading } = useGetLogsByGoodQuery(
    actionProduct?.id,
    {
      skip: !actionProduct,
    },
  );
  const [addLog, { isLoading: logSaving }] = useAddLogMutation();

  // ---------- reusable theme classes ----------
  const pageText = "text-neutral-900 dark:text-white";
  const panelClass =
    "border transition-colors bg-white/90 border-black/10 text-neutral-900 dark:bg-white/10 dark:border-white/20 dark:text-white";
  const inputClass =
    "w-full px-3 py-2 rounded-xl outline-none transition-colors bg-white border border-black/10 text-neutral-900 placeholder:text-neutral-500 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-white/60";
  const ghostBtnClass =
    "px-3 py-2 rounded-xl border transition bg-white border-black/10 hover:bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20 dark:text-white";
  const modalClass =
    "relative w-full backdrop-blur-xl border bg-white/95 border-black/10 text-neutral-900 dark:bg-gray-900/70 dark:border-white/20 dark:text-white";
  const stickyHeadClass =
    "sticky top-0 backdrop-blur border-b py-3 -mx-5 px-5 bg-white/80 border-black/10 dark:bg-gray-900/40 dark:border-white/10";

  // zones list
  const zones = useMemo(() => {
    const set = new Set(
      data.map((p) => String(p.zona || "").trim()).filter(Boolean),
    );
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
          String(p.code || "")
            .toLowerCase()
            .includes(s) ||
          String(p.name || "")
            .toLowerCase()
            .includes(s)
        );
      });
  }, [data, q, zona]);

  const logOut = async () => {
  try {
    localStorage.removeItem("session");

    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.replace("/login");
  } catch (e) {
    console.error("Logout error:", e);
    localStorage.removeItem("session");
    window.location.replace("/login");
  }
};

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

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) return alert("Введите name");
    if (!form.code.trim()) return alert("Введите code");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      zona: String(form.zona ?? "").trim(),
      ryad: String(form.ryad ?? "").trim(),
      pozisiya: String(form.pozisiya ?? "").trim(),
      quant: Number(String(form.quant ?? "0").replace(",", ".") || 0).toFixed(
        2,
      ),
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

  // ---------- voice search ----------
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

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

  // ---------- actions modal ----------
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

  // ---------- ISSUE ----------
  const issue = async () => {
    if (!actionProduct) return;

    const qty = Number(String(logForm.qty).replace(",", ".")) || 0;
    if (!qty) return alert("Введи количество");
    if (!logForm.toPerson.trim()) return alert("Напиши кто брал товар");

    const current = toNumberQty(actionProduct.quant);
    if (qty > current) return alert(`На складе только ${current}`);

    try {
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

      const next = Math.max(0, current - qty);
      await updateProduct({
        id: actionProduct.id,
        quant: toQtyString(next),
      }).unwrap();

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

  // ---------- RETURN ----------
  const receive = async () => {
    if (!actionProduct) return;

    const qty = Number(String(logForm.qty).replace(",", ".")) || 0;
    if (!qty) return alert("Введи количество");
    if (!logForm.fromPerson.trim()) return alert("Напиши кто принял приход");

    try {
      await addLog({
        goodId: String(actionProduct.id),
        data: new Date().toISOString(),
        qty: String(qty),
        comment: logForm.comment || "",
        fromPerson: logForm.fromPerson.trim(),
        toPerson: (logForm.toPerson || "").trim(),
        userName: logForm.fromPerson.trim(),
        userJob: "RETURN",
      }).unwrap();

      const current = toNumberQty(actionProduct.quant);
      const next = current + qty;
      await updateProduct({
        id: actionProduct.id,
        quant: toQtyString(next),
      }).unwrap();

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

  if (isLoading) {
    return <div className={`p-6 ${pageText}`}>Загрузка...</div>;
  }

  if (isError) {
    return <div className={`p-6 ${pageText}`}>Ошибка загрузки</div>;
  }

  return (
    <div className={`px-4 pb-24 md:pb-6 transition-colors ${pageText}`}>
      {/* Sticky Toolbar */}
      <div
        className="sticky top-0 z-40 rounded-xl backdrop-blur-2xl px-4 py-3 mb-4 md:max-w-800 mx-auto border
        bg-white/80 border-black/10
        dark:bg-black/70 dark:border-white/10"
      >
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center w-full md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по коду или имени..."
              className={inputClass}
            />

            <button
              type="button"
              onClick={startVoice}
              className={ghostBtnClass}
              title="Голосовой поиск"
              disabled={listening}
            >
              <Mic className={listening ? "animate-pulse" : ""} />
            </button>

            <select
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className={`${inputClass} ml-0 md:ml-2 w-full md:w-auto`}
            >
              {zones.map((z) => (
                <option
                  key={z}
                  value={z}
                  className="bg-white text-neutral-900 dark:bg-gray-900 dark:text-white"
                >
                  {z === "ALL" ? "Все зоны" : `Зона ${z}`}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex gap-2 items-center">
            {busy && (
              <span className="text-sm text-neutral-600 dark:text-white/70">
                Сохраняю...
              </span>
            )}

            <button
              type="button"
              onClick={openAdd}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
            >
              + Добавить
            </button>

            <button type="button" onClick={logOut} className={ghostBtnClass}>
              <span className="flex items-center gap-2">
                <LogOut size={18} />
                Выйти
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-6 items-center justify-center p-5 m-5">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-2xl w-90 md:w-screen flex flex-col justify-center md:flex-row md:items-center md:justify-between gap-3 ${panelClass}`}
          >
            <div className="min-w-0">
              <div className="font-semibold truncate text-base md:text-lg">
                {p.name}
              </div>

              {/* Mobile compact info */}
              <div className="mt-2 md:hidden grid grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-white/90">
                <div>
                  Code:{" "}
                  <b className="text-neutral-900 dark:text-white">{p.code}</b>
                </div>
                <div>
                  Кол-во:{" "}
                  <b className="text-neutral-900 dark:text-white">{p.quant}</b>
                </div>
                <div>
                  Zona:{" "}
                  <b className="text-neutral-900 dark:text-white">{p.zona}</b>
                </div>
                <div>
                  {p.ryad}/{p.pozisiya}
                </div>
              </div>

              {/* Desktop info */}
              <div className="hidden md:flex text-sm flex-wrap gap-4 items-center mt-2 text-neutral-600 dark:text-white/80">
                <p>
                  Code:{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {p.code}
                  </span>
                </p>
                <p>
                  Zona:{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {p.zona}
                  </span>
                </p>
                <p>
                  Ryad:{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {p.ryad}
                  </span>
                </p>
                <p>
                  Poz:{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {p.pozisiya}
                  </span>
                </p>
                <p>
                  Кол-во:{" "}
                  <span className="font-bold text-2xl text-neutral-900 dark:text-white">
                    {p.quant}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => openEdit(p)}
                className={ghostBtnClass}
                title="Редактировать"
              >
                <PencilLine />
              </button>

              <button
                type="button"
                onClick={() => remove(p)}
                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 hover:bg-red-500/15 dark:bg-red-500/30 dark:border-red-400/30 dark:text-red-200 dark:hover:bg-red-500/40"
                title="Удалить"
              >
                <Trash2 />
              </button>

              <button
                type="button"
                onClick={() => openActionsModal(p)}
                className={ghostBtnClass}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div
            className={`${modalClass} max-w-[520px] md:rounded-2xl rounded-none md:h-auto h-[100dvh] md:max-h-[90vh] overflow-auto p-5`}
          >
            <div
              className={`flex items-center justify-between mb-4 ${stickyHeadClass}`}
            >
              <h2 className="text-lg font-semibold">
                {mode === "add" ? "Добавить товар" : "Редактировать товар"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className={ghostBtnClass}
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Code">
                <input
                  value={form.code}
                  onChange={(e) => onChange("code", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Zona">
                  <input
                    value={form.zona}
                    onChange={(e) => onChange("zona", e.target.value)}
                    className={inputClass}
                    placeholder="A / B / C / D"
                  />
                </Field>

                <Field label="Ryad">
                  <input
                    value={form.ryad}
                    onChange={(e) => onChange("ryad", e.target.value)}
                    className={inputClass}
                    placeholder="1..9"
                  />
                </Field>
              </div>

              <Field label="Pozisiya">
                <input
                  value={form.pozisiya}
                  onChange={(e) => onChange("pozisiya", e.target.value)}
                  className={inputClass}
                  placeholder="1..4"
                />
              </Field>

              <Field label="Quant (количество)">
                <input
                  value={form.quant}
                  onChange={(e) => onChange("quant", e.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                />
              </Field>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                onClick={closeModal}
                className={ghostBtnClass}
                disabled={busy}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={save}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold"
                disabled={busy}
              >
                {busy ? "..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {actionModal && actionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeActionsModal}
          />
          <div
            className={`${modalClass} max-w-[720px] md:rounded-2xl rounded-none md:h-auto h-[100dvh] md:max-h-[90vh] overflow-auto p-5`}
          >
            <div
              className={`flex items-start md:items-center justify-between mb-3 ${stickyHeadClass}`}
            >
              <div className="min-w-0">
                <div className="text-lg font-semibold truncate">
                  {actionProduct.name}
                </div>
                <div className="text-sm text-neutral-600 dark:text-white/80">
                  code:{" "}
                  <b className="text-neutral-900 dark:text-white">
                    {actionProduct.code}
                  </b>{" "}
                  • остаток:{" "}
                  <b className="text-neutral-900 dark:text-white">
                    {actionProduct.quant}
                  </b>
                </div>
              </div>

              <button
                type="button"
                onClick={closeActionsModal}
                className={ghostBtnClass}
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <TabBtn
                active={tab === "history"}
                onClick={() => setTab("history")}
              >
                История
              </TabBtn>

              <TabBtn active={tab === "issue"} onClick={() => setTab("issue")}>
                Выдать
              </TabBtn>

              <TabBtn
                active={tab === "return"}
                onClick={() => setTab("return")}
              >
                Приход
              </TabBtn>
            </div>

            {tab === "history" ? (
              <div className="max-h-[70dvh] md:max-h-[360px] overflow-auto space-y-2">
                {logsLoading ? (
                  <div className="text-neutral-600 dark:text-white/70">
                    Загрузка...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-neutral-600 dark:text-white/70">
                    История пустая
                  </div>
                ) : (
                  logs.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-xl border bg-white/80 border-black/10 dark:bg-white/10 dark:border-white/20"
                    >
                      <div className="flex justify-between gap-3">
                        <div className="font-semibold flex items-center gap-2">
                          {l.userJob === "ISSUE" ? (
                            <>
                              <Send
                                size={22}
                                className="text-neutral-500 dark:text-white/80"
                              />
                              <span className="text-red-500 dark:text-red-400">
                                Выдача
                              </span>
                            </>
                          ) : l.userJob === "RETURN" ? (
                            <>
                              <PackagePlus
                                size={22}
                                className="text-neutral-500 dark:text-white/80"
                              />
                              <span className="text-green-600 dark:text-green-400">
                                Приход
                              </span>
                            </>
                          ) : (
                            <>
                              <FileText
                                size={22}
                                className="text-neutral-500 dark:text-white/80"
                              />
                              <span>Запись</span>
                            </>
                          )}
                        </div>

                        <div className="text-sm text-neutral-500 dark:text-white/70">
                          {l.data ? new Date(l.data).toLocaleString() : ""}
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-neutral-700 dark:text-white/90">
                        Кол-во: <b>{l.qty}</b>
                      </div>

                      <div className="text-sm flex gap-2 items-center text-neutral-700 dark:text-white/90 mt-1">
                        <CircleUser size={18} />

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
                        <div className="text-sm mt-2">
                          <div className="border rounded-xl p-3 flex gap-2 items-start bg-white border-black/10 text-neutral-800 dark:border-white/15 dark:bg-white/5 dark:text-white/85">
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
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          fromPerson: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Напр: Маджид"
                    />
                  </Field>

                  <Field label="Кто брал (обязательно)">
                    <input
                      value={logForm.toPerson}
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          toPerson: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Напр: Али"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Сколько (qty)">
                    <input
                      value={logForm.qty}
                      onChange={(e) =>
                        setLogForm((p) => ({ ...p, qty: e.target.value }))
                      }
                      className={inputClass}
                      inputMode="decimal"
                    />
                  </Field>

                  <Field label="Комментарий">
                    <input
                      value={logForm.comment}
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          comment: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Напр: для объекта №12"
                    />
                  </Field>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    disabled={logSaving}
                    onClick={issue}
                    className="px-4 py-3 md:py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2 font-semibold w-full md:w-auto"
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
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          fromPerson: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Напр: Маджид"
                    />
                  </Field>

                  <Field label="От кого (не обязательно)">
                    <input
                      value={logForm.toPerson}
                      onChange={(e) =>
                        setLogForm((p) => ({ ...p, toPerson: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="Поставщик / водитель"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Сколько (qty)">
                    <input
                      value={logForm.qty}
                      onChange={(e) =>
                        setLogForm((p) => ({ ...p, qty: e.target.value }))
                      }
                      className={inputClass}
                      inputMode="decimal"
                    />
                  </Field>

                  <Field label="Комментарий">
                    <input
                      value={logForm.comment}
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          comment: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Напр: накладная №..."
                    />
                  </Field>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    disabled={logSaving}
                    onClick={receive}
                    className="px-4 py-3 md:py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2 font-semibold w-full md:w-auto"
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

      {/* Bottom bar mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-xl border-t px-4 py-3
        bg-white/90 border-black/10
        dark:bg-black/70 dark:border-white/10"
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="py-3 rounded-xl bg-primary-600 text-white font-semibold"
          >
            + Товар
          </button>

          <button
            type="button"
            onClick={startVoice}
            disabled={listening}
            className={ghostBtnClass}
          >
            <div className="flex items-center justify-center gap-2">
              <Mic className={listening ? "animate-pulse" : ""} />
              Голос
            </div>
          </button>

          <button type="button" onClick={logOut} className={ghostBtnClass}>
            <div className="flex items-center justify-center gap-2">
              <LogOut size={18} />
              Выйти
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
