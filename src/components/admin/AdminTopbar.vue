<template>
  <q-toolbar class="admin-topbar__bar">
    <q-btn flat dense round icon="menu" aria-label="Menüyü aç" @click="emit('toggle')" />
    <div class="admin-topbar__title">{{ title }}</div>
    <q-space />

    <q-btn flat round icon="notifications" aria-label="Bildirimler">
      <q-badge v-if="unreadCount" floating color="negative" rounded />
      <q-menu
        class="notice-menu"
        anchor="bottom right"
        self="top right"
        :offset="[0, 8]"
        @before-show="loadNotifications"
        @hide="markRead"
      >
        <div class="notice-menu__panel">
          <header class="notice-menu__head">
            <h2>Bildirimler</h2>
            <span v-if="unreadCount">{{ unreadCount }} yeni</span>
          </header>
          <p v-if="!notifications.length" class="notice-menu__empty">Henüz bildirim yok</p>
          <ul v-else class="notice-menu__list">
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
                <span class="notice-menu__time">{{ item.time }}</span>
              </span>
            </li>
          </ul>
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
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getNotifications, markNotificationsRead } from '@/services/notificationService'
import { STORAGE_KEYS } from '@/utils/constants'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['toggle'])
const router = useRouter()
const $q = useQuasar()
const { auth, logout } = useAuth()
const isDark = computed(() => $q.dark.isActive)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter((item) => item.unread).length)

async function loadNotifications() {
  try {
    notifications.value = await getNotifications()
  } catch {
    notifications.value = []
  }
}

async function markRead() {
  if (!notifications.value.some((item) => item.unread)) {
    return
  }

  try {
    notifications.value = await markNotificationsRead()
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

  if (text.includes('menüyü açtı') || text === 'Menü açıldı') {
    return 'visibility'
  }

  if (text.includes('fiyatı')) {
    return 'payments'
  }

  if (text.includes('kategorisi')) {
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

onMounted(loadNotifications)
</script>
