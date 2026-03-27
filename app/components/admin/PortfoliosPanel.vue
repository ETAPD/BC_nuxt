<template>
  <section class="admin-panel">
    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vlastník</th>
            <th>Názov</th>
            <th>Investované</th>
            <th>Celková hodnota</th>
            <th>Denná zmena</th>
            <th>Riziko</th>
            <th>Aktualizované</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="portfolio in portfolios" :key="portfolio.portfolio_id">
            <td>{{ portfolio.portfolio_id }}</td>
            <td class="bold">
              {{ portfolio.users?.full_name ?? '—' }}<br />
              <span class="muted">{{ portfolio.users?.email ?? '' }}</span>
            </td>
            <td>{{ portfolio.name }}</td>
            <td>
              {{ formatCurrency(portfolio.invested, portfolio.users?.preferred_currency || 'USD') }}
            </td>
            <td class="bold">
              {{
                formatCurrency(portfolio.total_value, portfolio.users?.preferred_currency || 'USD')
              }}
            </td>
            <td :class="portfolio.day_change >= 0 ? 'up' : 'down'">
              {{ portfolio.day_change >= 0 ? '+' : '' }}
              {{
                formatCurrency(portfolio.day_change, portfolio.users?.preferred_currency || 'USD')
              }}
              ({{ portfolio.day_change_percent }}%)
            </td>
            <td>{{ portfolio.risk_profile }}</td>
            <td>{{ formatDate(portfolio.updated_at) }}</td>
          </tr>
          <tr v-if="portfolios.length === 0">
            <td colspan="8" class="empty-table">Žiadne portfóliá.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'PortfoliosPanel',
  props: {
    portfolios: {
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
  border-collapse: collapse;
  min-width: 1100px;
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
.muted {
  color: var(--color-text-muted);
  font-size: 0.84rem;
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
