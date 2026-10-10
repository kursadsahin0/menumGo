<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="product-toolbar">
        <q-input
          v-model="filters.search"
          outlined
          dense
          clearable
          debounce="300"
          label="Ürün ara"
          @update:model-value="load"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          v-model="filters.categoryId"
          :options="categoryOptions"
          emit-value
          map-options
          outlined
          dense
          label="Kategori"
          @update:model-value="load"
        />
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          emit-value
          map-options
          outlined
          dense
          label="Durum"
          @update:model-value="load"
        />
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="Yeni ürün"
          icon="add"
          @click="openCreate"
        />
      </div>
      <p class="product-toolbar__hint">
        {{
          canReorder
            ? 'Sırayı kategori içinde yukarı ve aşağı düğmeleriyle değiştirin. Geniş ekranda tutamaçtan da sürükleyebilirsiniz.'
            : 'Sırayı değiştirmek için aramayı ve durum filtresini kapatın.'
        }}
      </p>

      <div v-if="categoryError" class="load-failure">
        <AppError :error="categoryError" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="loadCategories" />
      </div>

      <div v-if="failed" class="load-failure q-mt-md">
        <AppError :error="productStore.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <template v-else>
      <AppError class="q-mt-md" :error="productStore.error" />

      <AdminSkeleton
        v-if="productStore.status === 'loading' && productStore.products.length === 0"
      />

      <ProductList
        v-else
        class="q-mt-md"
        :products="productStore.products"
        :categories="productStore.categories"
        :sortable="canReorder"
        :filtered="filtered"
        @edit="openEdit"
        @remove="askRemove"
        @reorder="reorder"
      />
      <ListPager
        :page="productStore.page"
        :page-size="productStore.pageSize"
        :total="productStore.total"
        @change="showPage"
      />
      </template>
    </div>

    <q-dialog v-model="formOpen" persistent>
      <q-card class="product-dialog">
        <q-card-section>
          <ProductForm
            :key="formKey"
            :mode="editing ? 'edit' : 'create'"
            :product="editing"
            :categories="productStore.categories"
            :saving="saving"
            @submit="onSave"
            @cancel="formOpen = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Ürünü sil"
      :message="pending ? `${trText(pending.name)} silinsin mi? Bu işlem geri alınamaz.` : ''"
      confirm-label="Sil"
      danger
      :loading="removing"
      @confirm="confirmRemove"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import ListPager from '@/components/admin/ListPager.vue'
import ProductForm from '@/components/admin/ProductForm.vue'
import ProductList from '@/components/admin/ProductList.vue'
import { useNotify } from '@/composables/useNotify'
import { useProductStore } from '@/stores/product'
import { trText } from '@/utils/localeText'

const productStore = useProductStore()
const { notifySuccess, notifyError } = useNotify()
const categoryError = ref(null)
const formOpen = ref(false)
const formKey = ref(0)
const confirmOpen = ref(false)
const saving = ref(false)
const removing = ref(false)
const editing = ref(null)
const pending = ref(null)

const filters = reactive({
  search: '',
  categoryId: '',
  status: 'all',
})

const statusOptions = [
  { label: 'Tümü', value: 'all' },
  { label: 'Mevcut', value: 'available' },
  { label: 'Tükendi', value: 'unavailable' },
]

const failed = computed(
  () => productStore.status === 'error' && productStore.products.length === 0,
)
const canReorder = computed(
  () => !String(filters.search || '').trim() && filters.status === 'all',
)
const filtered = computed(
  () =>
    Boolean(String(filters.search || '').trim() || filters.categoryId || filters.status !== 'all'),
)

const categoryOptions = computed(() => [
  { label: 'Tüm kategoriler', value: '' },
  ...productStore.categories.map((category) => ({
    label: trText(category.name),
    value: category.id,
  })),
])

async function loadCategories() {
  try {
    await productStore.fetchCategories()
    categoryError.value = null
  } catch (error) {
    categoryError.value = error
  }
}

function load() {
  productStore.fetchProducts({ ...filters, page: 1 })
}

function showPage(page) {
  productStore.fetchProducts({ page })
}

function reorder(ids) {
  productStore.reorder(ids)
}

function openCreate() {
  editing.value = null
  formKey.value += 1
  formOpen.value = true
}

async function openEdit(product) {
  editing.value = await productStore.fetchProduct(product.id)
  formKey.value += 1
  formOpen.value = true
}

async function onSave(payload) {
  saving.value = true

  try {
    await productStore.saveProduct(payload, editing.value?.id)
    formOpen.value = false
    editing.value = null
    notifySuccess('Ürün kaydedildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}

function askRemove(product) {
  pending.value = product
  confirmOpen.value = true
}

async function confirmRemove() {
  if (!pending.value) {
    return
  }

  removing.value = true

  try {
    await productStore.removeProduct(pending.value.id)
    confirmOpen.value = false
    pending.value = null
    notifySuccess('Ürün silindi.')
  } catch (error) {
    confirmOpen.value = false
    notifyError(error)
  } finally {
    removing.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  load()
})
</script>
