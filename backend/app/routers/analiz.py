import logging

from fastapi import APIRouter, HTTPException

from app.models.sema import DuyguAnalizIstek, DuyguAnalizSonuc
from app.services.duygu_analizi import metni_analiz_et, DuyguAnaliziHatasi

router = APIRouter()
logger = logging.getLogger("huzur_akisi.router.analiz")


@router.post("/", response_model=DuyguAnalizSonuc)
async def duygu_analizi_yap(istek: DuyguAnalizIstek):
    """
    Kullanici metnini analiz eder ve duygu durumu, skor ve
    (varsa) mola onerisi doner.

    Hata durumlari:
      - 400: gecersiz istek (bos metin vb. - Pydantic tarafindan yakalanir)
      - 502: LLM saglayicisindan (OpenRouter) gecerli bir yanit alinamadi
      - 503: API anahtari tanimli degil / yapilandirma eksik
    """
    try:
        return await metni_analiz_et(istek.metin)
    except DuyguAnaliziHatasi as e:
        mesaj = str(e)
        logger.warning("Duygu analizi basarisiz: %s", mesaj)
        if "tanimli degil" in mesaj or "placeholder" in mesaj:
            raise HTTPException(status_code=503, detail=mesaj)
        raise HTTPException(status_code=502, detail=mesaj)
