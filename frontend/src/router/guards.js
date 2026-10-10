import { useAuthStore } from '@/stores/auth'
import { APP_NAME } from '@/utils/constants'
import { applySeo, HOME_TITLE, homeJsonLd, SITE_DESCRIPTION } from '@/utils/seo'

export function registerGuards(router, pinia) {
  applySeo()

  router.afterEach((to) => {
    const isPrivate = to.matched.some((record) => record.meta.requiresAuth || record.meta.guestOnly)
    const pageTitle = [...to.matched].reverse().find((record) => record.meta.title)?.meta.title
    const title =
      to.name === 'public-home' ? HOME_TITLE : pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME

    applySeo({
      title: to.name === 'public-menu' ? `Menü · ${APP_NAME}` : title,
      description: to.meta.description || SITE_DESCRIPTION,
      robots: isPrivate ? 'noindex, nofollow' : 'index, follow',
      path: to.path,
      jsonLd: to.name === 'public-home' ? homeJsonLd() : null,
    })
  })

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

    if (to.name === 'verify-pending' && auth.isAuthenticated) {
      return { name: auth.entryRoute }
    }

    const allowsUnpaid = to.matched.some((record) => record.meta.allowWithoutSubscription)

    if (requiresAuth && auth.isAuthenticated && !auth.hasAccess && !allowsUnpaid) {
      return { name: 'admin-billing' }
    }

    if (guestOnly && auth.isAuthenticated && !to.meta.allowAuthenticated) {
      return { name: auth.entryRoute }
    }

    return true
  })
}
