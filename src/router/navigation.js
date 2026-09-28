export const adminNavigation = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    to: { name: 'admin-dashboard' },
    exact: true,
  },
  {
    label: 'Menü',
    icon: 'restaurant_menu',
    children: [
      {
        label: 'Kategoriler',
        icon: 'category',
        to: { name: 'admin-categories' },
      },
      {
        label: 'Ürünler',
        icon: 'lunch_dining',
        to: { name: 'admin-products' },
      },
      {
        label: 'Menü Ayarları',
        icon: 'tune',
        to: { name: 'admin-menu-settings' },
      },
    ],
  },
  {
    label: 'QR Kodlar',
    icon: 'qr_code_2',
    to: { name: 'admin-qr' },
  },
  {
    label: 'İstatistikler',
    icon: 'insights',
    to: { name: 'admin-stats' },
  },
  {
    label: 'İşletme Ayarları',
    icon: 'storefront',
    to: { name: 'admin-business' },
  },
]

export const adminNotifications = [
  {
    id: 'ntf_1',
    title: 'Masa 4 menüyü açtı',
    time: '4 dk önce',
    unread: true,
  },
  {
    id: 'ntf_2',
    title: 'Cheesecake fiyatı kaydedildi',
    time: '1 sa önce',
    unread: true,
  },
  {
    id: 'ntf_3',
    title: 'Haftalık görüntülenme özeti hazır',
    time: 'Dün',
    unread: false,
  },
]
