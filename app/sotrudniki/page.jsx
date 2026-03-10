"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  useAddSotrudnikMutation,
  useGetSotrudnikiQuery,
  useDeleteSotrudnikMutation,
  useUpdateSotrudnikMutation,
} from "@/store/services/sotrudnikiApi";

function extFromName(name = "") {
  const parts = name.split(".");
  return (parts[parts.length - 1] || "jpg").toLowerCase();
}

async function uploadAvatar(file) {
  const ext = extFromName(file.name);
  const filePath = `sotrudniki/${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function SotrudnikiPage() {
  const { data = [], isLoading, error } = useGetSotrudnikiQuery();

  const [addSotrudnik, { isLoading: adding }] = useAddSotrudnikMutation();
  const [updateSotrudnik, { isLoading: updating }] =
    useUpdateSotrudnikMutation();
  const [deleteSotrudnik] = useDeleteSotrudnikMutation();

  const [form, setForm] = useState({ name: "", job: "", age: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    job: "",
    age: "",
    avatar: "",
  });

  const [saveStatus, setSaveStatus] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (editPreview) URL.revokeObjectURL(editPreview);
    };
  }, [preview, editPreview]);

  const save = async () => {
    if (!form.name.trim()) return alert("Введите имя");
    if (!form.job.trim()) return alert("Введите должность");

    try {
      let avatarUrl = null;

      if (file) {
        avatarUrl = await uploadAvatar(file);
      }

      await addSotrudnik({
        name: form.name.trim(),
        job: form.job.trim(),
        age: form.age || null,
        avatar: avatarUrl,
      }).unwrap();

      if (preview) URL.revokeObjectURL(preview);

      setForm({ name: "", job: "", age: "" });
      setFile(null);
      setPreview(null);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Ошибка добавления");
    }
  };

  async function remove(id) {
    if (confirm("Удалить сотрудника?")) {
      try {
        await deleteSotrudnik(id).unwrap();
      } catch (e) {
        console.error(e);
        alert(e?.message || "Ошибка удаления");
      }
    }
  }

  const openEdit = (sotrudnik) => {
    setEditingId(sotrudnik.id);
    setEditForm({
      name: sotrudnik.name || "",
      job: sotrudnik.job || "",
      age: sotrudnik.age || "",
      avatar: sotrudnik.avatar || "",
    });
    setEditFile(null);
    setEditPreview(null);
    setSaveStatus("");
  };

  const closeEdit = () => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditingId(null);
    setEditForm({ name: "", job: "", age: "", avatar: "" });
    setEditFile(null);
    setEditPreview(null);
    setSaveStatus("");
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) return alert("Введите имя");
    if (!editForm.job.trim()) return alert("Введите должность");

    try {
      let avatarUrl = editForm.avatar || null;

      if (editFile) {
        avatarUrl = await uploadAvatar(editFile);
      }

      await updateSotrudnik({
        id: editingId,
        name: editForm.name.trim(),
        job: editForm.job.trim(),
        age: editForm.age || null,
        avatar: avatarUrl,
      }).unwrap();

      setSaveStatus("success");
      setTimeout(() => {
        closeEdit();
      }, 1000);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Ошибка сохранения");
    }
  };

  return (
    <div className="p-4 text-white">
      <Link href="/products" className="inline-block mb-4 hover:underline">
        Назад к товарам
      </Link>

      <h1 className="text-3xl font-bold mb-4">Сотрудники</h1>

      <div className="grid gap-2 max-w-md mb-6">
        <input
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/20"
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />

        <input
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/20"
          placeholder="Должность"
          value={form.job}
          onChange={(e) => setForm((p) => ({ ...p, job: e.target.value }))}
        />

        <input
          type="date"
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/20"
          value={form.age}
          onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
        />

        <input
          type="file"
          accept="image/*"
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/20"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;

            if (preview) URL.revokeObjectURL(preview);

            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />

        {preview ? (
          <div className="flex items-center gap-3 mt-1">
            <img
              src={preview}
              alt="preview"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="text-sm opacity-80 truncate">{file?.name}</div>
            <button
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview);
                setFile(null);
                setPreview(null);
              }}
              className="text-sm opacity-80 hover:opacity-100"
            >
              Удалить
            </button>
          </div>
        ) : null}

        <button
          onClick={save}
          disabled={adding}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold"
        >
          {adding ? "..." : "Добавить"}
        </button>
      </div>

      {isLoading ? (
        <div className="opacity-70">Загрузка...</div>
      ) : error ? (
        <div className="text-red-400">Ошибка загрузки</div>
      ) : (
        <div className="grid gap-3">
          {data.map((s) => (
            <div
              key={s.id}
              className="p-4 flex items-center justify-between rounded-2xl bg-white/10 border border-white/20"
            >
              <div className="flex items-center gap-6">
                {s.avatar && typeof s.avatar === "string" ? (
                  <Image
                    src={s.avatar}
                    alt={s.name || "avatar"}
                    width={74}
                    height={74}
                    unoptimized
                    className="rounded-full object-cover w-[74px] h-[74px]"
                  />
                ) : (
                  <div className="w-[74px] h-[74px] rounded-full bg-gray-600 flex items-center justify-center text-white text-xl font-semibold">
                    {s.name?.[0] || "?"}
                  </div>
                )}

                <div>
                  <div className="font-semibold text-2xl">{s.name}</div>
                  <div className="text-sm opacity-80">
                    Должность: {s.job || "-"}
                  </div>
                  <div className="text-sm opacity-80">
                    ДР: {s.age ? new Date(s.age).toLocaleDateString() : "-"}
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => openEdit(s)}
                  className="px-4 py-2 rounded-xl bg-white/20 text-sm opacity-80 hover:bg-white/60 transition hover:text-black"
                >
                  Редактировать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Редактировать сотрудника
            </h2>

            {saveStatus === "success" && (
              <div className="mb-4 p-3 rounded-xl bg-green-600/20 border border-green-600 text-green-400 text-sm flex items-center gap-2 animate-pulse">
                <span>✓</span> Сохранено успешно!
              </div>
            )}

            <div className="grid gap-3 mb-4">
              <input
                type="text"
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                placeholder="Имя"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />

              <input
                type="text"
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                placeholder="Должность"
                value={editForm.job}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, job: e.target.value }))
                }
              />

              <input
                type="date"
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                value={editForm.age}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, age: e.target.value }))
                }
              />

              <input
                type="file"
                accept="image/*"
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;

                  if (editPreview) URL.revokeObjectURL(editPreview);

                  setEditFile(f);
                  setEditPreview(f ? URL.createObjectURL(f) : null);
                }}
              />

              {editPreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={editPreview}
                    alt="edit preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-sm opacity-80 truncate">
                    {editFile?.name}
                  </div>
                </div>
              ) : editForm.avatar ? (
                <Image
                  src={editForm.avatar}
                  alt="current avatar"
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : null}

              <button
                onClick={() => {
                  remove(editingId);
                  closeEdit();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Удалить сотрудника
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeEdit}
                className="flex-1 px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={updating || saveStatus === "success"}
                className="flex-1 px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-50"
              >
                {updating ? "Сохранение..." : saveStatus === "success" ? "✓ Сохранено" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}