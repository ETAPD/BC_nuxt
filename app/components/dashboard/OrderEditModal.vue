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

<script setup lang="ts">
// Modal na upravu objednavky
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  editingOrder: any | null
  saving?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { orderId: any; updates: Record<string, any> }]
}>()

const editForm = ref({
  amount: '',
  price: '',
})

const validationError = computed(() => {
  const amount = Number(editForm.value.amount) || 0
  const price = Number(editForm.value.price) || 0
  if (!props.editingOrder) return ''
  if (amount <= 0) return 'Množstvo musí byť väčšie ako 0'
  if (props.editingOrder.order_type !== 'Market' && price <= 0) return 'Cena musí byť väčšia ako 0'
  return ''
})

watch(
  () => props.editingOrder,
  (order) => {
    if (!order) {
      editForm.value.amount = ''
      editForm.value.price = ''
      return
    }
    editForm.value.amount = String(order.amount ?? '')
    editForm.value.price = String(order.limit_price ?? order.stop_price ?? '')
  },
  { immediate: true }
)

function emitSave() {
  if (!props.editingOrder || validationError.value) return
  const updates: Record<string, any> = {
    amount: Number(editForm.value.amount),
  }
  if (props.editingOrder.order_type === 'Limit') updates.limit_price = Number(editForm.value.price)
  if (props.editingOrder.order_type === 'Stop') updates.stop_price = Number(editForm.value.price)
  emit('save', {
    orderId: props.editingOrder.order_id,
    updates,
  })
}
</script>

<style>
</style>
