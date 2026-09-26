<template>
  <q-card flat class="auth-card">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">Hesap oluştur</h1>
        <p class="auth-card__text">İşletmeniz için bir panel açın. Kart istenmez.</p>
      </header>

      <q-form class="q-gutter-y-sm q-mt-lg" @submit="onSubmit">
        <q-input
          v-model="form.fullName"
          label="Ad Soyad"
          autocomplete="name"
          outlined
          lazy-rules
          :rules="[rules.required]"
        />
        <q-input
          v-model="form.businessName"
          label="İşletme adı"
          autocomplete="organization"
          outlined
          lazy-rules
          :rules="[rules.required]"
        />
        <q-input
          v-model="form.email"
          type="email"
          label="E-posta"
          autocomplete="email"
          outlined
          lazy-rules
          :rules="[rules.required, rules.email]"
        />
        <q-input
          v-model="form.phone"
          type="tel"
          label="Telefon"
          autocomplete="tel"
          outlined
          lazy-rules
          :rules="[rules.required, rules.phone]"
        />
        <AuthPasswordField
          v-model="form.password"
          label="Şifre"
          autocomplete="new-password"
          :rules="[rules.required, rules.password]"
        />
        <AuthPasswordField
          v-model="form.passwordConfirm"
          label="Şifre tekrar"
          autocomplete="new-password"
          :rules="confirmRules"
        />

        <q-field
          v-model="form.acceptedTerms"
          borderless
          dense
          lazy-rules
          class="auth-check"
          :rules="[rules.accepted]"
        >
          <template #control>
            <q-checkbox
              v-model="form.acceptedTerms"
              dense
              label="Kullanım koşullarını kabul ediyorum."
            />
          </template>
        </q-field>

        <q-banner v-if="errorMessage" class="bg-red-1 text-negative" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Ücretsiz başla"
          no-caps
          unelevated
          class="full-width landing-btn"
          :loading="auth.status === 'loading'"
        />
      </q-form>
    </q-card-section>

    <q-card-section class="auth-card__footer">
      Zaten hesabınız var mı?
      <router-link class="auth-link" :to="{ name: 'login' }">Giriş yap</router-link>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import { useAuth } from '@/composables/useAuth'
import { matches, rules } from '@/utils/validators'

const router = useRouter()
const { auth, register } = useAuth()
const errorMessage = ref('')

const form = reactive({
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  acceptedTerms: false,
})

const confirmRules = computed(() => [
  rules.required,
  matches(form.password, 'Şifreler eşleşmiyor.'),
])

async function onSubmit() {
  errorMessage.value = ''

  try {
    await register({
      fullName: form.fullName,
      businessName: form.businessName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      acceptedTerms: form.acceptedTerms,
    })
    router.push({ name: 'admin-dashboard' })
  } catch (error) {
    errorMessage.value = error?.message || 'Kayıt tamamlanamadı.'
  }
}
</script>
