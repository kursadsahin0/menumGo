<template>
  <div class="pay-card-scene" aria-hidden="true">
    <div class="pay-card" :class="{ 'is-back': flipped }">
      <div class="pay-card__face pay-card__face--front">
        <div class="pay-card__top">
          <div class="pay-card__tools">
            <svg class="pay-card__chip" viewBox="0 0 46 34">
              <defs>
                <linearGradient id="pay-card-chip" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#f4e7d2" />
                  <stop offset="0.48" stop-color="#d4b896" />
                  <stop offset="1" stop-color="#8d6a45" />
                </linearGradient>
              </defs>
              <rect width="46" height="34" rx="6" fill="url(#pay-card-chip)" />
              <path
                d="M0 12h46M0 22h46M16 0v34M30 0v34"
                fill="none"
                stroke="rgba(80, 52, 24, 0.35)"
                stroke-width="1"
              />
            </svg>
            <svg class="pay-card__wave" viewBox="0 0 28 28">
              <path d="M9 9.5c2.2 2 2.2 7 0 9" />
              <path d="M13.5 6.5c3.6 3.2 3.6 11.8 0 15" />
              <path d="M18 3.8c5 4.6 5 15.8 0 20.4" />
            </svg>
          </div>
        </div>

        <p class="pay-card__number" :class="{ 'is-hot': active === 'number' }">
          <span v-for="(group, index) in numberGroups" :key="index" class="pay-card__group">
            <span
              v-for="(char, charIndex) in group"
              :key="charIndex"
              :class="{ 'is-empty': char === '•' }"
            >{{ char }}</span>
          </span>
        </p>

        <div class="pay-card__bottom">
          <p :class="{ 'is-hot': active === 'holder' }">
            <span>Kart sahibi</span>
            <strong>{{ holderLabel }}</strong>
          </p>
          <p :class="{ 'is-hot': active === 'expiry' }">
            <span>SKT</span>
            <strong :class="{ 'is-empty': !expiry }">{{ expiryLabel }}</strong>
          </p>
        </div>
      </div>

      <div class="pay-card__face pay-card__face--back">
        <span class="pay-card__stripe"></span>
        <div class="pay-card__sign">
          <span>Güvenlik kodu</span>
          <strong>{{ cvcLabel }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  holder: { type: String, default: '' },
  number: { type: String, default: '' },
  expiry: { type: String, default: '' },
  cvc: { type: String, default: '' },
  active: { type: String, default: '' },
  flipped: { type: Boolean, default: false },
})

const numberGroups = computed(() => {
  const digits = String(props.number || '').replace(/\D/g, '').slice(0, 16)
  return [0, 1, 2, 3].map((index) => (digits.slice(index * 4, index * 4 + 4) + '••••').slice(0, 4))
})

const holderLabel = computed(() => {
  const name = String(props.holder || '').trim()
  return (name || 'Ad Soyad').toLocaleUpperCase('tr-TR')
})

const expiryLabel = computed(() => props.expiry || 'AA/YY')

const cvcLabel = computed(() => {
  const digits = String(props.cvc || '').replace(/\D/g, '').slice(0, 4)
  return digits || '•••'
})
</script>
