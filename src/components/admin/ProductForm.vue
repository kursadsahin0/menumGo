<template>
  <q-form class="product-form" @submit="onSubmit">
    <div class="product-form__title">{{ mode === 'edit' ? 'Ürünü düzenle' : 'Yeni ürün' }}</div>

    <q-input v-model="form.name" label="Ürün adı" outlined lazy-rules :rules="[rules.required]" />
    <q-input v-model="form.description" type="textarea" label="Açıklama" outlined autogrow />
    <div class="product-form__prices">
      <q-input
        v-model="form.price"
        type="number"
        min="0"
        step="0.01"
        label="Fiyat"
        prefix="₺"
        outlined
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
        lazy-rules
        :rules="[discountRule]"
      />
    </div>
    <q-select
      v-model="form.categoryId"
      :options="categories"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      label="Kategori"
      outlined
      lazy-rules
      :rules="[rules.required]"
    />
    <q-file
      v-model="imageFile"
      label="Görsel"
      accept="image/*"
      outlined
      clearable
      @update:model-value="onImage"
    >
      <template #prepend>
        <q-icon name="image" />
      </template>
    </q-file>
    <div v-if="form.image" class="product-form__preview">
      <img class="product-thumb" :src="form.image" alt="" />
      <q-btn flat no-caps color="negative" label="Görseli kaldır" @click="clearImage" />
    </div>
    <div class="product-form__toggles">
      <q-btn-toggle
        v-model="form.isAvailable"
        no-caps
        unelevated
        toggle-color="primary"
        :options="availabilityOptions"
      />
      <q-checkbox v-model="form.isFeatured" label="Öne çıkan" />
    </div>
    <q-input
      v-model.number="form.sortOrder"
      type="number"
      min="0"
      label="Sıralama"
      outlined
      lazy-rules
      :rules="[sortRule]"
    />

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
import { reactive, ref, watch } from 'vue'
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

const imageFile = ref(null)
const form = reactive(blankForm())

function blankForm() {
  return {
    name: '',
    description: '',
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
    name: product.name,
    description: product.description,
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
    name: form.name,
    description: form.description,
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
