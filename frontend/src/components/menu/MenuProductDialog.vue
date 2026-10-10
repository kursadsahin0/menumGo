<template>
  <q-dialog v-model="open" :position="$q.screen.lt.sm ? 'bottom' : 'standard'">
    <q-card v-if="product" class="menu-dialog">
      <MenuPhoto :photo="product.image" :alt="text(product.name)" size="cover" />
      <q-card-section class="menu-dialog__body">
        <div v-if="product.isFeatured || !product.isAvailable" class="menu-dialog__badges">
          <span v-if="product.isFeatured" class="menu-badge menu-badge--featured">
            {{ messages.featured }}
          </span>
          <span v-if="!product.isAvailable" class="menu-badge menu-badge--sold">
            {{ messages.soldOut }}
          </span>
        </div>
        <h2 class="menu-dialog__name">{{ text(product.name) }}</h2>
        <p v-if="text(product.description)" class="menu-dialog__description">
          {{ text(product.description) }}
        </p>
        <dl v-if="hasDetails" class="menu-details">
          <div v-if="portion">
            <dt>{{ messages.portion }}</dt>
            <dd>{{ portion }}</dd>
          </div>
          <div v-if="ingredients">
            <dt>{{ messages.ingredients }}</dt>
            <dd>{{ ingredients }}</dd>
          </div>
          <div v-if="allergenLabels.length">
            <dt>{{ messages.allergens }}</dt>
            <dd class="menu-allergens">
              <span v-for="item in allergenLabels" :key="item" class="menu-allergen">{{ item }}</span>
            </dd>
          </div>
        </dl>
        <div class="menu-prices">
          <span v-if="hasDiscount" class="menu-price menu-price--deal">
            {{ formatTry(product.discountedPrice) }}
          </span>
          <span class="menu-price" :class="{ 'menu-price--old': hasDiscount }">
            {{ formatTry(product.price) }}
          </span>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps :label="messages.close" @click="open = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import MenuPhoto from '@/components/menu/MenuPhoto.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { allergenLabel } from '@/data/allergens'
import { formatTry } from '@/utils/currency'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
})

const $q = useQuasar()
const { locale, messages, text } = useMenuLanguage()
const portion = computed(() => text(props.product?.portion))
const ingredients = computed(() => text(props.product?.ingredients))
const allergenLabels = computed(() =>
  (props.product?.allergens || []).map((id) => allergenLabel(id, locale.value)).filter(Boolean),
)
const hasDetails = computed(
  () => Boolean(portion.value || ingredients.value || allergenLabels.value.length),
)
const hasDiscount = computed(
  () => props.product?.discountedPrice != null && props.product?.discountedPrice !== '',
)
</script>
