export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    password: '/auth/password',
  },
  menus: {
    public: (slug) => `/public/menus/${slug}`,
    view: (slug) => `/public/menus/${slug}/views`,
    productView: (slug, productId) => `/public/menus/${slug}/products/${productId}/views`,
  },
  menuSettings: {
    current: '/menu-settings',
  },
  business: {
    current: '/business',
  },
  subscription: {
    current: '/subscription',
    checkout: '/subscription/checkout',
    cancel: '/subscription/cancel',
  },
  dashboard: {
    overview: '/dashboard',
  },
  stats: {
    report: '/stats',
  },
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    order: '/products/order',
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
  notifications: {
    list: '/notifications',
    read: '/notifications/read',
  },
}
