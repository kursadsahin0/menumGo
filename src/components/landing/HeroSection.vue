<template>
  <section class="landing-section hero">
    <div class="landing-wrap hero__grid">
      <div class="hero__copy">
        <p class="landing-heading__eyebrow">Kafe, restoran ve barlar için</p>
        <h1 class="hero__title">Menünüz her masada, her zaman güncel.</h1>
        <p class="hero__text">
          Misafirler tek QR kodu okutup menüyü telefonunda açar. Fiyat değişince menü de değişir.
          Baskı beklemezsiniz.
        </p>
        <div class="hero__actions">
          <q-btn
            unelevated
            no-caps
            color="primary"
            label="Menüyü Gör"
            class="landing-btn"
            :to="{ name: 'public-menu', params: { restaurantSlug: 'burger-house' } }"
          />
        </div>
      </div>

      <div class="hero__stage">
        <div class="phone" aria-hidden="true">
          <div class="phone__screen">
            <div class="phone__notch"></div>
            <div class="phone__top">
              <div>
                <div class="phone__venue">{{ heroMenu.venue }}</div>
                <div class="phone__meta">Dijital menü</div>
              </div>
            </div>

            <div v-for="category in heroMenu.categories" :key="category.name" class="phone__group">
              <div class="phone__category">{{ category.name }}</div>
              <q-list>
                <q-item v-for="item in category.items" :key="item.name" class="phone__item">
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="phone__price">{{ item.price }}</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
        <p class="hero__caption">Misafirin telefonunda gördüğü menü</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { heroMenu } from '@/data/landing'
</script>
