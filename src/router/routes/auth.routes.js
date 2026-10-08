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
        meta: { title: 'Şifremi unuttum', allowAuthenticated: true },
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        meta: { title: 'Şifre sıfırla', allowAuthenticated: true },
        component: () => import('@/pages/auth/ResetPasswordPage.vue'),
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        meta: { title: 'E-posta doğrula', allowAuthenticated: true },
        component: () => import('@/pages/auth/VerifyEmailPage.vue'),
      },
      {
        path: 'verify-pending',
        name: 'verify-pending',
        meta: { title: 'E-posta doğrulanmadı', allowAuthenticated: true },
        component: () => import('@/pages/auth/VerifyPendingPage.vue'),
      },
    ],
  },
]
