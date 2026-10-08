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
npm run dev
```

`npm run dev` arayüzü ve API’yi birlikte açar. Arayüz `http://localhost:9000` adresindedir. İstekler `http://127.0.0.1:3000` üzerindeki API’ye gider. Yalnızca API için `npm run api` yeterlidir.

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
npm run dev         # arayüz ve API birlikte
npm run build       # üretim derlemesi
npm run lint        # biçim ve lint düzeltmesi
npm run lint:check  # biçim ve lint kontrolü
```
# deneme
