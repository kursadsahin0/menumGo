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
    label: 'Adisyonlar',
    icon: 'receipt_long',
    to: { name: 'admin-orders' },
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

/** Mobil alt sekme (app shell) */
export const adminMobileTabs = [
  {
    id: 'home',
    label: 'Özet',
    icon: 'space_dashboard',
    to: { name: 'admin-dashboard' },
    names: ['admin-dashboard'],
  },
  {
    id: 'menu',
    label: 'Menü',
    icon: 'restaurant_menu',
    to: { name: 'admin-products' },
    names: ['admin-products', 'admin-categories', 'admin-menu-settings'],
  },
  {
    id: 'tables',
    label: 'Masalar',
    icon: 'table_restaurant',
    to: { name: 'admin-tables' },
    names: ['admin-tables'],
  },
  {
    id: 'orders',
    label: 'Adisyon',
    icon: 'receipt_long',
    to: { name: 'admin-orders' },
    names: ['admin-orders'],
  },
  {
    id: 'more',
    label: 'Diğer',
    icon: 'apps',
    action: 'more',
    names: ['admin-qr', 'admin-stats', 'admin-business', 'admin-profile', 'admin-billing'],
  },
]

export const adminMobileMore = [
  { label: 'Kategoriler', icon: 'category', to: { name: 'admin-categories' } },
  { label: 'Menü Ayarları', icon: 'tune', to: { name: 'admin-menu-settings' } },
  { label: 'QR Kodlar', icon: 'qr_code_2', to: { name: 'admin-qr' } },
  { label: 'İstatistikler', icon: 'insights', to: { name: 'admin-stats' } },
  { label: 'İşletme', icon: 'storefront', to: { name: 'admin-business' } },
  { label: 'Profil', icon: 'person_outline', to: { name: 'admin-profile' } },
  { label: 'İletişim', icon: 'call', to: { name: 'admin-billing' } },
]
