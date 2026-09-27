<template>
  <header class="landing-nav">
    <q-toolbar class="landing-nav__bar">
      <router-link class="landing-nav__brand" :to="{ name: 'admin-dashboard' }">
        <AppBrand />
      </router-link>

      <nav class="landing-nav__links" aria-label="Sayfa bölümleri">
        <a v-for="item in landingNav" :key="item.href" class="landing-nav__link" :href="item.href">
          {{ item.label }}
        </a>
      </nav>

      <div class="landing-nav__actions">
        <q-btn
          class="landing-nav__register"
          flat
          no-caps
          color="primary"
          label="Kayıt ol"
          :to="{ name: 'register' }"
        />
        <q-btn
          class="landing-nav__login"
          unelevated
          no-caps
          color="primary"
          label="Giriş Yap"
          :to="{ name: 'login' }"
        />
        <q-btn
          class="landing-nav__menu-btn"
          flat
          round
          icon="menu"
          aria-label="Menüyü aç"
          @click="menuOpen = true"
        />
      </div>
    </q-toolbar>

    <q-dialog v-model="menuOpen" position="right" full-height>
      <q-card class="landing-nav__panel">
        <q-card-section class="row items-center">
          <router-link
            class="landing-nav__brand"
            :to="{ name: 'admin-dashboard' }"
            @click="menuOpen = false"
          >
            <AppBrand />
          </router-link>
          <q-space />
          <q-btn flat round icon="close" aria-label="Menüyü kapat" @click="menuOpen = false" />
        </q-card-section>

        <q-list padding>
          <q-item
            v-for="item in landingNav"
            :key="item.href"
            v-ripple
            clickable
            :href="item.href"
            @click="menuOpen = false"
          >
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>

        <q-card-actions vertical class="q-px-md q-pb-lg">
          <q-btn
            flat
            no-caps
            color="primary"
            label="Kayıt ol"
            :to="{ name: 'register' }"
            @click="menuOpen = false"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Giriş Yap"
            :to="{ name: 'login' }"
            @click="menuOpen = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import AppBrand from '@/components/common/AppBrand.vue'
import { landingNav } from '@/data/landing'

const menuOpen = ref(false)
</script>
