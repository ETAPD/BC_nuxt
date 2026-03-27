<template>
  <section class="admin-panel">
    <div v-if="messages.length === 0" class="empty-state">
      <p>No contact messages yet.</p>
    </div>
    <div v-else class="messages-list">
      <div v-for="message in messages" :key="message.id" class="message-card">
        <div class="message-header">
          <div class="message-sender">
            <span class="sender-name">{{ message.name }}</span>
            <span class="sender-email">{{ message.email }}</span>
          </div>
          <span class="message-date">{{ formatDate(message.created_at) }}</span>
        </div>
        <h4 class="message-subject">{{ message.subject }}</h4>
        <p class="message-body">{{ message.message }}</p>
        <div class="message-actions">
          <a
            :href="
              'mailto:' +
              message.email +
              '?subject=Re: ' +
              encodeURIComponent(message.subject || '')
            "
            class="btn btn-sm btn-outline"
          >
            Reply
          </a>
          <button
            class="btn btn-sm btn-danger-outline"
            @click="$emit('delete-message', message.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'MessagesPanel',
  emits: ['delete-message'],
  props: {
    messages: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  methods: {
    formatDate(value: string) {
      if (!value) return '—'
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
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
.empty-state {
  color: var(--color-text-muted);
  text-align: center;
  padding: 2.5rem 1rem;
}
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.message-card {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}
.message-header,
.message-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.message-header {
  margin-bottom: 0.8rem;
}
.message-sender {
  display: grid;
  gap: 0.2rem;
}
.sender-name {
  color: var(--color-white);
  font-weight: 700;
}
.sender-email,
.message-date {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}
.message-subject {
  margin: 0 0 0.6rem;
  color: var(--color-white);
  font-weight: 700;
}
.message-body {
  margin: 0 0 1rem;
  color: var(--color-text);
  line-height: 1.6;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
}
.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}
.btn-outline {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-accent);
}
.btn-outline:hover {
  background: rgba(59, 130, 246, 0.08);
}
.btn-danger-outline {
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.btn-danger-outline:hover {
  background: rgba(239, 68, 68, 0.15);
}
@media (max-width: 700px) {
  .message-header,
  .message-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
