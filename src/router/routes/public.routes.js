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
