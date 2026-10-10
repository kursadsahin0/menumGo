<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">Yeni şifre</h1>
        <p class="auth-card__text">Hesabınız için yeni bir şifre belirleyin.</p>
      </header>

      <q-banner v-if="!token" class="bg-red-1 text-negative q-mt-md" rounded>
        Sıfırlama bağlantısı eksik.
        <router-link class="auth-link" :to="{ name: 'forgot-password' }"
          >Yeni bağlantı iste</router-link
        >
      </q-banner>

      <q-form v-else class="q-gutter-y-sm q-mt-lg" @submit="onSubmit">
        <AuthPasswordField
          v-model="form.password"
          label="Yeni şifre"
          autocomplete="new-password"
          :rules="[rules.required, rules.password]"
        />
        <AuthPasswordField
          v-model="form.passwordConfirm"
          label="Yeni şifre tekrar"
          autocomplete="new-password"
          :rules="confirmRules"
        />

        <q-banner v-if="errorMessage" class="bg-red-1 text-negative" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Şifreyi güncelle"
          no-caps
          unelevated
          class="full-width landing-btn"
          :loading="auth.status === 'loading'"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="auth-card__footer">
      <router-link class="auth-link" :to="{ name: 'login' }">Girişe dön</router-link>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import { useAuth } from '@/composables/useAuth'
import { matches, rules } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const { auth, resetPassword } = useAuth()
const errorMessage = ref('')
const token = typeof route.query.token === 'string' ? route.query.token : ''

const form = reactive({
  password: '',
  passwordConfirm: '',
})

const confirmRules = computed(() => [
  rules.required,
  matches(form.password, 'Şifreler eşleşmiyor.'),
])

async function onSubmit() {
  errorMessage.value = ''

  try {
    await resetPassword({
      token,
      password: form.password,
    })
    router.push({ name: 'login', query: { reset: '1' } })
  } catch (error) {
    errorMessage.value = error?.message || 'Şifre güncellenemedi.'
  }
}
</script>
