<template>
  <footer class="menu-footer">
    <div class="menu-footer__name">{{ restaurant.name }}</div>
    <button v-if="hasVenue" type="button" class="menu-venue" @click="venueOpen = true">
      <q-icon name="storefront" size="18px" />
      {{ messages.venue }}
    </button>
    <MenuVenueDialog v-model="venueOpen" :restaurant="restaurant" />
  </footer>
</template>

<script setup>
import { computed, ref } from 'vue'
import MenuVenueDialog from '@/components/menu/MenuVenueDialog.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const props = defineProps({
  restaurant: {
    type: Object,
    required: true,
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
