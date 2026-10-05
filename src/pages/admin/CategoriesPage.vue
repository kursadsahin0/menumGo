<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="category-toolbar">
        <p class="category-toolbar__hint">Sırayı tutamaçtan sürükleyerek değiştirin.</p>
        <q-btn unelevated no-caps color="primary" label="Yeni kategori" icon="add" @click="openCreate" />
      </div>

      <AppError class="q-mt-md" :error="categoryStore.error" />

      <AdminSkeleton
        v-if="categoryStore.status === 'loading' && categoryStore.categories.length === 0"
      />

      <CategoryList
        v-else
        class="q-mt-md"
        :categories="categoryStore.categories"
        @edit="openEdit"
        @remove="askRemove"
        @toggle="toggle"
        @reorder="reorder"
      />
    </div>

    <q-dialog v-model="formOpen" persistent>
      <q-card class="product-dialog">
        <q-card-section>
          <CategoryForm
            :key="formKey"
            :mode="editing ? 'edit' : 'create'"
            :category="editing"
            :saving="saving"
            @submit="onSave"
            @cancel="formOpen = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Kategoriyi sil"
      :message="pending ? `${trText(pending.name)} silinsin mi? Bu işlem geri alınamaz.` : ''"
      confirm-label="Sil"
      danger
      :loading="removing"
      @confirm="confirmRemove"
    />
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CategoryForm from '@/components/admin/CategoryForm.vue'
import CategoryList from '@/components/admin/CategoryList.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useNotify } from '@/composables/useNotify'
import { useCategoryStore } from '@/stores/category'
import { trText } from '@/utils/localeText'

const categoryStore = useCategoryStore()
const { notifySuccess, notifyError } = useNotify()
const formOpen = ref(false)
const formKey = ref(0)
const confirmOpen = ref(false)
const saving = ref(false)
const removing = ref(false)
const editing = ref(null)
const pending = ref(null)

function openCreate() {
  editing.value = null
  formKey.value += 1
  formOpen.value = true
}

function openEdit(category) {
  editing.value = category
  formKey.value += 1
  formOpen.value = true
}

async function onSave(payload) {
  saving.value = true

  try {
    await categoryStore.saveCategory(payload, editing.value?.id)
    formOpen.value = false
    editing.value = null
    notifySuccess('Kategori kaydedildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}

function askRemove(category) {
  pending.value = category
  confirmOpen.value = true
}

async function confirmRemove() {
  if (!pending.value) {
    return
  }

  removing.value = true

  try {
    await categoryStore.removeCategory(pending.value.id)
    confirmOpen.value = false
    pending.value = null
    notifySuccess('Kategori silindi.')
  } catch (error) {
    confirmOpen.value = false
    notifyError(error)
  } finally {
    removing.value = false
  }
}

async function toggle(category) {
  try {
    await categoryStore.patchCategory(category.id, { isActive: !category.isActive })
  } catch (error) {
    notifyError(error)
  }
}

function reorder(ids) {
  categoryStore.reorder(ids)
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>
