<template>
  <section class="profile-card tickets-card">
    <div class="section-header tickets-header">
      <div>
        <h3>Podpora</h3>
        <p>Otvorte tiket a komunikujte priamo s administrátorom.</p>
      </div>
    </div>

    <div v-if="loading" class="tickets-empty">Načítavam tikety…</div>
    <div v-else-if="tickets.length === 0" class="tickets-empty">
      Zatiaľ nemáte žiadne tikety podpory.
    </div>
    <div v-else class="tickets-list">
      <article v-for="ticket in tickets" :key="ticket.ticket_id" class="ticket-row">
        <div>
          <h4>{{ ticket.subject || 'Bez predmetu' }}</h4>
          <p>Aktualizované: {{ formatDate(ticket.updated_at) }}</p>
        </div>
        <div class="ticket-row__right">
          <span :class="['ticket-badge', statusClass(ticket.status)]">{{
            statusLabel(ticket.status)
          }}</span>
          <button type="button" class="btn btn-sm" @click="openChat(ticket)">Otvoriť chat</button>
        </div>
      </article>
    </div>

    <div v-if="createOpen" class="ticket-modal-backdrop" @click.self="closeCreateModal">
      <div class="ticket-modal ticket-modal--small" @click.stop>
        <header class="ticket-modal__header">
          <h3>Nový tiket podpory</h3>
          <button type="button" class="btn-close" @click="closeCreateModal">✕</button>
        </header>

        <div class="ticket-form">
          <label>
            <span>Predmet</span>
            <input v-model="newSubject" type="text" placeholder="Napríklad: Problém s príkazom" />
          </label>
          <label>
            <span>Správa</span>
            <textarea
              v-model="newMessage"
              rows="6"
              placeholder="Popíšte váš problém alebo otázku…"
            />
          </label>
        </div>

        <div class="ticket-modal__footer">
          <button type="button" class="btn" :disabled="createLoading" @click="closeCreateModal">
            Zrušiť
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="createLoading || !newSubject.trim() || !newMessage.trim()"
            @click="createNewTicket"
          >
            {{ createLoading ? 'Odosielam…' : 'Vytvoriť tiket' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="chatOpen && activeTicket" class="ticket-modal-backdrop" @click.self="closeChat">
      <div class="ticket-modal" @click.stop>
        <header class="ticket-modal__header">
          <div>
            <h3>{{ activeTicket.subject || 'Bez predmetu' }}</h3>
            <p>Ticket #{{ activeTicket.ticket_id }}</p>
          </div>
          <button type="button" class="btn-close" @click="closeChat">✕</button>
        </header>

        <div class="ticket-modal__subheader">
          <span :class="['ticket-badge', statusClass(activeTicket.status)]">{{
            statusLabel(activeTicket.status)
          }}</span>
        </div>

        <div class="ticket-thread">
          <div v-if="messagesLoading" class="tickets-empty">Načítavam správy…</div>
          <div v-else-if="messages.length === 0" class="tickets-empty">Zatiaľ žiadne správy.</div>

          <template v-else>
            <template v-for="message in messages" :key="message.id">
              <div v-if="isCloseReasonMessage(message)" class="ticket-close-note">
                <div class="ticket-close-note__label">Dôvod uzavretia tiketu</div>
                <div class="ticket-close-note__body">{{ extractCloseReason(message.body) }}</div>
                <div class="ticket-close-note__time">{{ formatDate(message.created_at) }}</div>
              </div>

              <div
                v-else
                :class="['message-bubble', message.sender_role === 'user' ? 'is-user' : 'is-admin']"
              >
                <div class="message-bubble__author">
                  {{
                    message.sender_name || (message.sender_role === 'user' ? 'Vy' : 'Administrátor')
                  }}
                </div>
                <div class="message-bubble__body">{{ message.body }}</div>
                <div class="message-bubble__time">{{ formatDate(message.created_at) }}</div>
              </div>
            </template>
          </template>
        </div>

        <div class="ticket-compose">
          <textarea
            v-model="replyText"
            rows="4"
            placeholder="Napíšte správu…"
            :disabled="sendLoading || normalizedStatus(activeTicket.status) === 'closed'"
          />
          <div class="ticket-modal__footer ticket-modal__footer--chat">
            <button
              v-if="normalizedStatus(activeTicket.status) !== 'closed'"
              type="button"
              class="btn btn-danger-outline"
              :disabled="statusLoading"
              @click="closeCurrentTicket"
            >
              {{ statusLoading ? 'Ukladám…' : 'Uzavrieť tiket' }}
            </button>
            <button
              v-else
              type="button"
              class="btn"
              :disabled="statusLoading"
              @click="reopenCurrentTicket"
            >
              {{ statusLoading ? 'Ukladám…' : 'Znovu otvoriť' }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="
                sendLoading ||
                !replyText.trim() ||
                normalizedStatus(activeTicket.status) === 'closed'
              "
              @click="sendReply"
            >
              {{ sendLoading ? 'Odosielam…' : 'Odoslať správu' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  createTicket,
  getUserTickets,
  getTicketMessages,
  sendTicketMessage,
  closeTicket,
  reopenTicket,
} from '../../composables/useSupportTickets'

const CLOSE_REASON_PREFIX = '__CLOSE_REASON__:'

export default {
  name: 'UserTicketsPanel',
  props: {
    userId: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      default: 'User',
    },
  },
  data() {
    return {
      loading: true,
      tickets: [],
      createOpen: false,
      createLoading: false,
      newSubject: '',
      newMessage: '',
      chatOpen: false,
      activeTicket: null,
      messages: [],
      messagesLoading: false,
      sendLoading: false,
      statusLoading: false,
      replyText: '',
    }
  },
  computed: {
    anyTicketModalOpen() {
      return this.createOpen || this.chatOpen
    },
  },
  watch: {
    anyTicketModalOpen: {
      immediate: true,
      handler(open) {
        document.body.style.overflow = open ? 'hidden' : ''
      },
    },
  },
  mounted() {
    this.loadTickets()
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  },
  methods: {
    normalizedStatus(status) {
      return status === 'closed' ? 'closed' : 'open'
    },
    statusLabel(status) {
      return this.normalizedStatus(status) === 'closed' ? 'Uzavretý' : 'Otvorený'
    },
    statusClass(status) {
      return this.normalizedStatus(status) === 'closed' ? 'is-closed' : 'is-open'
    },
    isCloseReasonMessage(message) {
      return typeof message?.body === 'string' && message.body.startsWith(CLOSE_REASON_PREFIX)
    },
    extractCloseReason(body) {
      if (typeof body !== 'string') return ''
      return body.replace(CLOSE_REASON_PREFIX, '').trim()
    },
    formatDate(value) {
      if (!value) return '—'
      return new Date(value).toLocaleString('sk-SK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    async loadTickets() {
      this.loading = true
      try {
        this.tickets = await getUserTickets(this.userId)
      } finally {
        this.loading = false
      }
    },
    openCreateModal() {
      this.createOpen = true
    },
    closeCreateModal() {
      this.createOpen = false
      this.newSubject = ''
      this.newMessage = ''
    },
    async createNewTicket() {
      if (!this.newSubject.trim() || !this.newMessage.trim()) return
      this.createLoading = true
      try {
        const ticket = await createTicket(
          this.userId,
          this.newSubject.trim(),
          this.newMessage.trim(),
          this.userName,
        )
        await this.loadTickets()
        this.closeCreateModal()
        const opened = this.tickets.find((item) => item.ticket_id === ticket.ticket_id) || ticket
        await this.openChat(opened)
      } finally {
        this.createLoading = false
      }
    },
    async openChat(ticket) {
      this.activeTicket = { ...ticket }
      this.chatOpen = true
      this.replyText = ''
      this.messagesLoading = true
      try {
        this.messages = await getTicketMessages(ticket.ticket_id)
      } finally {
        this.messagesLoading = false
      }
    },
    closeChat() {
      this.chatOpen = false
      this.activeTicket = null
      this.messages = []
      this.replyText = ''
    },
    async sendReply() {
      if (!this.activeTicket || !this.replyText.trim()) return
      this.sendLoading = true
      try {
        await sendTicketMessage(
          this.activeTicket.ticket_id,
          'user',
          this.userName,
          this.replyText.trim(),
        )
        this.replyText = ''
        this.messages = await getTicketMessages(this.activeTicket.ticket_id)
        await this.loadTickets()
        const updated = this.tickets.find((item) => item.ticket_id === this.activeTicket.ticket_id)
        if (updated) this.activeTicket = { ...updated }
      } finally {
        this.sendLoading = false
      }
    },
    async closeCurrentTicket() {
      if (!this.activeTicket) return
      this.statusLoading = true
      try {
        await closeTicket(this.activeTicket.ticket_id)
        await this.loadTickets()
        const updated = this.tickets.find((item) => item.ticket_id === this.activeTicket.ticket_id)
        if (updated) this.activeTicket = { ...updated }
      } finally {
        this.statusLoading = false
      }
    },
    async reopenCurrentTicket() {
      if (!this.activeTicket) return
      this.statusLoading = true
      try {
        await reopenTicket(this.activeTicket.ticket_id)
        await this.loadTickets()
        const updated = this.tickets.find((item) => item.ticket_id === this.activeTicket.ticket_id)
        if (updated) this.activeTicket = { ...updated }
      } finally {
        this.statusLoading = false
      }
    },
  },
}
</script>

<style scoped>
.tickets-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tickets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.tickets-header h3,
.tickets-header p,
.ticket-row h4,
.ticket-row p {
  margin: 0;
}
.tickets-header p,
.ticket-row p,
.tickets-empty {
  color: #94a3b8;
}
.tickets-list {
  display: grid;
  gap: 0.9rem;
}
.ticket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.42));
}
.ticket-row__right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.ticket-badge {
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}
.ticket-badge.is-open {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}
.ticket-badge.is-closed {
  background: rgba(148, 163, 184, 0.16);
  color: #cbd5e1;
}
.ticket-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(8px);
}
.ticket-modal {
  width: min(820px, 100%);
  max-height: 88vh;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94));
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
}
.ticket-modal--small {
  width: min(620px, 100%);
  grid-template-rows: auto 1fr auto;
}
.ticket-modal__header,
.ticket-modal__subheader,
.ticket-modal__footer,
.ticket-form,
.ticket-compose {
  padding: 1rem 1.1rem;
}
.ticket-modal__header,
.ticket-modal__subheader,
.ticket-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.ticket-modal__header h3,
.ticket-modal__header p,
.ticket-modal__subheader {
  margin: 0;
}
.ticket-modal__header p,
.ticket-modal__subheader {
  color: #94a3b8;
}
.ticket-form {
  display: grid;
  gap: 1rem;
}
.ticket-form label {
  display: grid;
  gap: 0.45rem;
}
.ticket-form input,
.ticket-form textarea,
.ticket-compose textarea {
  width: 100%;
  resize: vertical;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.65);
  color: #e5eefc;
  padding: 0.95rem 1rem;
}
.ticket-thread {
  overflow: auto;
  padding: 0 1.1rem 1rem;
  display: grid;
  gap: 0.85rem;
}
.message-bubble {
  max-width: 80%;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.message-bubble.is-user {
  justify-self: end;
  background: rgba(37, 99, 235, 0.18);
}
.message-bubble.is-admin {
  justify-self: start;
  background: rgba(30, 41, 59, 0.9);
}
.message-bubble__author {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: #cbd5e1;
}
.message-bubble__body {
  white-space: pre-wrap;
  line-height: 1.55;
}
.message-bubble__time,
.ticket-close-note__time {
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: #94a3b8;
}
.ticket-close-note {
  justify-self: center;
  width: min(100%, 620px);
  border-radius: 18px;
  border: 1px solid rgba(251, 191, 36, 0.24);
  background: linear-gradient(180deg, rgba(120, 53, 15, 0.32), rgba(120, 53, 15, 0.22));
  padding: 0.9rem 1rem;
}
.ticket-close-note__label {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fcd34d;
  margin-bottom: 0.35rem;
}
.ticket-close-note__body {
  white-space: pre-wrap;
  line-height: 1.55;
  color: #fff7ed;
}
.ticket-modal__footer--chat {
  justify-content: flex-end;
}
.btn-close {
  border: none;
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  cursor: pointer;
}
@media (max-width: 720px) {
  .tickets-header,
  .ticket-row,
  .ticket-row__right,
  .ticket-modal__header,
  .ticket-modal__subheader,
  .ticket-modal__footer {
    flex-direction: column;
    align-items: stretch;
  }
  .message-bubble {
    max-width: 100%;
  }
}
</style>
