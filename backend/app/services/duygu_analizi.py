"""
Duygu Analizi Servisi

Bu modul, kullanici metin girdisinden duygu durumu cikarimi yapar.
Uretim ortaminda buyuk dil modeli (LLM) API'sine baglanir; API anahtari
ortam degiskeninden (environment variable) okunur ve KESINLIKLE
kod icine gömulmez.

Kurulum:
    1. Proje kok dizininde bir .env dosyasi olusturun (bkz. .env.example)
    2. ANTHROPIC_API_KEY degiskenini kendi anahtarinizla doldurun
    3. .env dosyasi .gitignore icinde oldugu icin GitHub'a asla yuklenmez
"""

import json
import os
import re
from typing import Optional

import httpx
from dotenv import load_dotenv

from app.models.sema import DuyguAnalizSonuc

load_dotenv()

API_ANAHTARI = os.getenv("ANTHROPIC_API_KEY")
API_URL = "https://api.anthropic.com/v1/messages"
MODEL_ADI = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

SISTEM_TALIMATI = """Sen bir sosyal medya platformunda kullanici ruh halini analiz eden bir sistemsin.
Kullanicinin yazdigi metni analiz et ve SADECE gecerli bir JSON nesnesi don, baska hicbir aciklama ekleme.

JSON semasi:
{
  "duygu": "pozitif" | "notr" | "olumsuz" | "kaygili",
  "skor": 0 ile 100 arasi tam sayi (100=cok olumlu, 0=cok olumsuz),
  "aciklama": "en fazla 15 kelimelik kisa Turkce aciklama",
  "mola_onerisi": "duygu olumsuz veya kaygiliysa nazik, yargilamayan tek cumlelik bir mesaj; aksi halde null"
}"""


class DuyguAnaliziHatasi(Exception):
    """Duygu analizi sirasinda olusan hatalar icin ozel istisna."""
    pass


def _json_cikar(metin: str) -> dict:
    """LLM yanitindan JSON blogunu güvenli sekilde ayiklar."""
    temiz = re.sub(r"```json|```", "", metin).strip()
    eslesme = re.search(r"\{.*\}", temiz, re.DOTALL)
    if not eslesme:
        raise DuyguAnaliziHatasi("Yanitta gecerli JSON bulunamadi")
    return json.loads(eslesme.group(0))


async def metni_analiz_et(metin: str) -> DuyguAnalizSonuc:
    """
    Verilen kullanici metnini LLM API'si araciligiyla analiz eder
    ve yapilandirilmis bir DuyguAnalizSonuc dondurur.
    """
    if not API_ANAHTARI:
        raise DuyguAnaliziHatasi(
            "ANTHROPIC_API_KEY ortam degiskeni tanimli degil. "
            ".env dosyanizi kontrol edin (bkz. .env.example)."
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            yanit = await client.post(
                API_URL,
                headers={
                    "x-api-key": API_ANAHTARI,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": MODEL_ADI,
                    "max_tokens": 300,
                    "system": SISTEM_TALIMATI,
                    "messages": [{"role": "user", "content": metin}],
                },
            )
            yanit.raise_for_status()
        except httpx.HTTPError as e:
            raise DuyguAnaliziHatasi(f"API istegi basarisiz: {e}")

        veri = yanit.json()
        metin_govdesi = "".join(
            blok.get("text", "") for blok in veri.get("content", []) if blok.get("type") == "text"
        )

        try:
            sonuc_json = _json_cikar(metin_govdesi)
        except (DuyguAnaliziHatasi, json.JSONDecodeError) as e:
            raise DuyguAnaliziHatasi(f"Model yaniti ayristirilamadi: {e}")

        return DuyguAnalizSonuc(
            duygu=sonuc_json.get("duygu", "notr"),
            skor=int(sonuc_json.get("skor", 50)),
            aciklama=sonuc_json.get("aciklama", ""),
            mola_onerisi=sonuc_json.get("mola_onerisi"),
        )
