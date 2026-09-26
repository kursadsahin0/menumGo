<template>
  <q-card flat class="dashboard-card">
    <q-card-section>
      <h2 class="dashboard-block__title">En çok görüntülenen kategoriler</h2>
      <q-list v-if="categories.length">
        <q-item v-for="category in categories" :key="category.id">
          <q-item-section>
            <q-item-label>{{ category.name }}</q-item-label>
            <q-linear-progress
              class="q-mt-xs"
              :value="share(category.views)"
              color="primary"
              rounded
            />
          </q-item-section>
          <q-item-section side>{{ category.views }}</q-item-section>
        </q-item>
      </q-list>
      <EmptyState
        v-else
        icon="category"
        title="Henüz görüntüleme yok"
        text="Kategoriler menü açıldıkça burada sıralanır."
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
})

const maxViews = computed(() => Math.max(...props.categories.map((item) => item.views), 1))

function share(views) {
  return views / maxViews.value
}
</script>
