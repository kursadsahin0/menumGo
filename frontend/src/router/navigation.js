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
    label: 'Masalar',
    icon: 'table_restaurant',
    to: { name: 'admin-tables' },
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
  {
    label: 'Profil',
    icon: 'person_outline',
    to: { name: 'admin-profile' },
  },
  {
    label: 'İletişim',
    icon: 'call',
    to: { name: 'admin-billing' },
  },
]
