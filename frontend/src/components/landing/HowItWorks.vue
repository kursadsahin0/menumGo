<template>
  <section id="nasil-calisir" class="landing-section">
    <div class="landing-wrap">
      <LandingSectionHeading
        eyebrow="Nasıl çalışır?"
        title="Üç adımda masada yayında."
        text="Menüyü siz girer, tek kodu masaya siz koyarsınız."
      />

      <div class="steps">
        <q-card v-for="step in landingSteps" :key="step.index" flat class="landing-card step-card">
          <q-card-section>
            <div class="step-card__index">{{ step.index }}</div>
            <h3 class="step-card__title">{{ step.title }}</h3>
            <p class="step-card__text">{{ step.text }}</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </section>
</template>

<script setup>
import LandingSectionHeading from '@/components/landing/LandingSectionHeading.vue'
import { landingSteps } from '@/data/landing'
</script>
