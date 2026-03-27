<template>
  <div v-if="modelValue" class="page-modal-overlay" @click.self="close">
    <div class="page-modal-card page-modal-card--sm">
      <div class="page-modal-header">
        <h3>Odstrániť účet</h3>
        <button class="page-modal-close" @click="close">✕</button>
      </div>

      <div class="delete-warning">
        <p>Táto akcia je <strong>nezvratná</strong>. Všetky vaše dáta budú natrvalo vymazané.</p>
        <p>Pre potvrdenie napíšte <strong>DELETE</strong>:</p>
        <input v-model="deleteConfirm" type="text" placeholder="DELETE" class="delete-input" />
      </div>

      <div class="modal-actions">
        <button class="btn" @click="close">Zrušiť</button>
        <button class="btn btn-danger" :disabled="!canDelete || saving" @click="emitDelete">
          {{ saving ? 'Odstraňujem…' : 'Natrvalo odstrániť' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteAccountModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'confirm-delete'],
  data() {
    return {
      deleteConfirm: '',
    }
  },
  computed: {
    canDelete() {
      return this.deleteConfirm === 'DELETE'
    },
  },
  watch: {
    modelValue(value) {
      if (!value) {
        this.deleteConfirm = ''
      }
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    emitDelete() {
      if (!this.canDelete) return
      this.$emit('confirm-delete')
    },
  },
}
</script>

<style scoped>
.page-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 8, 23, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.page-modal-card {
  width: min(100%, 520px);
  background: #0f1b36;
  border: 1px solid rgba(59, 130, 246, 0.22);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  padding: 1.25rem 1.25rem 1rem;
}

.page-modal-card--sm {
  width: min(100%, 520px);
}

.page-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-modal-header h3 {
  margin: 0;
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 800;
}

.page-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.9);
  color: var(--color-white);
  cursor: pointer;
  font-size: 0.95rem;
}

.delete-warning {
  line-height: 1.6;
  color: var(--color-text);
  font-size: 0.9rem;
}

.delete-warning strong {
  color: #ef4444;
}

.delete-input {
  width: 100%;
  margin-top: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.65rem;
  color: var(--color-white);
  font-family: inherit;
  font-size: 0.88rem;
}

.modal-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-background-mute);
  color: var(--color-white);
  cursor: pointer;
  font-family: inherit;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}
</style>
