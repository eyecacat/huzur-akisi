import React from "react";

/**
 * İmza tasarım öğesi: sayfanın üstünde yaşayan, yavaşça hareket eden
 * bir "akış" çizgisi. Sistemin temel fikrini (mevcut akışı alıp
 * yumuşak biçimde yeniden şekillendirmek) doğrudan görselleştirir.
 * Duygu durumuna göre rengi/genliği hafifçe değişir.
 */
export default function AkisDalgasi({ mod = "notr" }) {
  const renkler = {
    notr: ["#7C6FE0", "#E0A458"],
    pozitif: ["#7C6FE0", "#B7A9F5"],
    olumsuz: ["#3A3564", "#7C6FE0"],
  };
  const [renk1, renk2] = renkler[mod] || renkler.notr;

  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{ width: "100%", height: 120, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="akisGradyan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={renk1} stopOpacity="0.35" />
          <stop offset="100%" stopColor={renk2} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M0,110 C150,60 300,160 450,100 C600,40 750,140 900,90 C1000,60 1100,110 1200,80 L1200,200 L0,200 Z"
        fill="url(#akisGradyan)"
      >
        <animate
          attributeName="d"
          dur="14s"
          repeatCount="indefinite"
          values="
            M0,110 C150,60 300,160 450,100 C600,40 750,140 900,90 C1000,60 1100,110 1200,80 L1200,200 L0,200 Z;
            M0,90 C150,140 300,60 450,110 C600,150 750,60 900,100 C1000,130 1100,70 1200,100 L1200,200 L0,200 Z;
            M0,110 C150,60 300,160 450,100 C600,40 750,140 900,90 C1000,60 1100,110 1200,80 L1200,200 L0,200 Z
          "
        />
      </path>
    </svg>
  );
}
