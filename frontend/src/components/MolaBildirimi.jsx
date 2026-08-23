import React, { useState } from "react";

/**
 * Raporun 3.3 bölümünde tanımlanan bildirim davranışı:
 * kullanıcı bildirimi kabul edebilir, erteleyebilir veya tamamen kapatabilir.
 * Ton her zaman "destekleyici", asla "paternalist" olmalı.
 */
export default function MolaBildirimi({ mesaj, onKapat }) {
  const [durum, setDurum] = useState("aktif"); // aktif | ertelendi | kapatildi

  if (durum === "kapatildi") return null;

  return (
    <div
      role="status"
      style={{
        background: "var(--renk-zemin-yukseltilmis)",
        border: "1px solid var(--renk-alacakaranlik-1)",
        borderRadius: "var(--radius-m)",
        padding: "18px 20px",
        marginBottom: 20,
        boxShadow: "var(--golge-yumusak)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">
          🌙
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, color: "var(--renk-mürekkep)" }}>
            {durum === "ertelendi" ? "Tamam, 10 dakika sonra tekrar hatırlatırım." : mesaj}
          </p>

          {durum === "aktif" && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => {
                  setDurum("kapatildi");
                  onKapat?.("kabul");
                }}
                style={{
                  background: "var(--renk-alacakaranlik-1)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-s)",
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Pozitif içerik göster
              </button>
              <button
                onClick={() => setDurum("ertelendi")}
                style={{
                  background: "transparent",
                  color: "var(--renk-mürekkep-soluk)",
                  border: "1px solid var(--renk-cizgi)",
                  borderRadius: "var(--radius-s)",
                  padding: "8px 16px",
                  fontSize: 13,
                }}
              >
                Daha sonra
              </button>
              <button
                onClick={() => {
                  setDurum("kapatildi");
                  onKapat?.("kapat");
                }}
                aria-label="Bildirimi kapat"
                style={{
                  background: "transparent",
                  color: "var(--renk-mürekkep-soluk)",
                  border: "none",
                  padding: "8px 10px",
                  fontSize: 13,
                  marginLeft: "auto",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
