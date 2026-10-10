<template>
  <button
    type="button"
    class="menu-card"
    :class="{ 'menu-card--sold': !product.isAvailable }"
    @click="emit('open', product)"
  >
    <span class="menu-card__media">
      <MenuPhoto :photo="product.image" :alt="text(product.name)" size="thumb" />
    </span>
    <span class="menu-card__body">
      <span v-if="product.isFeatured || !product.isAvailable" class="menu-card__flags">
        <span v-if="product.isFeatured" class="menu-badge menu-badge--featured">
          {{ messages.featured }}
        </span>
        <span v-if="!product.isAvailable" class="menu-badge menu-badge--sold">
          {{ messages.soldOut }}
        </span>
      </span>
      <span class="menu-card__top">
        <span class="menu-card__name">{{ text(product.name) }}</span>
        <span class="menu-prices">
          <span v-if="hasDiscount" class="menu-price menu-price--deal">
            {{ formatTry(product.discountedPrice) }}
          </span>
          <span class="menu-price" :class="{ 'menu-price--old': hasDiscount }">
            {{ formatTry(product.price) }}
          </span>
        </span>
      </span>
      <span v-if="text(product.description)" class="menu-card__description">
        {{ text(product.description) }}
      </span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import MenuPhoto from '@/components/menu/MenuPhoto.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { formatTry } from '@/utils/currency'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open'])
const { messages, text } = useMenuLanguage()
const hasDiscount = computed(
  () => props.product.discountedPrice != null && props.product.discountedPrice !== '',
)
</script>
