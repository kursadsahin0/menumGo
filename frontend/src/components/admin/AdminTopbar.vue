<template>
  <q-toolbar class="admin-topbar__bar">
    <q-btn
      v-if="showMenu"
      flat
      dense
      round
      icon="menu"
      aria-label="Menüyü aç"
      @click="emit('toggle')"
    />
    <div v-if="title" class="admin-topbar__title">{{ title }}</div>
    <q-space />

    <q-btn flat round icon="notifications" aria-label="Bildirimler">
      <q-badge v-if="unreadTotal" floating color="negative" rounded />
      <q-menu
        class="notice-menu"
        anchor="bottom right"
        self="top right"
        :offset="[0, 8]"
        @before-show="openNotifications"
        @hide="markRead"
      >
        <div class="notice-menu__panel">
          <header class="notice-menu__head">
            <h2>Bildirimler</h2>
            <div class="notice-menu__tools">
              <span v-if="unreadTotal">{{ unreadTotal }} yeni</span>
              <button
                v-if="notifications.length"
                type="button"
                class="notice-menu__clear"
                :disabled="clearing"
                @click="clearAll"
              >
                Temizle
              </button>
            </div>
          </header>
          <div v-if="loadError" class="notice-menu__failure">
            <AppError :error="loadError" />
            <button type="button" class="notice-menu__more" @click.stop="retryLoad">Yeniden dene</button>
          </div>
          <p v-else-if="!notifications.length" class="notice-menu__empty">Henüz bildirim yok</p>
          <ul v-if="notifications.length" class="notice-menu__list">
            <li
              v-for="item in notifications"
              :key="item.id"
              class="notice-menu__item"
              :class="{ 'is-unread': item.unread }"
            >
              <span class="notice-menu__icon">
                <q-icon :name="notificationIcon(item.title)" size="18px" />
              </span>
              <span class="notice-menu__copy">
                <span class="notice-menu__title">{{ item.title }}</span>
                <span v-if="item.body" class="notice-menu__body">{{ item.body }}</span>
                <span class="notice-menu__time">{{ item.time }}</span>
              </span>
            </li>
          </ul>
          <div v-if="olderError" class="notice-menu__failure">
            <AppError :error="olderError" />
            <button
              type="button"
              class="notice-menu__more"
              :disabled="loadingOlder"
              @click.stop="loadOlder"
            >
              Yeniden dene
            </button>
          </div>
          <button
            v-else-if="hasMore"
            type="button"
            class="notice-menu__more"
            :disabled="loadingOlder"
            @click.stop="loadOlder"
          >
            Daha eski
          </button>
        </div>
      </q-menu>
    </q-btn>

    <q-btn flat round aria-label="Kullanıcı menüsü">
      <q-avatar size="32px" color="primary" text-color="white">{{ initials }}</q-avatar>
      <q-menu class="account-menu" anchor="bottom right" self="top right" :offset="[0, 8]">
        <div class="account-menu__panel">
          <div class="account-menu__head">
            <q-avatar size="40px" color="primary" text-color="white">{{ initials }}</q-avatar>
            <div class="account-menu__identity">
              <div class="account-menu__name">{{ displayName }}</div>
              <div v-if="venueName" class="account-menu__venue">{{ venueName }}</div>
              <div class="account-menu__email">{{ auth.user?.email }}</div>
            </div>
          </div>

          <div class="account-menu__theme">
            <span>Koyu tema</span>
            <q-toggle
              :model-value="isDark"
              size="sm"
              color="primary"
              aria-label="Koyu tema"
              @update:model-value="setDark"
            />
          </div>

          <q-list class="account-menu__actions">
            <q-item
              v-close-popup
              v-ripple
              clickable
              class="account-menu__action"
              :to="{ name: 'admin-profile' }"
            >
              <q-item-section avatar>
                <q-icon name="person_outline" size="20px" />
              </q-item-section>
              <q-item-section>Profil</q-item-section>
            </q-item>
            <q-item v-close-popup v-ripple clickable class="account-menu__action" @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" size="20px" />
              </q-item-section>
              <q-item-section>Çıkış</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-menu>
    </q-btn>
  </q-toolbar>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import AppError from '@/components/common/AppError.vue'
import { useAuth } from '@/composables/useAuth'
import {
  clearNotifications,
  getNotifications,
  markNotificationsRead,
} from '@/services/notificationService'
import { STORAGE_KEYS } from '@/utils/constants'
import {
  playWaiterChime,
  showWaiterNotice,
  unlockNotificationSound,
} from '@/utils/notificationSound'
import { enableWaiterPush } from '@/utils/waiterPush'

defineProps({
  title: {
    type: String,
    default: '',
  },
  showMenu: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle'])
const router = useRouter()
const $q = useQuasar()
const { auth, logout } = useAuth()
const isDark = computed(() => $q.dark.isActive)
const notifications = ref([])
const clearing = ref(false)
const loadingOlder = ref(false)
const loadError = ref(null)
const olderError = ref(null)
const hasMore = ref(false)
const unreadTotal = ref(0)
const menuOpen = ref(false)
let seenIds = null
let pollTimer
let requestId = 0

function applyNotifications(next, { announce = true } = {}) {
  if (announce && seenIds) {
    next
      .filter((item) => !seenIds.has(item.id) && String(item.title).includes('Garson'))
      .forEach((item, index) => {
        window.setTimeout(() => playWaiterChime(), index * 400)
        showWaiterNotice(item.title, item.body)
      })
  }

  seenIds = new Set(next.map((item) => item.id))
  notifications.value = next
}

function showPage(page, next, { announce = true } = {}) {
  hasMore.value = page.hasMore
  unreadTotal.value = page.unread
  applyNotifications(next, { announce })
}

async function loadNotifications({ replace = false } = {}) {
  const id = ++requestId

  try {
    const page = await getNotifications()

    if (id !== requestId) {
      return
    }

    const pageIds = new Set(page.items.map((item) => item.id))
    const older = notifications.value.filter((item) => !pageIds.has(item.id))
    const keepOlder = !replace && menuOpen.value && older.length
    const alreadyComplete = keepOlder && !hasMore.value
    showPage(page, keepOlder ? [...page.items, ...older] : page.items)

    if (alreadyComplete) {
      hasMore.value = false
    }

    loadError.value = null
    olderError.value = null
  } catch (error) {
    if (id !== requestId) {
      return
    }

    loadError.value = error
  }
}

function retryLoad() {
  loadNotifications({ replace: true })
}

function openNotifications() {
  menuOpen.value = true
  loadNotifications({ replace: true })
}

async function loadOlder() {
  const oldest = notifications.value[notifications.value.length - 1]

  if (!hasMore.value || loadingOlder.value || !oldest) {
    return
  }

  loadingOlder.value = true
  const id = ++requestId

  try {
    const page = await getNotifications(oldest.id)

    if (id !== requestId) {
      return
    }

    const known = new Set(notifications.value.map((item) => item.id))
    const extra = page.items.filter((item) => !known.has(item.id))
    olderError.value = null
    showPage(page, [...notifications.value, ...extra], { announce: false })
  } catch (error) {
    if (id === requestId) {
      olderError.value = error
    }
  } finally {
    loadingOlder.value = false
  }
}

async function clearAll() {
  if (clearing.value || !notifications.value.length) {
    return
  }

  clearing.value = true
  const id = ++requestId
  const ids = notifications.value.map((item) => item.id)

  try {
    const page = await clearNotifications(ids)

    if (id === requestId) {
      showPage(page, page.items, { announce: false })
    }
  } catch {
    // The list stays until a later refresh succeeds.
  } finally {
    clearing.value = false
  }
}

async function markRead() {
  menuOpen.value = false
  const ids = notifications.value.filter((item) => item.unread).map((item) => item.id)

  if (!ids.length) {
    return
  }

  try {
    const result = await markNotificationsRead(ids)
    unreadTotal.value = result.unread
    const marked = new Set(ids)
    notifications.value = notifications.value.map((item) =>
      marked.has(item.id) ? { ...item, unread: false } : item,
    )
  } catch {
    // The badge stays until the next successful refresh.
  }
}
const displayName = computed(() => auth.user?.fullName || 'Hesap')
const venueName = computed(() => auth.user?.tenant?.name || '')
const initials = computed(() => {
  const parts = displayName.value.split(' ').filter(Boolean).slice(0, 2)
  return (
    parts
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'Q'
  )
})

function notificationIcon(title) {
  const text = String(title || '')

  if (text.includes('Garson')) {
    return 'room_service'
  }

  if (text.toLocaleLowerCase('tr').includes('fiyat')) {
    return 'payments'
  }

  if (text.toLocaleLowerCase('tr').includes('kategori')) {
    return 'category'
  }

  if (text.includes('silindi')) {
    return 'delete_outline'
  }

  if (text.includes('eklendi')) {
    return 'add_circle_outline'
  }

  return 'edit_note'
}

function setDark(value) {
  $q.dark.set(value)
  localStorage.setItem(STORAGE_KEYS.dark, value ? 'true' : 'false')
}

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  loadNotifications()
  window.addEventListener('pointerdown', unlockNotificationSound)

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    enableWaiterPush().catch(() => {})
  }

  pollTimer = window.setInterval(loadNotifications, 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', unlockNotificationSound)
  window.clearInterval(pollTimer)
})
</script>
