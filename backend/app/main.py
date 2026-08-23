"""
Huzur Akisi - Ruh Haline Duyarli Sosyal Medya Deneyimi
Ana FastAPI uygulamasi.
"""

import logging
import os
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import analiz, akis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("huzur_akisi")

app = FastAPI(
    title="Huzur Akisi API",
    description="Sosyal Yapay Zeka temali kullanici ruh hali duyarli icerik siralama servisi",
    version="1.0.0",
)

# CORS: production'da CORS_ORIGINS ortam degiskeni ile spesifik domain(ler)
# tanimlanmasi tavsiye edilir (ornek: "https://huzur-akisi.vercel.app").
# Bos birakilirsa gelistirme kolayligi icin tum originlere izin verilir.
_izinli_originler = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _izinli_originler == "*" else _izinli_originler.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Basit bellek-ici rate limiting (IP basina dakikada N istek) ---
# Not: Coklu instance (yatay olceklenmis) production ortaminda Redis gibi
# paylasilan bir depolama kullanilmasi onerilir; bu implementasyon tek
# instance / prototip / kucuk olcekli kullanim icin yeterlidir.
_RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
_istek_gecmisi: dict[str, deque] = defaultdict(deque)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        istemci_ip = request.client.host if request.client else "bilinmiyor"
        simdi = time.time()
        gecmis = _istek_gecmisi[istemci_ip]

        while gecmis and simdi - gecmis[0] > 60:
            gecmis.popleft()

        if len(gecmis) >= _RATE_LIMIT:
            logger.warning("Rate limit asildi: %s", istemci_ip)
            return JSONResponse(
                status_code=429,
                content={"detail": "Cok fazla istek gonderildi, lutfen bir dakika sonra tekrar deneyin."},
            )

        gecmis.append(simdi)

    return await call_next(request)


@app.exception_handler(Exception)
async def genel_hata_yakalayici(request: Request, exc: Exception):
    """Beklenmeyen tum hatalari yakalayip loglar, istemciye genel bir mesaj doner."""
    logger.exception("Beklenmeyen hata: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucuda beklenmeyen bir hata olustu."},
    )


app.include_router(analiz.router, prefix="/api/analiz", tags=["Duygu Analizi"])
app.include_router(akis.router, prefix="/api/akis", tags=["Akis Siralama"])


@app.get("/")
def kok():
    return {"servis": "Huzur Akisi API", "durum": "calisiyor", "surum": "1.0.0"}


@app.get("/saglik")
def saglik_kontrolu():
    api_anahtari_tanimli = bool(os.getenv("OPENROUTER_API_KEY")) and os.getenv("OPENROUTER_API_KEY") != "xxxxxx"
    return {
        "durum": "sağlıklı",
        "llm_yapilandirmasi": "tamam" if api_anahtari_tanimli else "eksik (OPENROUTER_API_KEY ayarlanmali)",
    }
