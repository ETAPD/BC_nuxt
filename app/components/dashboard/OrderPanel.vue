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

<script lang="ts">
import { defineComponent } from 'vue'

type OrderSide = 'BUY' | 'SELL'
type OrderType = 'Market' | 'Limit' | 'Stop'
type TimeInForce = 'Day' | 'GTC'

export default defineComponent({
  name: 'OrderPanel',
  emits: ['submit-order'],
  props: {
    assets: { type: Array, default: () => [] },
    holdings: { type: Array, default: () => [] },
    availableCash: { type: Number, default: 0 },
    userLimits: { type: Object, default: () => ({}) },
    submitting: { type: Boolean, default: false },
    submitError: { type: String, default: '' },
    submitSuccess: { type: Boolean, default: false },
    formatCurrency: { type: Function, required: true },
  },
  data() {
    return {
      orderTab: 'BUY' as OrderSide,
      orderType: 'Market' as OrderType,
      timeInForce: 'Day' as TimeInForce,
      showConfirm: false,
      orderForm: {
        asset_id: 0,
        symbol: '',
        amount: '',
        price: '',
      },
    }
  },
  computed: {
    orderAssetOptions(): any[] {
      if (this.orderTab === 'SELL') {
        return (this.assets as any[]).filter((asset: any) =>
          (this.holdings as any[]).some((holding: any) => holding.asset_id === asset.asset_id),
        )
      }
      return this.assets as any[]
    },
    selectedAsset(): any | undefined {
      return (this.assets as any[]).find((asset: any) => asset.asset_id === this.orderForm.asset_id)
    },
    currentMarketPrice(): number {
      return Number(this.selectedAsset?.base_price ?? 0)
    },
    quantityUnit(): string {
      const asset = this.selectedAsset
      if (!asset) return 'jednotiek'
      const type = String(asset.asset_type || '').toLowerCase()
      if (type === 'crypto') return asset.symbol
      if (type === 'stock' || type === 'etf') return 'akcií'
      if (type === 'forex') return 'lotov'
      return 'jednotiek'
    },
    numericAmount(): number {
      return Number(this.orderForm.amount) || 0
    },
    numericPrice(): number {
      return Number(this.orderForm.price) || 0
    },
    effectivePrice(): number {
      return this.orderType === 'Market' ? this.currentMarketPrice : this.numericPrice
    },
    totalOrderValue(): number {
      return this.numericAmount * this.effectivePrice
    },
    estimatedFee(): number {
      return this.totalOrderValue * 0.001
    },
    holdingForAsset(): any | undefined {
      return (this.holdings as any[]).find((holding: any) => holding.asset_id === this.orderForm.asset_id)
    },
    validationError(): string {
      if (!this.orderForm.asset_id) return 'Vyberte aktívum'
      if (this.numericAmount <= 0) return 'Množstvo musí byť väčšie ako 0'
      if (this.orderType !== 'Market' && this.numericPrice <= 0) return 'Cena musí byť väčšia ako 0'
      if (this.orderType === 'Stop' && !this.userLimits?.can_use_stop_orders) return 'Stop príkazy vyžadujú plán Pro alebo Premium'
      if (this.orderTab === 'SELL') {
        const owned = Number(this.holdingForAsset?.amount ?? 0)
        if (!owned) return 'Nevlastníte toto aktívum'
        if (this.numericAmount > owned) return `Vlastníte len ${owned} ${this.quantityUnit}`
      }
      if (this.orderTab === 'BUY') {
        const cost = this.totalOrderValue + this.estimatedFee
        if (cost > this.availableCash) return `Nedostatočný zostatok (${this.formatCurrency(this.availableCash)} k dispozícii)`
      }
      return ''
    },
    isSubmitDisabled(): boolean {
      return !!this.validationError || (this.orderTab === 'SELL' && !this.orderAssetOptions.length)
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler() {
        this.ensureValidSelectedAsset()
      },
    },
    holdings() {
      this.ensureValidSelectedAsset()
    },
    submitSuccess(value: boolean) {
      if (value) {
        this.orderForm.amount = ''
        this.orderForm.price = ''
        this.showConfirm = false
      }
    },
    orderType(value: OrderType) {
      if (value === 'Market') this.orderForm.price = ''
    },
  },
  methods: {
    ensureValidSelectedAsset() {
      const options = this.orderAssetOptions
      if (!options.length) {
        this.orderForm.asset_id = 0
        this.orderForm.symbol = ''
        return
      }
      const selectedExists = options.some((asset: any) => asset.asset_id === this.orderForm.asset_id)
      if (!selectedExists) this.applyAsset(options[0].asset_id)
    },
    applyAsset(assetId: number) {
      const asset = (this.assets as any[]).find((item: any) => item.asset_id === Number(assetId))
      if (!asset) return
      this.orderForm.asset_id = asset.asset_id
      this.orderForm.symbol = asset.symbol
    },
    setOrderTab(value: OrderSide) {
      this.orderTab = value
      this.ensureValidSelectedAsset()
    },
    setOrderType(value: OrderType) {
      this.orderType = value
    },
    onAssetChange(event: Event) {
      const value = Number((event.target as HTMLSelectElement | null)?.value ?? 0)
      this.applyAsset(value)
    },
    requestOrder() {
      if (this.validationError || this.submitting) return
      this.showConfirm = true
    },
    closeConfirm() {
      this.showConfirm = false
    },
    confirmOrder() {
      if (this.validationError || this.submitting) return
      this.$emit('submit-order', {
        asset_id: this.orderForm.asset_id,
        symbol: this.orderForm.symbol,
        order_side: this.orderTab,
        order_type: this.orderType,
        limit_price: this.orderType === 'Limit' ? this.numericPrice : null,
        stop_price: this.orderType === 'Stop' ? this.numericPrice : null,
        amount: this.numericAmount,
        amount_unit: this.quantityUnit,
        time_in_force: this.timeInForce,
      })
    },
    formatPercent(value: number) {
      const numeric = Number(value || 0)
      return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(4)}%`
    },
  },
})
</script>

<style>
</style>
