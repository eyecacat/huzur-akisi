import React, { useState } from "react";
import GonderiKarti from "./components/GonderiKarti.jsx";
import DuyguGostergesi from "./components/DuyguGostergesi.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ORNEK_GONDERILER = [
  { id: 1, yazar: "@teknoblog", metin: "Yeni yapay zeka modeli inanılmaz sonuçlar veriyor!", tip: "notr" },
  { id: 2, yazar: "@gundemtakip", metin: "Herkes birbirini suçluyor, hiçbir şey düzelmeyecek.", tip: "toksik" },
  { id: 3, yazar: "@dogasever", metin: "Bu sabah kahvemi bahçede içtim, harikaydı.", tip: "pozitif" },
  { id: 4, yazar: "@magdurkullanici", metin: "Zaten hiçbir şey değişmeyecek, boşuna uğraşma.", tip: "toksik" },
  { id: 5, yazar: "@kodcu42", metin: "Bugün bir bug'ı çözdüm, gelişim böyle bir şey.", tip: "pozitif" },
];

export default function App() {
  const [girdi, setGirdi] = useState("");
  const [analiz, setAnaliz] = useState(null);
  const [gonderiler, setGonderiler] = useState(ORNEK_GONDERILER);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function gonder() {
    if (!girdi.trim()) {
      setHata("Önce bir şeyler yazmalısın.");
      return;
    }
    setHata("");
    setYukleniyor(true);
    try {
      const analizYaniti = await fetch(`${API_URL}/api/analiz/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullanici_id: "demo-kullanici", metin: girdi }),
      });
      if (!analizYaniti.ok) throw new Error("Analiz servisi hata döndü");
      const analizSonucu = await analizYaniti.json();
      setAnaliz(analizSonucu);

      const siralamaYaniti = await fetch(`${API_URL}/api/akis/sirala`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici_id: "demo-kullanici",
          duygu_durumu: analizSonucu.duygu,
          gonderiler: ORNEK_GONDERILER,
        }),
      });
      if (!siralamaYaniti.ok) throw new Error("Sıralama servisi hata döndü");
      const siralamaSonucu = await siralamaYaniti.json();
      setGonderiler(siralamaSonucu.siralanmis_gonderiler);
    } catch (e) {
      setHata("Sunucuya bağlanılamadı. Backend'in çalıştığından emin olun (bkz. README).");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500 }}>Huzur Akışı</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
        Ruh hâline duyarlı sosyal medya deneyimi — canlı demo
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={girdi}
          onChange={(e) => setGirdi(e.target.value)}
          placeholder="Bugün nasıl hissediyorsun?"
          style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid #ccc" }}
          onKeyDown={(e) => e.key === "Enter" && gonder()}
        />
        <button onClick={gonder} disabled={yukleniyor} style={{ height: 36, padding: "0 16px", borderRadius: 8 }}>
          {yukleniyor ? "Gönderiliyor…" : "Gönder"}
        </button>
      </div>

      {hata && <p style={{ color: "#c0392b", fontSize: 13 }}>{hata}</p>}

      {analiz && <DuyguGostergesi analiz={analiz} />}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        {gonderiler.map((g) => (
          <GonderiKarti key={g.id} gonderi={g} />
        ))}
      </div>
    </div>
  );
}
