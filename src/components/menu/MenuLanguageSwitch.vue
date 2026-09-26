<template>
  <div class="menu-lang" role="group" :aria-label="locale === 'tr' ? 'Dil' : 'Language'">
    <button
      type="button"
      class="menu-lang__btn"
      :class="{ 'is-active': locale === 'tr' }"
      @click="setLocale('tr')"
    >
      TR
    </button>
    <button
      type="button"
      class="menu-lang__btn"
      :class="{ 'is-active': locale === 'en' }"
      @click="setLocale('en')"
    >
      EN
    </button>
  </div>
</template>

<script setup>
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const { locale, setLocale } = useMenuLanguage()
</script>
