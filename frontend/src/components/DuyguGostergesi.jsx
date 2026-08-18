import React from "react";

const RENKLER = {
  pozitif: { bg: "#eaf3de", text: "#173404", border: "#639922" },
  notr: { bg: "#f1efe8", text: "#2c2c2a", border: "#888780" },
  olumsuz: { bg: "#faece7", text: "#4a1b0c", border: "#d85a30" },
  kaygili: { bg: "#faece7", text: "#4a1b0c", border: "#d85a30" },
};

export default function DuyguGostergesi({ analiz }) {
  const renk = RENKLER[analiz.duygu] || RENKLER.notr;
  const olumsuzMu = analiz.duygu === "olumsuz" || analiz.duygu === "kaygili";

  return (
    <div style={{ background: renk.bg, border: `1px solid ${renk.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: renk.text }}>Ruh hâli: {analiz.duygu}</span>
        <span style={{ fontSize: 13, color: renk.text }}>skor: {analiz.skor}/100</span>
      </div>
      <p style={{ fontSize: 13, color: renk.text, margin: "4px 0 0" }}>{analiz.aciklama}</p>
      {olumsuzMu && analiz.mola_onerisi && (
        <p style={{ fontSize: 13, color: renk.text, margin: "8px 0 0", fontStyle: "italic" }}>
          💬 {analiz.mola_onerisi}
        </p>
      )}
    </div>
  );
}
