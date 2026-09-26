<template>
  <div class="admin-sidebar">
    <div class="admin-sidebar__brand">
      <AppBrand />
      <div v-if="tenantName" class="admin-sidebar__tenant">{{ tenantName }}</div>
    </div>

    <q-list padding class="admin-sidebar__list">
      <template v-for="item in adminNavigation" :key="item.label">
        <q-expansion-item
          v-if="item.children"
          v-model="menuOpen"
          :icon="item.icon"
          :label="item.label"
          expand-separator
          :header-class="menuActive ? 'admin-nav__group--active' : ''"
        >
          <q-item
            v-for="child in item.children"
            :key="child.label"
            v-ripple
            clickable
            :to="child.to"
            active-class="admin-nav__item--active"
            class="admin-nav__child"
            @click="emit('navigate')"
          >
            <q-item-section avatar>
              <q-icon :name="child.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ child.label }}</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item
          v-else
          v-ripple
          clickable
          :to="item.to"
          :exact="item.exact"
          active-class="admin-nav__item--active"
          @click="emit('navigate')"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppBrand from '@/components/common/AppBrand.vue'
import { useAuthStore } from '@/stores/auth'
import { adminNavigation } from '@/router/navigation'

const emit = defineEmits(['navigate'])
const route = useRoute()
const auth = useAuthStore()

const menuGroup = adminNavigation.find((item) => item.children)
const menuNames = (menuGroup?.children || []).map((child) => child.to.name)
const menuActive = computed(() => menuNames.includes(route.name))
const menuOpen = ref(menuActive.value)
const tenantName = computed(() => auth.user?.tenant?.name || '')

watch(menuActive, (active) => {
  if (active) {
    menuOpen.value = true
  }
})
</script>
