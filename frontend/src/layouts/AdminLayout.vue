<template>
  <q-layout
    view="lHh Lpr lFf"
    class="admin-layout"
    :class="{
      'admin-layout--trial': showTrial,
      'admin-layout--app': isMobileApp,
    }"
  >
    <q-header bordered class="admin-topbar">
      <AdminTopbar :title="pageTitle" :show-menu="showDesktopSidebar" @toggle="toggleDrawer" />
      <div v-if="showTrial" class="admin-trial">
        <span>Deneme sürüyor. {{ daysLeft }} gün kaldı.</span>
        <a :href="salesPhoneHref">{{ salesPhone }}</a>
      </div>
    </q-header>

    <q-drawer
      v-if="showDesktopSidebar"
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="260"
      :breakpoint="1024"
      class="admin-layout__drawer"
    >
      <AdminSidebar @navigate="onNavigate" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <AdminBottomNav v-if="showMobileTabs" />
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AdminBottomNav from '@/components/admin/AdminBottomNav.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/AdminTopbar.vue'
import { useAuthStore } from '@/stores/auth'
import { SALES_PHONE, SALES_PHONE_HREF } from '@/utils/constants'
import { trialDaysRemaining } from '@/utils/trial'

const route = useRoute()
const auth = useAuthStore()
const $q = useQuasar()
const drawerOpen = ref(false)
const salesPhone = SALES_PHONE
const salesPhoneHref = SALES_PHONE_HREF
const daysLeft = computed(() => trialDaysRemaining(auth.user?.subscription?.trialEndsAt))
const showTrial = computed(
  () => auth.hasAccess && auth.user?.subscription?.status === 'trial' && route.name !== 'admin-billing',
)

const lockedOut = computed(() => route.name === 'admin-billing' && !auth.hasAccess)
const isMobileApp = computed(() => $q.screen.lt.lg)

const pageTitle = computed(() => {
  if (lockedOut.value) return ''
  const match = [...route.matched].reverse().find((record) => record.meta.title)
  return match?.meta.title || 'Panel'
})

const showSidebar = computed(() => !lockedOut.value)
const showDesktopSidebar = computed(() => showSidebar.value && !isMobileApp.value)
const showMobileTabs = computed(() => showSidebar.value && isMobileApp.value && auth.hasAccess)

watch(isMobileApp, (mobile) => {
  if (mobile) {
    drawerOpen.value = false
  }
})

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function onNavigate() {
  if ($q.screen.lt.lg) {
    drawerOpen.value = false
  }
}
</script>
