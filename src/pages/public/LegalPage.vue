<template>
  <q-page class="landing-page legal-page">
    <LandingNavbar />
    <article class="landing-wrap landing-wrap--narrow legal">
      <header class="legal__header">
        <p class="landing-heading__eyebrow">Sürüm {{ termsVersion }}</p>
        <h1 class="landing-heading__title">{{ document.title }}</h1>
      </header>
      <section v-for="section in document.sections" :key="section.heading" class="legal__section">
        <h2>{{ section.heading }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </section>
      <nav class="legal__nav" aria-label="Diğer metinler">
        <router-link
          v-for="item in others"
          :key="item.name"
          class="legal__link"
          :to="{ name: item.name }"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </article>
    <LandingFooter />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import { legalDocuments, termsVersion } from '@/data/legal'

const route = useRoute()
const document = computed(() => legalDocuments[route.meta.document])
const others = computed(() =>
  [
    { name: 'terms', title: legalDocuments.terms.title },
    { name: 'privacy', title: legalDocuments.privacy.title },
    { name: 'kvkk', title: legalDocuments.kvkk.title },
  ].filter((item) => item.name !== route.name),
)
</script>
