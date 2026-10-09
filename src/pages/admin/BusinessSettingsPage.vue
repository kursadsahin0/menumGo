<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <AdminSkeleton v-if="pending" variant="form" />

      <div v-else-if="failed" class="load-failure">
        <AppError :error="businessStore.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <q-form v-else greedy class="business-profile" @submit="save">
        <div class="business-profile__hero">
          <button
            type="button"
            class="business-profile__cover"
            aria-label="Kapağı değiştir"
            @click="pickCover"
          >
            <img v-if="coverSrc" :src="coverSrc" alt="" />
            <span v-else class="business-profile__cover-empty">
              <q-icon name="panorama" size="28px" />
              Kapak görseli ekle
            </span>
          </button>
          <button
            type="button"
            class="business-profile__logo"
            aria-label="Logoyu değiştir"
            @click="pickLogo"
          >
            <img v-if="logoSrc" :src="logoSrc" alt="" />
            <q-icon v-else name="storefront" size="28px" />
          </button>
        </div>

        <input
          ref="coverInput"
          class="sr-only"
          type="file"
          accept="image/*"
          aria-label="Kapak görseli"
          @change="onFile('coverImage', $event)"
        />
        <input
          ref="logoInput"
          class="sr-only"
          type="file"
          accept="image/*"
          aria-label="Logo"
          @change="onFile('logo', $event)"
        />

        <div class="business-profile__body">
          <div class="business-profile__heading">
            <div>
              <h2 class="business-profile__title">İşletme bilgileri</h2>
              <p class="business-profile__lead">
                Ad, açıklama, logo ve kapak misafir menüsünde görünür.
              </p>
            </div>
            <div class="business-profile__media-actions">
              <q-btn flat dense no-caps label="Logoyu değiştir" @click="pickLogo" />
              <q-btn flat dense no-caps label="Kapağı değiştir" @click="pickCover" />
              <q-btn
                v-if="draft.logo"
                flat
                dense
                no-caps
                color="negative"
                label="Logoyu kaldır"
                @click="clearImage('logo')"
              />
              <q-btn
                v-if="draft.coverImage"
                flat
                dense
                no-caps
                color="negative"
                label="Kapağı kaldır"
                @click="clearImage('coverImage')"
              />
            </div>
          </div>

          <q-input
            v-model="draft.name"
            label="Restoran adı"
            outlined
            lazy-rules
            :rules="[rules.required]"
          />

          <div class="business-profile__field">
            <span class="business-profile__label">İşletme türü</span>
            <div class="business-types" role="radiogroup" aria-label="İşletme türü">
              <button
                v-for="type in businessTypes"
                :key="type.value"
                type="button"
                class="business-type"
                :class="{ 'is-active': draft.businessType === type.value }"
                role="radio"
                :aria-checked="draft.businessType === type.value"
                @click="draft.businessType = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <q-input
            v-model="draft.description"
            type="textarea"
            label="Açıklama"
            outlined
            autogrow
            :rows="3"
          />
          <q-input
            v-model="draft.descriptionEn"
            type="textarea"
            label="Açıklama (İngilizce)"
            outlined
            autogrow
            :rows="3"
          />
        </div>

        <AppError
          v-if="businessStore.error"
          class="business-profile__error"
          :error="businessStore.error"
        />

        <div class="business-profile__footer">
          <p class="business-profile__status">
            {{ dirty ? 'Kaydedilmemiş değişiklik var.' : 'Tüm değişiklikler kayıtlı.' }}
          </p>
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            label="Kaydet"
            :loading="businessStore.saving || imageBusy"
            :disable="!dirty || imageBusy"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import { businessTypes } from '@/data/business'
import { useNotify } from '@/composables/useNotify'
import { useBusinessStore } from '@/stores/business'
import { menuImage } from '@/utils/menuImage'
import { imageEdges, prepareImage } from '@/utils/prepareImage'
import { rules } from '@/utils/validators'

const { notifySuccess, notifyError } = useNotify()
const businessStore = useBusinessStore()
const coverInput = ref(null)
const logoInput = ref(null)
const imageBusy = ref(false)
const draft = computed(() => businessStore.draft)
const pending = computed(() => !draft.value && businessStore.status !== 'error')
const failed = computed(() => !draft.value && businessStore.status === 'error')
const dirty = computed(
  () => JSON.stringify(businessStore.draft) !== JSON.stringify(businessStore.profile),
)
const logoSrc = computed(() => menuImage(draft.value?.logo, 240))
const coverSrc = computed(() => menuImage(draft.value?.coverImage, 1200))

function pickCover() {
  coverInput.value?.click()
}

function pickLogo() {
  logoInput.value?.click()
}

function onFile(field, event) {
  const file = event.target.files?.[0]
  event.target.value = ''

  if (!file) {
    return
  }

  onImage(field, file)
}

async function onImage(field, file) {
  if (!draft.value) {
    return
  }

  imageBusy.value = true

  try {
    draft.value[field] = await prepareImage(file, {
      maxEdge: field === 'coverImage' ? imageEdges.cover : imageEdges.photo,
    })
  } catch (error) {
    notifyError(error instanceof Error ? error.message : 'Görsel okunamadı.')
  } finally {
    imageBusy.value = false
  }
}

function clearImage(field) {
  if (!draft.value) {
    return
  }

  draft.value[field] = null
}

async function save() {
  try {
    await businessStore.save()
    notifySuccess('İşletme bilgileri kaydedildi.')
  } catch (error) {
    notifyError(error)
  }
}

async function load() {
  try {
    await businessStore.fetchBusiness()
    businessStore.resetDraft()
  } catch {
    // The store keeps the error on the page.
  }
}

onMounted(load)
</script>
