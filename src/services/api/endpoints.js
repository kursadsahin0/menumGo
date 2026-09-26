export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  menus: {
    list: '/menus',
    public: (slug) => `/public/menus/${slug}`,
  },
  menuSettings: {
    current: '/menu-settings',
  },
  business: {
    current: '/business',
  },
  subscription: {
    current: '/subscription',
    plans: '/subscription/plans',
    checkout: '/subscription/checkout',
    cancel: '/subscription/cancel',
  },
  dashboard: {
    overview: '/dashboard',
  },
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
  },
  categories: {
    list: '/categories',
    detail: (id) => `/categories/${id}`,
    order: '/categories/order',
  },
  tables: {
    list: '/tables',
    detail: (id) => `/tables/${id}`,
  },
}
