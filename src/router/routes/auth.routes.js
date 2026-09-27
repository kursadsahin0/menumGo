export default [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      {
        path: 'login',
        name: 'login',
        meta: { title: 'Giriş' },
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
      {
        path: 'register',
        name: 'register',
        meta: { title: 'Kayıt' },
        component: () => import('@/pages/auth/RegisterPage.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        meta: { title: 'Şifremi unuttum' },
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        meta: { title: 'Şifre sıfırla' },
        component: () => import('@/pages/auth/ResetPasswordPage.vue'),
      },
    ],
  },
]
