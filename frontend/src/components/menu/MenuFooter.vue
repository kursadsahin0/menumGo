<template>
  <footer class="menu-footer">
    <div class="menu-footer__name">{{ restaurant.name }}</div>
    <button v-if="hasVenue" type="button" class="menu-venue" @click="venueOpen = true">
      <q-icon name="storefront" size="18px" />
      {{ messages.venue }}
    </button>
    <nav class="menu-footer__legal" aria-label="Yasal metinler">
      <router-link v-for="item in legalLinks" :key="item.to" :to="item.to">{{ item.label }}</router-link>
    </nav>
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
const legalLinks = computed(() => [
  { to: '/iletisim', label: messages.value.contact },
  { to: '/kullanim-kosullari', label: messages.value.terms },
  { to: '/gizlilik', label: messages.value.privacy },
  { to: '/kvkk', label: messages.value.kvkk },
])
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
