export const landingNav = [
  { label: 'Özellikler', href: '#ozellikler' },
  { label: 'Nasıl Çalışır?', href: '#nasil-calisir' },
  { label: 'SSS', href: '#sss' },
]

export const landingFeatures = [
  {
    icon: 'qr_code_2',
    title: 'QR Menü',
    text: 'Misafir kodu okutur, menü tarayıcıda açılır. Uygulama indirmek gerekmez.',
  },
  {
    icon: 'restaurant_menu',
    title: 'Kolay Ürün Yönetimi',
    text: 'Ürün adı, açıklama ve fiyat menüde durur. Değişince misafirin gördüğü liste de değişir.',
  },
  {
    icon: 'sell',
    title: 'Anlık Fiyat Güncelleme',
    text: 'Fiyat değişince menü hemen güncellenir. Yeniden baskı almazsınız.',
  },
  {
    icon: 'category',
    title: 'Kategori Yönetimi',
    text: 'Kahve, yemek, tatlı ve içki başlıklarını dilediğiniz sırayla düzenleyin.',
  },
  {
    icon: 'qr_code',
    title: 'Tek QR',
    text: 'İşletmenin tek kodu var. Hangi masaya konursa konulsun aynı menü açılır.',
  },
  {
    icon: 'qr_code',
    title: 'QR Kod Oluşturma',
    text: 'İşletmenizin kodunu oluşturup indirin veya yazdırın.',
  },
  {
    icon: 'image',
    title: 'Görsel Yönetimi',
    text: 'Ürün fotoğraflarını ekleyin. Menü, kâğıt listeden daha anlaşılır olsun.',
  },
  {
    icon: 'translate',
    title: 'Çoklu Dil',
    text: 'Aynı menüyü Türkçe ve diğer dillerde sunun.',
  },
  {
    icon: 'storefront',
    title: 'İşletme Yönetimi',
    text: 'Kafe, restoran veya bar bilgilerinizi tek yerden yönetin.',
  },
  {
    icon: 'health_and_safety',
    title: 'İçerik ve alerjen',
    text: 'Porsiyon, malzeme ve alerjen ürünün içinde durur. Misafir kartı açınca görür.',
  },
]

export const landingSteps = [
  {
    index: '01',
    title: 'İşletmeni yaz',
    text: 'Ad, adres ve çalışma saatini girin. Türkçe ve İngilizce aynı menüde durur.',
  },
  {
    index: '02',
    title: 'Menünü oluştur',
    text: 'Kategorileri, ürünleri, fiyatları ve görselleri girin. Yayınlamadan önce önizleyin.',
  },
  {
    index: '03',
    title: 'Tek kodu masaya koy',
    text: 'Aynı kodu istediğiniz masaya bırakın. Misafir okuttuğunda menü açılır.',
  },
]

export const landingFaqs = [
  {
    question: 'Misafirler uygulama indirmek zorunda mı?',
    answer: 'Hayır. Masadaki QR kodu telefon kamerasıyla okuttuklarında menü tarayıcıda açılır.',
  },
  {
    question: 'Fiyat değişince menü ne zaman güncellenir?',
    answer: 'Kaydettiğiniz anda. Menüyü yeniden bastırmanız gerekmez.',
  },
  {
    question: 'Kurulum için teknik bilgi gerekir mi?',
    answer: 'Gerekmez. İşletmenizi oluşturup ürünleri girmeniz yeterli. Kod yazılmaz.',
  },
  {
    question: 'Her masa için ayrı QR gerekir mi?',
    answer: 'Gerekmez. İşletmenin tek kodu vardır. Aynı kodu bütün masalara koyabilirsiniz.',
  },
  {
    question: 'Menüyü Türkçe dışında da sunabilir miyim?',
    answer: 'Evet. Menü Türkçe ve İngilizce durur. Misafir dili sayfanın içinden değiştirir.',
  },
]

export const dashboardNav = [
  { icon: 'restaurant_menu', label: 'Menü', active: true },
  { icon: 'qr_code', label: 'QR Kod', active: false },
  { icon: 'translate', label: 'Diller', active: false },
]

export const dashboardStats = [
  { label: 'QR', value: '1' },
  { label: 'Dil', value: 'TR / EN' },
  { label: 'Yayındaki ürün', value: '24' },
]

export const dashboardItems = [
  { name: 'Espresso', category: 'Kahveler', price: 90, state: 'Yayında' },
  { name: 'Filtre Kahve', category: 'Kahveler', price: 110, state: 'Yayında' },
  { name: 'Cheesecake', category: 'Tatlılar', price: 220, state: 'Güncellendi' },
]
