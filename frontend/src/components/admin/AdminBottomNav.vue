<template>
  <nav class="admin-tabbar" aria-label="Ana menü">
    <button
      v-for="tab in adminMobileTabs"
      :key="tab.id"
      type="button"
      class="admin-tabbar__item"
      :class="{ 'is-active': isActive(tab) }"
      @click="onTab(tab)"
    >
      <q-icon :name="tab.icon" size="22px" />
      <span>{{ tab.label }}</span>
    </button>
  </nav>

  <q-dialog v-model="moreOpen" position="bottom" class="admin-sheet">
    <q-card class="admin-sheet__card">
      <div class="admin-sheet__handle" aria-hidden="true" />
      <header class="admin-sheet__head">
        <h2>Diğer</h2>
        <q-btn flat round dense icon="close" aria-label="Kapat" @click="moreOpen = false" />
      </header>
      <q-list class="admin-sheet__list">
        <q-item
          v-for="item in adminMobileMore"
          :key="item.label"
          v-ripple
          clickable
          :to="item.to"
          active-class="admin-sheet__item--active"
          @click="moreOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="22px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" size="18px" color="grey-6" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminMobileMore, adminMobileTabs } from '@/router/navigation'

const route = useRoute()
const router = useRouter()
const moreOpen = ref(false)

function isActive(tab) {
  return tab.names.includes(route.name)
}

function onTab(tab) {
  if (tab.action === 'more') {
    moreOpen.value = true
    return
  }

  if (tab.to?.name && tab.to.name !== route.name) {
    router.push(tab.to)
  }
}
</script>
