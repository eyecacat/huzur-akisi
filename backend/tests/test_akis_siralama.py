"""
Akis Yeniden Siralama Servisi - Birim Testleri

Calistirmak icin: pytest tests/test_akis_siralama.py -v
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models.sema import Gonderi, DuyguDurumu, IcerikTipi
from app.services.akis_siralama import akisi_yeniden_sirala


def ornek_gonderiler():
    return [
        Gonderi(id=1, yazar="@a", metin="pozitif icerik", tip=IcerikTipi.POZITIF),
        Gonderi(id=2, yazar="@b", metin="toksik icerik", tip=IcerikTipi.TOKSIK),
        Gonderi(id=3, yazar="@c", metin="notr icerik", tip=IcerikTipi.NOTR),
        Gonderi(id=4, yazar="@d", metin="baska toksik", tip=IcerikTipi.TOKSIK),
    ]


def test_olumsuz_duygu_toksik_icerigi_bastirir():
    sonuc, strateji = akisi_yeniden_sirala(ornek_gonderiler(), DuyguDurumu.OLUMSUZ)
    assert sonuc[0].tip == IcerikTipi.POZITIF
    assert sonuc[-1].tip == IcerikTipi.TOKSIK
    assert strateji == "toksik_icerik_bastirma_pozitif_onceliklendirme"


def test_kaygili_duygu_toksik_icerigi_bastirir():
    sonuc, _ = akisi_yeniden_sirala(ornek_gonderiler(), DuyguDurumu.KAYGILI)
    assert sonuc[0].tip == IcerikTipi.POZITIF


def test_notr_duygu_siralamayi_korur():
    orijinal = ornek_gonderiler()
    sonuc, strateji = akisi_yeniden_sirala(orijinal, DuyguDurumu.NOTR)
    assert [g.id for g in sonuc] == [g.id for g in orijinal]
    assert strateji == "varsayilan_kronolojik_siralama"


def test_pozitif_duygu_siralamayi_korur():
    orijinal = ornek_gonderiler()
    sonuc, _ = akisi_yeniden_sirala(orijinal, DuyguDurumu.POZITIF)
    assert [g.id for g in sonuc] == [g.id for g in orijinal]


def test_bos_liste_hata_vermez():
    sonuc, _ = akisi_yeniden_sirala([], DuyguDurumu.OLUMSUZ)
    assert sonuc == []
