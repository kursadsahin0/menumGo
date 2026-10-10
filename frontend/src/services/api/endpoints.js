export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    sendVerification: '/auth/verify-email/send',
    slug: '/auth/slug',
    password: '/auth/password',
  },
  menus: {
    public: (slug) => `/public/menus/${slug}`,
    view: (slug) => `/public/menus/${slug}/views`,
    waiter: (slug) => `/public/menus/${slug}/waiter`,
    wifi: (slug) => `/public/menus/${slug}/wifi`,
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
    clear: '/notifications',
  },
  push: {
    publicKey: '/push/public-key',
    subscription: '/push/subscription',
  },
}
