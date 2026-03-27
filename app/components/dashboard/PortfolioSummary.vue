<template>
  <section class="portfolio-summary">
    <div class="summary-card main-value">
      <span class="label">Hodnota portfólia</span>
      <span class="value">{{ formatCurrency(portfolio?.total_value ?? 0) }}</span>
      <span :class="['change', dayChange >= 0 ? 'up' : 'down']">
        {{ dayChange >= 0 ? '+' : '' }}{{ formatCurrency(dayChange) }}
        ({{ dayChangePercent }}%) dnes
      </span>
    </div>

    <div class="summary-card">
      <span class="label">Investované</span>
      <span class="value">{{ formatCurrency(portfolio?.invested ?? 0) }}</span>
      <span class="change">Celkovo vynaložené na aktíva</span>
    </div>

    <div class="summary-card">
      <span class="label">Dostupná hotovosť</span>
      <span class="value">{{ formatCurrency(availableCash) }}</span>
      <span class="change">Pripravené na investovanie</span>
    </div>

    <div class="summary-card">
      <span class="label">Otvorené príkazy</span>
      <span class="value">{{ openOrdersCount }}</span>
      <span class="change">Aktívne limitné/stop príkazy</span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PortfolioSummary',
  props: {
    portfolio: { type: Object, default: null },
    availableCash: { type: Number, default: 0 },
    openOrdersCount: { type: Number, default: 0 },
    formatCurrency: { type: Function, required: true },
  },
  computed: {
    dayChange(): number {
      return Number(this.portfolio?.day_change ?? 0)
    },

    dayChangePercent(): string {
      return String(this.portfolio?.day_change_percent ?? 0)
    },
  },
})
</script>

<style>
</style>
