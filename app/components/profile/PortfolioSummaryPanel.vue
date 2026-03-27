<template>
  <section class="panel">
    <h2 class="panel-title">Portfólio</h2>
    <div class="wallet-grid">
      <div class="wg-item wg-main">
        <span class="wg-label">Celková hodnota</span>
        <span class="wg-value big">{{ formatCurrency(holdingsTotal) }}</span>
      </div>
      <div class="wg-item">
        <span class="wg-label">Investované</span>
        <span class="wg-value">{{ formatCurrency(investedAmount) }}</span>
      </div>
      <div class="wg-item">
        <span class="wg-label">Dostupná hotovosť</span>
        <span class="wg-value">{{ formatCurrency(availableCash) }}</span>
      </div>
      <div class="wg-item">
        <span class="wg-label">Denná zmena</span>
        <span :class="['wg-value', dayChange >= 0 ? 'up' : 'down']">
          {{ dayChange >= 0 ? '+' : '' }}{{ formatCurrency(dayChange) }} ({{ dayChangePct }}%)
        </span>
      </div>
      <div class="wg-item">
        <span class="wg-label">Celkový P/L</span>
        <span :class="['wg-value', totalPnL >= 0 ? 'up' : 'down']">
          {{ totalPnL >= 0 ? '+' : '' }}{{ formatCurrency(totalPnL) }} ({{ totalPnLPct }}%)
        </span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PortfolioSummaryPanel',
  props: {
    holdingsTotal: {
      type: Number,
      default: 0,
    },
    investedAmount: {
      type: Number,
      default: 0,
    },
    availableCash: {
      type: Number,
      default: 0,
    },
    dayChange: {
      type: Number,
      default: 0,
    },
    dayChangePct: {
      type: [Number, String],
      default: 0,
    },
    totalPnL: {
      type: Number,
      default: 0,
    },
    totalPnLPct: {
      type: [Number, String],
      default: 0,
    },
  },
  methods: {
    formatCurrency(value) {
      if (value == null) return '$0.00'
      return Number(value).toLocaleString('sk-SK', { style: 'currency', currency: 'USD' })
    },
  },
}
</script>

<style scoped>
.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.35rem;
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
}

.wallet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.wg-main {
  grid-column: 1 / -1;
}

.wg-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.wg-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.wg-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-white);
}

.wg-value.big {
  font-size: 1.6rem;
  font-weight: 800;
}

.up {
  color: #22c55e;
}

.down {
  color: #ef4444;
}

@media (max-width: 640px) {
  .wallet-grid {
    grid-template-columns: 1fr;
  }
}
</style>
