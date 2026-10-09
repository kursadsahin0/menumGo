<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="billing-contact">
        <header class="billing-offer__head">
          <h1>Tek seferlik panel</h1>
          <p v-if="onTrial">Denemeniz sürüyor. {{ daysLeft }} gün kaldı.</p>
          <p v-else-if="paid">Paneliniz açık. Ulaşmak için bu numarayı arayın.</p>
          <p v-else>Deneme süreniz bitti. Satın alınca menü yeniden açılır.</p>
          <p>Aylık ücret yok. Bir kez ödersiniz, menü bu işletmede kalır.</p>
        </header>

        <article class="billing-offer">
          <p class="billing-offer__price">
            <strong>{{ formatTry(price) }}</strong>
            <span>tek sefer</span>
          </p>

          <ul class="billing-offer__list">
            <li v-for="item in includes" :key="item">
              <q-icon name="check" size="14px" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </article>

        <section class="billing-contact__card">
          <h2>{{ paid ? 'Bize ulaşın' : 'Satın almak için arayın' }}</h2>
          <a class="billing-contact__phone" :href="salesPhoneHref">{{ salesPhone }}</a>
          <p v-if="onTrial">Ödeme tamamlanınca deneme kalkar, panel sizde kalır.</p>
          <p v-else-if="paid">Aynı hat satın alma ve destek içindir.</p>
          <p v-else>Ödeme tamamlanınca panel açılır.</p>
          <div class="billing-contact__actions">
            <q-btn
              class="billing-contact__button"
              unelevated
              no-caps
              color="primary"
              icon="call"
              :href="salesPhoneHref"
              label="Ara"
            />
            <q-btn
              v-if="auth.hasAccess"
              class="billing-contact__button"
              outline
              no-caps
              color="primary"
              label="Panele dön"
              :to="{ name: 'admin-dashboard' }"
            />
          </div>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentSubscription } from '@/services/subscriptionService'
import { useAuthStore } from '@/stores/auth'
import { SALES_PHONE, SALES_PHONE_HREF } from '@/utils/constants'
import { formatTry } from '@/utils/currency'
import { trialDaysRemaining } from '@/utils/trial'

const router = useRouter()
const auth = useAuthStore()
let accessTimer = 0
let checkingAccess = false

const price = 9900
const salesPhone = SALES_PHONE
const salesPhoneHref = SALES_PHONE_HREF
const onTrial = computed(() => auth.hasAccess && auth.user?.subscription?.status === 'trial')
const paid = computed(() => auth.user?.subscription?.status === 'active')
const daysLeft = computed(() => trialDaysRemaining(auth.user?.subscription?.trialEndsAt))
const waitingForAccess = !auth.hasAccess

const includes = [
  'Misafir menüsü ve tek QR kod',
  'Türkçe ve İngilizce',
  'Fiyat, fotoğraf ve tükenen ürün',
  'Menü görüntülenme istatistikleri',
]

async function syncAccess() {
  if (checkingAccess) {
    return
  }

  checkingAccess = true

  try {
    const subscription = await getCurrentSubscription()
    auth.applySubscription(subscription)

    if (waitingForAccess && auth.user?.subscription?.status === 'active') {
      router.replace({ name: 'admin-dashboard' })
    }
  } catch (error) {
    if (error?.status === 401) {
      auth.clearLocalSession()
      router.replace({ name: 'login' })
    }
  } finally {
    checkingAccess = false
  }
}

function onVisible() {
  if (document.visibilityState === 'visible') {
    syncAccess()
  }
}

onMounted(() => {
  syncAccess()
  accessTimer = window.setInterval(syncAccess, 5000)
  document.addEventListener('visibilitychange', onVisible)
})

onUnmounted(() => {
  window.clearInterval(accessTimer)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>
