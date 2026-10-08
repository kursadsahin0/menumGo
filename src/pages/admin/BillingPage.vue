<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="billing-checkout">
        <header class="billing-offer__head">
          <h1>Tek seferlik panel</h1>
          <p>Aylık ücret yok. Bir kez ödersiniz, menü bu işletmede kalır.</p>
          <p class="billing-call">
            <q-icon name="call" size="18px" />
            <span>
              Satın almak için
              <a :href="salesPhoneHref">{{ salesPhone }}</a>
              numarasını arayın.
            </span>
          </p>
        </header>

        <article class="billing-offer">
          <PaymentCard
            :holder="form.holder"
            :number="form.number"
            :expiry="form.expiry"
            :cvc="form.cvc"
            :active="activeField"
            :flipped="activeField === 'cvc'"
          />

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

        <div class="billing-pay" @focusin="onPayFocus" @focusout="clearField">
          <q-form class="billing-pay__form" @submit="onSubmit">
          <h2>Kart bilgisi</h2>

          <div class="billing-pay__grid">
            <q-input
              v-model="form.holder"
              class="billing-pay__wide"
              label="Kart üzerindeki isim"
              autocomplete="cc-name"
              outlined
              hide-bottom-space
              lazy-rules
              :rules="[required]"
            />
            <q-input
              v-model="form.number"
              class="billing-pay__wide"
              label="Kart numarası"
              mask="#### #### #### ####"
              unmasked-value
              inputmode="numeric"
              autocomplete="cc-number"
              outlined
              hide-bottom-space
              lazy-rules
              :rules="[cardRule]"
            />
            <q-input
              v-model="form.expiry"
              label="Son kullanma"
              mask="##/##"
              inputmode="numeric"
              autocomplete="cc-exp"
              outlined
              hide-bottom-space
              lazy-rules
              :rules="[expiryRule]"
            />
            <q-input
              v-model="form.cvc"
              label="Güvenlik kodu"
              mask="####"
              inputmode="numeric"
              autocomplete="cc-csc"
              outlined
              hide-bottom-space
              lazy-rules
              :rules="[cvcRule]"
            />
          </div>

            <div class="billing-pay__submit">
              <q-btn
                unelevated
                no-caps
                color="primary"
                type="submit"
                class="billing-offer__button"
                :label="`Satın al · ${formatTry(price)}`"
              />
              <p class="billing-offer__note">
                Ödeme şu an alınamıyor. Satın almak için
                <a :href="salesPhoneHref">{{ salesPhone }}</a>
                numarasını arayın. Ödeme tamamlanınca panel açılır.
              </p>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PaymentCard from '@/components/admin/PaymentCard.vue'
import { useNotify } from '@/composables/useNotify'
import { getCurrentSubscription } from '@/services/subscriptionService'
import { useAuthStore } from '@/stores/auth'
import { formatTry } from '@/utils/currency'

const router = useRouter()
const auth = useAuthStore()
let accessTimer = 0
let checkingAccess = false

const price = 9900
const salesPhone = '0555 123 45 67'
const salesPhoneHref = `tel:+90${salesPhone.replace(/\D/g, '').replace(/^0/, '')}`
const { notifyError } = useNotify()
const activeField = ref('')

const includes = [
  'Misafir menüsü ve tek QR kod',
  'Türkçe ve İngilizce',
  'Fiyat, fotoğraf ve tükenen ürün',
  'Menü görüntülenme istatistikleri',
]

const form = reactive({
  holder: '',
  number: '',
  expiry: '',
  cvc: '',
})

const required = (value) => (String(value || '').trim() ? true : 'Bu alan gerekli')

const cardRule = (value) =>
  String(value || '').replace(/\D/g, '').length === 16 ? true : 'Kart numarası 16 hane olmalı'

const expiryRule = (value) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(value || ''))
  if (!match) return 'AA/YY olarak girin'
  const month = Number(match[1])
  if (month < 1 || month > 12) return 'Ay 01 ile 12 arasında olmalı'
  return true
}

const cvcRule = (value) => (/^\d{3,4}$/.test(String(value || '')) ? true : '3 veya 4 hane girin')

const fieldByAuto = {
  'cc-name': 'holder',
  'cc-number': 'number',
  'cc-exp': 'expiry',
  'cc-csc': 'cvc',
}

function onPayFocus(event) {
  const name = event.target?.getAttribute?.('autocomplete')
  if (fieldByAuto[name]) activeField.value = fieldByAuto[name]
}

function clearField(event) {
  const next = event.relatedTarget
  const staying = next && next.closest && next.closest('.billing-pay .q-field')
  if (!staying) activeField.value = ''
}

function onSubmit() {
  notifyError(
    `Ödeme şu an alınamıyor. Satın almak için ${salesPhone} numarasını arayın. Panel, ödeme tamamlanınca açılır.`,
  )
}

async function syncAccess() {
  if (checkingAccess) {
    return
  }

  checkingAccess = true

  try {
    const subscription = await getCurrentSubscription()
    auth.applySubscription(subscription.status)

    if (auth.hasAccess) {
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
