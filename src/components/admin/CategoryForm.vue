<template>
  <q-form class="product-form" @submit="onSubmit">
    <h2 class="product-form__title">{{ mode === 'edit' ? 'Kategoriyi düzenle' : 'Yeni kategori' }}</h2>

    <q-input v-model="form.name" label="Kategori adı" outlined dense lazy-rules :rules="[rules.required]" />
    <q-input v-model="form.description" type="textarea" label="Açıklama" outlined dense autogrow />

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
      <q-btn v-if="form.image" flat dense no-caps color="negative" label="Kaldır" @click="clearImage" />
    </div>

    <q-btn-toggle
      v-model="form.isActive"
      no-caps
      unelevated
      toggle-color="primary"
      :options="statusOptions"
    />

    <div class="product-form__actions">
      <q-btn flat no-caps label="Vazgeç" @click="emit('cancel')" />
      <q-btn
        type="submit"
        unelevated
        no-caps
        color="primary"
        :label="mode === 'edit' ? 'Kaydet' : 'Kategori ekle'"
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
  category: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const statusOptions = [
  { label: 'Yayında', value: true },
  { label: 'Gizli', value: false },
]

const imageFile = ref(null)
const form = reactive(blankForm())

function blankForm() {
  return {
    name: '',
    description: '',
    image: null,
    isActive: true,
  }
}

function fillForm(category) {
  const next = blankForm()

  if (!category) {
    Object.assign(form, next)
    imageFile.value = null
    return
  }

  Object.assign(form, {
    ...next,
    name: category.name,
    description: category.description,
    image: category.image,
    isActive: category.isActive,
  })
  imageFile.value = null
}

watch(() => props.category, fillForm, { immediate: true })

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
    image: form.image,
    isActive: form.isActive,
  })
}
</script>
