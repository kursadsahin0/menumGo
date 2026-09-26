<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">Şifrenizi sıfırlayın</h1>
        <p class="auth-card__text">
          Hesabınıza bağlı e-postayı yazın. Sıfırlama bağlantısı gönderilir.
        </p>
      </header>

      <q-banner v-if="sent" class="bg-green-1 text-positive q-mt-md" rounded>
        Bu e-posta kayıtlıysa sıfırlama bağlantısı hazır.
        <router-link
          v-if="resetToken"
          class="auth-link"
          :to="{ name: 'reset-password', query: { token: resetToken } }"
        >
          Sıfırlama sayfasını aç
        </router-link>
      </q-banner>

      <q-form v-else class="q-gutter-y-sm q-mt-lg" @submit="onSubmit">
        <q-input
          v-model="email"
          type="email"
          label="E-posta"
          autocomplete="email"
          outlined
          lazy-rules
          :rules="[rules.required, rules.email]"
        />

        <q-banner v-if="errorMessage" class="bg-red-1 text-negative" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Bağlantı gönder"
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
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { rules } from '@/utils/validators'

const { auth, forgotPassword } = useAuth()
const email = ref('')
const errorMessage = ref('')
const sent = ref(false)
const resetToken = ref('')

async function onSubmit() {
  errorMessage.value = ''

  try {
    const result = await forgotPassword({ email: email.value })
    resetToken.value = result?.resetToken || ''
    sent.value = true
  } catch (error) {
    errorMessage.value = error?.message || 'Bağlantı gönderilemedi.'
  }
}
</script>
