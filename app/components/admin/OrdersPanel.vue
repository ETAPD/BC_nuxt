<template>
  <section class="admin-panel">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Hľadať podľa symbolu, stavu, portfólia alebo vlastníka…"
      />
    </div>

    <div class="order-filters">
      <select v-model="orderFilterStatus">
        <option value="">Všetky stavy</option>
        <option value="pending">Čakajúce</option>
        <option value="active">Aktívne</option>
        <option value="filled">Vyplnené</option>
        <option value="cancelled">Zrušené</option>
        <option value="rejected">Zamietnuté</option>
      </select>
      <select v-model="orderFilterSide">
        <option value="">Všetky strany</option>
        <option value="buy">Kúpa</option>
        <option value="sell">Predaj</option>
      </select>
      <select v-model="orderFilterType">
        <option value="">Všetky typy</option>
        <option value="market">Tržový</option>
        <option value="limit">Limitný</option>
        <option value="stop-loss">Stop-Loss</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Portfólio</th>
            <th>Symbol</th>
            <th>Strana</th>
            <th>Typ</th>
            <th>Cena</th>
            <th>Množstvo</th>
            <th>Vyplnená cena</th>
            <th>Stav</th>
            <th>Vytvorené</th>
            <th>Akcie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.order_id">
            <td>{{ order.order_id }}</td>
            <td>
              <span class="bold">{{ orderPortfolioDisplay(order).name }}</span>
              <br v-if="orderPortfolioDisplay(order).owner" />
              <span v-if="orderPortfolioDisplay(order).owner" class="muted">
                {{ orderPortfolioDisplay(order).owner }}
              </span>
            </td>
            <td>
              <span class="bold">{{ order.symbol }}</span>
              <span
                v-if="order.assets?.asset_type"
                :class="['asset-type-badge', order.assets.asset_type]"
              >
                {{ order.assets.asset_type }}
              </span>
            </td>
            <td>
              <span :class="['side-badge', order.order_side?.toLowerCase()]">{{
                order.order_side
              }}</span>
            </td>
            <td>{{ order.order_type }}</td>
            <td>{{ orderPriceDisplay(order) }}</td>
            <td>{{ formatAmount(order.amount, order.amount_unit) }}</td>
            <td>
              <template v-if="order.status === 'filled' && order.filled_price != null">
                {{ formatCurrency(order.filled_price) }}
              </template>
              <template v-else>—</template>
            </td>
            <td>
              <span :class="['status-badge', 'status-' + (order.status || 'pending')]">
                {{ order.status }}
              </span>
            </td>
            <td>
              <span class="date-main">{{ formatDateTwoLine(order.created_at).date }}</span>
              <br />
              <span class="muted">{{ formatDateTwoLine(order.created_at).time }}</span>
            </td>
            <td class="actions-cell">
              <template v-if="order.status === 'pending'">
                <button
                  type="button"
                  class="action-btn approve"
                  @click="$emit('change-status', order.order_id, 'active')"
                >
                  Aktivovať
                </button>
                <button
                  type="button"
                  class="action-btn fill"
                  @click="$emit('change-status', order.order_id, 'filled')"
                >
                  Vyplniť
                </button>
                <button
                  type="button"
                  class="action-btn cancel"
                  @click="$emit('change-status', order.order_id, 'cancelled')"
                >
                  Zrušiť
                </button>
                <button
                  type="button"
                  class="action-btn reject"
                  @click="$emit('change-status', order.order_id, 'rejected')"
                >
                  Zamietnuť
                </button>
              </template>
              <template v-else-if="order.status === 'active'">
                <button
                  type="button"
                  class="action-btn fill"
                  @click="$emit('change-status', order.order_id, 'filled')"
                >
                  Vyplniť
                </button>
                <button
                  type="button"
                  class="action-btn cancel"
                  @click="$emit('change-status', order.order_id, 'cancelled')"
                >
                  Zrušiť
                </button>
              </template>
              <template v-else-if="order.status === 'cancelled' || order.status === 'rejected'">
                <button
                  type="button"
                  class="action-btn reopen"
                  @click="$emit('change-status', order.order_id, 'pending')"
                >
                  Znovu otvoriť
                </button>
              </template>
              <template v-else-if="order.status === 'filled'">
                <span class="muted">Vyplnený</span>
              </template>
              <template v-else>
                <span class="muted">—</span>
              </template>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="11" class="empty-table">Žiadne príkazy.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'OrdersPanel',
  emits: ['change-status'],
  props: {
    orders: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: '',
      orderFilterStatus: '',
      orderFilterSide: '',
      orderFilterType: '',
    }
  },
  computed: {
    filteredOrders(): any[] {
      let list = [...this.orders]
      const q = this.searchQuery.trim().toLowerCase()
      if (q) {
        list = list.filter((order: any) => {
          return (
            order.symbol?.toLowerCase().includes(q) ||
            order.status?.toLowerCase().includes(q) ||
            order.portfolios?.name?.toLowerCase().includes(q) ||
            order.portfolios?.users?.full_name?.toLowerCase().includes(q) ||
            String(order.portfolio_id).includes(q)
          )
        })
      }
      if (this.orderFilterStatus)
        list = list.filter((order: any) => order.status === this.orderFilterStatus)
      if (this.orderFilterSide)
        list = list.filter((order: any) => order.order_side?.toLowerCase() === this.orderFilterSide)
      if (this.orderFilterType)
        list = list.filter((order: any) => order.order_type?.toLowerCase() === this.orderFilterType)
      return list
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
    formatAmount(value: number, unit?: string) {
      if (value == null) return '0'
      const formatted = value.toLocaleString('en-US', { maximumFractionDigits: 8 })
      return unit ? `${formatted} ${unit}` : formatted
    },
    formatDateTwoLine(value: string) {
      if (!value) return { date: '—', time: '' }
      const date = new Date(value)
      return {
        date: date.toLocaleDateString('sk-SK', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
      }
    },
    orderPriceDisplay(order: any) {
      if (order.order_type?.toLowerCase() === 'market') return 'Tržový'
      return this.formatCurrency(order.limit_price ?? order.stop_price ?? 0)
    },
    orderPortfolioDisplay(order: any) {
      const name = order.portfolios?.name || `#${order.portfolio_id}`
      const owner = order.portfolios?.users?.full_name || ''
      return { name, owner }
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
.search-bar,
.order-filters {
  margin-bottom: 1rem;
}
.search-bar input,
.order-filters select {
  width: 100%;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.85rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-fast);
}
.order-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.search-bar input:focus,
.order-filters select:focus {
  border-color: var(--color-accent);
}
.table-wrapper {
  max-height: 520px;
  overflow-y: auto;
  overflow-x: hidden;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.85rem;
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
  vertical-align: middle;
}
.admin-table td {
  padding: 0.75rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  vertical-align: middle;
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
.asset-type-badge,
.side-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}
.asset-type-badge.stock {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-accent);
}
.asset-type-badge.crypto {
  background: rgba(168, 85, 247, 0.12);
  color: #a78bfa;
}
.asset-type-badge.forex {
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
}
.asset-type-badge.commodity {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.asset-type-badge.etf {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.side-badge.buy {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.side-badge.sell {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.status-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.status-active {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-accent);
}
.status-filled {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.status-cancelled,
.status-rejected {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.actions-cell {
  min-width: 220px;
}
.action-btn {
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0.15rem 0.25rem 0.15rem 0;
  transition: all var(--transition-fast);
  color: #fff;
}
.action-btn.approve,
.action-btn.reopen {
  background: #2563eb;
}
.action-btn.approve:hover,
.action-btn.reopen:hover {
  background: #1d4ed8;
}
.action-btn.fill {
  background: #16a34a;
}
.action-btn.fill:hover {
  background: #15803d;
}
.action-btn.cancel {
  background: #f59e0b;
}
.action-btn.cancel:hover {
  background: #d97706;
}
.action-btn.reject {
  background: #ef4444;
}
.action-btn.reject:hover {
  background: #dc2626;
}
.date-main {
  color: var(--color-white);
  font-weight: 700;
}
.empty-table {
  text-align: center;
  color: var(--color-text-muted);
}
@media (max-width: 880px) {
  .order-filters {
    grid-template-columns: 1fr;
  }
}
</style>
