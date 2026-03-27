<template>
  <div v-if="editingOrder" class="confirm-overlay" @click.self="$emit('close')">
    <div class="confirm-modal">
      <h3>Upraviť príkaz — {{ editingOrder.symbol }}</h3>

      <div class="order-form" style="gap: 1rem; display: flex; flex-direction: column">
        <div class="form-group">
          <label>Strana</label>
          <span :class="editingOrder.order_side === 'BUY' ? 'up' : 'down'" style="font-weight: 700">
            {{ editingOrder.order_side }}
          </span>
        </div>

        <div class="form-group">
          <label>Množstvo</label>
          <input v-model="editForm.amount" type="number" step="any" min="0" class="edit-input" />
        </div>

        <div v-if="editingOrder.order_type !== 'Market'" class="form-group">
          <label>{{ editingOrder.order_type === 'Limit' ? 'Limitná' : 'Stop' }} cena (USD)</label>
          <input v-model="editForm.price" type="number" step="any" min="0" class="edit-input" />
        </div>
      </div>

      <div v-if="validationError" class="order-error" style="margin-top: 1rem">{{ validationError }}</div>

      <div class="confirm-actions" style="margin-top: 1.25rem">
        <button class="btn btn-outline confirm-cancel" @click="$emit('close')">Zrušiť</button>
        <button class="btn order-btn buy-btn" :disabled="!!validationError || saving" @click="emitSave">
          {{ saving ? 'Ukladám...' : 'Uložiť' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OrderEditModal',
  emits: ['close', 'save'],
  props: {
    editingOrder: { type: Object, default: null },
    saving: { type: Boolean, default: false },
  },
  data() {
    return {
      editForm: {
        amount: '',
        price: '',
      },
    }
  },
  computed: {
    validationError(): string {
      const amount = Number(this.editForm.amount) || 0
      const price = Number(this.editForm.price) || 0
      if (!this.editingOrder) return ''
      if (amount <= 0) return 'Množstvo musí byť väčšie ako 0'
      if (this.editingOrder.order_type !== 'Market' && price <= 0) return 'Cena musí byť väčšia ako 0'
      return ''
    },
  },
  watch: {
    editingOrder: {
      immediate: true,
      handler(order: any) {
        if (!order) {
          this.editForm.amount = ''
          this.editForm.price = ''
          return
        }
        this.editForm.amount = String(order.amount ?? '')
        this.editForm.price = String(order.limit_price ?? order.stop_price ?? '')
      },
    },
  },
  methods: {
    emitSave() {
      if (!this.editingOrder || this.validationError) return
      const updates: Record<string, any> = {
        amount: Number(this.editForm.amount),
      }
      if (this.editingOrder.order_type === 'Limit') updates.limit_price = Number(this.editForm.price)
      if (this.editingOrder.order_type === 'Stop') updates.stop_price = Number(this.editForm.price)
      this.$emit('save', {
        orderId: this.editingOrder.order_id,
        updates,
      })
    },
  },
})
</script>

<style>
</style>
