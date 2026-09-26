<template>
  <section class="landing-section landing-band">
    <div class="landing-wrap">
      <LandingSectionHeading
        eyebrow="Menü"
        title="Tek kod, güncel liste."
        text="Misafir aynı QR ile kategorileri, fiyatları ve tükenen ürünü görür."
      />

      <div class="dash">
        <div class="dash__chrome">
          <span class="dash__dot"></span>
          <span class="dash__dot"></span>
          <span class="dash__dot"></span>
          <div class="dash__url">menü / burger-house</div>
        </div>

        <div class="dash__body">
          <aside class="dash__sidebar">
            <q-list dense>
              <q-item
                v-for="item in dashboardNav"
                :key="item.label"
                :class="{ 'dash__item--active': item.active }"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" size="18px" />
                </q-item-section>
                <q-item-section>{{ item.label }}</q-item-section>
              </q-item>
            </q-list>
          </aside>

          <div class="dash__main">
            <div class="dash__stats">
              <q-card v-for="stat in dashboardStats" :key="stat.label" flat class="dash__stat">
                <q-card-section>
                  <div class="dash__stat-label">{{ stat.label }}</div>
                  <div class="dash__stat-value">{{ stat.value }}</div>
                </q-card-section>
              </q-card>
            </div>

            <q-card flat class="dash__table">
              <q-item class="dash__table-head">
                <q-item-section>Ürün</q-item-section>
                <q-item-section class="gt-xs">Kategori</q-item-section>
                <q-item-section side>Fiyat</q-item-section>
              </q-item>
              <q-separator />
              <q-list>
                <q-item v-for="item in dashboardItems" :key="item.name">
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                    <q-item-label caption class="lt-sm">{{ item.category }}</q-item-label>
                  </q-item-section>
                  <q-item-section class="gt-xs">{{ item.category }}</q-item-section>
                  <q-item-section side>
                    <div class="dash__price">
                      <span>{{ item.price }}</span>
                      <q-badge
                        :color="item.state === 'Güncellendi' ? 'primary' : 'positive'"
                        :label="item.state"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import LandingSectionHeading from '@/components/landing/LandingSectionHeading.vue'
import { dashboardItems, dashboardNav, dashboardStats } from '@/data/landing'
</script>
