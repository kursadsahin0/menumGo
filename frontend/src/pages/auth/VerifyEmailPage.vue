<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">E-posta doğrulama</h1>
        <p class="auth-card__text">
          {{ verified ? 'E-posta adresiniz doğrulandı.' : 'Doğrulama bağlantısı kontrol ediliyor.' }}
        </p>
      </header>

      <q-banner v-if="!token" class="bg-red-1 text-negative q-mt-md" rounded>
        Doğrulama bağlantısı eksik.
      </q-banner>

      <q-banner v-else-if="errorMessage" class="bg-red-1 text-negative q-mt-md" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-banner v-else-if="verified" class="bg-green-1 text-positive q-mt-md" rounded>
        Bu adres artık hesabınıza bağlı.
      </q-banner>

      <div v-else class="q-mt-lg">
        <q-spinner color="primary" size="28px" />
      </div>
    </q-card-section>

    <q-card-section class="auth-card__footer">
      <router-link class="auth-link" :to="nextLink">{{ nextLabel }}</router-link>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const verified = ref(false)
const errorMessage = ref('')
const token = typeof route.query.token === 'string' ? route.query.token : ''
const nextLink = computed(() =>
  auth.isAuthenticated ? { name: auth.entryRoute } : { name: 'login' },
)
const nextLabel = computed(() => (auth.isAuthenticated ? 'Panele dön' : 'Girişe dön'))

onMounted(async () => {
  if (!token) {
    return
  }

  try {
    const result = await auth.verifyEmail({ token })
    verified.value = true

    if (auth.isAuthenticated && result?.email === auth.user?.email) {
      await auth.fetchUser()
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.'
  }
})
</script>
