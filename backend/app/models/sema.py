"""
Pydantic sema tanimlari - istek/yanit veri yapilari.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class DuyguDurumu(str, Enum):
    POZITIF = "pozitif"
    NOTR = "notr"
    OLUMSUZ = "olumsuz"
    KAYGILI = "kaygili"


class IcerikTipi(str, Enum):
    POZITIF = "pozitif"
    NOTR = "notr"
    TOKSIK = "toksik"


class DuyguAnalizIstek(BaseModel):
    kullanici_id: str = Field(..., description="Anonimlestirilmis kullanici kimligi")
    metin: str = Field(..., min_length=1, max_length=2000, description="Analiz edilecek kullanici girdisi")


class DuyguAnalizSonuc(BaseModel):
    duygu: DuyguDurumu
    skor: int = Field(..., ge=0, le=100, description="0=cok olumsuz, 100=cok olumlu")
    aciklama: str
    mola_onerisi: Optional[str] = Field(default=None, description="Olumsuz/kaygili durumda gosterilecek nazik mesaj")


class Gonderi(BaseModel):
    id: int
    yazar: str
    metin: str
    tip: IcerikTipi


class AkisSiralamaIstek(BaseModel):
    kullanici_id: str
    duygu_durumu: DuyguDurumu
    gonderiler: List[Gonderi]


class AkisSiralamaSonuc(BaseModel):
    siralanmis_gonderiler: List[Gonderi]
    uygulanan_strateji: str
