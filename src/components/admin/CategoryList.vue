<template>
  <div class="category-list">
    <div v-if="categories.length" class="category-head">
      <span></span>
      <span></span>
      <span>Kategori</span>
      <span>Ürün</span>
      <span>Durum</span>
      <span>İşlemler</span>
    </div>

    <article
      v-for="(category, index) in categories"
      :key="category.id"
      class="category-row"
      :class="{ 'category-row--dragging': dragIndex === index }"
      @dragover.prevent
      @drop="move(index)"
    >
      <span
        class="category-handle"
        draggable="true"
        aria-label="Sırayı değiştir"
        @dragstart="dragIndex = index"
        @dragend="dragIndex = -1"
      >
        <q-icon name="drag_indicator" />
      </span>

      <div class="category-row__media">
        <img v-if="category.image" class="product-thumb" :src="category.image" alt="" />
        <div v-else class="product-thumb product-thumb--empty">
          <q-icon name="category" />
        </div>
      </div>

      <div class="category-row__name">
        <div class="category-row__title">{{ trText(category.name) }}</div>
        <div v-if="trText(category.description)" class="category-row__description">
          {{ trText(category.description) }}
        </div>
      </div>

      <div class="category-row__count">{{ category.productCount || 0 }} ürün</div>

      <button
        type="button"
        class="category-row__status product-status"
        :class="{ 'is-off': !category.isActive }"
        @click="emit('toggle', category)"
      >
        {{ category.isActive ? 'Yayında' : 'Gizli' }}
      </button>

      <div class="category-actions">
        <q-btn flat round dense icon="edit" aria-label="Düzenle" @click="emit('edit', category)">
          <q-tooltip>Düzenle</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="delete_outline"
          color="negative"
          aria-label="Sil"
          @click="emit('remove', category)"
        >
          <q-tooltip>Sil</q-tooltip>
        </q-btn>
      </div>
    </article>

    <EmptyState
      v-if="categories.length === 0"
      icon="category"
      title="Kategori yok"
      text="Ürün eklemeden önce bir kategori oluşturun."
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { trText } from '@/utils/localeText'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'remove', 'toggle', 'reorder'])
const dragIndex = ref(-1)

function move(index) {
  const from = dragIndex.value
  dragIndex.value = -1

  if (from < 0 || from === index) {
    return
  }

  const next = props.categories.slice()
  const [item] = next.splice(from, 1)
  next.splice(index, 0, item)
  emit(
    'reorder',
    next.map((category) => category.id),
  )
}
</script>
