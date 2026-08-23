import React, { useState } from "react";

const TIP_ETIKET = {
  pozitif: "destekleyici",
  notr: "standart",
  toksik: "gerilim yüksek",
};

const NEDEN_METNI = {
  öne_alindi: "Ruh haline uygun, destekleyici içerik olduğu için öne alındı.",
  bastirildi: "Şu an geriye alındı — gerilimi yüksek olabilir, ama istersen görebilirsin.",
  standart: "Sıralama değişmedi.",
};

function nedenAnahtari(gonderi, siraDegisti) {
  if (!siraDegisti) return "standart";
  if (gonderi.tip === "toksik") return "bastirildi";
  if (gonderi.tip === "pozitif") return "öne_alindi";
  return "standart";
}

export default function GonderiKarti({ gonderi, siraDegisti = false }) {
  const [nedenAcik, setNedenAcik] = useState(false);
  const anahtar = nedenAnahtari(gonderi, siraDegisti);
  const gizliMi = anahtar === "bastirildi";

  return (
    <article
      style={{
        background: "var(--renk-zemin-yukseltilmis)",
        border: "1px solid var(--renk-cizgi)",
        borderRadius: "var(--radius-m)",
        padding: "18px 20px",
        opacity: gizliMi ? 0.7 : 1,
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{gonderi.yazar}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: 20,
            background:
              gonderi.tip === "toksik"
                ? "var(--renk-toksik-rozet-bg)"
                : gonderi.tip === "pozitif"
                ? "var(--renk-sakin-bg)"
                : "var(--renk-notr-bg)",
            color:
              gonderi.tip === "toksik"
                ? "var(--renk-toksik-rozet-metin)"
                : gonderi.tip === "pozitif"
                ? "var(--renk-sakin-metin)"
                : "var(--renk-notr-metin)",
          }}
        >
          {TIP_ETIKET[gonderi.tip] || gonderi.tip}
        </span>
      </div>

      <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "0 0 10px", color: "var(--renk-mürekkep)" }}>
        {gonderi.metin}
      </p>

      {anahtar !== "standart" && (
        <div>
          <button
            onClick={() => setNedenAcik((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 12.5,
              color: "var(--renk-alacakaranlik-1)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            aria-expanded={nedenAcik}
          >
            neden bu sırada? {nedenAcik ? "▲" : "▼"}
          </button>
          {nedenAcik && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--renk-mürekkep-soluk)",
                margin: "6px 0 0",
                borderLeft: "2px solid var(--renk-cizgi)",
                paddingLeft: 10,
              }}
            >
              {NEDEN_METNI[anahtar]}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
