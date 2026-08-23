import React from "react";

const DUYGU_ETIKET = {
  pozitif: "Keyifli görünüyorsun",
  notr: "Sakin bir tempoda görünüyorsun",
  olumsuz: "Bugün biraz yorucu geçiyor gibi",
  kaygili: "Biraz gergin görünüyorsun",
};

const RENK_GRUBU = {
  pozitif: "sakin",
  notr: "notr",
  olumsuz: "uyari",
  kaygili: "uyari",
};

export default function DuyguGostergesi({ analiz }) {
  const grup = RENK_GRUBU[analiz.duygu] || "notr";

  return (
    <div
      style={{
        background: `var(--renk-${grup}-bg)`,
        border: `1px solid var(--renk-${grup}-kenar)`,
        borderRadius: "var(--radius-m)",
        padding: "18px 22px",
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-baslik)", fontSize: 18, fontStyle: "italic", color: `var(--renk-${grup}-metin)` }}>
          {DUYGU_ETIKET[analiz.duygu] || "Analiz edildi"}
        </span>
        <span style={{ fontSize: 12, color: `var(--renk-${grup}-metin)`, opacity: 0.75, whiteSpace: "nowrap" }}>
          güven skoru {analiz.skor}/100
        </span>
      </div>
      {analiz.aciklama && (
        <p style={{ fontSize: 13, color: `var(--renk-${grup}-metin)`, margin: "6px 0 0", opacity: 0.85 }}>
          {analiz.aciklama}
        </p>
      )}
    </div>
  );
}
