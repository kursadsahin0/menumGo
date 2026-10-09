<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <AdminSkeleton v-if="pending" variant="form" />

      <div v-else-if="failed" class="load-failure">
        <AppError :error="settingsStore.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

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
            <h2 class="menu-settings__title">İletişim</h2>
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

        <MenuPreview
          class="menu-settings__preview"
          :settings="draft"
          :venue="businessStore.profile"
          :categories="categories"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MenuPreview from '@/components/admin/MenuPreview.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import { cardStyleOptions, fontOptions, menuThemes } from '@/data/menuThemes'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useMenuSettingsStore } from '@/stores/menuSettings'
import { useMenuStore } from '@/stores/menu'

const auth = useAuthStore()
const businessStore = useBusinessStore()
const menu = useMenuStore()
const settingsStore = useMenuSettingsStore()
const { notifySuccess, notifyError } = useNotify()
const draft = computed(() => settingsStore.draft)
const pending = computed(() => !draft.value && settingsStore.status !== 'error')
const failed = computed(() => !draft.value && settingsStore.status === 'error')
const categories = computed(() => menu.publicMenu?.categories || [])
const dirty = computed(
  () => JSON.stringify(settingsStore.draft) !== JSON.stringify(settingsStore.settings),
)

async function save() {
  try {
    await settingsStore.save()
    notifySuccess('Menü ayarları kaydedildi.')
  } catch (error) {
    notifyError(error)
  }
}

async function load() {
  await Promise.allSettled([settingsStore.fetchSettings(), businessStore.fetchBusiness()])

  if (!settingsStore.settings) {
    return
  }

  settingsStore.resetDraft()
  const slug = auth.user?.tenant?.slug || 'burger-house'
  menu.fetchPublicMenu(slug).catch(() => {})
}

onMounted(load)
</script>
