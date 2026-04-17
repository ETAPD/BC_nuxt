<template>
  <teleport to="body">
    <div v-if="open && localUser" class="manage-modal-overlay" @click.self="handleClose">
    <div class="manage-modal-card" @click.stop>
      <header class="manage-modal-header">
        <div>
          <p class="manage-modal-kicker">Administrácia</p>
          <h3>Upraviť používateľa</h3>
          <p class="manage-modal-subtitle">
            {{ localUser.full_name || 'Používateľ' }} · {{ localUser.email || 'bez e-mailu' }}
          </p>
        </div>
        <button type="button" class="manage-modal-close" @click="handleClose">✕</button>
      </header>

      <div class="manage-modal-grid">
        <div class="manage-field manage-field--full">
          <label>ID používateľa</label>
          <input type="text" :value="localUser.user_id" disabled />
        </div>

        <div class="manage-field">
          <label>Celé meno</label>
          <input v-model="localUser.full_name" type="text" />
        </div>

        <div class="manage-field">
          <label>E-mail</label>
          <input v-model="localUser.email" type="email" />
        </div>

        <div class="manage-field">
          <label>Preferovaná mena</label>
          <select v-model="localUser.preferred_currency">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CZK">CZK</option>
          </select>
        </div>

        <div class="manage-field">
          <label>Stav účtu</label>
          <select v-model="localUser.status">
            <option value="active">Aktívny</option>
            <option value="suspended">Pozastavený</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="manage-field">
          <label>Členstvo</label>
          <select v-model="localUser.role">
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div class="manage-modal-actions">
        <button type="button" class="manage-btn manage-btn--ghost" :disabled="saving" @click="handlePasswordReset">
          Poslať reset hesla
        </button>
        <div class="manage-modal-actions-right">
          <button type="button" class="manage-btn manage-btn--secondary" :disabled="saving" @click="handleClose">
            Zrušiť
          </button>
          <button type="button" class="manage-btn manage-btn--primary" :disabled="saving" @click="handleSave">
            {{ saving ? 'Ukladám…' : 'Uložiť zmeny' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
// Modal na spravu pouzivatela
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  open: boolean
  user: any | null
  saving?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [user: any]
  'password-reset': [email: string]
}>()

const localUser = ref<any | null>(props.user ? { ...props.user } : null)

watch(
  () => props.user,
  (newUser) => {
    localUser.value = newUser ? { ...newUser } : null
  },
  { immediate: true, deep: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

function handleClose() {
  emit('close')
}

function handleSave() {
  if (!localUser.value) return
  emit('save', { ...localUser.value })
}

function handlePasswordReset() {
  if (!localUser.value?.email) return
  emit('password-reset', localUser.value.email)
}
</script>

<style scoped>
.manage-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.14), transparent 34%),
    rgba(2, 6, 23, 0.76);
  backdrop-filter: blur(6px);
}

.manage-modal-card {
  width: min(760px, 100%);
  border-radius: 24px;
  border: 1px solid rgba(59, 130, 246, 0.22);
  background:
    linear-gradient(180deg, rgba(16, 28, 53, 0.98), rgba(8, 18, 38, 0.98));
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(59, 130, 246, 0.08) inset;
  color: #e5eefc;
  overflow: hidden;
}

.manage-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px 18px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.14);
}

.manage-modal-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7fb0ff;
  font-weight: 700;
}

.manage-modal-header h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  color: #f8fbff;
}

.manage-modal-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #9eb4d3;
}

.manage-modal-close {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.68);
  color: #d7e3f8;
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s ease;
  flex: 0 0 auto;
}

.manage-modal-close:hover {
  border-color: rgba(96, 165, 250, 0.35);
  background: rgba(30, 41, 59, 0.95);
  color: #ffffff;
}

.manage-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding: 24px 28px;
}

.manage-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manage-field--full {
  grid-column: 1 / -1;
}

.manage-field label {
  font-size: 13px;
  font-weight: 700;
  color: #9eb4d3;
}

.manage-field input,
.manage-field select {
  width: 100%;
  min-width: 0;
  height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(71, 85, 105, 0.55);
  background: rgba(6, 14, 28, 0.92);
  color: #f8fbff;
  padding: 0 14px;
  font: inherit;
  outline: none;
  transition: 0.2s ease;
}

.manage-field input:focus,
.manage-field select:focus {
  border-color: rgba(96, 165, 250, 0.75);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.manage-field input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.manage-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 28px 28px;
  border-top: 1px solid rgba(59, 130, 246, 0.12);
}

.manage-modal-actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manage-btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.manage-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.manage-btn--ghost {
  background: rgba(8, 18, 38, 0.72);
  border-color: rgba(71, 85, 105, 0.45);
  color: #d3e2f7;
}

.manage-btn--ghost:hover:not(:disabled) {
  border-color: rgba(96, 165, 250, 0.45);
  color: #ffffff;
}

.manage-btn--secondary {
  background: rgba(15, 23, 42, 0.82);
  border-color: rgba(71, 85, 105, 0.45);
  color: #d3e2f7;
}

.manage-btn--secondary:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.92);
  color: #ffffff;
}

.manage-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
}

.manage-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.3);
}

@media (max-width: 760px) {
  .manage-modal-overlay {
    padding: 12px;
  }

  .manage-modal-card {
    border-radius: 20px;
  }

  .manage-modal-header,
  .manage-modal-grid,
  .manage-modal-actions {
    padding-left: 18px;
    padding-right: 18px;
  }

  .manage-modal-grid {
    grid-template-columns: 1fr;
  }

  .manage-modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .manage-modal-actions-right {
    width: 100%;
    justify-content: stretch;
  }

  .manage-modal-actions-right .manage-btn {
    flex: 1;
  }

  .manage-btn--ghost {
    width: 100%;
  }
}
</style>
