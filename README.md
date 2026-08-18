# Huzur Akışı — Ruh Hâline Duyarlı Sosyal Medya Deneyimi

**NSosyal İnovasyon Yarışması 2026** kapsamında geliştirilen, **Sosyal Yapay Zekâ** temalı bir prototip.

## Proje Özeti

Huzur Akışı, kullanıcının sosyal medya platformundaki anlık ruh hâlini yapay
zekâ destekli analizle tespit ederek, içerik akışını kullanıcı refahına göre
yeniden önceliklendiren bir sistemdir. Kullanıcı olumsuz veya kaygılı bir
duygu durumundaysa toksik/tetikleyici içerikler akışta geriye itilir, pozitif
ve destekleyici içerikler öne alınır ve kullanıcıya şeffaf, yargılamayan bir
"mola" bildirimi gösterilir.

Detaylı proje gerekçesi, problem tanımı ve iş modeli için `docs/Huzur_Akisi_Teknik_Rapor.docx` dosyasına bakınız.

## Mimari

```
huzur-akisi/
├── backend/                  # FastAPI tabanlı API servisi
│   ├── app/
│   │   ├── main.py           # Uygulama giriş noktası
│   │   ├── models/sema.py    # Pydantic veri modelleri
│   │   ├── routers/          # API endpoint tanımları
│   │   │   ├── analiz.py     # POST /api/analiz
│   │   │   └── akis.py       # POST /api/akis/sirala
│   │   └── services/
│   │       ├── duygu_analizi.py   # LLM tabanlı duygu analizi
│   │       └── akis_siralama.py   # Akış yeniden sıralama algoritması
│   ├── tests/                # Birim testler (pytest)
│   ├── requirements.txt
│   └── .env.example          # Ortam değişkeni şablonu (gerçek key İÇERMEZ)
├── frontend/                  # React tabanlı örnek arayüz
├── docs/                      # Teknik rapor ve ek dokümanlar
└── .gitignore                 # .env dosyasının repoya girmesini engeller
```

## Kurulum

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env dosyasını açıp ANTHROPIC_API_KEY değerini kendi anahtarınızla doldurun

uvicorn app.main:app --reload --port 8000
```

API dokümantasyonu: `http://localhost:8000/docs`

### Testleri çalıştırma

```bash
cd backend
pytest tests/ -v
```

## API Uç Noktaları

| Metod | Yol | Açıklama |
|---|---|---|
| POST | `/api/analiz/` | Kullanıcı metnini analiz eder, duygu durumu ve skor döner |
| POST | `/api/akis/sirala` | Verilen gönderi listesini duygu durumuna göre yeniden sıralar |
| GET | `/saglik` | Servis sağlık kontrolü |

## Güvenlik Notu

Bu depo, `.env` dosyasını `.gitignore` ile hariç tutar. **API anahtarları
hiçbir zaman kaynak koda gömülmemeli veya commit edilmemelidir.** Yeni bir
ortamda çalıştırırken `.env.example` dosyasını kopyalayıp kendi anahtarınızı
girin.

## Takım

Takım yapısı ve rol dağılımı için teknik rapordaki "8. Takım Yapısı"
bölümüne bakınız (değerlendirme esasları gereği bu depoda kişisel bilgi
paylaşılmamıştır).

## Lisans

Bu proje TEKNOFEST NSosyal İnovasyon Yarışması 2026 kapsamında geliştirilmiştir.
