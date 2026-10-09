<template>
  <q-card flat class="auth-card auth-card--fit">
    <q-card-section>
      <header>
        <h1 class="auth-card__title">Hesap oluştur</h1>
        <p class="auth-card__text">
          Kayıtla 7 gün ücretsiz denersiniz. Süre bitince satın almak için ararsınız.
        </p>
      </header>

      <q-form class="auth-form" @submit="onSubmit">
        <q-input
          v-model="form.fullName"
          label="Ad Soyad"
          autocomplete="name"
          outlined
          dense
          hide-bottom-space
          lazy-rules
          :rules="[rules.required]"
        />
        <q-input
          v-model="form.businessName"
          label="İşletme adı"
          autocomplete="organization"
          outlined
          dense
          hide-bottom-space
          lazy-rules
          :rules="[rules.required]"
        />
        <q-input
          v-model="form.email"
          type="email"
          label="E-posta"
          autocomplete="email"
          outlined
          dense
          hide-bottom-space
          lazy-rules
          :rules="[rules.required, rules.email]"
        />
        <q-input
          v-model="form.phone"
          type="tel"
          label="Telefon"
          autocomplete="tel"
          outlined
          dense
          hide-bottom-space
          lazy-rules
          :rules="[rules.required, rules.phone]"
        />
        <AuthPasswordField
          v-model="form.password"
          label="Şifre"
          autocomplete="new-password"
          dense
          hide-bottom-space
          :rules="[rules.required, rules.password]"
        />
        <AuthPasswordField
          v-model="form.passwordConfirm"
          label="Şifre tekrar"
          autocomplete="new-password"
          dense
          hide-bottom-space
          :rules="confirmRules"
        />

        <q-field
          v-model="form.acceptedTerms"
          borderless
          dense
          hide-bottom-space
          lazy-rules
          class="auth-check auth-form__wide"
          :rules="[rules.accepted]"
        >
          <template #control>
            <q-checkbox v-model="form.acceptedTerms" dense>
              <span class="auth-consent">
                <router-link class="auth-link" :to="{ name: 'terms' }" target="_blank" rel="noopener" @click.stop>Kullanım koşullarını</router-link>,
                <router-link class="auth-link" :to="{ name: 'privacy' }" target="_blank" rel="noopener" @click.stop>gizlilik bildirimini</router-link>
                ve
                <router-link class="auth-link" :to="{ name: 'kvkk' }" target="_blank" rel="noopener" @click.stop>KVKK aydınlatma metnini</router-link>
                okudum, kabul ediyorum.
              </span>
            </q-checkbox>
          </template>
        </q-field>

        <q-banner v-if="errorMessage" class="auth-form__wide bg-red-1 text-negative" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Hesap oluştur"
          no-caps
          unelevated
          class="auth-form__wide full-width landing-btn"
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
import { termsVersion } from '@/data/legal'
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
      termsVersion,
    })
    router.push({ name: auth.entryRoute })
  } catch (error) {
    errorMessage.value = error?.message || 'Kayıt tamamlanamadı.'
  }
}
</script>
