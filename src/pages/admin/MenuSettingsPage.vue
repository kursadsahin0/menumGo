<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <AppError v-if="settingsStore.error && !draft" :error="settingsStore.error" />

      <AdminSkeleton v-if="!draft" variant="form" />

      <div v-else class="menu-settings">
        <form class="menu-settings__form" @submit.prevent="save">
          <section class="menu-settings__section">
            <h2 class="menu-settings__title">Menü teması</h2>
            <div class="theme-list">
              <button
                v-for="theme in menuThemes"
                :key="theme.id"
                type="button"
                class="theme-card"
                :class="{ 'is-active': draft.theme === theme.id }"
                @click="settingsStore.applyTheme(theme.id)"
              >
                <span class="theme-card__swatches" aria-hidden="true">
                  <i :style="{ background: theme.primaryColor }" />
                  <i :style="{ background: theme.secondaryColor }" />
                </span>
                {{ theme.label }}
              </button>
            </div>
          </section>

          <section class="menu-settings__section">
            <h2 class="menu-settings__title">Restoran bilgileri</h2>
            <q-file
              v-model="logoFile"
              label="Logo"
              accept="image/*"
              outlined
              dense
              clearable
              @update:model-value="onLogo"
            >
              <template #prepend>
                <q-icon name="image" />
              </template>
            </q-file>
            <div v-if="draft.logo" class="menu-settings__logo">
              <img :src="logoSrc" alt="" />
              <q-btn flat no-caps color="negative" label="Logoyu kaldır" @click="clearLogo" />
            </div>
            <q-input v-model="draft.name" label="Restoran adı" outlined dense />
            <div class="menu-settings__copy">
              <q-input
                v-model="draft.description.tr"
                type="textarea"
                label="Açıklama"
                outlined
                dense
                autogrow
              />
              <q-input
                v-model="draft.description.en"
                type="textarea"
                label="Açıklama (İngilizce)"
                outlined
                dense
                autogrow
              />
            </div>
            <q-input v-model="draft.phone" label="Telefon" outlined dense />
            <div class="menu-settings__copy">
              <q-input
                v-model="draft.address.tr"
                type="textarea"
                label="Adres"
                outlined
                dense
                autogrow
              />
              <q-input
                v-model="draft.address.en"
                type="textarea"
                label="Adres (İngilizce)"
                outlined
                dense
                autogrow
              />
            </div>
            <q-input v-model="draft.wifiName" label="Wi-Fi ağ adı" outlined dense />
            <q-input v-model="draft.wifiPassword" label="Wi-Fi şifresi" outlined dense />
            <q-input v-model="draft.website" label="Website" outlined dense />
            <q-input v-model="draft.instagram" label="Instagram" outlined dense />
            <div class="menu-settings__copy">
              <q-input v-model="draft.hours.tr" label="Çalışma saatleri" outlined dense />
              <q-input v-model="draft.hours.en" label="Çalışma saatleri (İngilizce)" outlined dense />
            </div>
          </section>

          <section class="menu-settings__section">
            <h2 class="menu-settings__title">Menü görünümü</h2>
            <q-select
              v-model="draft.font"
              :options="fontOptions"
              emit-value
              map-options
              label="Font"
              outlined
              dense
            />
            <div class="menu-settings__choice">
              <span>Kart stili</span>
              <q-btn-toggle
                v-model="draft.cardStyle"
                no-caps
                unelevated
                toggle-color="primary"
                :options="cardStyleOptions"
              />
            </div>
            <q-toggle v-model="draft.showDescriptions" label="Açıklamaları göster" />
            <q-toggle v-model="draft.showProductImages" label="Ürün görsellerini göster" />
            <q-toggle v-model="draft.showPrices" label="Fiyatları göster" />
          </section>

          <AppError v-if="settingsStore.error" :error="settingsStore.error" />

          <div class="menu-settings__save">
            <q-btn
              type="submit"
              unelevated
              no-caps
              color="primary"
              label="Kaydet"
              :loading="settingsStore.saving"
              :disable="!dirty"
            />
          </div>
        </form>

        <MenuPreview class="menu-settings__preview" :settings="draft" :categories="categories" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MenuPreview from '@/components/admin/MenuPreview.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import { cardStyleOptions, fontOptions, menuThemes } from '@/data/menuThemes'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { useMenuSettingsStore } from '@/stores/menuSettings'
import { useMenuStore } from '@/stores/menu'
import { menuImage } from '@/utils/menuImage'

const auth = useAuthStore()
const menu = useMenuStore()
const settingsStore = useMenuSettingsStore()
const { notifySuccess, notifyError } = useNotify()
const logoFile = ref(null)
const draft = computed(() => settingsStore.draft)
const categories = computed(() => menu.publicMenu?.categories || [])
const dirty = computed(
  () => JSON.stringify(settingsStore.draft) !== JSON.stringify(settingsStore.settings),
)
const logoSrc = computed(() => menuImage(draft.value?.logo, 144))

function onLogo(file) {
  if (!file || !draft.value) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    draft.value.logo = reader.result
  }
  reader.readAsDataURL(file)
}

function clearLogo() {
  if (!draft.value) {
    return
  }

  draft.value.logo = null
  logoFile.value = null
}

async function save() {
  try {
    await settingsStore.save()
    notifySuccess('Menü ayarları kaydedildi.')
  } catch (error) {
    notifyError(error)
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings()
  settingsStore.resetDraft()
  const slug = auth.user?.tenant?.slug || 'burger-house'
  menu.fetchPublicMenu(slug).catch(() => {})
})
</script>
