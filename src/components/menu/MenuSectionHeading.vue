<template>
  <header class="menu-section__head">
    <img
      v-if="image"
      class="menu-section__photo"
      :src="menuImage(image, 160)"
      alt=""
      width="56"
      height="56"
    />
    <div>
      <h2 class="menu-section__title">{{ text(name) }}</h2>
      <p v-if="text(description)" class="menu-section__text">{{ text(description) }}</p>
    </div>
  </header>
</template>

<script setup>
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { menuImage } from '@/utils/menuImage'

defineProps({
  name: {
    type: [String, Object],
    default: '',
  },
  description: {
    type: [String, Object],
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
})

const { text } = useMenuLanguage()
</script>
