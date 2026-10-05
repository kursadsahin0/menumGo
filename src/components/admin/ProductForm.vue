<template>
  <q-form class="product-form" @submit="onSubmit">
    <h2 class="product-form__title">{{ mode === 'edit' ? 'Ürünü düzenle' : 'Yeni ürün' }}</h2>

    <div class="product-form__copy">
      <q-input v-model="form.name.tr" label="Ürün adı" outlined dense lazy-rules :rules="[rules.required]" />
      <q-input v-model="form.name.en" label="Ürün adı (İngilizce)" outlined dense />
    </div>
    <div class="product-form__copy">
      <q-input v-model="form.description.tr" type="textarea" label="Açıklama" outlined dense autogrow />
      <q-input
        v-model="form.description.en"
        type="textarea"
        label="Açıklama (İngilizce)"
        outlined
        dense
        autogrow
      />
    </div>
    <div class="product-form__copy">
      <q-input v-model="form.portion.tr" label="Porsiyon" outlined dense />
      <q-input v-model="form.portion.en" label="Porsiyon (İngilizce)" outlined dense />
    </div>
    <div class="product-form__copy">
      <q-input v-model="form.ingredients.tr" type="textarea" label="İçerik" outlined dense autogrow />
      <q-input
        v-model="form.ingredients.en"
        type="textarea"
        label="İçerik (İngilizce)"
        outlined
        dense
        autogrow
      />
    </div>
    <q-select
      v-model="form.allergens"
      :options="allergenOptions"
      option-value="id"
      option-label="label"
      emit-value
      map-options
      multiple
      use-chips
      label="Alerjenler"
      outlined
      dense
    />

    <div class="product-form__row">
      <q-input
        v-model="form.price"
        type="number"
        min="0"
        step="0.01"
        label="Fiyat"
        prefix="₺"
        outlined
        dense
        lazy-rules
        :rules="[priceRule]"
      />
      <q-input
        v-model="form.discountedPrice"
        type="number"
        min="0"
        step="0.01"
        label="İndirimli fiyat"
        prefix="₺"
        outlined
        dense
        lazy-rules
        :rules="[discountRule]"
      />
    </div>

    <div class="product-form__row">
      <q-select
        v-model="form.categoryId"
        class="product-form__grow"
        :options="categoryChoices"
        option-value="id"
        option-label="name"
        emit-value
        map-options
        label="Kategori"
        outlined
        dense
        lazy-rules
        :rules="[rules.required]"
      />
      <q-input
        v-model.number="form.sortOrder"
        class="product-form__sort"
        type="number"
        min="0"
        label="Sıra"
        outlined
        dense
        lazy-rules
        :rules="[sortRule]"
      />
    </div>

    <div class="product-form__image">
      <img v-if="form.image" class="product-form__thumb" :src="form.image" alt="" />
      <q-file
        v-model="imageFile"
        class="product-form__grow"
        label="Görsel"
        accept="image/*"
        outlined
        dense
        clearable
        @update:model-value="onImage"
      >
        <template #prepend>
          <q-icon name="image" />
        </template>
      </q-file>
      <q-btn
        v-if="form.image"
        flat
        dense
        no-caps
        color="negative"
        label="Kaldır"
        @click="clearImage"
      />
    </div>

    <div class="product-form__row">
      <q-btn-toggle
        v-model="form.isAvailable"
        no-caps
        unelevated
        toggle-color="primary"
        :options="availabilityOptions"
      />
      <q-checkbox v-model="form.isFeatured" label="Öne çıkan" dense />
    </div>

    <div class="product-form__actions">
      <q-btn flat no-caps label="Vazgeç" @click="emit('cancel')" />
      <q-btn
        type="submit"
        unelevated
        no-caps
        color="primary"
        :label="mode === 'edit' ? 'Kaydet' : 'Ürün ekle'"
        :loading="saving"
      />
    </div>
  </q-form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { allergens } from '@/data/allergens'
import { localeField, trText } from '@/utils/localeText'
import { rules } from '@/utils/validators'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
  },
  product: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const availabilityOptions = [
  { label: 'Mevcut', value: true },
  { label: 'Tükendi', value: false },
]

const allergenOptions = allergens.map((item) => ({
  id: item.id,
  label: item.tr,
}))
const imageFile = ref(null)
const form = reactive(blankForm())
const categoryChoices = computed(() =>
  props.categories.map((category) => ({
    id: category.id,
    name: trText(category.name),
  })),
)

function blankForm() {
  return {
    name: { tr: '', en: '' },
    description: { tr: '', en: '' },
    portion: { tr: '', en: '' },
    ingredients: { tr: '', en: '' },
    allergens: [],
    price: '',
    discountedPrice: '',
    categoryId: null,
    image: null,
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
  }
}

function fillForm(product) {
  const next = blankForm()

  if (!product) {
    Object.assign(form, next)
    imageFile.value = null
    return
  }

  Object.assign(form, {
    ...next,
    name: localeField(product.name),
    description: localeField(product.description),
    portion: localeField(product.portion),
    ingredients: localeField(product.ingredients),
    allergens: Array.isArray(product.allergens) ? [...product.allergens] : [],
    price: product.price,
    discountedPrice: product.discountedPrice ?? '',
    categoryId: product.categoryId,
    image: product.image,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
  })
  imageFile.value = null
}

watch(() => props.product, fillForm, { immediate: true })

function priceRule(value) {
  if (value === '' || value == null) {
    return 'Bu alan zorunlu.'
  }

  const amount = Number(value)
  return (Number.isFinite(amount) && amount >= 0) || 'Geçerli bir fiyat girin.'
}

function discountRule(value) {
  if (value === '' || value == null) {
    return true
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0) {
    return 'Geçerli bir fiyat girin.'
  }

  if (Number(form.price) && amount >= Number(form.price)) {
    return 'İndirimli fiyat, satış fiyatından düşük olmalı.'
  }

  return true
}

function sortRule(value) {
  return (Number.isInteger(Number(value)) && Number(value) >= 0) || 'Sıra 0 veya daha büyük olmalı.'
}

function onImage(file) {
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.image = reader.result
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  form.image = null
  imageFile.value = null
}

function onSubmit() {
  emit('submit', {
    name: { ...form.name },
    description: { ...form.description },
    portion: { ...form.portion },
    ingredients: { ...form.ingredients },
    allergens: [...form.allergens],
    price: Number(form.price),
    discountedPrice: form.discountedPrice === '' ? null : Number(form.discountedPrice),
    categoryId: form.categoryId,
    image: form.image,
    isAvailable: form.isAvailable,
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder),
  })
}
</script>
