<template>
  <q-toolbar class="admin-topbar__bar">
    <q-btn flat dense round icon="menu" aria-label="Menüyü aç" @click="emit('toggle')" />
    <div class="admin-topbar__title">{{ title }}</div>
    <q-space />

    <q-btn flat round icon="notifications" aria-label="Bildirimler">
      <q-badge v-if="unreadCount" floating color="negative" rounded />
      <q-menu anchor="bottom right" self="top right">
        <q-list class="admin-topbar__menu">
          <q-item-label header>Bildirimler</q-item-label>
          <q-item v-for="item in adminNotifications" :key="item.id">
            <q-item-section>
              <q-item-label>{{ item.title }}</q-item-label>
              <q-item-label caption>{{ item.time }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="item.unread" side>
              <q-badge color="primary" rounded />
            </q-item-section>
          </q-item>
        </q-list>
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
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { adminNotifications } from '@/router/navigation'
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

const unreadCount = computed(() => adminNotifications.filter((item) => item.unread).length)
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

function setDark(value) {
  $q.dark.set(value)
  localStorage.setItem(STORAGE_KEYS.dark, value ? 'true' : 'false')
}

async function onLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>
