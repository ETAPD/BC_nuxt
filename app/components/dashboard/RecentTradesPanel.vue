<template>
  <section class="panel">
    <h2 class="panel-title">Nedávne obchody</h2>
    <div class="trades-list">
      <div v-for="trade in normalizedTrades" :key="trade.trade_id" class="trade-item">
        <span :class="['trade-type', trade.trade_type.toLowerCase()]">{{ trade.trade_type }}</span>
        <span class="trade-symbol">{{ trade.symbol }}</span>
        <span class="trade-amount">{{ trade.amount }}</span>
        <span class="trade-price">{{ formatCurrency(trade.price) }}</span>
        <span class="trade-time">{{ timeAgo(trade.executed_at) }}</span>
      </div>
      <div v-if="!normalizedTrades.length" class="empty-msg">Žiadne nedávne obchody</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  recentTrades: any[]
  formatCurrency: (value: number, currency?: string) => string
}>()

const normalizedTrades = computed(() => {
  return props.recentTrades.map((trade: any) => ({
    ...trade,
    trade_type: trade.trade_type || 'BUY',
  }))
})

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Práve teraz'
  if (mins < 60) return `pred ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `pred ${hrs} hod`
  return `pred ${Math.floor(hrs / 24)} d`
}
</script>

<style>
</style>
