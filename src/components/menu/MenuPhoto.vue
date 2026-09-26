<template>
  <img
    v-if="photo && !failed"
    class="menu-photo"
    :class="`menu-photo--${size}`"
    :src="menuImage(photo, width)"
    :srcset="menuImageSrcset(photo, width)"
    :sizes="sizes"
    :width="width"
    :height="height"
    :alt="alt"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : 'low'"
    decoding="async"
    @error="failed = true"
  />
  <div
    v-else
    class="menu-photo menu-photo--empty"
    :class="`menu-photo--${size}`"
    aria-hidden="true"
  >
    <q-icon name="restaurant" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { menuImage, menuImageSrcset } from '@/utils/menuImage'

const props = defineProps({
  photo: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'thumb',
  },
  priority: {
    type: Boolean,
    default: false,
  },
})

const frames = {
  logo: { width: 144, height: 144, sizes: '72px' },
  thumb: { width: 192, height: 192, sizes: '96px' },
  cover: { width: 720, height: 480, sizes: '(max-width: 560px) 100vw, 480px' },
}

const failed = ref(false)
const frame = computed(() => frames[props.size] || frames.thumb)
const width = computed(() => frame.value.width)
const height = computed(() => frame.value.height)
const sizes = computed(() => frame.value.sizes)

watch(
  () => props.photo,
  () => {
    failed.value = false
  },
)
</script>
