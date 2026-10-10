<template>
  <q-card flat class="dashboard-card dashboard-activity">
    <q-expansion-item
      v-model="open"
      switch-toggle-side
      expand-icon-class="dashboard-activity__chevron"
      header-class="dashboard-activity__header"
    >
      <template #header>
        <div class="dashboard-activity__head">
          <h2 class="dashboard-block__title">Son aktiviteler</h2>
          <span v-if="activity.length" class="dashboard-activity__count">{{ activity.length }}</span>
        </div>
      </template>

      <div class="dashboard-activity__body">
        <q-list v-if="activity.length" class="dashboard-activity__list">
          <q-item v-for="item in activity" :key="item.id" class="dashboard-activity__item">
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
      </div>
    </q-expansion-item>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import EmptyState from '@/components/common/EmptyState.vue'

defineProps({
  activity: {
    type: Array,
    default: () => [],
  },
})

const $q = useQuasar()
const open = ref(!$q.screen.lt.lg)

watch(
  () => $q.screen.lt.lg,
  (mobile) => {
    open.value = !mobile
  },
)
</script>
