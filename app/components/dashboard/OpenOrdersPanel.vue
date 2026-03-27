<template>
  <section class="panel">
    <h2 class="panel-title">Otvorené príkazy</h2>
    <div class="orders-list">
      <div v-for="order in normalizedOrders" :key="order.order_id" class="order-item">
        <span :class="['order-type', order.order_side.toLowerCase()]">{{ order.order_side }}</span>
        <div class="order-details">
          <span class="order-symbol">{{ order.symbol }}</span>
          <span class="order-meta">{{ getOrderMeta(order) }}</span>
        </div>
        <span class="order-amount">{{ order.amount }} {{ order.amount_unit }}</span>
        <span :class="['order-status', getStatusClass(order.status)]">{{ order.status }}</span>
        <button class="edit-btn" @click="$emit('edit', order)" title="Upraviť">&#9998;</button>
        <button class="cancel-btn" @click="$emit('cancel', order.order_id)" title="Zrušiť">✕</button>
      </div>
      <div v-if="!normalizedOrders.length" class="empty-msg">Žiadne otvorené príkazy</div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OpenOrdersPanel',
  emits: ['edit', 'cancel'],
  props: {
    openOrders: { type: Array, default: () => [] },
    formatCurrency: { type: Function, required: true },
  },
  computed: {
    normalizedOrders(): any[] {
      return (this.openOrders as any[]).map((order: any) => ({
        ...order,
        status: order.status || 'pending',
        order_side: order.order_side || 'BUY',
      }))
    },
  },
  methods: {
    getStatusClass(status: string) {
      const normalized = String(status || '').toLowerCase()
      if (normalized === 'filled') return 'status-filled'
      if (normalized === 'cancelled' || normalized === 'rejected') return 'status-cancelled'
      if (normalized === 'active') return 'status-active'
      return 'status-pending'
    },
    getOrderMeta(order: any) {
      if (order.order_type === 'Market') return 'Trhový príkaz'
      const price = order.limit_price ?? order.stop_price ?? 0
      return `${order.order_type} @ ${this.formatCurrency(Number(price || 0))}`
    },
  },
})
</script>

<style>
</style>
