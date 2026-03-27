<script setup lang="ts">
import { watch } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    showClose?: boolean
    width?: string
  }>(),
  {
    title: '',
    showClose: true,
    width: '',
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

watch(
  () => props.show,
  (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)

function onBackdropClick() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="onBackdropClick">
      <div class="modal-box" :style="width ? { maxWidth: width } : {}" @click.stop>
        <header v-if="title || showClose || $slots.header" class="modal-header">
          <slot name="header">
            <h3 class="modal-title">{{ title }}</h3>
          </slot>
          <button v-if="showClose" type="button" class="modal-close" @click="emit('close')">
            &times;
          </button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.modal-box {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-width: 520px;
  width: 92vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.35rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
}
.modal-close:hover {
  color: var(--color-white);
}

.modal-body {
  padding: 1.35rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.35rem;
  border-top: 1px solid var(--color-border);
}
</style>
