/**
 * API istemcisi — backend ile tüm iletişim burada toplanır.
 * Ortam değişkeni bulunamazsa yerel geliştirme adresine düşer.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiHatasi extends Error {
  constructor(mesaj, durumKodu) {
    super(mesaj);
    this.durumKodu = durumKodu;
  }
}

async function istekYap(yol, gövde) {
  let yanit;
  try {
    yanit = await fetch(`${API_URL}${yol}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gövde),
    });
  } catch (e) {
    throw new ApiHatasi(
      "Sunucuya bağlanılamadı. Backend'in çalıştığından ve adresin doğru olduğundan emin olun.",
      0
    );
  }

  if (!yanit.ok) {
    let detay = "Bilinmeyen bir hata oluştu.";
    try {
      const gövdeJson = await yanit.json();
      detay = gövdeJson.detail || detay;
    } catch {
      /* yanıt gövdesi JSON değilse varsayılan mesaj kullanılır */
    }
    throw new ApiHatasi(detay, yanit.status);
  }

  return yanit.json();
}

export async function duyguAnalizEt(kullaniciId, metin) {
  return istekYap("/api/analiz/", { kullanici_id: kullaniciId, metin });
}

export async function akisiSirala(kullaniciId, duyguDurumu, gonderiler) {
  return istekYap("/api/akis/sirala", {
    kullanici_id: kullaniciId,
    duygu_durumu: duyguDurumu,
    gonderiler,
  });
}

export { ApiHatasi };
