<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <q-page-container>
      <q-page class="auth-layout__page">
        <aside class="auth-layout__aside">
          <router-link class="auth-layout__wordmark" :to="{ name: 'public-home' }">
            {{ APP_NAME }}
          </router-link>
          <div>
            <h2 class="auth-layout__headline">Menünüz her masada, kontrol panelinizde.</h2>
            <p class="auth-layout__lead">
              İşletmenizi açın, menüyü girin ve QR kodu masaya koyun. Fiyat değişince menü de
              değişir.
            </p>
          </div>
        </aside>

        <div class="auth-layout__main">
          <router-link class="auth-layout__brand" :to="{ name: 'public-home' }">
            <AppBrand />
          </router-link>
          <div class="auth-layout__panel">
            <router-view />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AppBrand from '@/components/common/AppBrand.vue'
import { APP_NAME } from '@/utils/constants'
</script>
