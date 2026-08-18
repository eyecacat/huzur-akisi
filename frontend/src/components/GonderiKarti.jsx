import React from "react";

const RENKLER = {
  pozitif: { bg: "#eaf3de", text: "#173404" },
  notr: { bg: "#f1efe8", text: "#2c2c2a" },
  toksik: { bg: "#faece7", text: "#4a1b0c" },
};

export default function GonderiKarti({ gonderi }) {
  const renk = RENKLER[gonderi.tip] || RENKLER.notr;
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>{gonderi.yazar}</span>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: renk.bg, color: renk.text }}>
          {gonderi.tip}
        </span>
      </div>
      <p style={{ fontSize: 13, margin: 0 }}>{gonderi.metin}</p>
    </div>
  );
}
