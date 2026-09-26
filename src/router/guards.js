import { useAuthStore } from '@/stores/auth'

export function registerGuards(router, pinia) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)

    if (auth.token && !auth.sessionChecked) {
      try {
        await auth.fetchUser()
      } catch {
        // Invalid sessions are cleared in the store.
      }
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta.guestOnly)

    if (requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }

    if (guestOnly && auth.isAuthenticated) {
      return { name: 'admin-dashboard' }
    }

    return true
  })
}
