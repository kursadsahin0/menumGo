<template>
  <q-page>
    <div class="page-shell page-shell--wide">
      <PageHeader title="Menüler" subtitle="İşletmeye ait menü listesi." />

      <q-banner v-if="menu.error" class="bg-negative text-white q-mb-md" rounded>
        {{ menu.error.message }}
      </q-banner>

      <q-list bordered separator>
        <q-item v-for="item in menu.menus" :key="item.id">
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
            <q-item-label caption>{{ item.slug }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="item.isPublished ? 'positive' : 'grey'"
              :label="item.isPublished ? 'Yayında' : 'Taslak'"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="menu.status === 'success' && menu.menus.length === 0" class="text-grey-7 q-mt-md">
        Henüz menü yok.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { useMenuStore } from '@/stores/menu'

const menu = useMenuStore()

onMounted(() => {
  menu.fetchMenus().catch(() => {})
})
</script>
