"""
Akis Yeniden Siralama Servisi

Kullanicinin tespit edilen duygu durumuna gore icerik akisini
agirliklandirilmis bicimde yeniden sirala. Bu, projenin "toksik
icerik yonetimi" ve "kullanici ruh haline uygun icerik onerisi"
bilesenlerini olusturan cekirdek mantiktir.
"""

from typing import List

from app.models.sema import Gonderi, DuyguDurumu, IcerikTipi


def _icerik_agirligi(gonderi: Gonderi, duygu: DuyguDurumu) -> int:
    """
    Dusuk agirlik = akista daha ust siraya cikar.
    Kullanici olumsuz/kaygili durumdaysa toksik icerik geriye itilir,
    pozitif icerik one alinir. Notr durumda siralama degistirilmez.
    """
    olumsuz_durumlar = (DuyguDurumu.OLUMSUZ, DuyguDurumu.KAYGILI)

    if duygu not in olumsuz_durumlar:
        return 0  # notr/pozitif durumda mudahale edilmez

    if gonderi.tip == IcerikTipi.TOKSIK:
        return 2
    if gonderi.tip == IcerikTipi.POZITIF:
        return 0
    return 1


def akisi_yeniden_sirala(gonderiler: List[Gonderi], duygu: DuyguDurumu) -> tuple[List[Gonderi], str]:
    """
    Gonderi listesini kullanicinin duygu durumuna gore yeniden siralar.
    Orijinal sira, esit agirlikli gonderiler arasinda korunur (stable sort).
    """
    siralanmis = sorted(gonderiler, key=lambda g: _icerik_agirligi(g, duygu))

    if duygu in (DuyguDurumu.OLUMSUZ, DuyguDurumu.KAYGILI):
        strateji = "toksik_icerik_bastirma_pozitif_onceliklendirme"
    else:
        strateji = "varsayilan_kronolojik_siralama"

    return siralanmis, strateji
