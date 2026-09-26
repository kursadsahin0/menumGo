<template>
  <section id="sss" class="landing-section landing-band">
    <div class="landing-wrap landing-wrap--narrow">
      <LandingSectionHeading
        eyebrow="SSS"
        title="Başlamadan önce."
        text="Kısa cevaplar. Kurulum sırasında sürpriz çıkmasın."
      />

      <q-list class="faq">
        <q-expansion-item
          v-for="item in landingFaqs"
          :key="item.question"
          :label="item.question"
          header-class="faq__question"
          expand-separator
        >
          <div class="faq__answer">{{ item.answer }}</div>
        </q-expansion-item>
      </q-list>
    </div>
  </section>
</template>

<script setup>
import LandingSectionHeading from '@/components/landing/LandingSectionHeading.vue'
import { landingFaqs } from '@/data/landing'
</script>
