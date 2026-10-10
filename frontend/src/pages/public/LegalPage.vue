<template>
  <q-page class="landing-page legal-page">
    <LandingNavbar />

    <section v-if="kind === 'terms'" class="terms-page">
      <div class="landing-wrap terms-page__wrap">
        <header class="landing-heading">
          <p class="landing-heading__eyebrow">Sürüm {{ termsVersion }}</p>
          <h1 class="landing-heading__title">{{ document.title }}</h1>
          <p class="landing-heading__text">{{ document.description }}</p>
        </header>

        <div class="terms-bar">
          <div>
            <p class="terms-bar__label">Deneme</p>
            <p class="terms-bar__value">7 gün</p>
          </div>
          <p>
            Kayıt, 7 günlük deneme başlatır. Bu sürede panel ve misafir menüsü açıktır. Süre bitince
            panel, satın alma tamamlanana kadar kapalı kalır.
          </p>
          <q-btn
            class="landing-btn"
            unelevated
            no-caps
            color="primary"
            label="Kayıt ol"
            :to="{ name: 'register' }"
          />
        </div>

        <ol class="terms-steps">
          <li v-for="(section, index) in document.sections" :key="section.heading" class="terms-step">
            <div class="terms-step__rail">
              <span class="terms-step__index">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div class="terms-step__body">
              <h2>{{ section.heading }}</h2>
              <LegalText :paragraphs="section.paragraphs" />
            </div>
          </li>
        </ol>

        <LegalLinks :items="others" />
      </div>
    </section>

    <section v-else-if="kind === 'privacy'" class="privacy-page">
      <div class="landing-wrap">
        <header class="landing-heading">
          <p class="landing-heading__eyebrow">İşlenen veriler</p>
          <h1 class="landing-heading__title">{{ document.title }}</h1>
          <p class="landing-heading__text">{{ document.description }}</p>
        </header>

        <div class="privacy-grid">
          <article v-for="section in document.sections" :key="section.heading" class="landing-card privacy-card">
            <div class="feature-card__icon">
              <q-icon :name="privacyIcons[section.heading]" size="22px" />
            </div>
            <h2>{{ section.heading }}</h2>
            <LegalText :paragraphs="section.paragraphs" />
          </article>
        </div>

        <LegalLinks :items="others" />
      </div>
    </section>

    <section v-else class="notice">
      <div class="landing-wrap notice__wrap">
        <header class="landing-heading">
          <p class="landing-heading__eyebrow">6698 sayılı Kanun</p>
          <h1 class="landing-heading__title">{{ document.title }}</h1>
          <p class="landing-heading__text">{{ document.description }}</p>
        </header>

        <div class="notice__layout">
          <article class="notice__body">
            <section v-for="(section, index) in document.sections" :key="section.heading" class="notice__article">
              <h2>
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                {{ section.heading }}
              </h2>
              <LegalText :paragraphs="section.paragraphs" />
            </section>
          </article>

          <aside class="notice__aside">
            <div class="notice-card">
              <p class="notice-card__label">Sürüm</p>
              <p class="notice-card__value">{{ termsVersion }}</p>
              <p>Kayıt, bu sürümün kabul edildiğini hesapta saklar.</p>
            </div>
            <div class="notice-card notice-card--call">
              <p class="notice-card__label">Başvuru hattı</p>
              <a class="notice-phone" :href="phoneHref">{{ phone }}</a>
              <p>KVKK m. 11 talepleri bu numaraya iletilir. Talepte kayıtlı e-posta adresi belirtilir.</p>
              <q-btn
                class="landing-btn"
                unelevated
                no-caps
                color="primary"
                icon="call"
                label="Ara"
                :href="phoneHref"
              />
            </div>
          </aside>
        </div>

        <LegalLinks :items="others" />
      </div>
    </section>

    <LandingFooter />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LegalLinks from '@/components/landing/LegalLinks.vue'
import LegalText from '@/components/landing/LegalText.vue'
import { legalDocuments, termsVersion } from '@/data/legal'
import { SALES_PHONE, SALES_PHONE_HREF } from '@/utils/constants'

const privacyIcons = {
  'Hesap verisi': 'badge',
  'Menü ve görsel': 'image',
  Misafir: 'person_off',
  Saklama: 'schedule',
}

const route = useRoute()
const document = computed(() => legalDocuments[route.meta.document])
const kind = computed(() => route.meta.document)
const phone = SALES_PHONE
const phoneHref = SALES_PHONE_HREF
const others = computed(() =>
  [
    { name: 'terms', title: legalDocuments.terms.title },
    { name: 'privacy', title: legalDocuments.privacy.title },
    { name: 'kvkk', title: legalDocuments.kvkk.title },
  ].filter((item) => item.name !== route.name),
)
</script>
