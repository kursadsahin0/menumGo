import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import publicRoutes from './routes/public.routes'

const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
