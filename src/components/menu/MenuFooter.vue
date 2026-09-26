<template>
  <footer class="menu-footer">
    <div class="menu-footer__name">{{ restaurant.name }}</div>
    <p>{{ text(restaurant.address) }}</p>
    <p>{{ text(restaurant.hours) }}</p>
    <p>
      <a class="menu-link" :href="`tel:${phoneHref}`">{{ restaurant.phone }}</a>
    </p>
    <div class="menu-footer__social">
      <span class="menu-footer__label">{{ messages.social }}</span>
      <a
        v-for="social in restaurant.socials"
        :key="social.name"
        class="menu-link"
        :href="social.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ social.name }}
      </a>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const props = defineProps({
  restaurant: {
    type: Object,
    required: true,
  },
})

const { messages, text } = useMenuLanguage()
const phoneHref = computed(() => String(props.restaurant.phone || '').replace(/[^\d+]/g, ''))
</script>
