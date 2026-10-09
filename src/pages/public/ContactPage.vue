<template>
  <q-page class="landing-page">
    <LandingNavbar />
    <section class="contact">
      <div class="landing-wrap">
        <header class="landing-heading">
          <p class="landing-heading__eyebrow">İletişim</p>
          <h1 class="landing-heading__title">Satın alma ve destek tek hatta.</h1>
          <p class="landing-heading__text">
            Deneme, satın alma ve sorularınız için aynı numarayı arayın.
          </p>
        </header>

        <div class="contact__grid">
          <article class="contact-card contact-card--call">
            <p class="contact-card__label">Abonelik hattı</p>
            <a class="contact-phone" :href="phoneHref">{{ phone }}</a>
            <p>Kayıtla 7 gün deneme başlar. Süre bitince satın alma bu numaradan tamamlanır.</p>
            <div class="contact-actions">
              <q-btn
                class="landing-btn"
                unelevated
                no-caps
                color="primary"
                icon="call"
                label="Ara"
                :href="phoneHref"
              />
              <q-btn
                class="landing-btn"
                outline
                no-caps
                color="primary"
                label="Kayıt ol"
                :to="{ name: 'register' }"
              />
            </div>
          </article>

          <article class="contact-card">
            <h2>Hakkımızda</h2>
            <p>
              menümGo, kafeler, restoranlar ve barlar için dijital QR menüdür. Misafir kodu okutur
              ve menüyü telefonunda görür.
            </p>
            <ul class="contact-points">
              <li v-for="item in points" :key="item">
                <q-icon name="check" size="16px" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
    <LandingFooter />
  </q-page>
</template>

<script setup>
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import { SALES_PHONE, SALES_PHONE_HREF } from '@/utils/constants'

const phone = SALES_PHONE
const phoneHref = SALES_PHONE_HREF
const points = [
  'Uygulama indirmeden menü açılır.',
  'Menüden sipariş verilmez ve ödeme alınmaz.',
  'Aynı menü Türkçe ve İngilizce durur.',
]
</script>
