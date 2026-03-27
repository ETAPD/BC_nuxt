<template>
  <div v-if="modelValue" class="page-modal-overlay" @click.self="close">
    <div class="page-modal-card page-modal-card--sm">
      <div class="page-modal-header">
        <h3>Zmeniť heslo</h3>
        <button class="page-modal-close" @click="close">✕</button>
      </div>

      <div class="modal-form">
        <div class="mf-row">
          <label>Nové heslo</label>
          <input v-model="newPassword" type="password" placeholder="Min. 6 znakov" />
        </div>

        <div class="mf-row">
          <label>Potvrdiť heslo</label>
          <input v-model="confirmPassword" type="password" placeholder="Zopakujte heslo" />
        </div>

        <div v-if="localError" class="mf-error">{{ localError }}</div>
      </div>

      <div class="modal-actions">
        <button class="btn" @click="close">Zrušiť</button>
        <button class="btn btn-accent" :disabled="saving" @click="submitPassword">
          {{ saving ? 'Mením…' : 'Zmeniť heslo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChangePasswordModal',
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
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      localError: '',
    }
  },
  watch: {
    modelValue(value) {
      if (!value) {
        this.reset()
      }
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    reset() {
      this.newPassword = ''
      this.confirmPassword = ''
      this.localError = ''
    },
    submitPassword() {
      this.localError = ''
      if (this.newPassword.length < 6) {
        this.localError = 'Heslo musí mať aspoň 6 znakov'
        return
      }
      if (this.newPassword !== this.confirmPassword) {
        this.localError = 'Heslá sa nezhodujú'
        return
      }
      this.$emit('submit', this.newPassword)
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
  width: min(100%, 620px);
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mf-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mf-row label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.mf-row input {
  width: 100%;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.65rem;
  color: var(--color-white);
  font-family: inherit;
  font-size: 0.88rem;
}

.mf-error {
  color: #ef4444;
  font-size: 0.82rem;
  font-weight: 600;
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

.btn-accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
</style>
