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

<script setup lang="ts">
// Zoznam sledovanych aktiv
import { ref, computed } from 'vue'

const props = defineProps<{
  assets: any[]
  watchlist: any[]
  maxWatchlist: number
  formatCurrency: (value: number, currency?: string) => string
}>()

const emit = defineEmits<{
  add: [symbol: string]
  remove: [id: any]
}>()

const showAdd = ref(false)
const selectedSymbol = ref('')
const localError = ref('')

const usedSymbols = computed(() => {
  return props.watchlist.map((item: any) => String(item.symbol || '').toUpperCase())
})

const availableAssets = computed(() => {
  return props.assets.filter((asset: any) => !usedSymbols.value.includes(String(asset.symbol || '').toUpperCase()))
})

const isAtLimit = computed(() => {
  return props.maxWatchlist !== -1 && props.watchlist.length >= props.maxWatchlist
})

function toggleAdd() {
  if (!showAdd.value && isAtLimit.value) {
    localError.value = `Môžete mať maximálne ${props.maxWatchlist} položiek v sledovacom zozname`
    return
  }
  localError.value = ''
  showAdd.value = !showAdd.value
  if (showAdd.value && availableAssets.value.length && !selectedSymbol.value) selectedSymbol.value = availableAssets.value[0].symbol
}

function submitAdd() {
  if (isAtLimit.value) {
    localError.value = `Môžete mať maximálne ${props.maxWatchlist} položiek v sledovacom zozname`
    return
  }
  if (!selectedSymbol.value) {
    localError.value = 'Vyberte aktívum'
    return
  }
  localError.value = ''
  emit('add', selectedSymbol.value)
  selectedSymbol.value = ''
  showAdd.value = false
}

function formatPercent(value: number | string) {
  const numeric = Number(value || 0)
  return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(2)}%`
}
</script>

<style>
</style>
