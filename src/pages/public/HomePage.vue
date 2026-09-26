<template>
  <q-page class="landing-page">
    <LandingNavbar />
    <HeroSection />
    <FeatureSection />
    <HowItWorks />
    <DashboardPreview />
    <FAQSection />
    <LandingFooter />
  </q-page>
</template>

<script setup>
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeatureSection from '@/components/landing/FeatureSection.vue'
import HowItWorks from '@/components/landing/HowItWorks.vue'
import DashboardPreview from '@/components/landing/DashboardPreview.vue'
import FAQSection from '@/components/landing/FAQSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>
