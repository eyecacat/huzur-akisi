"""
Huzur Akisi - Ruh Haline Duyarli Sosyal Medya Deneyimi
Ana FastAPI uygulamasi.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analiz, akis

app = FastAPI(
    title="Huzur Akisi API",
    description="Sosyal Yapay Zeka temali kullanici ruh hali duyarli icerik siralama servisi",
    version="0.1.0",
)

# Gelistirme asamasinda tum originlere izin verilir; production'da kisitlanmalidir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analiz.router, prefix="/api/analiz", tags=["Duygu Analizi"])
app.include_router(akis.router, prefix="/api/akis", tags=["Akis Siralama"])


@app.get("/")
def kok():
    return {"servis": "Huzur Akisi API", "durum": "calisiyor"}


@app.get("/saglik")
def saglik_kontrolu():
    return {"durum": "sağlıklı"}
