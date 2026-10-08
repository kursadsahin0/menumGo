<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">Giriş yap</h1>
        <p class="auth-card__text">İşletme panelinize devam edin.</p>
      </header>

      <q-banner v-if="resetNotice" class="bg-green-1 text-positive q-mt-md" rounded>
        Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
      </q-banner>

      <q-form class="q-gutter-y-sm q-mt-lg" @submit="onSubmit">
        <q-input
          v-model="form.email"
          type="email"
          label="E-posta"
          autocomplete="email"
          outlined
          lazy-rules
          :rules="[rules.required, rules.email]"
        />
        <AuthPasswordField
          v-model="form.password"
          label="Şifre"
          autocomplete="current-password"
          :rules="[rules.required]"
        />

        <div class="auth-card__row">
          <q-checkbox v-model="form.remember" label="Beni hatırla" dense />
          <router-link class="auth-link" :to="{ name: 'forgot-password' }">
            Şifremi unuttum
          </router-link>
        </div>

        <q-banner v-if="errorMessage" class="bg-red-1 text-negative" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Giriş yap"
          no-caps
          unelevated
          class="full-width landing-btn q-mt-sm"
          :loading="auth.status === 'loading'"
        />
      </q-form>

      <p class="auth-card__hint">Deneme hesabı: demo@qrmenu.local · demo1234</p>
    </q-card-section>

    <q-card-section class="auth-card__footer">
      Hesabınız yok mu?
      <router-link class="auth-link" :to="{ name: 'register' }">Kayıt ol</router-link>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import { useAuth } from '@/composables/useAuth'
import { rules } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const { auth, login } = useAuth()
const errorMessage = ref('')
const resetNotice = route.query.reset === '1'

const form = reactive({
  email: '',
  password: '',
  remember: true,
})

async function onSubmit() {
  errorMessage.value = ''

  try {
    await login(form)

    if (!auth.emailVerified) {
      router.push({ name: 'verify-pending' })
      return
    }

    if (!auth.hasAccess) {
      router.push({ name: 'admin-billing' })
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    router.push(redirect || { name: 'admin-dashboard' })
  } catch (error) {
    errorMessage.value = error?.message || 'Giriş yapılamadı.'
  }
}
</script>
