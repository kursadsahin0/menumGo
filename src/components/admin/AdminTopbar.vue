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
      <q-menu anchor="bottom right" self="top right">
        <q-list class="admin-topbar__menu">
          <q-item>
            <q-item-section>
              <q-item-label>{{ displayName }}</q-item-label>
              <q-item-label caption>{{ auth.user?.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>Koyu tema</q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="isDark"
                aria-label="Koyu tema"
                @update:model-value="setDark"
              />
            </q-item-section>
          </q-item>
          <q-item v-ripple clickable :to="{ name: 'admin-profile' }">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Profil</q-item-section>
          </q-item>
          <q-item v-ripple clickable @click="onLogout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Çıkış</q-item-section>
          </q-item>
        </q-list>
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
