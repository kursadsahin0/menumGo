<template>
  <header class="menu-header" :class="{ 'menu-header--cover': restaurant.coverImage }">
    <img
      v-if="restaurant.coverImage"
      class="menu-cover"
      :src="menuImage(restaurant.coverImage, 1200)"
      alt=""
    />
    <MenuPhoto
      class="menu-logo"
      :photo="restaurant.logo"
      :alt="restaurant.name"
      size="logo"
      priority
    />
    <h1 class="menu-header__name">{{ restaurant.name }}</h1>
    <p v-if="table?.name" class="menu-header__table">{{ table.name }}</p>
    <p class="menu-header__description">{{ text(restaurant.description) }}</p>
    <dl class="menu-facts">
      <div class="menu-fact">
        <q-icon name="schedule" size="18px" />
        <div>
          <dt>{{ messages.hours }}</dt>
          <dd>{{ text(restaurant.hours) }}</dd>
        </div>
      </div>
      <div class="menu-fact">
        <q-icon name="call" size="18px" />
        <div>
          <dt>{{ messages.phone }}</dt>
          <dd>
            <a class="menu-link" :href="`tel:${phoneHref}`">{{ restaurant.phone }}</a>
          </dd>
        </div>
      </div>
      <div class="menu-fact">
        <q-icon name="place" size="18px" />
        <div>
          <dt>{{ messages.address }}</dt>
          <dd>
            <a
              class="menu-link"
              :href="restaurant.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ text(restaurant.address) }}
            </a>
          </dd>
        </div>
      </div>
    </dl>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import MenuPhoto from '@/components/menu/MenuPhoto.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { menuImage } from '@/utils/menuImage'

const props = defineProps({
  restaurant: {
    type: Object,
    required: true,
  },
  table: {
    type: Object,
    default: null,
  },
})

const { messages, text } = useMenuLanguage()
const phoneHref = computed(() => String(props.restaurant.phone || '').replace(/[^\d+]/g, ''))
</script>
