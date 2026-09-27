<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="account-settings">
        <article class="account-sheet">
          <header class="account-sheet__hero">
            <div class="account-sheet__avatar" aria-hidden="true">{{ initials }}</div>
            <div>
              <h2>{{ displayName }}</h2>
              <p>{{ auth.user?.email }}</p>
            </div>
          </header>

          <section class="account-sheet__section">
            <h3 class="account-sheet__label">Hesap</h3>
            <q-form class="account-sheet__fields" greedy @submit="saveAccount">
              <q-input
                v-model="account.fullName"
                label="Ad soyad"
                outlined
                dense
                lazy-rules
                autocomplete="name"
                :rules="[rules.required]"
              />
              <div class="account-sheet__split">
                <q-input
                  v-model="account.email"
                  type="email"
                  label="E-posta"
                  outlined
                  dense
                  lazy-rules
                  autocomplete="email"
                  :rules="[rules.required, rules.email]"
                />
                <q-input
                  v-model="account.phone"
                  type="tel"
                  label="Telefon"
                  outlined
                  dense
                  lazy-rules
                  autocomplete="tel"
                  :rules="[rules.required, rules.phone]"
                />
              </div>
              <div class="account-sheet__footer">
                <p v-if="accountDirty" class="account-sheet__status">Kaydedilmemiş değişiklik var.</p>
                <q-btn
                  class="account-sheet__save"
                  type="submit"
                  unelevated
                  no-caps
                  color="primary"
                  label="Kaydet"
                  :loading="savingAccount"
                  :disable="!accountDirty"
                />
              </div>
            </q-form>
          </section>

          <section class="account-sheet__section">
            <h3 class="account-sheet__label">Şifre</h3>
            <q-form
              ref="passwordForm"
              class="account-sheet__fields"
              greedy
              @submit="savePassword"
            >
              <AuthPasswordField
                v-model="password.current"
                dense
                label="Mevcut şifre"
                autocomplete="current-password"
                :rules="[rules.required]"
              />
              <div class="account-sheet__split">
                <AuthPasswordField
                  v-model="password.next"
                  dense
                  label="Yeni şifre"
                  autocomplete="new-password"
                  :rules="[rules.required, rules.password]"
                />
                <AuthPasswordField
                  v-model="password.confirm"
                  dense
                  label="Yeni şifre tekrar"
                  autocomplete="new-password"
                  :rules="[rules.required, confirmMatches]"
                />
              </div>
              <div class="account-sheet__footer">
                <p v-if="passwordDirty" class="account-sheet__status">Kaydedilmemiş değişiklik var.</p>
                <q-btn
                  class="account-sheet__save"
                  type="submit"
                  unelevated
                  no-caps
                  color="primary"
                  label="Şifreyi güncelle"
                  :loading="savingPassword"
                  :disable="!passwordDirty"
                />
              </div>
            </q-form>
          </section>

          <section class="account-sheet__section">
            <div class="account-sheet__theme">
              <div>
                <h3>Koyu tema</h3>
                <p>Panel koyu görünür. Menü sayfası kendi renginde kalır.</p>
              </div>
              <q-toggle
                :model-value="isDark"
                color="primary"
                aria-label="Koyu tema"
                @update:model-value="setDark"
              />
            </div>
          </section>
        </article>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/utils/constants'
import { matches, rules } from '@/utils/validators'

const $q = useQuasar()
const auth = useAuthStore()
const { notifySuccess, notifyError } = useNotify()
const passwordForm = ref(null)
const savingAccount = ref(false)
const savingPassword = ref(false)
const isDark = computed(() => $q.dark.isActive)
const displayName = computed(() => auth.user?.fullName || 'Hesap')
const initials = computed(() => {
  const parts = displayName.value.split(' ').filter(Boolean).slice(0, 2)
  return (
    parts
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'Q'
  )
})

const account = reactive({
  fullName: '',
  email: '',
  phone: '',
})

const password = reactive({
  current: '',
  next: '',
  confirm: '',
})

const confirmMatches = computed(() => matches(password.next, 'Şifreler eşleşmiyor.'))
const accountDirty = computed(() => {
  const user = auth.user
  if (!user) {
    return false
  }

  return (
    account.fullName.trim() !== (user.fullName || '') ||
    account.email.trim() !== (user.email || '') ||
    account.phone.trim() !== (user.phone || '')
  )
})
const passwordDirty = computed(
  () => Boolean(password.current || password.next || password.confirm),
)

watch(
  () => auth.user,
  (user) => {
    account.fullName = user?.fullName || ''
    account.email = user?.email || ''
    account.phone = user?.phone || ''
  },
  { immediate: true },
)

function setDark(value) {
  $q.dark.set(value)
  localStorage.setItem(STORAGE_KEYS.dark, value ? 'true' : 'false')
}

async function saveAccount() {
  savingAccount.value = true

  try {
    await auth.updateAccount({
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
    })
    notifySuccess('Hesap kaydedildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    savingAccount.value = false
  }
}

async function savePassword() {
  savingPassword.value = true

  try {
    await auth.changePassword({
      currentPassword: password.current,
      password: password.next,
    })
    password.current = ''
    password.next = ''
    password.confirm = ''
    passwordForm.value?.resetValidation()
    notifySuccess('Şifre güncellendi.')
  } catch (error) {
    notifyError(error)
  } finally {
    savingPassword.value = false
  }
}
</script>
