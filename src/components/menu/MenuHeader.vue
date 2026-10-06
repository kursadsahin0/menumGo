<template>
  <header class="menu-header" :class="{ 'menu-header--cover': restaurant.coverImage }">
    <img
      v-if="restaurant.coverImage"
      class="menu-cover"
      :src="menuImage(restaurant.coverImage, 1200)"
      alt=""
    />
    <MenuPhoto
      v-if="restaurant.logo"
      class="menu-logo"
      :photo="restaurant.logo"
      :alt="restaurant.name"
      size="logo"
      priority
    />
    <h1 class="menu-header__name">{{ restaurant.name }}</h1>
    <p v-if="table?.name" class="menu-header__table">{{ table.name }}</p>
    <button v-if="hasVenue" type="button" class="menu-venue" @click="venueOpen = true">
      <q-icon name="storefront" size="18px" />
      {{ messages.venue }}
    </button>
    <MenuGuestActions
      :wifi-name="restaurant.wifiName"
      :wifi-password="restaurant.wifiPassword"
      :table-name="table?.name || ''"
      :request-waiter="requestWaiter"
    />
    <MenuVenueDialog v-model="venueOpen" :restaurant="restaurant" />
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import MenuGuestActions from '@/components/menu/MenuGuestActions.vue'
import MenuPhoto from '@/components/menu/MenuPhoto.vue'
import MenuVenueDialog from '@/components/menu/MenuVenueDialog.vue'
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
  requestWaiter: {
    type: Function,
    default: null,
  },
})

const { messages, text } = useMenuLanguage()
const venueOpen = ref(false)
const hasVenue = computed(
  () =>
    Boolean(
      text(props.restaurant.description) ||
        text(props.restaurant.hours) ||
        props.restaurant.phone ||
        text(props.restaurant.address) ||
        props.restaurant.socials?.length,
    ),
)
</script>
