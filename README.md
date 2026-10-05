# menümGo

Kafeler, restoranlar ve barlar için dijital menü. Misafir tek bir QR kodu okutur, menüyü tarayıcıda görür. Sipariş veya ödeme yok.

Menü Türkçe ve İngilizce açılır. Üründe fiyat, porsiyon, içerik ve alerjen bulunur. Tükenen ürün işaretlenir.

## Çalıştırma

Node.js 22 veya üzeri gerekir.

```bash
npm install
cp .env.example .env
npm install --prefix server
cp server/.env.example server/.env
npm run api
npm run dev
```

Arayüz `http://localhost:9000` adresinde açılır. Hesaplar `npm run api` ile çalışan API üzerinden PostgreSQL'e yazılır.

## Ortam

| Değişken | Açıklama |
| --- | --- |
| `VITE_API_BASE_URL` | API adresi. `/api` iken geliştirme sunucusu istekleri `http://127.0.0.1:3000` adresine iletir. |
| `VITE_USE_MOCK` | Varsayılan kapalıdır. `true` yalnızca abonelik çağrılarını yerel veriye çevirir. Ürün, kategori, menü ve hesap istekleri her zaman API'ye gider. |

## Deneme

Panel girişi: `demo@qrmenu.local` / `demo1234`

Misafir menüsü: `/menu/burger-house`

## Komutlar

```bash
npm run dev         # geliştirme
npm run build       # üretim derlemesi
npm run lint        # biçim ve lint düzeltmesi
npm run lint:check  # biçim ve lint kontrolü
```
# deneme
