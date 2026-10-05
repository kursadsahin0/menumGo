<template>
  <q-page class="menu-screen" :class="appearance.class" :style="appearance.style">
    <div v-if="menu.status === 'loading' && !menu.publicMenu" class="menu-state" role="status">
      <span class="sr-only">Menü yükleniyor</span>
      <q-skeleton type="rect" height="120px" class="q-mb-md" />
      <q-skeleton type="rect" height="44px" class="q-mb-sm" />
      <q-skeleton v-for="item in 4" :key="item" type="rect" height="96px" class="q-mb-sm" />
    </div>

    <div v-else-if="menu.error" class="menu-page">
      <div class="menu-state menu-state--block">
        <div class="menu-notice">
          <q-icon name="link_off" size="32px" />
          <h1 class="menu-notice__title">{{ messages.notFoundTitle }}</h1>
          <p class="menu-notice__text">{{ messages.notFoundText }}</p>
          <q-btn
            class="menu-notice__action"
            unelevated
            no-caps
            color="primary"
            :label="messages.home"
            to="/"
          />
        </div>
      </div>
    </div>

    <div v-else-if="restaurant" class="menu-page">
      <MenuHeader :restaurant="restaurant" :table="menu.publicMenu?.table" />

      <div class="menu-sticky">
        <div class="menu-toolbar">
          <q-input
            v-model="query"
            outlined
            dense
            clearable
            class="menu-search"
            :label="messages.search"
            @clear="query = ''"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <MenuLanguageSwitch />
        </div>
        <MenuCategoryNav
          :categories="visibleCategories"
          :active-id="activeId"
          @select="selectCategory"
        />
      </div>

      <div v-if="!searching && visibleCategories.length === 0" class="menu-notice">
        <q-icon name="restaurant_menu" size="32px" />
        <h2 class="menu-notice__title">{{ messages.noProductsTitle }}</h2>
        <p class="menu-notice__text">{{ messages.noProducts }}</p>
      </div>

      <div v-else-if="searching && visibleCategories.length === 0" class="menu-notice">
        <q-icon name="search_off" size="32px" />
        <h2 class="menu-notice__title">{{ messages.emptyTitle }}</h2>
        <p class="menu-notice__text">{{ messages.empty }}</p>
        <q-btn
          class="menu-notice__action"
          unelevated
          no-caps
          color="primary"
          :label="messages.clearSearch"
          @click="query = ''"
        />
      </div>

      <section
        v-for="category in visibleCategories"
        :id="category.id"
        :key="category.id"
        class="menu-section"
        data-menu-section
      >
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
            @open="openProduct"
          />
        </div>
      </section>

      <MenuFooter :restaurant="restaurant" />
      <MenuProductDialog v-model="dialogOpen" :product="selected" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MenuCategoryNav from '@/components/menu/MenuCategoryNav.vue'
import MenuFooter from '@/components/menu/MenuFooter.vue'
import MenuHeader from '@/components/menu/MenuHeader.vue'
import MenuLanguageSwitch from '@/components/menu/MenuLanguageSwitch.vue'
import MenuProductCard from '@/components/menu/MenuProductCard.vue'
import MenuProductDialog from '@/components/menu/MenuProductDialog.vue'
import MenuSectionHeading from '@/components/menu/MenuSectionHeading.vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { recordMenuView, recordProductView } from '@/services/menuService'
import { useMenuStore } from '@/stores/menu'
import { menuAppearance, presentRestaurant } from '@/utils/menuAppearance'
import { menuImage } from '@/utils/menuImage'
import { applySeo, menuJsonLd, SITE_DESCRIPTION } from '@/utils/seo'
import { APP_NAME } from '@/utils/constants'

const route = useRoute()
const menu = useMenuStore()
const { locale, messages, text, setLocale } = useMenuLanguage()
const query = ref('')
const searching = computed(() => String(query.value || '').trim().length > 0)
const activeId = ref('')
const selected = ref(null)
const dialogOpen = ref(false)
let observer

const restaurant = computed(() =>
  presentRestaurant(menu.publicMenu?.restaurant, menu.publicMenu?.settings),
)
const appearance = computed(() => menuAppearance(menu.publicMenu?.settings))

const visibleCategories = computed(() => {
  const categories = menu.publicMenu?.categories || []
  const term = String(query.value || '')
    .trim()
    .toLocaleLowerCase(locale.value === 'en' ? 'en' : 'tr')

  if (!term) {
    return categories
  }

  return categories
    .map((category) => ({
      ...category,
      products: category.products.filter((product) => {
        const name = text(product.name).toLocaleLowerCase(locale.value === 'en' ? 'en' : 'tr')
        const description = text(product.description).toLocaleLowerCase(
          locale.value === 'en' ? 'en' : 'tr',
        )
        return name.includes(term) || description.includes(term)
      }),
    }))
    .filter((category) => category.products.length > 0)
})

function tableQuery() {
  const value = route.query.table
  return String(Array.isArray(value) ? value[0] : value || '')
}

function load() {
  query.value = ''
  selected.value = null
  dialogOpen.value = false
  const slug = route.params.restaurantSlug
  const tableId = tableQuery()

  menu
    .fetchPublicMenu(slug, tableId)
    .then(() => recordMenuView(slug, locale.value, tableId))
    .catch(() => {})
}

function openProduct(product) {
  selected.value = product
  dialogOpen.value = true
  recordProductView(route.params.restaurantSlug, product.id)
}

function selectCategory(id) {
  activeId.value = id
  const section = document.getElementById(id)

  if (!section) {
    return
  }

  const top = section.getBoundingClientRect().top + window.scrollY - 124
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
}

function bindSpy() {
  observer?.disconnect()
  const sections = [...document.querySelectorAll('[data-menu-section]')]

  if (!sections.length) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible?.target?.id) {
        activeId.value = visible.target.id
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0.15, 0.4, 0.7] },
  )

  sections.forEach((section) => observer.observe(section))
}

watch(visibleCategories, async (categories) => {
  if (!categories.some((category) => category.id === activeId.value)) {
    activeId.value = categories[0]?.id || ''
  }

  await nextTick()
  bindSpy()
})

function syncMenuSeo() {
  if (menu.error) {
    applySeo({
      title: `Menü bulunamadı · ${APP_NAME}`,
      description: SITE_DESCRIPTION,
      robots: 'noindex, nofollow',
      path: route.path,
    })
    return
  }

  const place = restaurant.value

  if (!place?.name) {
    return
  }

  const label = locale.value === 'en' ? 'Menu' : 'Menü'
  const description = text(place.description) || SITE_DESCRIPTION
  const photo = menuImage(place.coverImage || place.logo, 1200)
  const image = photo.startsWith('http') ? photo : undefined

  applySeo({
    title: `${place.name} · ${label}`,
    description,
    path: route.path,
    image,
    jsonLd: menuJsonLd({
      name: place.name,
      description,
      path: route.path,
      image,
      telephone: place.phone,
      address: text(place.address),
    }),
  })
}

watch([restaurant, locale, () => menu.error], syncMenuSeo)

onBeforeUnmount(() => {
  observer?.disconnect()
})

setLocale(locale.value)
watch(() => [route.params.restaurantSlug, route.query.table], load, { immediate: true })
</script>
