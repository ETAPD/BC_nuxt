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

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  portfolio: any | null
  availableCash: number
  openOrdersCount: number
  formatCurrency: (value: number, currency?: string) => string
}>()

const dayChange = computed(() => Number(props.portfolio?.day_change ?? 0))
const dayChangePercent = computed(() => String(props.portfolio?.day_change_percent ?? 0))
</script>

<style>
</style>
