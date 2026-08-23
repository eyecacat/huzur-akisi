"""
Duygu Analizi Servisi

Bu modul, kullanici metin girdisinden duygu durumu cikarimi yapar.
Buyuk dil modeli (LLM) cagrisi OpenRouter API'si uzerinden yapilir; bu
sayede saglayicidan bagimsiz (Claude, GPT, Llama, Mistral vb. arasinda
gecis yapilabilir) esnek bir mimari elde edilir.

GUVENLIK - ONEMLI:
    API anahtari HICBIR ZAMAN kod icine yazilmaz. Ortam degiskeninden
    (environment variable) okunur:
      - Yerel gelistirmede: .env dosyasi (bkz. .env.example)
      - Vercel/Render/Railway gibi platformlarda: proje ayarlarindaki
        "Environment Variables" / "Secrets" bolumu
      - GitHub Actions kullanilacaksa: repo Settings > Secrets and variables

Kurulum:
    1. .env.example dosyasini .env olarak kopyalayin
    2. OPENROUTER_API_KEY degiskenini openrouter.ai/keys adresinden
       aldiginiz kendi anahtarinizla doldurun
    3. .env dosyasi .gitignore icinde oldugu icin GitHub'a asla yuklenmez
"""

import json
import logging
import os
import re

import httpx
from dotenv import load_dotenv

from app.models.sema import DuyguAnalizSonuc

load_dotenv()

logger = logging.getLogger("huzur_akisi.duygu_analizi")

# --- Yapilandirma: API anahtari SADECE ortam degiskeninden okunur ---
API_ANAHTARI = os.getenv("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")
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_ADI = os.getenv("LLM_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

# OpenRouter'in istegi dogru kaynaktan geldigini dogrulamasi icin (opsiyonel ama tavsiye edilir)
SITE_URL = os.getenv("SITE_URL", "https://github.com/eyecacat/huzur-akisi")
SITE_ADI = os.getenv("SITE_ADI", "Huzur Akisi")

SISTEM_TALIMATI = """Sen bir sosyal medya platformunda kullanici ruh halini analiz eden bir sistemsin.
Kullanicinin yazdigi metni analiz et ve SADECE gecerli bir JSON nesnesi don, baska hicbir aciklama, yorum veya markdown formatlama ekleme.

JSON semasi (tam olarak bu alanlari kullan):
{
  "duygu": "pozitif" | "notr" | "olumsuz" | "kaygili",
  "skor": 0 ile 100 arasi tam sayi (100=cok olumlu, 0=cok olumsuz),
  "aciklama": "en fazla 15 kelimelik kisa Turkce aciklama",
  "mola_onerisi": "duygu olumsuz veya kaygiliysa nazik, yargilamayan, tek cumlelik Turkce bir mesaj; aksi halde null"
}

Onemli: mola_onerisi asla kucumseyici, buyurgan veya klinik bir tonda olmamali; destekleyici bir arkadas gibi konus."""


class DuyguAnaliziHatasi(Exception):
    """Duygu analizi sirasinda olusan hatalar icin ozel istisna."""
    pass


def _api_anahtari_kontrol():
    if not API_ANAHTARI or API_ANAHTARI == "xxxxxx":
        raise DuyguAnaliziHatasi(
            "OPENROUTER_API_KEY tanimli degil veya hala placeholder degerinde. "
            "Yerel gelistirmede .env dosyanizi, canli ortamda platform "
            "Environment Variables / Secrets ayarlarinizi kontrol edin."
        )


def _json_cikar(metin: str) -> dict:
    """LLM yanitindan JSON blogunu güvenli sekilde ayiklar."""
    temiz = re.sub(r"```json|```", "", metin).strip()
    eslesme = re.search(r"\{.*\}", temiz, re.DOTALL)
    if not eslesme:
        raise DuyguAnaliziHatasi("Model yanitinda gecerli JSON bulunamadi")
    return json.loads(eslesme.group(0))


def _dogrula_ve_normallestir(sonuc_json: dict) -> DuyguAnalizSonuc:
    """Modelden gelen serbest bicimli JSON'u guvenli, sinirlari kontrol edilmis bir sonuca donusturur."""
    gecerli_duygular = {"pozitif", "notr", "olumsuz", "kaygili"}
    duygu = sonuc_json.get("duygu", "notr")
    if duygu not in gecerli_duygular:
        duygu = "notr"

    try:
        skor = int(sonuc_json.get("skor", 50))
    except (TypeError, ValueError):
        skor = 50
    skor = max(0, min(100, skor))

    aciklama = str(sonuc_json.get("aciklama", "")).strip()[:200]
    mola = sonuc_json.get("mola_onerisi")
    if mola is not None:
        mola = str(mola).strip()[:300] or None

    return DuyguAnalizSonuc(duygu=duygu, skor=skor, aciklama=aciklama, mola_onerisi=mola)


async def metni_analiz_et(metin: str) -> DuyguAnalizSonuc:
    """
    Verilen kullanici metnini OpenRouter uzerinden bir LLM'e gonderip
    analiz eder ve yapilandirilmis, dogrulanmis bir DuyguAnalizSonuc dondurur.

    Olasi hatalar (agsal sorun, gecersiz anahtar, beklenmeyen yanit formati)
    DuyguAnaliziHatasi olarak yukariya firlatilir; cagiran taraf (router)
    bunu uygun bir HTTP hatasina cevirir.
    """
    _api_anahtari_kontrol()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            yanit = await client.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {API_ANAHTARI}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_ADI,
                },
                json={
                    "model": MODEL_ADI,
                    "messages": [
                        {"role": "system", "content": SISTEM_TALIMATI},
                        {"role": "user", "content": metin},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 300,
                },
            )
            yanit.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error("OpenRouter API hatasi: %s - %s", e.response.status_code, e.response.text)
            if e.response.status_code == 401:
                raise DuyguAnaliziHatasi(
                    "API anahtari gecersiz veya yetkisiz. OPENROUTER_API_KEY degerini kontrol edin."
                )
            if e.response.status_code == 429:
                raise DuyguAnaliziHatasi("API istek limiti asildi, lutfen birkac saniye sonra tekrar deneyin.")
            raise DuyguAnaliziHatasi(f"API istegi basarisiz oldu (HTTP {e.response.status_code}).")
        except httpx.HTTPError as e:
            logger.error("Aga erisim hatasi: %s", e)
            raise DuyguAnaliziHatasi("API sunucusuna ulasilamadi, ag baglantinizi kontrol edin.")

        veri = yanit.json()

        try:
            metin_govdesi = veri["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            logger.error("Beklenmeyen API yanit formati: %s", veri)
            raise DuyguAnaliziHatasi("Model yanit formati beklenenden farkli.")

        try:
            sonuc_json = _json_cikar(metin_govdesi)
        except (DuyguAnaliziHatasi, json.JSONDecodeError) as e:
            logger.error("JSON ayristirma hatasi. Ham yanit: %s", metin_govdesi)
            raise DuyguAnaliziHatasi(f"Model yaniti ayristirilamadi: {e}")

        return _dogrula_ve_normallestir(sonuc_json)
