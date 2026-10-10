<template>
  <div class="landing-page not-found">
    <LandingNavbar />
    <main class="not-found__main">
      <div class="landing-wrap landing-wrap--narrow">
        <p class="landing-heading__eyebrow">404</p>
        <h1 class="landing-heading__title">Sayfa bulunamadı.</h1>
        <p class="landing-heading__text">
          Bu adres menümGo içinde yok. Ana sayfaya dönebilirsiniz.
        </p>
        <q-btn class="landing-btn" unelevated no-caps color="primary" label="Ana sayfa" to="/" />
      </div>
    </main>
    <LandingFooter />
  </div>
</template>

<script setup>
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
</script>
