# menümGo

Kafeler, restoranlar ve barlar için dijital menü. Misafir tek bir QR kodu okutur, menüyü tarayıcıda görür. Sipariş veya ödeme yok.

Menü Türkçe ve İngilizce açılır. Üründe fiyat, porsiyon, içerik ve alerjen bulunur. Tükenen ürün işaretlenir.

## Çalıştırma

Node.js 22 veya üzeri gerekir.

```bash
npm install
cp .env.example .env
npm run dev
```

Uygulama `http://localhost:9000` adresinde açılır.

## Ortam

| Değişken | Açıklama |
| --- | --- |
| `VITE_USE_MOCK` | `true` iken istekler yerel veriye gider. Varsayılan budur. |
| `VITE_API_BASE_URL` | `VITE_USE_MOCK=false` iken kullanılacak API adresi. |

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
