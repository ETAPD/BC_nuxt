<template>
  <div class="ticket-chat">
    <div class="chat-header">
      <button v-if="showBack" class="btn-back" @click="$emit('back')">← Späť</button>
      <div v-if="showBack" class="chat-header-info">
        <h3 class="chat-subject">{{ ticket.subject }}</h3>
        <span :class="['chat-status', 'status-' + ticket.status]">
          {{ ticket.status === 'open' ? 'Otvorený' : 'Uzavretý' }}
        </span>
      </div>
      <span v-else :class="['chat-status', 'status-' + ticket.status]">
        {{ ticket.status === 'open' ? 'Otvorený' : 'Uzavretý' }}
      </span>
      <span class="chat-spacer"></span>
      <button
        v-if="ticket.status === 'open'"
        class="btn btn-sm btn-danger-outline"
        @click="$emit('close-ticket')"
      >
        Uzavrieť
      </button>
      <button v-else class="btn btn-sm btn-outline" @click="$emit('reopen-ticket')">
        Znovu otvoriť
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loading" class="chat-loading">Načítavam správy…</div>
      <template v-else>
        <div
          v-for="msg in messages"
          :key="msg.message_id"
          :class="['chat-bubble', msg.sender_role === senderRole ? 'mine' : 'theirs']"
        >
          <div class="bubble-meta">
            <span class="bubble-sender">{{ msg.sender_name }}</span>
            <span class="bubble-time">{{ formatTime(msg.created_at) }}</span>
          </div>
          <p class="bubble-body">{{ msg.body }}</p>
        </div>
      </template>
    </div>

    <form v-if="ticket.status === 'open'" class="chat-input" @submit.prevent="handleSend">
      <textarea
        v-model="newMessage"
        placeholder="Napíšte správu…"
        rows="2"
        class="chat-textarea"
        @keydown.enter.exact.prevent="handleSend"
      />
      <button
        type="submit"
        class="btn btn-primary btn-send"
        :disabled="!newMessage.trim() || sending"
      >
        {{ sending ? 'Odosielam…' : 'Odoslať' }}
      </button>
    </form>
    <div v-else class="chat-closed-notice">
      Tiket je uzavretý. Znovu ho otvorte pre pokračovanie v konverzácii.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, useTemplateRef } from 'vue'

const props = defineProps<{
  ticket: any
  messages: any[]
  loading?: boolean
  senderRole: 'user' | 'admin'
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
  send: [body: string]
  'close-ticket': []
  'reopen-ticket': []
}>()

const newMessage = ref('')
const sending = ref(false)
const messagesContainer = useTemplateRef<HTMLElement>('messagesContainer')

function scrollToBottom() {
  const el = messagesContainer.value
  if (el) el.scrollTop = el.scrollHeight
}

function formatTime(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleSend() {
  const body = newMessage.value.trim()
  if (!body) return
  sending.value = true
  try {
    emit('send', body)
    newMessage.value = ''
  } finally {
    sending.value = false
  }
}

watch(() => props.messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.ticket-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--vt-c-green);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.btn-back:hover {
  background: rgba(0, 189, 126, 0.08);
}

.chat-spacer {
  flex: 1;
}

.chat-header-info {
  flex: 1;
  min-width: 0;
}

.chat-subject {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.chat-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.status-open {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-closed {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chat-loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem 0;
}

.chat-bubble {
  max-width: 75%;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  word-break: break-word;
}

.chat-bubble.mine {
  align-self: flex-end;
  background: rgba(0, 189, 126, 0.12);
  border: 1px solid rgba(0, 189, 126, 0.25);
}

.chat-bubble.theirs {
  align-self: flex-start;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

.bubble-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.bubble-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-heading);
}

.bubble-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.bubble-body {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--color-text);
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
}

.chat-textarea {
  flex: 1;
  resize: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
}

.chat-textarea:focus {
  outline: none;
  border-color: var(--vt-c-green);
}

.btn-send {
  align-self: flex-end;
}

.chat-closed-notice {
  padding: 0.75rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--color-border);
}
</style>
