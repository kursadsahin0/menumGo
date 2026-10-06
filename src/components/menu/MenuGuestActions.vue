<template>
  <div class="menu-actions">
    <button v-if="hasWifi" type="button" class="menu-venue" @click="wifiOpen = true">
      <q-icon name="wifi" size="18px" />
      {{ messages.wifi }}
    </button>
    <button
      type="button"
      class="menu-venue"
      :disabled="sending || sent"
      @click="onCall"
    >
      <q-icon name="room_service" size="18px" />
      {{ sent ? messages.waiterSent : messages.callWaiter }}
    </button>
    <p v-if="sent" class="menu-actions__notice" role="status">{{ notice }}</p>
    <p v-if="error" class="menu-actions__error" role="alert">{{ error }}</p>
    <q-dialog v-model="wifiOpen" :position="$q.screen.lt.sm ? 'bottom' : 'standard'">
      <q-card class="menu-dialog menu-venue-dialog">
        <div class="menu-venue-dialog__head">
          <p class="menu-venue-dialog__kicker menu-venue-dialog__kicker--literal">{{ messages.wifi }}</p>
          <button
            type="button"
            class="menu-venue-dialog__close"
            :aria-label="messages.close"
            @click="wifiOpen = false"
          >
            <q-icon name="close" size="18px" />
          </button>
        </div>
        <h2 class="menu-venue-dialog__name">{{ wifiName }}</h2>
        <dl v-if="wifiPassword" class="menu-venue-dialog__list">
          <div>
            <dt>{{ messages.wifiPassword }}</dt>
            <dd>{{ wifiPassword }}</dd>
          </div>
        </dl>
        <button v-if="wifiPassword" type="button" class="menu-venue menu-actions__copy" @click="copyPassword">
          {{ copied ? messages.copied : messages.copy }}
        </button>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const props = defineProps({
  wifiName: {
    type: String,
    default: '',
  },
  wifiPassword: {
    type: String,
    default: '',
  },
  tableName: {
    type: String,
    default: '',
  },
  requestWaiter: {
    type: Function,
    default: null,
  },
})

const $q = useQuasar()
const { messages } = useMenuLanguage()
const wifiOpen = ref(false)
const copied = ref(false)
const sending = ref(false)
const sent = ref(false)
const error = ref('')
const hasWifi = computed(() => Boolean(props.wifiName || props.wifiPassword))
const notice = computed(() =>
  props.tableName ? `${props.tableName} · ${messages.value.waiterNotice}` : messages.value.waiterNotice,
)
let sentTimer
let copiedTimer

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(props.wifiPassword)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}

async function onCall() {
  if (sending.value || sent.value) {
    return
  }

  sending.value = true
  error.value = ''

  try {
    if (props.requestWaiter) {
      await props.requestWaiter()
    }

    sent.value = true
    $q.notify({
      message: notice.value,
      icon: 'room_service',
      position: 'top',
      timeout: 5000,
      classes: 'menu-toast',
    })
    clearTimeout(sentTimer)
    sentTimer = setTimeout(() => {
      sent.value = false
    }, 45_000)
  } catch {
    error.value = messages.value.waiterError
  } finally {
    sending.value = false
  }
}
</script>
