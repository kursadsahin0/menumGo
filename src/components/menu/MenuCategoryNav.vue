<template>
  <nav ref="navEl" class="menu-cats" :aria-label="messages.menu">
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="menu-chip"
      :class="{ 'is-active': category.id === activeId }"
      :data-id="category.id"
      @click="emit('select', category.id)"
    >
      {{ text(category.name) }}
    </button>
  </nav>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  activeId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select'])
const navEl = ref(null)
const { messages, text } = useMenuLanguage()

watch(
  () => props.activeId,
  async (id) => {
    await nextTick()
    const chip = navEl.value?.querySelector(`[data-id="${id}"]`)

    if (!chip || !navEl.value) {
      return
    }

    const left = chip.offsetLeft - (navEl.value.clientWidth - chip.clientWidth) / 2
    navEl.value.scrollTo({ left: Math.max(0, left), behavior: 'auto' })
  },
)
</script>
