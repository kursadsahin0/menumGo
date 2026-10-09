<template>
  <footer class="landing-footer">
    <div class="landing-wrap landing-footer__main">
      <div class="landing-footer__brand">
        <AppBrand />
        <p class="landing-footer__text">
          Kafeler, restoranlar ve barlar için dijital QR menü. Menünüz masada, kontrol sizde.
        </p>
      </div>

      <nav class="landing-footer__nav" aria-label="Alt bağlantılar">
        <a
          v-for="item in landingNav"
          :key="item.href"
          class="landing-footer__link"
          :href="item.href"
        >
          {{ item.label }}
        </a>
        <router-link class="landing-footer__link" :to="{ name: 'login' }">Giriş Yap</router-link>
        <router-link class="landing-footer__link" :to="{ name: 'terms' }">Kullanım koşulları</router-link>
        <router-link class="landing-footer__link" :to="{ name: 'privacy' }">Gizlilik</router-link>
        <router-link class="landing-footer__link" :to="{ name: 'kvkk' }">KVKK</router-link>
      </nav>
    </div>

    <div class="landing-wrap landing-footer__bar">
      <span>© {{ year }} {{ APP_NAME }}</span>
      <span>Dijital menü, baskı beklemeden.</span>
    </div>
  </footer>
</template>

<script setup>
import AppBrand from '@/components/common/AppBrand.vue'
import { APP_NAME } from '@/utils/constants'
import { landingNav } from '@/data/landing'

const year = new Date().getFullYear()
</script>
