from fastapi import APIRouter

from app.models.sema import AkisSiralamaIstek, AkisSiralamaSonuc
from app.services.akis_siralama import akisi_yeniden_sirala

router = APIRouter()


@router.post("/sirala", response_model=AkisSiralamaSonuc)
def akisi_sirala(istek: AkisSiralamaIstek):
    """
    Verilen gonderi listesini kullanicinin duygu durumuna gore
    yeniden siralar ve uygulanan stratejiyi doner.
    """
    siralanmis, strateji = akisi_yeniden_sirala(istek.gonderiler, istek.duygu_durumu)
    return AkisSiralamaSonuc(siralanmis_gonderiler=siralanmis, uygulanan_strateji=strateji)
