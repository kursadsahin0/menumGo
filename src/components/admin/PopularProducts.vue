<template>
  <q-card flat class="dashboard-card">
    <q-card-section>
      <h2 class="dashboard-block__title">En çok görüntülenen ürünler</h2>
      <q-list v-if="products.length">
        <q-item v-for="product in products" :key="product.id">
          <q-item-section>
            <q-item-label>{{ product.name }}</q-item-label>
            <q-item-label caption>{{ product.category }}</q-item-label>
            <q-linear-progress
              class="q-mt-xs"
              :value="share(product.views)"
              color="primary"
              rounded
            />
          </q-item-section>
          <q-item-section side>{{ product.views }}</q-item-section>
        </q-item>
      </q-list>
      <EmptyState
        v-else
        icon="restaurant_menu"
        title="Henüz görüntüleme yok"
        text="Menü açıldıkça ürünler burada sıralanır."
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

const maxViews = computed(() => Math.max(...props.products.map((item) => item.views), 1))

function share(views) {
  return views / maxViews.value
}
</script>
