"use client";

import { useEffect, useState } from "react";

export default function MoySkladProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/moysklad/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.rows || []);
      });
  }, []);

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Товары из МойСклад</h2>

      <div className="grid gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-xl bg-white/10 border border-white/20"
          >
            <div className="text-lg font-semibold">{p.name}</div>

            <div className="text-sm opacity-70">
              Код: {p.code || "-"}
            </div>

            <div className="text-sm opacity-70">
              ID: {p.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}