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
        <img
          class="hero__phone"
          src="/landing/hero-phone.png?v=4"
          alt="Misafirin telefonunda gördüğü menü"
        />
        <p class="hero__caption">Misafirin telefonunda gördüğü menü</p>
      </div>
    </div>
  </section>
</template>
