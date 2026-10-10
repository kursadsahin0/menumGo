# menümGo

Kafeler, restoranlar ve barlar için dijital menü. Misafir tek bir QR kodu okutur, menüyü tarayıcıda görür. Sipariş veya ödeme yok.

Menü Türkçe ve İngilizce açılır. Üründe fiyat, porsiyon, içerik ve alerjen bulunur. Tükenen ürün işaretlenir.

## Çalıştırma

Node.js 22 veya üzeri gerekir.

```bash
npm install --prefix backend
cp backend/.env.example backend/.env
npm install --prefix frontend
cp frontend/.env.example frontend/.env
npm run dev
```

`npm run dev` arayüzü ve API’yi birlikte açar. Arayüz `http://localhost:9000` adresindedir. İstekler `http://127.0.0.1:3000` üzerindeki API’ye gider. Yalnızca API için `npm run api` yeterlidir.

## Ortam

| Değişken | Açıklama |
| --- | --- |
| `VITE_API_BASE_URL` | API adresi. `/api` iken geliştirme sunucusu istekleri `http://127.0.0.1:3000` adresine iletir. `frontend/.env` içinde tutulur. |

## Deneme

Yerel geliştirmede demo hesap sunucu açılışında oluşturulur. `NODE_ENV=production` iken bu hesap oluşturulmaz; kayıtlıysa girişi kapanır.

Misafir menüsü: `/menu/burger-house`

## Komutlar

```bash
npm run dev         # arayüz ve API birlikte
npm run build       # üretim derlemesi
npm test            # API ve arayüz testleri
npm run lint        # biçim ve lint düzeltmesi
npm run lint:check  # biçim ve lint kontrolü
```

Veritabanı şeması `backend/prisma/migrations` altındaki migration ile kurulur. Mevcut bir veritabanında `npm run db:migrate --prefix backend` bekleyen migration’ları uygular.

## Dağıtım

`docker compose up --build` Postgres, API ve arayüzü açar. Arayüz `http://localhost:8080` adresindedir. API yalnızca konteyner ağında dinler; dışarıya 8080 üzerinden, `/api` yoluyla çıkar. `NODE_ENV=production` ile doğrudan çalışan API `127.0.0.1` adresine bağlanır.
