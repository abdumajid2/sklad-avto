"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  useAddSotrudnikMutation,
  useGetSotrudnikiQuery,
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

  const [form, setForm] = useState({ name: "", job: "", age: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const save = async () => {
    if (!form.name.trim()) return alert("Введите имя");
    if (!form.job.trim()) return alert("Введите должность");

    try {
      let avatarUrl = null;

      // если выбрали файл — грузим в Supabase Storage
      if (file) {
        avatarUrl = await uploadAvatar(file);
      }

      await addSotrudnik({
        name: form.name.trim(),
        job: form.job.trim(),
        age: form.age || null, // "YYYY-MM-DD"
        avatar: avatarUrl, // ссылка на фото из Storage
      }).unwrap();

      setForm({ name: "", job: "", age: "" });
      setFile(null);
      setPreview("");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Ошибка добавления");
    }
  };

  return (
    <div className="p-4 text-white">
      <Link href="/">На главную</Link>
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
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : "");
          }}
        />

        {preview ? (
          <div className="flex items-center gap-3 mt-1">
            {/* preview можно обычным img */}
            {/* <img
              src={preview}
              alt="preview"
              className="w-16 h-16 rounded-full object-cover"
            /> */}
            <div className="text-sm opacity-80 truncate">{file?.name}</div>
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

              {s.avatar ? (
                <div className="mt-2">
                  {/* Next/Image требует width/height */}
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    width={74}
                    height={74}
                    className="rounded-full object-cover"
                    />
                </div>
              ) : null}
              <div className="font-semibold text-2xl">{s.name}</div>
              <div className="text-sm opacity-80">Должность: {s.job || "-"}</div>
              <div className="text-sm opacity-80">
                ДР: {s.age ? new Date(s.age).toLocaleDateString() : "-"}
              </div>
              </div>
                <div>
                  <button className="px-4 py-2 rounded-xl bg-white/20 text-sm opacity-80 hover:bg-white/60 transition hover:text-black">
                    Редактировать

                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}