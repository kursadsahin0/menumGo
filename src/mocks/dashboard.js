import { wait } from '@/mocks/config'

const overview = {
  stats: [
    { key: 'products', label: 'Toplam ürün', value: 24, icon: 'lunch_dining' },
    { key: 'activeProducts', label: 'Aktif ürün', value: 21, icon: 'check_circle' },
    { key: 'categories', label: 'Kategori sayısı', value: 6, icon: 'category' },
    { key: 'tables', label: 'Masa sayısı', value: 12, icon: 'table_restaurant' },
    { key: 'views', label: 'Menü görüntülenme', value: 1840, icon: 'visibility' },
    { key: 'viewsToday', label: 'Bugünkü görüntülenme', value: 128, icon: 'today' },
    { key: 'viewsMonth', label: 'Aylık görüntülenme', value: 964, icon: 'calendar_month' },
  ],
  views: {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    values: [96, 110, 88, 132, 154, 176, 128],
  },
  popularCategories: [
    { id: 'cat_1', name: 'Kahveler', views: 640 },
    { id: 'cat_2', name: 'Tatlılar', views: 410 },
    { id: 'cat_3', name: 'Soğuk içecekler', views: 286 },
    { id: 'cat_4', name: 'Atıştırmalıklar', views: 154 },
  ],
  popularProducts: [
    { id: 'itm_1', name: 'Filtre Kahve', category: 'Kahveler', views: 248 },
    { id: 'itm_2', name: 'Cheesecake', category: 'Tatlılar', views: 196 },
    { id: 'itm_3', name: 'Espresso', category: 'Kahveler', views: 171 },
    { id: 'itm_4', name: 'Limonata', category: 'Soğuk içecekler', views: 124 },
  ],
  activity: [
    {
      id: 'act_1',
      title: 'Espresso fiyatı 90 TL olarak güncellendi',
      time: '12 dk önce',
      icon: 'sell',
    },
    {
      id: 'act_2',
      title: 'Menü QR kodu indirildi',
      time: '34 dk önce',
      icon: 'qr_code_2',
    },
    {
      id: 'act_3',
      title: 'Cheesecake görseli eklendi',
      time: '2 sa önce',
      icon: 'image',
    },
    {
      id: 'act_4',
      title: 'Tatlılar kategorisi yayına alındı',
      time: 'Dün',
      icon: 'category',
    },
  ],
}

export async function mockGetDashboard() {
  await wait()
  return overview
}
