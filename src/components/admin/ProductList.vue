<template>
  <div class="product-list">
    <div v-if="groups.length" class="product-head">
      <span></span>
      <span>Ürün</span>
      <span>Fiyat</span>
      <span>İndirimli fiyat</span>
      <span>Durum</span>
      <span>Öne çıkan</span>
      <span>İşlemler</span>
    </div>

    <section v-for="group in groups" :key="group.id" class="product-group">
      <h2 class="product-group__title">
        {{ group.name }}
        <span class="product-group__count">{{ group.products.length }} ürün</span>
      </h2>

      <q-card v-for="product in group.products" :key="product.id" flat class="product-row">
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
          <div class="product-row__title">{{ product.name }}</div>
          <div v-if="product.description" class="product-row__description">
            {{ product.description }}
          </div>
        </div>

        <div class="product-row__price">
          <span class="row-label">Fiyat</span>
          {{ formatTry(product.price) }}
        </div>
        <div class="product-row__deal">
          <span class="row-label">İndirimli fiyat</span>
          {{ formatTry(product.discountedPrice) }}
        </div>

        <q-badge
          :color="product.isAvailable ? 'positive' : 'grey-7'"
          :label="product.isAvailable ? 'Mevcut' : 'Tükendi'"
        />

        <q-icon
          class="product-row__featured"
          :name="product.isFeatured ? 'star' : 'star_border'"
          :color="product.isFeatured ? 'primary' : 'grey-6'"
          size="20px"
        />

        <div class="product-actions">
          <q-btn flat round dense icon="edit" aria-label="Düzenle" @click="emit('edit', product)">
            <q-tooltip>Düzenle</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            :icon="product.isAvailable ? 'toggle_on' : 'toggle_off'"
            aria-label="Aktif veya pasif yap"
            @click="emit('toggle-available', product)"
          >
            <q-tooltip>{{ product.isAvailable ? 'Pasif yap' : 'Aktif yap' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            :icon="product.isFeatured ? 'star' : 'star_border'"
            aria-label="Öne çıkar"
            @click="emit('toggle-featured', product)"
          >
            <q-tooltip>Öne çıkar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            aria-label="Sil"
            @click="emit('remove', product)"
          >
            <q-tooltip>Sil</q-tooltip>
          </q-btn>
        </div>
      </q-card>
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
import { computed } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatTry } from '@/utils/currency'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'remove', 'toggle-available', 'toggle-featured'])

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
    list.slice().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'))

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
