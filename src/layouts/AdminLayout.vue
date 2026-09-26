<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout">
    <q-header bordered class="admin-topbar">
      <AdminTopbar :title="pageTitle" @toggle="toggleDrawer" />
    </q-header>

    <q-drawer
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
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/AdminTopbar.vue'

const route = useRoute()
const $q = useQuasar()
const drawerOpen = ref(false)

const pageTitle = computed(() => {
  const match = [...route.matched].reverse().find((record) => record.meta.title)
  return match?.meta.title || 'Panel'
})

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function onNavigate() {
  if ($q.screen.lt.md) {
    drawerOpen.value = false
  }
}
</script>
