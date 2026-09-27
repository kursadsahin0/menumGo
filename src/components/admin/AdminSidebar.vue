<template>
  <div class="admin-sidebar">
    <router-link class="admin-sidebar__brand" :to="home">
      <AppBrand />
    </router-link>

    <q-list v-if="auth.hasAccess" padding class="admin-sidebar__list">
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
import { useAuthStore } from '@/stores/auth'
import AppBrand from '@/components/common/AppBrand.vue'
import { adminNavigation } from '@/router/navigation'

const emit = defineEmits(['navigate'])
const route = useRoute()
const auth = useAuthStore()
const home = computed(() =>
  auth.hasAccess ? { name: 'admin-dashboard' } : { name: 'admin-billing' },
)

const menuGroup = adminNavigation.find((item) => item.children)
const menuNames = (menuGroup?.children || []).map((child) => child.to.name)
const menuActive = computed(() => menuNames.includes(route.name))
const menuOpen = ref(menuActive.value)

watch(menuActive, (active) => {
  if (active) {
    menuOpen.value = true
  }
})
</script>
