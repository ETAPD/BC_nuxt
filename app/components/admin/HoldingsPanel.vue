<template>
  <section class="admin-panel">
    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Portfólio</th>
            <th>Symbol</th>
            <th>Aktívum</th>
            <th>Množstvo</th>
            <th>Prie. nákup</th>
            <th>Aktuálna</th>
            <th>24h</th>
            <th>Hodnota</th>
            <th>Váha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="holding in holdings" :key="holding.holding_id">
            <td>{{ holding.holding_id }}</td>
            <td>{{ holding.portfolio_id }}</td>
            <td class="bold">{{ holding.symbol }}</td>
            <td>{{ holding.assets?.name ?? '—' }}</td>
            <td>{{ holding.amount }}</td>
            <td>{{ formatCurrency(holding.avg_buy_price) }}</td>
            <td>{{ formatCurrency(holding.current_price) }}</td>
            <td :class="holding.change_24h >= 0 ? 'up' : 'down'">
              {{ holding.change_24h >= 0 ? '+' : '' }}{{ holding.change_24h }}%
            </td>
            <td class="bold">{{ formatCurrency(holding.value) }}</td>
            <td>{{ holding.weight_percent }}%</td>
          </tr>
          <tr v-if="holdings.length === 0">
            <td colspan="10" class="empty-table">Žiadne držby.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'HoldingsPanel',
  props: {
    holdings: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  methods: {
    formatCurrency(value: number, currency = 'USD') {
      if (value == null) return (0).toLocaleString('en-US', { style: 'currency', currency })
      try {
        return value.toLocaleString('en-US', { style: 'currency', currency })
      } catch {
        return String(value)
      }
    },
  },
})
</script>

<style scoped>
.admin-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}
.table-wrapper {
  overflow-x: auto;
}
.admin-table {
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.admin-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.admin-table td {
  padding: 0.75rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}
.admin-table tr:hover td {
  background: rgba(59, 130, 246, 0.03);
}
.bold {
  font-weight: 700;
  color: var(--color-white);
}
.up {
  color: #22c55e;
  font-weight: 700;
}
.down {
  color: #ef4444;
  font-weight: 700;
}
.empty-table {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
