<template>
  <div class="menu-preview">
    <div class="menu-preview__label">Canlı önizleme</div>
    <div class="menu-preview__phone">
      <div
        class="menu-screen menu-preview__screen"
        :class="appearance.class"
        :style="appearance.style"
      >
        <div class="menu-page">
          <MenuHeader v-if="restaurant" :restaurant="restaurant" :request-waiter="callWaiter" />
          <nav class="menu-cats" aria-hidden="true">
            <span
              v-for="(category, index) in previewCategories"
              :key="category.id"
              class="menu-chip"
              :class="{ 'is-active': index === 0 }"
            >
              {{ text(category.name) }}
            </span>
          </nav>
          <section v-for="category in previewCategories" :key="category.id" class="menu-section">
            <MenuSectionHeading
              :name="category.name"
              :description="category.description"
              :image="category.image"
            />
            <div class="menu-section__list">
              <MenuProductCard
                v-for="product in category.products"
                :key="product.id"
                :product="product"
              />
            </div>
          </section>
          <MenuFooter v-if="restaurant" :restaurant="restaurant" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MenuFooter from '@/components/menu/MenuFooter.vue'
import MenuHeader from '@/components/menu/MenuHeader.vue'
import MenuProductCard from '@/components/menu/MenuProductCard.vue'
import MenuSectionHeading from '@/components/menu/MenuSectionHeading.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { requestWaiter } from '@/services/menuService'
import { useAuthStore } from '@/stores/auth'
import { menuAppearance, presentRestaurant } from '@/utils/menuAppearance'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  venue: {
    type: Object,
    default: null,
  },
})

const auth = useAuthStore()
const { text } = useMenuLanguage()

function callWaiter() {
  const slug = auth.user?.tenant?.slug

  if (!slug) {
    return Promise.reject(new Error('waiter'))
  }

  return requestWaiter(slug)
}
const appearance = computed(() => menuAppearance(props.settings))
const restaurant = computed(() =>
  presentRestaurant(
    {
      name: props.venue?.name || props.settings.name || 'Restoran',
      logo: props.venue?.logo || props.settings.logo,
      coverImage: props.venue?.coverImage || null,
      description: props.venue
        ? { tr: props.venue.description || '', en: props.venue.descriptionEn || '' }
        : props.settings.description,
      phone: props.settings.phone,
      address: props.settings.address,
      hours: props.settings.hours,
      socials: [],
    },
    props.settings,
  ),
)

const fallbackCategories = [
  {
    id: 'preview-burgers',
    name: { tr: 'Burger', en: 'Burgers' },
    products: [
      {
        id: 'preview-house',
        name: { tr: 'House Burger', en: 'House Burger' },
        description: {
          tr: '180 g dana, cheddar, ev sosu.',
          en: '180 g beef, cheddar, house sauce.',
        },
        price: 285,
        discountedPrice: 245,
        image: 'photo-1568901346375-23c9450c58cd',
        isAvailable: true,
        isFeatured: true,
      },
      {
        id: 'preview-cheese',
        name: { tr: 'Cheeseburger', en: 'Cheeseburger' },
        description: {
          tr: 'Çift cheddar ve karamelize soğan.',
          en: 'Double cheddar and caramelized onion.',
        },
        price: 265,
        discountedPrice: null,
        image: 'photo-1550547660-d9450f859349',
        isAvailable: true,
        isFeatured: false,
      },
    ],
  },
]

const previewCategories = computed(() => {
  const source = props.categories.length ? props.categories : fallbackCategories

  return source.slice(0, 2).map((category) => ({
    ...category,
    products: category.products.slice(0, 2),
  }))
})
</script>
