<template>
  <section class="admin-panel">
    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Portfólio</th>
            <th>Symbol</th>
            <th>Typ</th>
            <th>Množstvo</th>
            <th>Cena</th>
            <th>Poplatok</th>
            <th>Celkom</th>
            <th>Vykonané</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trade in trades" :key="trade.trade_id">
            <td>{{ trade.trade_id }}</td>
            <td>{{ trade.portfolio_id }}</td>
            <td class="bold">{{ trade.symbol }}</td>
            <td>
              <span :class="['side-badge', trade.trade_type?.toLowerCase()]">{{
                trade.trade_type
              }}</span>
            </td>
            <td>{{ trade.amount }}</td>
            <td>{{ formatCurrency(trade.price) }}</td>
            <td>{{ formatCurrency(trade.fee) }}</td>
            <td class="bold">{{ formatCurrency(trade.total_value) }}</td>
            <td>{{ formatDate(trade.executed_at) }}</td>
          </tr>
          <tr v-if="trades.length === 0">
            <td colspan="9" class="empty-table">Žiadne obchody.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'TradesPanel',
  props: {
    trades: {
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
    formatDate(value: string) {
      if (!value) return '—'
      return new Date(value).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
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
  min-width: 1040px;
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
.side-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.side-badge.buy {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.side-badge.sell {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.empty-table {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
