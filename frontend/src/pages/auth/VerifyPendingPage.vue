<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">E-posta doğrulanmadı</h1>
        <p class="auth-card__text">
          Panele girmek için {{ auth.user?.email }} adresine gelen bağlantıya tıklayın.
        </p>
      </header>

      <q-banner v-if="sent" class="bg-green-1 text-positive q-mt-md" rounded>
        Doğrulama e-postası gönderildi.
      </q-banner>

      <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md" rounded>
        {{ errorMessage }}
      </q-banner>

        <q-btn
          color="primary"
          label="Doğrulama gönder"
          no-caps
          unelevated
          class="full-width landing-btn q-mt-lg"
          :loading="sending"
          @click="send()"
        />
    </q-card-section>

    <q-card-section class="auth-card__footer">
      <button type="button" class="auth-link auth-link--button" @click="onLogout">Çıkış yap</button>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const sending = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function send({ silent = false } = {}) {
  sending.value = true
  if (!silent) errorMessage.value = ''

  try {
    await auth.sendVerification()
    sent.value = true
  } catch (error) {
    if (!silent || !sent.value) {
      errorMessage.value = error?.message || 'Doğrulama e-postası gönderilemedi.'
    }
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  send({ silent: true })
})

async function onLogout() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>
