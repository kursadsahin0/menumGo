<template>
  <q-dialog v-model="open" :position="$q.screen.lt.sm ? 'bottom' : 'standard'">
    <q-card class="menu-dialog menu-venue-dialog">
      <div class="menu-venue-dialog__head">
        <p class="menu-venue-dialog__kicker">{{ messages.venue }}</p>
        <button
          type="button"
          class="menu-venue-dialog__close"
          :aria-label="messages.close"
          @click="open = false"
        >
          <q-icon name="close" size="18px" />
        </button>
      </div>
      <h2 class="menu-venue-dialog__name">{{ restaurant.name }}</h2>
      <p v-if="text(restaurant.description)" class="menu-venue-dialog__about">
        {{ text(restaurant.description) }}
      </p>
      <dl v-if="hasFacts || restaurant.socials?.length" class="menu-venue-dialog__list">
        <div v-if="text(restaurant.hours)">
          <dt>{{ messages.hours }}</dt>
          <dd>{{ text(restaurant.hours) }}</dd>
        </div>
        <div v-if="restaurant.phone">
          <dt>{{ messages.phone }}</dt>
          <dd>
            <a :href="`tel:${phoneHref}`">{{ restaurant.phone }}</a>
          </dd>
        </div>
        <div v-if="text(restaurant.address)">
          <dt>{{ messages.address }}</dt>
          <dd>
            <a :href="restaurant.mapsUrl" target="_blank" rel="noopener noreferrer">
              {{ text(restaurant.address) }}
            </a>
          </dd>
        </div>
        <div v-if="restaurant.socials?.length">
          <dt>{{ messages.social }}</dt>
          <dd class="menu-venue-dialog__socials">
            <a
              v-for="social in restaurant.socials"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ social.name }}
            </a>
          </dd>
        </div>
      </dl>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useMenuLanguage } from '@/composables/useMenuLanguage'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  restaurant: {
    type: Object,
    required: true,
  },
})

const $q = useQuasar()
const { messages, text } = useMenuLanguage()
const phoneHref = computed(() => String(props.restaurant.phone || '').replace(/[^\d+]/g, ''))
const hasFacts = computed(
  () =>
    Boolean(text(props.restaurant.hours) || props.restaurant.phone || text(props.restaurant.address)),
)
</script>
