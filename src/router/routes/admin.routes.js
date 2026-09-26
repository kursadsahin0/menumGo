const section = () => import('@/pages/admin/SectionPage.vue')

export default [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        meta: { title: 'Dashboard' },
        component: () => import('@/pages/admin/DashboardPage.vue'),
      },
      {
        path: 'products',
        name: 'admin-products',
        meta: { title: 'Ürünler' },
        component: () => import('@/pages/admin/ProductsPage.vue'),
      },
      {
        path: 'categories',
        redirect: { name: 'admin-products' },
      },
      {
        path: 'menu-settings',
        name: 'admin-menu-settings',
        meta: { title: 'Menü Ayarları' },
        component: () => import('@/pages/admin/MenuSettingsPage.vue'),
      },
      {
        path: 'qr-codes',
        name: 'admin-qr',
        meta: { title: 'QR Kodlar' },
        component: () => import('@/pages/admin/QrCodesPage.vue'),
      },
      {
        path: 'tables',
        redirect: { name: 'admin-qr' },
      },
      {
        path: 'orders',
        name: 'admin-orders',
        meta: { title: 'Siparişler', lead: 'Gelen siparişler burada listelenecek.' },
        component: section,
      },
      {
        path: 'stats',
        name: 'admin-stats',
        meta: { title: 'İstatistikler', lead: 'Ayrıntılı istatistikler burada olacak.' },
        component: section,
      },
      {
        path: 'settings/business',
        name: 'admin-business',
        meta: { title: 'İşletme Ayarları' },
        component: () => import('@/pages/admin/BusinessSettingsPage.vue'),
      },
      {
        path: 'venue',
        redirect: { name: 'admin-business' },
      },
      {
        path: 'subscription',
        redirect: { name: 'admin-dashboard' },
      },
      {
        path: 'settings',
        name: 'admin-settings',
        meta: { title: 'Ayarlar', lead: 'Hesap ayarları burada olacak.' },
        component: section,
      },
      {
        path: 'profile',
        name: 'admin-profile',
        meta: { title: 'Profil', lead: 'Profil bilgileriniz burada düzenlenecek.' },
        component: section,
      },
    ],
  },
]
