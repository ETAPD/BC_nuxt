<template>
  <section class="panel order-panel">
    <h2 class="panel-title">Zadať príkaz</h2>

    <div class="order-tabs">
      <button :class="['tab', { active: orderTab === 'BUY' }]" @click="setOrderTab('BUY')">
        Kúpiť
      </button>
      <button :class="['tab', { active: orderTab === 'SELL' }]" @click="setOrderTab('SELL')">
        Predať
      </button>
    </div>

    <form @submit.prevent="requestOrder" class="order-form">
      <div class="form-group">
        <label>Symbol</label>
        <select :value="orderForm.asset_id" @change="onAssetChange">
          <option v-for="asset in orderAssetOptions" :key="asset.asset_id" :value="asset.asset_id">
            {{ asset.symbol }} — {{ asset.name }}
          </option>
        </select>
        <span v-if="orderTab === 'SELL' && !orderAssetOptions.length" class="form-hint warn">
          Nevlastníte žiadne aktíva na predaj
        </span>
      </div>

      <div class="market-price-row" v-if="currentMarketPrice > 0">
        <span class="market-label">Trhová cena</span>
        <span class="market-value">{{ formatCurrency(currentMarketPrice) }}</span>
        <span
          v-if="selectedAsset?.change_24h != null"
          :class="['market-change', selectedAsset.change_24h >= 0 ? 'up' : 'down']"
        >
          {{ formatPercent(selectedAsset.change_24h) }}
        </span>
      </div>

      <div class="form-group">
        <label>Typ príkazu</label>
        <div class="type-tabs">
          <button type="button" :class="['type-btn', { active: orderType === 'Market' }]" @click="setOrderType('Market')">
            Trhový
          </button>
          <button type="button" :class="['type-btn', { active: orderType === 'Limit' }]" @click="setOrderType('Limit')">
            Limitný
          </button>
          <button type="button" :class="['type-btn', { active: orderType === 'Stop' }]" @click="setOrderType('Stop')">
            Stop
          </button>
        </div>
        <span v-if="orderType === 'Stop' && !userLimits?.can_use_stop_orders" class="form-hint warn">
          Stop príkazy sú dostupné od plánu Pro
        </span>
      </div>

      <div class="form-group" v-if="orderType !== 'Market'">
        <label>{{ orderType === 'Limit' ? 'Limitná cena' : 'Stop cena' }} (USD)</label>
        <input v-model="orderForm.price" type="number" step="any" min="0" :placeholder="formatCurrency(currentMarketPrice)" required />
      </div>

      <div class="form-group">
        <label>Množstvo <span class="unit-label">({{ quantityUnit }})</span></label>
        <input v-model="orderForm.amount" type="number" step="any" min="0" placeholder="0.00" required />
        <span v-if="orderTab === 'SELL' && holdingForAsset" class="form-hint">
          Vlastníte: {{ holdingForAsset.amount }} {{ quantityUnit }}
        </span>
      </div>

      <div class="form-group">
        <label>Platnosť príkazu</label>
        <div class="type-tabs">
          <button type="button" :class="['type-btn', { active: timeInForce === 'Day' }]" @click="timeInForce = 'Day'">Day</button>
          <button type="button" :class="['type-btn', { active: timeInForce === 'GTC' }]" @click="timeInForce = 'GTC'">GTC</button>
        </div>
      </div>

      <div class="order-summary" v-if="numericAmount > 0">
        <div class="summary-row">
          <span>Celková hodnota</span>
          <span class="bold">{{ formatCurrency(totalOrderValue) }}</span>
        </div>
        <div class="summary-row">
          <span>Odhadovaný poplatok (0,1 %)</span>
          <span>{{ formatCurrency(estimatedFee) }}</span>
        </div>
        <div v-if="orderTab === 'BUY'" class="summary-row">
          <span>Dostupná hotovosť</span>
          <span :class="availableCash < totalOrderValue + estimatedFee ? 'down' : ''">{{ formatCurrency(availableCash) }}</span>
        </div>
        <div v-if="orderTab === 'SELL'" class="summary-row">
          <span>Dostanete</span>
          <span class="up bold">{{ formatCurrency(totalOrderValue - estimatedFee) }}</span>
        </div>
      </div>

      <button type="submit" :class="['btn', 'order-btn', orderTab === 'BUY' ? 'buy-btn' : 'sell-btn']" :disabled="isSubmitDisabled || submitting">
        {{ submitting ? 'Odosielam...' : `${orderTab === 'BUY' ? 'Kúpiť' : 'Predať'} ${orderForm.symbol || ''}` }}
      </button>

      <div v-if="validationError" class="order-error">{{ validationError }}</div>
      <div v-else-if="submitError" class="order-error">{{ submitError }}</div>
      <div v-if="submitSuccess" class="order-success">&#10003; Príkaz bol úspešne zadaný!</div>
    </form>

    <div v-if="showConfirm" class="confirm-overlay" @click.self="closeConfirm">
      <div class="confirm-modal">
        <h3>Potvrdiť príkaz</h3>
        <div class="confirm-details">
          <div class="confirm-row"><span>Strana</span><span :class="orderTab === 'BUY' ? 'up' : 'down'">{{ orderTab }}</span></div>
          <div class="confirm-row"><span>Aktívum</span><span>{{ orderForm.symbol }}</span></div>
          <div class="confirm-row"><span>Typ</span><span>{{ orderType }}</span></div>
          <div class="confirm-row"><span>Množstvo</span><span>{{ numericAmount }} {{ quantityUnit }}</span></div>
          <div class="confirm-row"><span>Cena</span><span>{{ orderType === 'Market' ? 'Trhový' : formatCurrency(numericPrice) }}</span></div>
          <div class="confirm-row"><span>Celkom</span><span class="bold">{{ formatCurrency(totalOrderValue) }}</span></div>
          <div class="confirm-row"><span>Platnosť príkazu</span><span>{{ timeInForce }}</span></div>
        </div>
        <div class="confirm-actions">
          <button class="btn btn-outline confirm-cancel" @click="closeConfirm">Zrušiť</button>
          <button :class="['btn', 'order-btn', orderTab === 'BUY' ? 'buy-btn' : 'sell-btn']" @click="confirmOrder">
            Potvrdiť {{ orderTab }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Formular na zadanie objednavky
import { ref, computed, watch } from 'vue'

type OrderSide = 'BUY' | 'SELL'
type OrderType = 'Market' | 'Limit' | 'Stop'
type TimeInForce = 'Day' | 'GTC'

const props = defineProps<{
  assets: any[]
  holdings: any[]
  availableCash: number
  userLimits: any
  submitting: boolean
  submitError: string
  submitSuccess: boolean
  formatCurrency: (value: number, currency?: string) => string
}>()

const emit = defineEmits<{
  'submit-order': [order: any]
}>()

const orderTab = ref<OrderSide>('BUY')
const orderType = ref<OrderType>('Market')
const timeInForce = ref<TimeInForce>('Day')
const showConfirm = ref(false)
const orderForm = ref({
  asset_id: 0,
  symbol: '',
  amount: '',
  price: '',
})

const orderAssetOptions = computed(() => {
  if (orderTab.value === 'SELL') {
    return props.assets.filter((asset: any) =>
      props.holdings.some((holding: any) => holding.asset_id === asset.asset_id),
    )
  }
  return props.assets
})

const selectedAsset = computed(() => {
  return props.assets.find((asset: any) => asset.asset_id === orderForm.value.asset_id)
})

const currentMarketPrice = computed(() => Number(selectedAsset.value?.base_price ?? 0))

const quantityUnit = computed(() => {
  const asset = selectedAsset.value
  if (!asset) return 'jednotiek'
  const type = String(asset.asset_type || '').toLowerCase()
  if (type === 'crypto') return asset.symbol
  if (type === 'stock' || type === 'etf') return 'akcií'
  if (type === 'forex') return 'lotov'
  return 'jednotiek'
})

const numericAmount = computed(() => Number(orderForm.value.amount) || 0)
const numericPrice = computed(() => Number(orderForm.value.price) || 0)
const effectivePrice = computed(() => orderType.value === 'Market' ? currentMarketPrice.value : numericPrice.value)
const totalOrderValue = computed(() => numericAmount.value * effectivePrice.value)
const estimatedFee = computed(() => totalOrderValue.value * 0.001)

const holdingForAsset = computed(() => {
  return props.holdings.find((holding: any) => holding.asset_id === orderForm.value.asset_id)
})

const validationError = computed(() => {
  if (!orderForm.value.asset_id) return 'Vyberte aktívum'
  if (numericAmount.value <= 0) return 'Množstvo musí byť väčšie ako 0'
  if (orderType.value !== 'Market' && numericPrice.value <= 0) return 'Cena musí byť väčšia ako 0'
  if (orderType.value === 'Stop' && !props.userLimits?.can_use_stop_orders) return 'Stop príkazy vyžadujú plán Pro alebo Premium'
  if (orderTab.value === 'SELL') {
    const owned = Number(holdingForAsset.value?.amount ?? 0)
    if (!owned) return 'Nevlastníte toto aktívum'
    if (numericAmount.value > owned) return `Vlastníte len ${owned} ${quantityUnit.value}`
  }
  if (orderTab.value === 'BUY') {
    const cost = totalOrderValue.value + estimatedFee.value
    if (cost > props.availableCash) return `Nedostatočný zostatok (${props.formatCurrency(props.availableCash)} k dispozícii)`
  }
  return ''
})

const isSubmitDisabled = computed(() => {
  return !!validationError.value || (orderTab.value === 'SELL' && !orderAssetOptions.value.length)
})

watch(
  () => props.assets,
  () => ensureValidSelectedAsset(),
  { immediate: true }
)

watch(
  () => props.holdings,
  () => ensureValidSelectedAsset()
)

watch(
  () => props.submitSuccess,
  (value) => {
    if (value) {
      orderForm.value.amount = ''
      orderForm.value.price = ''
      showConfirm.value = false
    }
  }
)

watch(orderType, (value) => {
  if (value === 'Market') orderForm.value.price = ''
})

function ensureValidSelectedAsset() {
  const options = orderAssetOptions.value
  if (!options.length) {
    orderForm.value.asset_id = 0
    orderForm.value.symbol = ''
    return
  }
  const selectedExists = options.some((asset: any) => asset.asset_id === orderForm.value.asset_id)
  if (!selectedExists) applyAsset(options[0].asset_id)
}

function applyAsset(assetId: number) {
  const asset = props.assets.find((item: any) => item.asset_id === Number(assetId))
  if (!asset) return
  orderForm.value.asset_id = asset.asset_id
  orderForm.value.symbol = asset.symbol
}

function setOrderTab(value: OrderSide) {
  orderTab.value = value
  ensureValidSelectedAsset()
}

function setOrderType(value: OrderType) {
  orderType.value = value
}

function onAssetChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement | null)?.value ?? 0)
  applyAsset(value)
}

function requestOrder() {
  if (validationError.value || props.submitting) return
  showConfirm.value = true
}

function closeConfirm() {
  showConfirm.value = false
}

function confirmOrder() {
  if (validationError.value || props.submitting) return
  emit('submit-order', {
    asset_id: orderForm.value.asset_id,
    symbol: orderForm.value.symbol,
    order_side: orderTab.value,
    order_type: orderType.value,
    limit_price: orderType.value === 'Limit' ? numericPrice.value : null,
    stop_price: orderType.value === 'Stop' ? numericPrice.value : null,
    amount: numericAmount.value,
    amount_unit: quantityUnit.value,
    time_in_force: timeInForce.value,
  })
}

function formatPercent(value: number) {
  const numeric = Number(value || 0)
  return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(4)}%`
}
</script>

<style>
</style>
