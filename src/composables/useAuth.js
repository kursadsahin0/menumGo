import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const auth = useAuthStore()

  return {
    auth,
    isAuthenticated: () => auth.isAuthenticated,
    login: (payload) => auth.login(payload),
    register: (payload) => auth.register(payload),
    logout: () => auth.logout(),
    fetchUser: () => auth.fetchUser(),
    forgotPassword: (payload) => auth.forgotPassword(payload),
    resetPassword: (payload) => auth.resetPassword(payload),
  }
}
