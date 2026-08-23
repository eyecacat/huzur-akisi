import React, { useState } from "react";
import AkisDalgasi from "./components/AkisDalgasi.jsx";
import DuyguGostergesi from "./components/DuyguGostergesi.jsx";
import MolaBildirimi from "./components/MolaBildirimi.jsx";
import GonderiKarti from "./components/GonderiKarti.jsx";
import { duyguAnalizEt, akisiSirala, ApiHatasi } from "./api.js";

const ORNEK_GONDERILER = [
  { id: 1, yazar: "@teknoblog", metin: "Yeni yapay zekâ modeli inanılmaz sonuçlar veriyor, kesinlikle denemelisiniz!", tip: "notr" },
  { id: 2, yazar: "@gundemtakip", metin: "Herkes birbirini suçluyor, bu ülkede hiçbir şey düzelmeyecek, hepsi yalan söylüyor.", tip: "toksik" },
  { id: 3, yazar: "@dogasever", metin: "Bu sabah kahvemi bahçede içtim, kuş sesleri harikaydı. Küçük anların kıymetini bilelim.", tip: "pozitif" },
  { id: 4, yazar: "@magdurkullanici", metin: "Sen de mi başarısız oldun? Zaten hiçbir şey değişmeyecek, boşuna uğraşma.", tip: "toksik" },
  { id: 5, yazar: "@kodcu42", metin: "Bugün 3 saatte bitirdiğim bug'ı 2 hafta önce bulamamıştım. Gelişim böyle bir şey.", tip: "pozitif" },
  { id: 6, yazar: "@tartismaci", metin: "Bu konuda yanılıyorsun ve senin gibi düşünenler yüzünden her şey berbat oluyor.", tip: "toksik" },
  { id: 7, yazar: "@yemektarifi", metin: "Bugün denediğim mercimek çorbası tarifi tam kıvamında oldu, paylaşıyorum.", tip: "pozitif" },
  { id: 8, yazar: "@spor_takip", metin: "Maç sonucu belli oldu, önemli olan sahada verilen mücadele.", tip: "notr" },
];

const ORNEK_METINLER = [
  "bugün çok yoruldum, hiçbir şey yolunda gitmiyor",
  "harika bir gün geçiriyorum, enerjim yüksek",
  "işler biraz karışık ama idare ediyorum",
];

export default function App() {
  const [girdi, setGirdi] = useState("");
  const [analiz, setAnaliz] = useState(null);
  const [gonderiler, setGonderiler] = useState(ORNEK_GONDERILER);
  const [siraDegistiMi, setSiraDegistiMi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [bildirimGoster, setBildirimGoster] = useState(false);

  async function calistir() {
    if (!girdi.trim()) {
      setHata({ mesaj: "Önce bir şeyler yazmalısın.", tur: "girdi" });
      return;
    }
    setHata(null);
    setYukleniyor(true);
    setBildirimGoster(false);

    try {
      const analizSonucu = await duyguAnalizEt("demo-kullanici", girdi);
      setAnaliz(analizSonucu);

      const siralamaSonucu = await akisiSirala("demo-kullanici", analizSonucu.duygu, ORNEK_GONDERILER);
      setGonderiler(siralamaSonucu.siralanmis_gonderiler);
      setSiraDegistiMi(siralamaSonucu.uygulanan_strateji !== "varsayilan_kronolojik_siralama");

      if (analizSonucu.duygu === "olumsuz" || analizSonucu.duygu === "kaygili") {
        setBildirimGoster(true);
      }
    } catch (e) {
      if (e instanceof ApiHatasi) {
        setHata({ mesaj: e.message, tur: "api", kod: e.durumKodu });
      } else {
        setHata({ mesaj: "Beklenmeyen bir hata oluştu.", tur: "bilinmeyen" });
      }
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
        <AkisDalgasi mod={analiz?.duygu === "pozitif" ? "pozitif" : analiz?.duygu === "olumsuz" || analiz?.duygu === "kaygili" ? "olumsuz" : "notr"} />
        <div style={{ maxWidth: 640, margin: "-70px auto 0", padding: "0 20px" }}>
          <p style={{ fontFamily: "var(--font-govde)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--renk-alacakaranlik-1)", fontWeight: 600, margin: "0 0 6px" }}>
            NSosyal İnovasyon 2026 · Sosyal Yapay Zekâ
          </p>
          <h1 style={{ fontFamily: "var(--font-baslik)", fontSize: 40, fontWeight: 500, margin: "0 0 8px", color: "var(--renk-gece-mavisi)" }}>
            Huzur Akışı
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--renk-mürekkep-soluk)", margin: "0 0 28px", maxWidth: 480, lineHeight: 1.55 }}>
            Bir şeyler yaz — sistem ruh haline duyarlı biçimde akışını sessizce yeniden şekillendirsin.
            Neyin neden değiştiğini her zaman görebilirsin.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 60px", width: "100%", flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={girdi}
              onChange={(e) => setGirdi(e.target.value)}
              placeholder="Bugün nasıl hissediyorsun?"
              aria-label="Ruh halini yazın"
              style={{
                flex: 1,
                height: 46,
                padding: "0 16px",
                borderRadius: "var(--radius-s)",
                border: "1px solid var(--renk-cizgi)",
                fontSize: 14.5,
                fontFamily: "var(--font-govde)",
                background: "var(--renk-zemin-yukseltilmis)",
              }}
              onKeyDown={(e) => e.key === "Enter" && calistir()}
            />
            <button
              onClick={calistir}
              disabled={yukleniyor}
              style={{
                height: 46,
                padding: "0 22px",
                borderRadius: "var(--radius-s)",
                border: "none",
                background: yukleniyor ? "var(--renk-mürekkep-soluk)" : "var(--renk-gece-mavisi)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {yukleniyor ? "Analiz ediliyor…" : "Akışı güncelle"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {ORNEK_METINLER.map((ornek) => (
              <button
                key={ornek}
                onClick={() => setGirdi(ornek)}
                style={{
                  fontSize: 12,
                  color: "var(--renk-mürekkep-soluk)",
                  background: "var(--renk-notr-bg)",
                  border: "none",
                  borderRadius: 20,
                  padding: "5px 12px",
                }}
              >
                {ornek}
              </button>
            ))}
          </div>

          {hata && (
            <div
              role="alert"
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "var(--renk-uyari-metin)",
                background: "var(--renk-uyari-bg)",
                border: "1px solid var(--renk-uyari-kenar)",
                borderRadius: "var(--radius-s)",
                padding: "10px 14px",
              }}
            >
              {hata.mesaj}
              {hata.kod === 503 && (
                <div style={{ marginTop: 4, opacity: 0.85 }}>
                  Backend'de OPENROUTER_API_KEY tanımlı değil — .env dosyanızı veya deploy ortamınızın
                  Environment Variables / Secrets ayarını kontrol edin.
                </div>
              )}
            </div>
          )}
        </div>

        {analiz && <DuyguGostergesi analiz={analiz} />}

        {bildirimGoster && analiz?.mola_onerisi && (
          <MolaBildirimi mesaj={analiz.mola_onerisi} onKapat={() => setBildirimGoster(false)} />
        )}

        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ fontFamily: "var(--font-baslik)", fontSize: 16, fontWeight: 500, fontStyle: "italic", margin: 0, color: "var(--renk-mürekkep)" }}>
            {siraDegistiMi ? "Ruh haline göre yeniden düzenlendi" : "Akış"}
          </h2>
          {siraDegistiMi && (
            <button
              onClick={() => {
                setGonderiler(ORNEK_GONDERILER);
                setSiraDegistiMi(false);
                setAnaliz(null);
                setBildirimGoster(false);
              }}
              style={{ fontSize: 12, color: "var(--renk-alacakaranlik-1)", background: "none", border: "none", fontWeight: 500 }}
            >
              sıfırla
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {gonderiler.map((g) => (
            <GonderiKarti key={g.id} gonderi={g} siraDegisti={siraDegistiMi} />
          ))}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--renk-cizgi)", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--renk-mürekkep-soluk)", margin: 0 }}>
          Huzur Akışı — Takım NEXUS · TEKNOFEST NSosyal İnovasyon Yarışması 2026 prototipi
        </p>
      </footer>
    </div>
  );
}
