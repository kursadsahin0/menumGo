<template>
  <q-card flat class="dashboard-card">
    <q-card-section>
      <h2 class="dashboard-block__title">Son aktiviteler</h2>
      <q-list v-if="activity.length">
        <q-item v-for="item in activity" :key="item.id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" :icon="item.icon" size="36px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
            <q-item-label caption>{{ item.time }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <EmptyState
        v-else
        icon="history"
        title="Henüz aktivite yok"
        text="Yaptığınız işlemler burada görünür."
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import EmptyState from '@/components/common/EmptyState.vue'

defineProps({
  activity: {
    type: Array,
    default: () => [],
  },
})
</script>
