<template>
  <div v-if="modelValue" class="page-modal-overlay" @click.self="close">
    <div class="page-modal-card">
      <div class="page-modal-header">
        <h3>Upraviť profil</h3>
        <button class="page-modal-close" @click="close">✕</button>
      </div>

      <div class="modal-form">
        <div class="mf-row">
          <label>E-mail</label>
          <input :value="user && user.email" type="email" disabled class="mf-disabled" />
        </div>

        <div class="mf-row">
          <label>Celé meno *</label>
          <input v-model="form.full_name" type="text" placeholder="napr. Ján Novák" />
        </div>

        <div class="mf-row">
          <label>Iniciály <span class="mf-hint">(auto ak prázdne)</span></label>
          <input v-model="form.initials" type="text" maxlength="3" placeholder="JN" />
        </div>

        <div class="mf-row">
          <label>Telefón</label>
          <input v-model="form.phone" type="tel" placeholder="+421 900 000 000" />
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn" @click="close">Zrušiť</button>
        <button
          class="btn btn-accent"
          :disabled="saveLoading || !form.full_name.trim()"
          @click="emitSave"
        >
          {{ saveLoading ? 'Ukladám…' : 'Uložiť zmeny' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: boolean
  user?: Record<string, any> | null
  saveLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save-profile': [data: { full_name: string; initials: string; phone: string }]
}>()

const form = ref({
  full_name: '',
  initials: '',
  phone: '',
})

function resetFromUser() {
  form.value = {
    full_name: (props.user && props.user.full_name) || '',
    initials: (props.user && props.user.initials) || '',
    phone: (props.user && props.user.phone) || '',
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    resetFromUser()
  }
}, { immediate: true })

watch(() => props.user, () => {
  if (props.modelValue) {
    resetFromUser()
  }
}, { deep: true })

function close() {
  emit('update:modelValue', false)
}

function emitSave() {
  if (!form.value.full_name.trim()) return
  emit('save-profile', {
    full_name: form.value.full_name,
    initials: form.value.initials,
    phone: form.value.phone,
  })
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
  max-height: min(88vh, 900px);
  overflow-y: auto;
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

.mf-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: var(--color-background) !important;
}

.mf-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.mf-inline-request {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid rgba(79, 140, 255, 0.16);
  border-radius: 16px;
  background: rgba(9, 22, 51, 0.72);
}

.mf-inline-request-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.mf-inline-title {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f3f7ff;
  margin-bottom: 0.3rem;
}

.mf-inline-text {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #8ea8d8;
}

.mf-inline-box {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(79, 140, 255, 0.14);
}

.mf-inline-actions {
  display: flex;
  justify-content: flex-end;
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
  transition: all 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .mf-inline-request-head {
    flex-direction: column;
  }

  .mf-inline-actions {
    justify-content: stretch;
  }

  .mf-inline-actions .btn {
    width: 100%;
  }
}
</style>
