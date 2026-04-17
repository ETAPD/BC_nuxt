<template>
  <section class="admin-panel tickets-panel">
    <div class="tickets-toolbar">
      <div class="tickets-toolbar__search">
        <span class="tickets-toolbar__icon">🔎</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hľadať podľa predmetu, mena alebo e-mailu…"
        />
      </div>
      <select v-model="statusFilter">
        <option value="all">Všetky stavy</option>
        <option value="open">Otvorené</option>
        <option value="closed">Uzavreté</option>
      </select>
    </div>

    <div v-if="filteredTickets.length === 0" class="empty-state">
      <p>Žiadne tikety podpory.</p>
    </div>

    <div v-else class="tickets-list">
      <article
        v-for="ticket in filteredTickets"
        :key="ticket.ticket_id"
        class="ticket-card"
        role="button"
        tabindex="0"
        @click="openTicket(ticket)"
        @keydown.enter="openTicket(ticket)"
      >
        <div class="ticket-card__top">
          <div class="ticket-card__title-wrap">
            <h4>{{ ticket.subject || 'Bez predmetu' }}</h4>
            <p>
              <strong>{{ ticket.user_name || 'Používateľ' }}</strong>
              <span>· {{ ticket.user_email || '—' }}</span>
            </p>
          </div>
          <div class="ticket-card__right">
            <span :class="['ticket-status', statusClass(ticket.status)]">{{
              statusLabel(ticket.status)
            }}</span>
            <span class="ticket-card__arrow">›</span>
          </div>
        </div>
        <div class="ticket-card__meta">
          <span>#{{ ticket.ticket_id }}</span>
          <span>Aktualizované: {{ formatDate(ticket.updated_at) }}</span>
        </div>
      </article>
    </div>

    <div v-if="chatOpen && activeTicket" class="ticket-modal-backdrop" @click.self="closeChat">
      <div class="ticket-modal" @click.stop>
        <aside class="ticket-sidebar">
          <div class="ticket-sidebar__avatar">
            <img
              v-if="activeTicket.user?.profile_picture"
              :src="activeTicket.user.profile_picture"
              alt=""
              class="ticket-sidebar__avatar-img"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span v-else>{{ initials(activeTicket.user_name) }}</span>
          </div>
          <div class="ticket-sidebar__user">
            <h4>{{ activeTicket.user_name || 'Používateľ' }}</h4>
            <p>{{ activeTicket.user_email || '—' }}</p>
          </div>
          <div class="ticket-sidebar__divider"></div>
          <dl class="ticket-sidebar__meta">
            <dt>Predmet</dt>
            <dd>{{ activeTicket.subject || 'Bez predmetu' }}</dd>
            <dt>Vytvorené</dt>
            <dd>{{ formatDate(activeTicket.created_at) }}</dd>
            <dt>Tiket #</dt>
            <dd>{{ activeTicket.ticket_id }}</dd>
            <dt>Stav</dt>
            <dd>
              <span :class="['ticket-status', statusClass(activeTicket.status)]">{{
                statusLabel(activeTicket.status)
              }}</span>
            </dd>
          </dl>
          <div class="ticket-sidebar__divider"></div>
          <button
            type="button"
            class="btn btn-manage-user"
            @click.stop="$emit('manage-user', activeTicket)"
          >
            👤 Spravovať používateľa
          </button>
        </aside>

        <div class="ticket-chat-area">
          <header class="ticket-chat-area__header">
            <h3>{{ activeTicket.subject || 'Bez predmetu' }}</h3>
            <button type="button" class="btn-close" @click="closeChat">✕</button>
          </header>

          <div class="ticket-thread">
            <div v-if="messagesLoading" class="ticket-thread__empty">Načítavam správy…</div>
            <div v-else-if="messages.length === 0" class="ticket-thread__empty">Žiadne správy.</div>

            <template v-else>
              <template v-for="message in messages" :key="message.id">
                <div v-if="isCloseReasonMessage(message)" class="ticket-system-note">
                  <div class="ticket-system-note__label">Dôvod uzavretia</div>
                  <div class="ticket-system-note__body">{{ extractCloseReason(message.body) }}</div>
                  <div class="ticket-system-note__time">{{ formatDate(message.created_at) }}</div>
                </div>

                <div
                  v-else
                  :class="[
                    'ticket-bubble',
                    message.sender_role === 'admin' ? 'is-admin' : 'is-user',
                  ]"
                >
                  <div class="ticket-bubble__author">
                    {{
                      message.sender_name ||
                      (message.sender_role === 'admin' ? 'Admin' : 'Používateľ')
                    }}
                  </div>
                  <div class="ticket-bubble__body">{{ message.body }}</div>
                  <div class="ticket-bubble__time">{{ formatDate(message.created_at) }}</div>
                </div>
              </template>
            </template>
          </div>

          <div class="ticket-compose">
            <textarea
              v-model="replyText"
              rows="4"
              placeholder="Napíšte odpoveď používateľovi…"
              :disabled="sendLoading || normalizedStatus(activeTicket.status) === 'closed'"
            />
            <div class="ticket-compose__actions">
              <button
                v-if="normalizedStatus(activeTicket.status) !== 'closed'"
                type="button"
                class="btn btn-danger-outline"
                :disabled="statusLoading"
                @click="openCloseReasonModal"
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
                {{ sendLoading ? 'Odosielam…' : 'Odoslať odpoveď' }}
              </button>
            </div>
          </div>

          <div v-if="closeReasonOpen" class="close-reason-backdrop" @click.self="cancelCloseReason">
            <div class="close-reason-modal" @click.stop>
              <div class="close-reason-modal__header">
                <h4>Uzavrieť tiket</h4>
                <button type="button" class="btn-close" @click="cancelCloseReason">✕</button>
              </div>
              <p class="close-reason-modal__text">
                Zadajte dôvod uzavretia. Tento dôvod bude zobrazený používateľovi v chate.
              </p>
              <textarea
                v-model="closeReasonText"
                rows="4"
                placeholder="Napíšte dôvod uzavretia tiketu…"
              />
              <div class="close-reason-modal__actions">
                <button
                  type="button"
                  class="btn"
                  :disabled="statusLoading"
                  @click="cancelCloseReason"
                >
                  Zrušiť
                </button>
                <button
                  type="button"
                  class="btn btn-danger-outline"
                  :disabled="statusLoading || !closeReasonText.trim()"
                  @click="confirmCloseCurrentTicket"
                >
                  {{ statusLoading ? 'Ukladám…' : 'Potvrdiť uzavretie' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Panel support tiketov s chatom
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { adminGetAllTickets } from '../../composables/useAdmin'
import {
  getTicketMessages,
  sendTicketMessage,
  closeTicket,
  reopenTicket,
} from '../../composables/useSupportTickets'
import { createAdminNotification } from '../../composables/useNotifications'

const CLOSE_REASON_PREFIX = '__CLOSE_REASON__:'

const props = defineProps<{
  tickets: any[]
  adminName?: string
}>()

const emit = defineEmits<{
  (e: 'ticket-updated'): void
  (e: 'manage-user', ticket: any): void
  (e: 'refresh'): void
}>()

const searchQuery = ref('')
const statusFilter = ref('all')
const localTickets = ref<any[]>([])
const chatOpen = ref(false)
const activeTicket = ref<any>(null)
const messages = ref<any[]>([])
const messagesLoading = ref(false)
const sendLoading = ref(false)
const statusLoading = ref(false)
const replyText = ref('')
const closeReasonOpen = ref(false)
const closeReasonText = ref('')

const filteredTickets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return localTickets.value.filter((ticket) => {
    const statusOk =
      statusFilter.value === 'all' || normalizedStatus(ticket.status) === statusFilter.value
    if (!statusOk) return false
    if (!q) return true
    return (
      (ticket.subject || '').toLowerCase().includes(q) ||
      (ticket.user_name || '').toLowerCase().includes(q) ||
      (ticket.user_email || '').toLowerCase().includes(q) ||
      String(ticket.ticket_id || '').includes(q)
    )
  })
})

watch(
  () => props.tickets,
  (value) => {
    localTickets.value = Array.isArray(value) ? value.map((item) => ({ ...item })) : []
  },
  { immediate: true, deep: true },
)

watch(chatOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
}, { immediate: true })

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function normalizedStatus(status: string) {
  return status === 'closed' ? 'closed' : 'open'
}

function statusLabel(status: string) {
  return normalizedStatus(status) === 'closed' ? 'Uzavretý' : 'Otvorený'
}

function statusClass(status: string) {
  return normalizedStatus(status) === 'closed' ? 'is-closed' : 'is-open'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('sk-SK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isCloseReasonMessage(message: any) {
  return typeof message?.body === 'string' && message.body.startsWith(CLOSE_REASON_PREFIX)
}

function extractCloseReason(body: string) {
  if (typeof body !== 'string') return ''
  return body.replace(CLOSE_REASON_PREFIX, '').trim()
}

function initials(name: string | undefined) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((w) => (w[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('')
}

async function refreshTickets() {
  const fresh = await adminGetAllTickets()
  localTickets.value = Array.isArray(fresh) ? fresh : []
  emit('ticket-updated')
  if (activeTicket.value) {
    const updated = localTickets.value.find(
      (item) => item.ticket_id === activeTicket.value.ticket_id,
    )
    if (updated) activeTicket.value = { ...updated }
  }
}

async function reloadMessages() {
  if (!activeTicket.value) return
  messages.value = await getTicketMessages(activeTicket.value.ticket_id)
}

async function openTicket(ticket: any) {
  activeTicket.value = { ...ticket }
  chatOpen.value = true
  replyText.value = ''
  closeReasonOpen.value = false
  closeReasonText.value = ''
  messagesLoading.value = true
  try {
    messages.value = await getTicketMessages(ticket.ticket_id)
  } finally {
    messagesLoading.value = false
  }
}

function closeChat() {
  chatOpen.value = false
  activeTicket.value = null
  messages.value = []
  replyText.value = ''
  closeReasonOpen.value = false
  closeReasonText.value = ''
}

function openCloseReasonModal() {
  closeReasonOpen.value = true
  closeReasonText.value = ''
}

function cancelCloseReason() {
  closeReasonOpen.value = false
  closeReasonText.value = ''
}

async function sendReply() {
  if (!activeTicket.value || !replyText.value.trim()) return
  sendLoading.value = true
  try {
    await sendTicketMessage(
      activeTicket.value.ticket_id,
      'admin',
      props.adminName || 'Administrator',
      replyText.value.trim(),
    )
    if (activeTicket.value.user_id) {
      await createAdminNotification(
        activeTicket.value.user_id,
        'Nová odpoveď na tiket',
        `Dostali ste odpoveď na tiket: ${activeTicket.value.subject || 'Bez predmetu'}`,
      ).catch(() => {})
    }
    replyText.value = ''
    await reloadMessages()
    await refreshTickets()
  } finally {
    sendLoading.value = false
  }
}

async function confirmCloseCurrentTicket() {
  if (!activeTicket.value || !closeReasonText.value.trim()) return
  statusLoading.value = true
  try {
    await sendTicketMessage(
      activeTicket.value.ticket_id,
      'admin',
      props.adminName || 'Administrator',
      `${CLOSE_REASON_PREFIX}${closeReasonText.value.trim()}`,
    )
    await closeTicket(activeTicket.value.ticket_id)
    if (activeTicket.value.user_id) {
      await createAdminNotification(
        activeTicket.value.user_id,
        'Tiket bol uzavretý',
        `Váš tiket "${activeTicket.value.subject || 'Bez predmetu'}" bol uzavretý.`,
      ).catch(() => {})
    }
    await refreshTickets()
    await reloadMessages()
    cancelCloseReason()
  } finally {
    statusLoading.value = false
  }
}

async function reopenCurrentTicket() {
  if (!activeTicket.value) return
  statusLoading.value = true
  try {
    await reopenTicket(activeTicket.value.ticket_id)
    await refreshTickets()
  } finally {
    statusLoading.value = false
  }
}
</script>

<style scoped>
/* Toolbar */
.tickets-toolbar {
  display: grid;
  grid-template-columns: 1fr 230px;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.tickets-toolbar__search {
  position: relative;
}
.tickets-toolbar__icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.92rem;
  opacity: 0.75;
}
.tickets-toolbar input,
.tickets-toolbar select,
.ticket-compose textarea,
.close-reason-modal textarea {
  width: 100%;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.85rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-fast);
}
.tickets-toolbar input {
  padding-left: 2.5rem;
}
.tickets-toolbar input:focus,
.tickets-toolbar select:focus,
.ticket-compose textarea:focus,
.close-reason-modal textarea:focus {
  border-color: var(--color-accent);
}

/* Zoznam tiketov */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.ticket-card {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
}
.ticket-card:hover {
  border-color: var(--color-accent);
  background: rgba(59, 130, 246, 0.03);
}
.ticket-card__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
.ticket-card__arrow {
  color: var(--color-text-muted);
  font-size: 1.4rem;
  line-height: 1;
}
.ticket-card__top,
.ticket-card__meta,
.ticket-compose__actions,
.close-reason-modal__header,
.close-reason-modal__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.ticket-card__top h4,
.ticket-card__top p,
.ticket-thread__empty,
.close-reason-modal__header h4,
.close-reason-modal__text {
  margin: 0;
}
.ticket-card__top h4,
.close-reason-modal__header h4 {
  color: var(--color-white);
  font-size: 1rem;
  font-weight: 700;
}
.ticket-card__title-wrap {
  min-width: 0;
}
.ticket-card__top p,
.ticket-card__meta,
.ticket-thread__empty,
.close-reason-modal__text {
  color: var(--color-text-muted);
}
.ticket-card__meta {
  margin-top: 0.8rem;
  font-size: 0.84rem;
}

/* Status badge */
.ticket-status {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}
.ticket-status.is-open {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.ticket-status.is-closed {
  background: rgba(148, 163, 184, 0.12);
  color: var(--color-text-muted);
}

/* Modal */
.ticket-modal-backdrop,
.close-reason-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.65);
}
.close-reason-backdrop {
  z-index: 210;
}
.ticket-modal {
  width: min(1060px, 96vw);
  max-height: 90vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  overflow: hidden;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

/* Sidebar */
.ticket-sidebar {
  background: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  padding: 1.5rem 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.ticket-sidebar__avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.12);
  border: 2px solid rgba(59, 130, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-accent);
  overflow: hidden;
  flex-shrink: 0;
}
.ticket-sidebar__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ticket-sidebar__user h4 {
  color: var(--color-white);
  font-size: 0.97rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}
.ticket-sidebar__user p {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  margin: 0;
  word-break: break-all;
}
.ticket-sidebar__divider {
  height: 1px;
  background: var(--color-border);
}
.ticket-sidebar__meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem 0.75rem;
  margin: 0;
}
.ticket-sidebar__meta dt {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  padding-top: 0.1rem;
}
.ticket-sidebar__meta dd {
  margin: 0;
  font-size: 0.86rem;
  color: var(--color-white);
  min-width: 0;
  word-break: break-word;
}
.btn-manage-user {
  width: 100%;
  justify-content: center;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all var(--transition-fast);
}
.btn-manage-user:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: var(--color-accent);
}

/* Chat */
.ticket-chat-area {
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  position: relative;
}
.ticket-chat-area__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.ticket-chat-area__header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ticket-compose {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 0.75rem;
}

/* Bubliny sprav */
.ticket-thread {
  overflow: auto;
  padding: 1rem 1.5rem;
  display: grid;
  gap: 0.75rem;
}
.ticket-bubble {
  max-width: min(76%, 680px);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.ticket-bubble.is-admin {
  justify-self: end;
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.15);
}
.ticket-bubble.is-user {
  justify-self: start;
  background: var(--color-background-soft);
}
.ticket-bubble__author {
  font-size: 0.79rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: var(--color-text-muted);
}
.ticket-bubble__body {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-white);
}
.ticket-bubble__time,
.ticket-system-note__time {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.ticket-system-note {
  justify-self: center;
  width: min(100%, 620px);
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.06);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}
.ticket-system-note__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #f59e0b;
  margin-bottom: 0.35rem;
}
.ticket-system-note__body {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text);
}

/* Modal zatvorenia */
.close-reason-modal {
  width: min(540px, 100%);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  display: grid;
  gap: 1rem;
}
.close-reason-modal textarea {
  resize: vertical;
  min-height: 120px;
}

/* Responsive */
@media (max-width: 760px) {
  .tickets-toolbar {
    grid-template-columns: 1fr;
  }
  .ticket-modal {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    width: 100%;
    max-height: 100dvh;
    border-radius: 0;
  }
  .ticket-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    max-height: 38vh;
    overflow-y: auto;
  }
  .ticket-card__top,
  .ticket-card__meta,
  .ticket-compose__actions,
  .close-reason-modal__header,
  .close-reason-modal__actions {
    flex-direction: column;
    align-items: stretch;
  }
  .ticket-bubble {
    max-width: 100%;
  }
}
</style>
