export default [
  {
    path: '/',
    component: () => import('@/layouts/LandingLayout.vue'),
    children: [
      {
        path: '',
        name: 'public-home',
        component: () => import('@/pages/public/HomePage.vue'),
      },
      {
        path: 'kullanim-kosullari',
        name: 'terms',
        meta: {
          title: 'Kullanım koşulları',
          description: 'menümGo hesabı ve dijital menünün kullanım koşulları.',
          document: 'terms',
        },
        component: () => import('@/pages/public/LegalPage.vue'),
      },
      {
        path: 'gizlilik',
        name: 'privacy',
        meta: {
          title: 'Gizlilik bildirimi',
          description: 'menümGo hesabında ve misafir menüsünde işlenen veriler.',
          document: 'privacy',
        },
        component: () => import('@/pages/public/LegalPage.vue'),
      },
      {
        path: 'kvkk',
        name: 'kvkk',
        meta: {
          title: 'KVKK aydınlatma metni',
          description: '6698 sayılı Kanun kapsamında menümGo aydınlatma metni.',
          document: 'kvkk',
        },
        component: () => import('@/pages/public/LegalPage.vue'),
      },
    ],
  },
  {
    path: '/menu/:restaurantSlug',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'public-menu',
        component: () => import('@/pages/public/PublicMenuPage.vue'),
      },
    ],
  },
  {
    path: '/m/:restaurantSlug',
    redirect: (to) => ({
      name: 'public-menu',
      params: { restaurantSlug: to.params.restaurantSlug },
    }),
  },
]
