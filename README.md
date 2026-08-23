[README.md](https://github.com/user-attachments/files/31346558/README.md)
# Huzur Akışı — Ruh Hâline Duyarlı Sosyal Medya Deneyimi

**NSosyal İnovasyon Yarışması 2026** · Takım NEXUS · Başvuru ID 5394330 · Tematik Alan: Sosyal Yapay Zekâ

## Proje Özeti

Huzur Akışı, kullanıcının sosyal medya platformundaki anlık ruh hâlini yapay
zekâ destekli analizle tespit ederek, içerik akışını kullanıcı refahına göre
yeniden önceliklendiren bir sistemdir. Kullanıcı olumsuz veya kaygılı bir
duygu durumundaysa toksik/tetikleyici içerikler akışta geriye itilir, pozitif
ve destekleyici içerikler öne alınır ve kullanıcıya şeffaf, yargılamayan bir
"mola" bildirimi gösterilir — her zaman "neden bu sırada?" diyerek gerekçeyi
görebilir.

Detaylı proje gerekçesi, problem tanımı ve iş modeli için `docs/` klasöründeki teknik rapora bakınız.

## Mimari

```
huzur-akisi/
├── backend/                       # FastAPI tabanlı API servisi
│   ├── app/
│   │   ├── main.py                # Giriş noktası: CORS, rate limit, hata yakalama
│   │   ├── models/sema.py         # Pydantic veri modelleri
│   │   ├── routers/
│   │   │   ├── analiz.py          # POST /api/analiz
│   │   │   └── akis.py            # POST /api/akis/sirala
│   │   └── services/
│   │       ├── duygu_analizi.py   # OpenRouter uzerinden LLM cagrisi
│   │       └── akis_siralama.py   # Akis yeniden siralama algoritmasi
│   ├── tests/                     # Birim testler (pytest, 5/5 gecer)
│   ├── requirements.txt
│   ├── render.yaml                # Render.com tek-tik deploy blueprint'i
│   └── .env.example               # Ortam degiskeni sablonu (gercek key ICERMEZ)
├── frontend/                       # React + Vite arayuzu
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js                 # Backend ile tum iletisim
│   │   ├── components/
│   │   │   ├── AkisDalgasi.jsx    # Imza gorsel oge
│   │   │   ├── DuyguGostergesi.jsx
│   │   │   ├── MolaBildirimi.jsx  # Kabul/ertele/kapat akisi
│   │   │   └── GonderiKarti.jsx   # "Neden bu sirada?" seffafligi
│   │   └── styles/global.css
│   ├── vercel.json
│   └── .env.example
├── docs/                           # Teknik rapor
└── .gitignore                      # .env dosyasinin repoya girmesini engeller
```

## Güvenlik — API Anahtarları Hakkında

**Hiçbir API anahtarı bu depoda veya kodun hiçbir yerinde yazılı değildir.**
`.env.example` dosyalarında sadece `xxxxxx` placeholder'ı bulunur. Gerçek
anahtarınızı şu üç yerden birine, sadece kendi ortamınızda ekleyin:

| Ortam | Nereye eklenir |
|---|---|
| Yerel geliştirme | `backend/.env` dosyası (`.env.example`'dan kopyalayın) |
| Render / Railway | Dashboard → Environment Variables |
| Vercel (frontend için `VITE_API_URL`) | Project Settings → Environment Variables |
| GitHub Actions kullanılacaksa | Repo → Settings → Secrets and variables → Actions |

`.gitignore`, `.env` dosyasını tamamen dışlar — `git status` ile kontrol
ettiğinizde asla staged görünmez.

## Kurulum (yerel geliştirme)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env dosyasını açıp OPENROUTER_API_KEY=xxxxxx satırındaki
# xxxxxx yerine openrouter.ai/keys adresinden aldığınız anahtarı yazın

uvicorn app.main:app --reload --port 8000
```

API dokümantasyonu: `http://localhost:8000/docs`
Sağlık kontrolü (key doğru tanımlı mı?): `http://localhost:8000/saglik`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`http://localhost:5173` adresinde açılır.

### Testleri çalıştırma

```bash
cd backend
pytest tests/ -v
```

## Canlıya alma (deploy)

**Backend → Render.com** (ücretsiz katman uygundur)
1. Render'da "New → Blueprint" seçip bu repoyu bağlayın (`render.yaml` otomatik algılanır)
2. Deploy sonrası Dashboard → Environment'tan `OPENROUTER_API_KEY` değerini kendi anahtarınızla girin
3. Servis adresi `https://huzur-akisi-api.onrender.com` gibi bir URL olur

**Frontend → Vercel**
1. Vercel'de "New Project" ile `frontend/` klasörünü içeren bu repoyu bağlayın (Root Directory: `frontend`)
2. Project Settings → Environment Variables → `VITE_API_URL` = backend'in Render adresi
3. Deploy edin

## API Uç Noktaları

| Metod | Yol | Açıklama |
|---|---|---|
| POST | `/api/analiz/` | Kullanıcı metnini analiz eder, duygu durumu ve skor döner |
| POST | `/api/akis/sirala` | Verilen gönderi listesini duygu durumuna göre yeniden sıralar |
| GET | `/saglik` | Servis sağlık kontrolü + LLM yapılandırma durumu |

## Kullanılan Model

Varsayılan olarak OpenRouter üzerinden **ücretsiz** bir model
(`meta-llama/llama-3.1-8b-instruct:free`) kullanılır. `.env` dosyasındaki
`LLM_MODEL` değişkeninden güncel ücretsiz modeller arasında
([openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0))
geçiş yapılabilir; kod, sağlayıcı/model bağımsız çalışacak şekilde tasarlanmıştır.

## Takım

Takım yapısı ve rol dağılımı için teknik rapordaki "8. Takım Yapısı"
bölümüne bakınız (değerlendirme esasları gereği bu depoda kişisel bilgi
paylaşılmamıştır).
