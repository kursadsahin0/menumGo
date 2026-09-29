<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <section class="venue-qr">
        <div class="venue-qr__copy">
          <h2 class="venue-qr__title">{{ restaurantName }}</h2>
          <p class="venue-qr__lead">
            Bu kod masayı belirtmez. Misafir işletmenin menüsünü açar. Masaya özel kod için
            <router-link :to="{ name: 'admin-tables' }">Masalar</router-link>
            ekranını kullanın.
          </p>
        </div>

        <QRCode ref="qrRef" :value="url" :size="240" :label="`${restaurantName} menü QR kodu`" />

        <a class="venue-qr__url" :href="url" target="_blank" rel="noopener noreferrer">{{ url }}</a>

        <div class="venue-qr__actions">
          <q-btn
            outline
            no-caps
            color="primary"
            icon="content_copy"
            label="Kopyala"
            @click="copy"
          />
          <q-btn outline no-caps color="primary" icon="download" label="İndir" @click="download" />
          <q-btn unelevated no-caps color="primary" icon="print" label="Yazdır" @click="print" />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import QRCode from '@/components/common/QRCode.vue'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { absoluteMenuUrl } from '@/utils/menuUrl'

const auth = useAuthStore()
const businessStore = useBusinessStore()
const { notifySuccess, notifyError } = useNotify()
const qrRef = ref(null)

const restaurantName = computed(
  () => businessStore.profile?.name || auth.user?.tenant?.name || 'Menü',
)
const slug = computed(() => auth.user?.tenant?.slug || '')
const url = computed(() => (slug.value ? absoluteMenuUrl(`/menu/${slug.value}`) : ''))

function fileName() {
  return `${slug.value || 'menu'}-qr.png`
}

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    notifySuccess('Menü adresi kopyalandı.')
  } catch {
    notifyError('Adres kopyalanamadı.')
  }
}

function download() {
  qrRef.value?.download(fileName())
}

function print() {
  qrRef.value?.print({
    title: restaurantName.value,
    subtitle: 'Menü',
    url: url.value,
  })
}

onMounted(() => {
  businessStore.fetchBusiness()
})
</script>
