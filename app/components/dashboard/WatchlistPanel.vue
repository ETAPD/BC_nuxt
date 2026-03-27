<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title" style="margin-bottom: 0">Sledovací zoznam</h2>
      <button class="add-btn" @click="toggleAdd" title="Pridať symbol">+</button>
    </div>

    <div v-if="showAdd" class="watchlist-add-form">
      <select v-model="selectedSymbol" class="wl-select">
        <option value="" disabled>Vyberte aktívum…</option>
        <option v-for="asset in availableAssets" :key="asset.asset_id" :value="asset.symbol">
          {{ asset.symbol }} — {{ asset.name }}
        </option>
      </select>
      <button class="add-confirm-btn" @click="submitAdd">Pridať</button>
    </div>

    <div v-if="localError" class="order-error" style="margin-bottom: 1rem">{{ localError }}</div>

    <div class="watchlist">
      <div v-for="item in watchlist" :key="item.watchlist_item_id" class="watch-item">
        <span class="watch-symbol">{{ item.symbol }}</span>
        <span class="watch-price">{{ formatCurrency(item.current_price) }}</span>
        <span :class="['watch-change', Number(item.change_percent) >= 0 ? 'up' : 'down']">{{ formatPercent(item.change_percent) }}</span>
        <button class="remove-btn" @click="$emit('remove', item.watchlist_item_id)" title="Odstrániť">✕</button>
      </div>
      <div v-if="!watchlist.length" class="empty-msg">Žiadne položky v sledovacom zozname</div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WatchlistPanel',
  emits: ['add', 'remove'],
  props: {
    assets: { type: Array, default: () => [] },
    watchlist: { type: Array, default: () => [] },
    maxWatchlist: { type: Number, default: -1 },
    formatCurrency: { type: Function, required: true },
  },
  data() {
    return {
      showAdd: false,
      selectedSymbol: '',
      localError: '',
    }
  },
  computed: {
    usedSymbols(): string[] {
      return (this.watchlist as any[]).map((item: any) => String(item.symbol || '').toUpperCase())
    },
    availableAssets(): any[] {
      return (this.assets as any[]).filter((asset: any) => !this.usedSymbols.includes(String(asset.symbol || '').toUpperCase()))
    },
    isAtLimit(): boolean {
      return this.maxWatchlist !== -1 && (this.watchlist as any[]).length >= this.maxWatchlist
    },
  },
  methods: {
    toggleAdd() {
      if (!this.showAdd && this.isAtLimit) {
        this.localError = `Môžete mať maximálne ${this.maxWatchlist} položiek v sledovacom zozname`
        return
      }
      this.localError = ''
      this.showAdd = !this.showAdd
      if (this.showAdd && this.availableAssets.length && !this.selectedSymbol) this.selectedSymbol = this.availableAssets[0].symbol
    },
    submitAdd() {
      if (this.isAtLimit) {
        this.localError = `Môžete mať maximálne ${this.maxWatchlist} položiek v sledovacom zozname`
        return
      }
      if (!this.selectedSymbol) {
        this.localError = 'Vyberte aktívum'
        return
      }
      this.localError = ''
      this.$emit('add', this.selectedSymbol)
      this.selectedSymbol = ''
      this.showAdd = false
    },
    formatPercent(value: number | string) {
      const numeric = Number(value || 0)
      return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(2)}%`
    },
  },
})
</script>

<style>
</style>
