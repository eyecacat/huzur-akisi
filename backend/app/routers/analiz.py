from fastapi import APIRouter, HTTPException

from app.models.sema import DuyguAnalizIstek, DuyguAnalizSonuc
from app.services.duygu_analizi import metni_analiz_et, DuyguAnaliziHatasi

router = APIRouter()


@router.post("/", response_model=DuyguAnalizSonuc)
async def duygu_analizi_yap(istek: DuyguAnalizIstek):
    """
    Kullanici metnini analiz eder ve duygu durumu, skor ve
    (varsa) mola onerisi doner.
    """
    try:
        return await metni_analiz_et(istek.metin)
    except DuyguAnaliziHatasi as e:
        raise HTTPException(status_code=502, detail=str(e))
