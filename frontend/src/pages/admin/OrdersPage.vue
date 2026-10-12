<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap check-page">
      <header class="check-hero">
        <div>
          <p class="check-hero__eyebrow">Operasyon</p>
          <h1 class="check-hero__title">Adisyonlar</h1>
          <p class="check-hero__lead">
            Masa seçin, ürün ekleyin, fiş çıkarın. Kapatınca ödeme alınmış sayılır.
          </p>
        </div>
        <dl class="check-kpis">
          <div class="check-kpi">
            <dt>Aktif masa</dt>
            <dd>{{ checkStore.tables.length }}</dd>
          </div>
          <div class="check-kpi">
            <dt>Açık adisyon</dt>
            <dd>{{ checkStore.openChecks.length }}</dd>
          </div>
          <div class="check-kpi">
            <dt>Seçili toplam</dt>
            <dd>{{ formatTry(checkStore.activeCheck?.total || 0) }}</dd>
          </div>
        </dl>
      </header>

      <div v-if="failed" class="load-failure">
        <AppError :error="checkStore.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <template v-else>
        <AppError :error="checkStore.error" />
        <AdminSkeleton v-if="checkStore.status === 'loading' && !checkStore.tables.length" />

        <EmptyState
          v-else-if="!checkStore.tables.length"
          icon="table_restaurant"
          title="Aktif masa yok"
          text="Önce Masalar sayfasından açık bir masa ekleyin."
        />

        <div v-else class="check-layout">
          <aside class="check-rail" aria-label="Masalar">
            <div class="check-rail__head">
              <h2>Masalar</h2>
              <span>{{ checkStore.tables.length }}</span>
            </div>
            <div class="check-tables">
              <button
                v-for="table in checkStore.tables"
                :key="table.id"
                type="button"
                class="check-table"
                :class="{
                  'check-table--active': table.id === checkStore.selectedTableId,
                  'check-table--open': openByTableId.has(table.id),
                }"
                @click="onSelectTable(table.id)"
              >
                <span class="check-table__mark">{{ table.tableNumber }}</span>
                <span class="check-table__body">
                  <span class="check-table__name">{{ table.name }}</span>
                  <span class="check-table__status">
                    {{ openByTableId.has(table.id) ? 'Açık adisyon' : 'Boş' }}
                  </span>
                </span>
                <span
                  class="check-table__dot"
                  :class="{ 'is-open': openByTableId.has(table.id) }"
                  aria-hidden="true"
                />
              </button>
            </div>
          </aside>

          <section class="check-desk" aria-label="Adisyon">
            <template v-if="!checkStore.selectedTableId">
              <div class="check-desk__idle">
                <EmptyState
                  icon="receipt_long"
                  title="Masa seçin"
                  text="Soldaki listeden bir masa seçerek adisyona başlayın."
                />
              </div>
            </template>

            <template v-else>
              <header class="check-desk__head">
                <div class="check-desk__identity">
                  <span class="check-desk__mark">{{ checkStore.selectedTable?.tableNumber }}</span>
                  <div>
                    <h2>{{ checkStore.selectedTable?.name }}</h2>
                    <p>
                      <span
                        class="check-status"
                        :class="checkStore.activeCheck ? 'is-open' : 'is-idle'"
                      >
                        {{ checkStore.activeCheck ? 'Açık' : 'Hazır' }}
                      </span>
                      <span v-if="checkStore.activeCheck">
                        · {{ checkStore.activeCheck.items.length }} kalem
                      </span>
                      <span v-else>· Ürün ekleyince adisyon açılır</span>
                    </p>
                  </div>
                </div>
                <div v-if="checkStore.activeCheck" class="check-desk__actions">
                  <q-btn
                    outline
                    no-caps
                    color="primary"
                    icon="print"
                    label="Adisyon çıkar"
                    :disable="!checkStore.activeCheck.items.length"
                    @click="onPrint"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    label="Ödendi / kapat"
                    :loading="checkStore.saving"
                    :disable="!checkStore.activeCheck.items.length"
                    @click="onClose"
                  />
                </div>
              </header>

              <div class="check-desk__body">
                <div class="check-catalog">
                  <div class="check-catalog__head">
                    <div>
                      <h3>Ürün ekle</h3>
                      <p class="check-catalog__count">
                        {{ filteredProducts.length }} / {{ checkStore.products.length }} ürün
                      </p>
                    </div>
                    <q-input
                      v-model="productSearch"
                      dense
                      outlined
                      clearable
                      debounce="150"
                      placeholder="Ürün ara…"
                      class="check-catalog__search"
                    >
                      <template #prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>

                  <div v-if="!checkStore.products.length" class="check-catalog__none">
                    Satışta ürün yok. Önce
                    <router-link :to="{ name: 'admin-products' }">Ürünler</router-link>
                    sayfasından ekleyin.
                  </div>

                  <div v-else-if="!filteredProducts.length" class="check-catalog__none">
                    Aramaya uygun ürün yok.
                  </div>

                  <div v-else class="check-catalog__list">
                    <button
                      v-for="product in filteredProducts"
                      :key="product.id"
                      type="button"
                      class="check-product"
                      :disabled="checkStore.saving"
                      @click="onAdd(product.id)"
                    >
                      <span class="check-product__name">{{ productName(product) }}</span>
                      <span class="check-product__price">{{ formatTry(productPrice(product)) }}</span>
                      <span class="check-product__add" aria-hidden="true">
                        <q-icon name="add" size="18px" />
                      </span>
                    </button>
                  </div>
                </div>

                <div class="check-ticket">
                  <div class="check-ticket__head">
                    <h3>Adisyon kalemleri</h3>
                  </div>

                  <div class="check-ticket__cols" aria-hidden="true">
                    <span>Ürün</span>
                    <span>Adet</span>
                    <span>Tutar</span>
                    <span />
                  </div>

                  <ul v-if="checkStore.activeCheck?.items?.length" class="check-lines">
                    <li
                      v-for="item in checkStore.activeCheck.items"
                      :key="item.id"
                      class="check-line"
                    >
                      <div class="check-line__info">
                        <strong>{{ item.name }}</strong>
                        <span>{{ formatTry(item.unitPrice) }} / adet</span>
                      </div>
                      <div class="check-line__qty">
                        <q-btn
                          flat
                          dense
                          round
                          icon="remove"
                          :disable="checkStore.saving || item.quantity <= 1"
                          :aria-label="`${item.name} azalt`"
                          @click="onQty(item, item.quantity - 1)"
                        />
                        <span>{{ item.quantity }}</span>
                        <q-btn
                          flat
                          dense
                          round
                          icon="add"
                          :disable="checkStore.saving"
                          :aria-label="`${item.name} artır`"
                          @click="onQty(item, item.quantity + 1)"
                        />
                      </div>
                      <strong class="check-line__total">{{ formatTry(item.lineTotal) }}</strong>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete_outline"
                        color="negative"
                        :disable="checkStore.saving"
                        :aria-label="`${item.name} sil`"
                        @click="onRemove(item.id)"
                      />
                    </li>
                  </ul>

                  <div v-else class="check-ticket__empty">
                    <q-icon name="notes" size="28px" />
                    <p>Henüz kalem yok. Yukarıdaki listeden ürün ekleyin.</p>
                  </div>

                  <div class="check-total">
                    <div>
                      <span>Genel toplam</span>
                      <small v-if="checkStore.activeCheck?.items?.length">
                        {{ checkStore.activeCheck.items.length }} kalem
                      </small>
                    </div>
                    <strong>{{ formatTry(checkStore.activeCheck?.total || 0) }}</strong>
                  </div>
                </div>
              </div>
            </template>
          </section>
        </div>
      </template>
    </div>

    <ConfirmDialog
      v-model="closeOpen"
      title="Adisyonu kapat"
      message="Ödeme alındı sayılır ve adisyon kapanır. Emin misiniz?"
      confirm-label="Kapat"
      :loading="checkStore.saving"
      @confirm="confirmClose"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useNotify } from '@/composables/useNotify'
import { useAuthStore } from '@/stores/auth'
import { useCheckStore } from '@/stores/check'
import { formatTry } from '@/utils/currency'
import { printCheck } from '@/utils/printCheck'

const auth = useAuthStore()
const checkStore = useCheckStore()
const { notifySuccess, notifyError } = useNotify()
const { openByTableId } = storeToRefs(checkStore)
const productSearch = ref('')
const closeOpen = ref(false)

const failed = computed(
  () => checkStore.status === 'error' && !checkStore.tables.length,
)

const filteredProducts = computed(() => {
  const term = productSearch.value.trim().toLocaleLowerCase('tr')
  const list = checkStore.products

  if (!term) {
    return list
  }

  return list.filter((product) => {
    const name = productName(product).toLocaleLowerCase('tr')
    const en = String(product.name?.en || '').toLocaleLowerCase('tr')
    return name.includes(term) || en.includes(term)
  })
})

function productName(product) {
  return product?.name?.tr || product?.name?.en || product?.name || 'Ürün'
}

function productPrice(product) {
  if (product.discountedPrice != null && Number(product.discountedPrice) < Number(product.price)) {
    return product.discountedPrice
  }

  return product.price
}

function load() {
  return checkStore.loadWorkspace()
}

async function onSelectTable(tableId) {
  try {
    await checkStore.selectTable(tableId)
  } catch (error) {
    notifyError(error)
  }
}

async function onAdd(productId) {
  try {
    await checkStore.addProduct(productId)
  } catch (error) {
    notifyError(error)
  }
}

async function onQty(item, quantity) {
  try {
    await checkStore.setItemQuantity(item.id, quantity)
  } catch (error) {
    notifyError(error)
  }
}

async function onRemove(itemId) {
  try {
    await checkStore.removeItem(itemId)
  } catch (error) {
    notifyError(error)
  }
}

function onPrint() {
  try {
    printCheck({
      businessName: auth.user?.tenant?.name || 'Adisyon',
      check: checkStore.activeCheck,
    })
  } catch (error) {
    notifyError(error)
  }
}

function onClose() {
  closeOpen.value = true
}

async function confirmClose() {
  try {
    await checkStore.closeActive()
    closeOpen.value = false
    notifySuccess('Adisyon kapatıldı.')
  } catch (error) {
    notifyError(error)
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.check-page {
  max-width: 1280px;
}

.check-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--app-line);
}

.check-hero__eyebrow {
  margin: 0 0 4px;
  color: var(--app-muted);
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.check-hero__title {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.check-hero__lead {
  max-width: 36em;
  margin: 8px 0 0;
  color: var(--app-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.check-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(88px, 1fr));
  gap: 10px;
  margin: 0;
}

.check-kpi {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--app-line);
  border-radius: 14px;
  background: var(--app-surface);
}

.check-kpi dt {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.check-kpi dd {
  margin: 6px 0 0;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.check-layout {
  display: grid;
  gap: 16px;
}

@media (min-width: 960px) {
  .check-layout {
    grid-template-columns: 260px minmax(0, 1fr);
    align-items: start;
    gap: 18px;
  }
}

.check-rail,
.check-desk {
  border: 1px solid var(--app-line);
  border-radius: 18px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
}

.check-rail {
  overflow: hidden;
}

.check-rail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--app-line);
}

.check-rail__head h2 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.check-rail__head span {
  color: var(--app-muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.check-tables {
  display: grid;
  gap: 8px;
  padding: 12px;
  max-height: min(70vh, 640px);
  overflow: auto;
}

@media (max-width: 959px) {
  .check-tables {
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    max-height: none;
  }
}

.check-table {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: color-mix(in srgb, var(--app-bg) 80%, transparent);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.check-table:hover {
  border-color: color-mix(in srgb, var(--q-primary) 35%, var(--app-line));
}

.check-table--active {
  border-color: var(--q-primary);
  background: color-mix(in srgb, var(--q-primary) 10%, var(--app-surface));
}

.check-table__mark {
  display: grid;
  place-items: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--app-ink) 6%, transparent);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.check-table--active .check-table__mark {
  background: var(--q-primary);
  color: #fff;
}

.check-table__body {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.check-table__name {
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-table__status {
  color: var(--app-muted);
  font-size: 0.75rem;
}

.check-table__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--app-muted) 45%, transparent);
}

.check-table__dot.is-open {
  background: #2f9e6b;
  box-shadow: 0 0 0 3px color-mix(in srgb, #2f9e6b 22%, transparent);
}

.check-desk {
  display: grid;
  min-height: 420px;
}

.check-desk__idle {
  display: grid;
  place-items: center;
  padding: 40px 20px;
}

.check-desk__head {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--app-line);
}

.check-desk__identity {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.check-desk__mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--q-primary);
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.check-desk__identity h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.check-desk__identity p {
  margin: 4px 0 0;
  color: var(--app-muted);
  font-size: 0.85rem;
}

.check-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 650;
}

.check-status.is-open {
  color: #2f9e6b;
}

.check-status.is-idle {
  color: var(--app-muted);
}

.check-desk__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.check-desk__body {
  display: grid;
  gap: 0;
}

@media (min-width: 1100px) {
  .check-desk__body {
    grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  }

  .check-catalog {
    border-right: 1px solid var(--app-line);
  }
}

.check-ticket,
.check-catalog {
  padding: 16px 18px 18px;
}

.check-ticket__head h3,
.check-catalog__head h3 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.check-catalog__count {
  margin: 4px 0 0;
  color: var(--app-muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.check-catalog__none a {
  color: var(--q-primary);
  font-weight: 650;
  text-decoration: none;
}

.check-ticket__cols {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 8px;
  padding: 0 4px 8px;
  border-bottom: 1px solid var(--app-line);
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.check-ticket__cols span:nth-child(2),
.check-ticket__cols span:nth-child(3) {
  text-align: right;
  min-width: 72px;
}

.check-ticket__empty {
  display: grid;
  gap: 8px;
  place-items: center;
  padding: 36px 12px;
  color: var(--app-muted);
  text-align: center;
}

.check-ticket__empty p {
  margin: 0;
  max-width: 22em;
  font-size: 0.9rem;
  line-height: 1.45;
}

.check-lines {
  list-style: none;
  margin: 0;
  padding: 8px 0;
  display: grid;
  gap: 4px;
}

.check-line {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 8px;
  align-items: center;
  padding: 10px 4px;
  border-radius: 10px;
}

.check-line:hover {
  background: color-mix(in srgb, var(--app-bg) 75%, transparent);
}

.check-line__info {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.check-line__info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 650;
}

.check-line__info span,
.check-line__qty span {
  color: var(--app-muted);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.check-line__qty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 96px;
  border: 1px solid var(--app-line);
  border-radius: 999px;
  background: var(--app-surface);
}

.check-line__qty span {
  min-width: 1.25em;
  text-align: center;
  color: var(--app-ink);
  font-size: 0.9rem;
  font-weight: 650;
}

.check-line__total {
  min-width: 84px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.check-total {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding: 14px 4px 0;
  border-top: 2px solid var(--app-ink);
}

.check-total span {
  display: block;
  font-size: 0.8rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.check-total small {
  display: block;
  margin-top: 4px;
  color: var(--app-muted);
  font-size: 0.8rem;
}

.check-total strong {
  font-size: 1.35rem;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.check-catalog {
  background: color-mix(in srgb, var(--app-bg) 55%, var(--app-surface));
}

.check-catalog__head {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.check-catalog__none {
  color: var(--app-muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.check-catalog__list {
  display: grid;
  gap: 6px;
  max-height: min(52vh, 420px);
  overflow: auto;
  padding-bottom: 4px;
}

.check-product {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  background: var(--app-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.12s ease;
}

.check-product:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--q-primary) 45%, var(--app-line));
}

.check-product:active:not(:disabled) {
  transform: translateY(1px);
}

.check-product:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.check-product__name {
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-product__price {
  color: var(--app-muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.check-product__add {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--q-primary) 14%, transparent);
  color: var(--q-primary);
}

@media (max-width: 560px) {
  .check-kpis {
    width: 100%;
  }

  .check-ticket__cols {
    display: none;
  }

  .check-line {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'info total'
      'qty del';
    gap: 6px 10px;
    padding: 12px 8px;
    border: 1px solid var(--app-line);
    background: var(--app-surface);
  }

  .check-line__info {
    grid-area: info;
  }

  .check-line__qty {
    grid-area: qty;
    justify-self: start;
  }

  .check-line__total {
    grid-area: total;
    justify-self: end;
  }

  .check-line > .q-btn {
    grid-area: del;
    justify-self: end;
  }

  .check-desk__actions {
    width: 100%;
  }

  .check-desk__actions .q-btn {
    flex: 1 1 auto;
  }
}
</style>
