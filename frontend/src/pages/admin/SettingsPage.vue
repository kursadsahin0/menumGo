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
              <p>{{ auth.user?.emailVerified ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı' }}</p>
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
              <p v-if="!auth.user?.emailVerified" class="account-sheet__note">
                Doğrulama bağlantısı e-postanıza gider.
                <button
                  type="button"
                  class="account-sheet__link"
                  :disabled="sendingVerification"
                  @click="sendVerification"
                >
                  Doğrulama gönder
                </button>
              </p>
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
            <h3 class="account-sheet__label">Menü adresi</h3>
            <q-form class="account-sheet__fields" greedy @submit="saveSlug">
              <q-input
                v-model="slug"
                label="Adres"
                outlined
                dense
                lazy-rules
                prefix="/menu/"
                :rules="[rules.required, slugLength]"
              />
              <p class="account-sheet__note">
                Misafir menüsü {{ menuAddress }} adresinde açılır. Basılı QR kodları yeni adres için
                yeniden yazdırın.
              </p>
              <div class="account-sheet__footer">
                <p v-if="slugDirty" class="account-sheet__status">Kaydedilmemiş değişiklik var.</p>
                <q-btn
                  class="account-sheet__save"
                  type="submit"
                  unelevated
                  no-caps
                  color="primary"
                  label="Adresi kaydet"
                  :loading="savingSlug"
                  :disable="!slugDirty"
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
            <h3 class="account-sheet__label">Hesabı sil</h3>
            <div class="account-sheet__theme">
              <div>
                <h3>Menü ve hesap birlikte silinir</h3>
                <p>Ürünler, masalar, QR adresi ve bildirimler de kalkar.</p>
              </div>
              <q-btn
                unelevated
                no-caps
                color="negative"
                label="Hesabı sil"
                @click="deleteOpen = true"
              />
            </div>
          </section>

          <q-dialog v-model="deleteOpen">
            <q-card class="account-delete">
              <q-card-section>
                <h2 class="account-delete__title">Hesabı sil</h2>
                <p class="account-delete__text">
                  Devam etmek için mevcut şifrenizi yazın. Bu işlem geri alınamaz.
                </p>
              </q-card-section>
              <q-form @submit="removeAccount">
                <q-card-section>
                  <AuthPasswordField
                    v-model="deletePassword"
                    dense
                    label="Mevcut şifre"
                    autocomplete="current-password"
                    :rules="[rules.required]"
                  />
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat no-caps label="Vazgeç" @click="deleteOpen = false" />
                  <q-btn
                    type="submit"
                    unelevated
                    no-caps
                    color="negative"
                    label="Hesabı sil"
                    :loading="deleting"
                  />
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

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

      <UnsavedChanges :dirty="profileDirty" @discard="discardEdits" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import UnsavedChanges from '@/components/common/UnsavedChanges.vue'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/utils/constants'
import { absoluteMenuUrl } from '@/utils/menuUrl'
import { matches, rules } from '@/utils/validators'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const { notifySuccess, notifyError } = useNotify()
const passwordForm = ref(null)
const savingAccount = ref(false)
const savingPassword = ref(false)
const savingSlug = ref(false)
const sendingVerification = ref(false)
const deleting = ref(false)
const deleteOpen = ref(false)
const deletePassword = ref('')
const slug = ref('')
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
const slugLength = (value) =>
  String(value || '').trim().length >= 3 || 'Menü adresi en az 3 karakter olmalı.'
const menuAddress = computed(() => absoluteMenuUrl(`/menu/${slug.value.trim() || 'adres'}`))
const slugDirty = computed(() => slug.value.trim() !== (auth.user?.tenant?.slug || ''))
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
const profileDirty = computed(() => accountDirty.value || slugDirty.value || passwordDirty.value)

function discardEdits() {
  const current = auth.user
  account.fullName = current?.fullName || ''
  account.email = current?.email || ''
  account.phone = current?.phone || ''
  slug.value = current?.tenant?.slug || ''
  password.current = ''
  password.next = ''
  password.confirm = ''
  passwordForm.value?.resetValidation()
}

watch(
  () => auth.user,
  (user) => {
    account.fullName = user?.fullName || ''
    account.email = user?.email || ''
    account.phone = user?.phone || ''
    slug.value = user?.tenant?.slug || ''
  },
  { immediate: true },
)

function setDark(value) {
  $q.dark.set(value)
  localStorage.setItem(STORAGE_KEYS.dark, value ? 'true' : 'false')
}

async function saveAccount() {
  savingAccount.value = true
  const emailChanged =
    account.email.trim().toLowerCase() !== String(auth.user?.email || '').toLowerCase()

  try {
    await auth.updateAccount({
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
    })
    notifySuccess(
      emailChanged ? 'Hesap kaydedildi. Doğrulama e-postası gönderildi.' : 'Hesap kaydedildi.',
    )

    if (emailChanged) {
      await router.push({ name: 'verify-pending' })
    }
  } catch (error) {
    notifyError(error)
  } finally {
    savingAccount.value = false
  }
}

async function sendVerification() {
  sendingVerification.value = true

  try {
    await auth.sendVerification()
    notifySuccess('Doğrulama e-postası gönderildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    sendingVerification.value = false
  }
}

async function saveSlug() {
  savingSlug.value = true

  try {
    await auth.updateSlug(slug.value)
    notifySuccess('Menü adresi kaydedildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    savingSlug.value = false
  }
}

async function removeAccount() {
  deleting.value = true

  try {
    await auth.deleteAccount(deletePassword.value)
    deleteOpen.value = false
    discardEdits()
    await router.push({ name: 'login' })
  } catch (error) {
    notifyError(error)
  } finally {
    deleting.value = false
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
