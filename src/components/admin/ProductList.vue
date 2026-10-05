<template>
  <div class="product-list">
    <section v-for="group in groups" :key="group.id" class="product-group">
      <h2 class="product-group__title">
        {{ trText(group.name) }}
        <span class="product-group__count">{{ group.products.length }} ürün</span>
      </h2>

      <div class="product-sheet" :class="{ 'product-sheet--sortable': sortable }">
        <div class="product-head">
          <span v-if="sortable"></span>
          <span></span>
          <span>Ürün</span>
          <span>Fiyat</span>
          <span>Durum</span>
          <span>İşlemler</span>
        </div>

        <article
          v-for="(product, index) in group.products"
          :key="product.id"
          class="product-row"
          :class="{
            'is-off': !product.isAvailable,
            'product-row--dragging': drag.groupId === group.id && drag.index === index,
          }"
          @dragover.prevent
          @drop="move(group, index)"
        >
          <span
            v-if="sortable"
            class="product-handle"
            draggable="true"
            aria-label="Sırayı değiştir"
            @dragstart="startDrag(group.id, index, $event)"
            @dragend="drag = { groupId: '', index: -1 }"
          >
            <q-icon name="drag_indicator" />
          </span>
          <div class="product-row__media">
            <img
              v-if="product.image"
              class="product-thumb"
              :src="product.image"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div v-else class="product-thumb product-thumb--empty">
              <q-icon name="restaurant" />
            </div>
          </div>

          <div class="product-row__name">
            <div class="product-row__title">{{ trText(product.name) }}</div>
            <div v-if="trText(product.description)" class="product-row__description">
              {{ trText(product.description) }}
            </div>
          </div>

          <div class="product-row__price">
            <span class="product-row__amount">{{ formatTry(currentPrice(product)) }}</span>
            <span v-if="hasDiscount(product)" class="product-row__compare">
              {{ formatTry(product.price) }}
            </span>
          </div>

          <span class="product-status" :class="{ 'is-off': !product.isAvailable }">
            {{ product.isAvailable ? 'Mevcut' : 'Tükendi' }}
          </span>

          <div class="product-actions">
            <q-btn flat round dense icon="edit" aria-label="Düzenle" @click="emit('edit', product)">
              <q-tooltip>Düzenle</q-tooltip>
            </q-btn>
            <span class="product-actions__split" aria-hidden="true"></span>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              color="negative"
              aria-label="Sil"
              @click="emit('remove', product)"
            >
              <q-tooltip>Sil</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>
    </section>

    <EmptyState
      v-if="products.length === 0"
      icon="restaurant_menu"
      title="Ürün bulunamadı"
      text="Aramayı değiştirin veya yeni bir ürün ekleyin."
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatTry } from '@/utils/currency'
import { trText } from '@/utils/localeText'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  sortable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['edit', 'remove', 'reorder'])
const drag = ref({ groupId: '', index: -1 })

function startDrag(groupId, index, event) {
  drag.value = { groupId, index }

  if (!event.dataTransfer) {
    return
  }

  event.dataTransfer.effectAllowed = 'move'

  try {
    event.dataTransfer.setData('text/plain', String(index))
  } catch {
    // Some browsers reject setData outside a real drag gesture.
  }
}

function move(group, index) {
  const from = drag.value
  drag.value = { groupId: '', index: -1 }

  if (from.groupId !== group.id || from.index < 0 || from.index === index) {
    return
  }

  const next = group.products.slice()
  const [item] = next.splice(from.index, 1)
  next.splice(index, 0, item)
  emit(
    'reorder',
    next.map((product) => product.id),
  )
}

function hasDiscount(product) {
  return product.discountedPrice != null && Number(product.discountedPrice) < Number(product.price)
}

function currentPrice(product) {
  return hasDiscount(product) ? product.discountedPrice : product.price
}

const groups = computed(() => {
  const known = new Set(props.categories.map((category) => category.id))
  const buckets = new Map()

  props.products.forEach((product) => {
    const id = known.has(product.categoryId) ? product.categoryId : 'uncategorized'
    const list = buckets.get(id) || []
    list.push(product)
    buckets.set(id, list)
  })

  const sortProducts = (list) =>
    list
      .slice()
      .sort(
        (a, b) => a.sortOrder - b.sortOrder || trText(a.name).localeCompare(trText(b.name), 'tr'),
      )

  const grouped = props.categories
    .filter((category) => buckets.has(category.id))
    .map((category) => ({
      id: category.id,
      name: category.name,
      products: sortProducts(buckets.get(category.id)),
    }))

  if (buckets.has('uncategorized')) {
    grouped.push({
      id: 'uncategorized',
      name: 'Kategorisiz',
      products: sortProducts(buckets.get('uncategorized')),
    })
  }

  return grouped
})
</script>
