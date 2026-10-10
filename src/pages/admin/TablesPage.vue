<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="table-toolbar">
        <p class="table-toolbar__hint">
          Her masanın kendi QR kodu vardır. Misafir okuttuğunda o masanın adı menüde görünür ve Wi-Fi şifresi açılır. Kapalı masanın QR’ı menüyü açmaz.
        </p>
        <q-btn unelevated no-caps color="primary" label="Yeni masa" icon="add" @click="openCreate" />
      </div>

      <div v-if="failed" class="load-failure q-mt-md">
        <AppError :error="tableStore.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <template v-else>
      <AppError class="q-mt-md" :error="tableStore.error" />

      <AdminSkeleton v-if="tableStore.status === 'loading' && !tableStore.tables.length" />

      <EmptyState
        v-else-if="!tableStore.tables.length"
        class="q-mt-md"
        icon="table_restaurant"
        title="Henüz masa yok"
        text="Masa ekleyince ona özel bir QR kodu oluşur."
      />

      <template v-else>
      <div class="table-grid">
        <article
          v-for="table in tableStore.tables"
          :key="table.id"
          class="table-card"
          :class="{ 'table-card--closed': !table.isActive }"
        >
          <div class="table-card__head">
            <span class="table-card__mark">{{ table.tableNumber }}</span>
            <button
              type="button"
              class="table-card__status product-status"
              :class="{ 'is-off': !table.isActive }"
              :aria-label="`${table.name} ${table.isActive ? 'açık' : 'kapalı'}. Durumu değiştir`"
              :disabled="togglingId === table.id"
              @click="toggle(table)"
            >
              {{ table.isActive ? 'Açık' : 'Kapalı' }}
            </button>
          </div>
          <h2 class="table-card__name">{{ table.name }}</h2>
          <p v-if="!table.isActive" class="table-card__note">Bu masanın QR kodu menüyü açmaz.</p>
          <button
            type="button"
            class="table-card__plate"
            :aria-label="`${table.name} QR kodunu aç`"
            @click="openQr(table)"
          >
            <QRCode :value="menuUrl(table)" :size="148" :label="`${table.name} QR kodu`" />
          </button>
          <div class="table-card__bar">
            <button type="button" class="table-card__copy" @click="copyLink(table)">Adresi kopyala</button>
            <q-btn flat round dense icon="edit" :aria-label="`${table.name} düzenle`" @click="openEdit(table)">
              <q-tooltip>Düzenle</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              color="negative"
              :aria-label="`${table.name} sil`"
              @click="askRemove(table)"
            >
              <q-tooltip>Sil</q-tooltip>
            </q-btn>
          </div>
        </article>
      </div>
      <ListPager
        :page="tableStore.page"
        :page-size="tableStore.pageSize"
        :total="tableStore.total"
        @change="tableStore.fetchTables"
      />
      </template>
      </template>
    </div>

    <q-dialog v-model="formOpen" persistent>
      <q-card class="product-dialog">
        <q-card-section>
          <q-form greedy class="table-form" @submit="onSave">
            <h2 class="table-form__title">{{ editing ? 'Masayı düzenle' : 'Yeni masa' }}</h2>
            <q-input v-model="form.name" label="Masa adı" outlined :rules="[rules.required]" />
            <q-input v-model="form.tableNumber" label="Masa numarası" outlined :rules="[rules.required]" />
            <q-btn-toggle
              v-model="form.isActive"
              no-caps
              unelevated
              toggle-color="primary"
              :options="statusOptions"
            />
            <div class="table-form__actions">
              <q-btn flat no-caps label="Vazgeç" :disable="saving" @click="formOpen = false" />
              <q-btn unelevated no-caps color="primary" type="submit" label="Kaydet" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="qrOpen">
      <q-card v-if="qrTable" class="table-qr">
        <q-card-section class="table-qr__body">
          <h2 class="table-qr__title">{{ qrTable.name }}</h2>
          <p class="table-qr__lead">No {{ qrTable.tableNumber }}</p>
          <p v-if="!qrTable.isActive" class="table-qr__lead">Masa kapalı. Bu QR menüyü açmaz.</p>
          <QRCode
            ref="qrRef"
            :value="qrUrl"
            :size="220"
            :label="`${qrTable.name} QR kodu`"
          />
          <a class="table-qr__url" :href="qrUrl" target="_blank" rel="noopener noreferrer">{{ qrUrl }}</a>
          <div class="table-qr__actions">
            <q-btn outline no-caps color="primary" icon="content_copy" label="Kopyala" @click="copyQr" />
            <q-btn outline no-caps color="primary" icon="download" label="İndir" @click="downloadQr" />
            <q-btn unelevated no-caps color="primary" icon="print" label="Yazdır" @click="printQr" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Masayı sil"
      :message="pending ? `${pending.name} silinsin mi? Bu masanın QR kodu çalışmayı durdurur.` : ''"
      confirm-label="Sil"
      danger
      :loading="removing"
      @confirm="confirmRemove"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import QRCode from '@/components/common/QRCode.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ListPager from '@/components/admin/ListPager.vue'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import { absoluteMenuUrl } from '@/utils/menuUrl'
import { rules } from '@/utils/validators'

const tableStore = useTableStore()
const auth = useAuthStore()
const { notifySuccess, notifyError } = useNotify()
const formOpen = ref(false)
const qrOpen = ref(false)
const confirmOpen = ref(false)
const saving = ref(false)
const removing = ref(false)
const togglingId = ref('')
const statusOptions = [
  { label: 'Açık', value: true },
  { label: 'Kapalı', value: false },
]
const editing = ref(null)
const pending = ref(null)
const qrTable = ref(null)
const qrRef = ref(null)
const form = reactive({
  name: '',
  tableNumber: '',
  isActive: true,
})

const qrUrl = computed(() => absoluteMenuUrl(qrTable.value?.qrCode || ''))
const venueName = computed(() => auth.user?.tenant?.name || 'Menü')

function menuUrl(table) {
  return absoluteMenuUrl(table?.qrCode || '')
}

function fillForm(table) {
  form.name = table?.name || ''
  form.tableNumber = table?.tableNumber || ''
  form.isActive = table ? table.isActive !== false : true
}

function openCreate() {
  editing.value = null
  fillForm(null)
  formOpen.value = true
}

function openEdit(table) {
  editing.value = table
  fillForm(table)
  formOpen.value = true
}

function openQr(table) {
  qrTable.value = table
  qrOpen.value = true
}

async function onSave() {
  saving.value = true

  try {
    await tableStore.saveTable(
      {
        name: form.name,
        tableNumber: form.tableNumber,
        isActive: form.isActive,
      },
      editing.value?.id,
    )
    formOpen.value = false
    editing.value = null
    notifySuccess('Masa kaydedildi.')
  } catch (error) {
    notifyError(error)
  } finally {
    saving.value = false
  }
}

async function toggle(table) {
  togglingId.value = table.id

  try {
    await tableStore.patchTable(table.id, { isActive: !table.isActive })
  } catch (error) {
    notifyError(error)
  } finally {
    togglingId.value = ''
  }
}

function askRemove(table) {
  pending.value = table
  confirmOpen.value = true
}

async function confirmRemove() {
  if (!pending.value) {
    return
  }

  removing.value = true

  try {
    await tableStore.removeTable(pending.value.id)
    confirmOpen.value = false
    pending.value = null
    notifySuccess('Masa silindi.')
  } catch (error) {
    confirmOpen.value = false
    notifyError(error)
  } finally {
    removing.value = false
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    notifySuccess('Masa adresi kopyalandı.')
  } catch {
    notifyError('Adres kopyalanamadı.')
  }
}

function copyLink(table) {
  copyText(menuUrl(table))
}

function copyQr() {
  copyText(qrUrl.value)
}

function downloadQr() {
  const number = String(qrTable.value?.tableNumber || 'masa').replace(/[^\w.-]+/g, '-')
  qrRef.value?.download(`masa-${number}.png`)
}

function printQr() {
  qrRef.value?.print({
    title: qrTable.value?.name || 'Masa',
    subtitle: venueName.value,
    url: qrUrl.value,
  })
}

const failed = computed(() => tableStore.status === 'error' && tableStore.tables.length === 0)

function load() {
  tableStore.fetchTables()
}

onMounted(load)
</script>
