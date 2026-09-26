<template>
  <section id="ozellikler" class="landing-section landing-band">
    <div class="landing-wrap">
      <LandingSectionHeading
        eyebrow="Özellikler"
        title="Servisi yavaşlatmadan menüyü yönetin."
        text="Tek QR, güncel fiyat, iki dil. Masa başına ayrı kod yok."
      />

      <div class="feature-grid">
        <q-card v-for="feature in landingFeatures" :key="feature.title" flat class="landing-card">
          <q-card-section>
            <div class="feature-card__icon">
              <q-icon :name="feature.icon" size="22px" />
            </div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__text">{{ feature.text }}</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </section>
</template>

<script setup>
import LandingSectionHeading from '@/components/landing/LandingSectionHeading.vue'
import { landingFeatures } from '@/data/landing'
</script>
