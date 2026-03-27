<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-btn', { active: activeTab === tab.key }]"
      @click="$emit('update:activeTab', tab.key)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      {{ tab.label }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

const tabs = [
  { key: 'users', label: 'Používatelia', icon: '👤' },
  { key: 'portfolios', label: 'Portfóliá', icon: '💼' },
  { key: 'orders', label: 'Príkazy', icon: '📋' },
  { key: 'trades', label: 'Obchody', icon: '📊' },
  { key: 'holdings', label: 'Držby', icon: '📦' },
  { key: 'tickets', label: 'Tikety', icon: '🎫' },
] as const

type TabKey = (typeof tabs)[number]['key']

export default defineComponent({
  name: 'TabsBar',
  emits: ['update:activeTab'],
  props: {
    activeTab: {
      type: String as PropType<TabKey>,
      required: true,
    },
  },
  data() {
    return {
      tabs,
    }
  },
})
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
}
.tab-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}
.tab-btn:hover:not(.active) {
  background: rgba(59, 130, 246, 0.08);
  color: var(--color-text);
}
.tab-btn.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.12);
}
.tab-icon {
  font-size: 0.95rem;
}
@media (max-width: 900px) {
  .tab-bar {
    overflow-x: auto;
  }
  .tab-btn {
    flex: 0 0 auto;
    min-width: 132px;
  }
}
</style>
