<template>
  <div class="admin">
    <AppNavbar />

    <div v-if="loading" class="admin-loading">
      <p>Loading admin panel…</p>
    </div>
    <div v-else-if="loadError && !hasData" class="admin-error">
      <p>{{ loadError }}</p>
    </div>

    <main v-else class="admin-main">
      <div v-if="actionError" class="action-banner action-banner--error">
        <span>{{ actionError }}</span>
        <button type="button" class="btn-close" @click="actionError = ''">
          ✕
        </button>
      </div>
      <div v-if="actionSuccess" class="action-banner action-banner--success">
        <span>{{ actionSuccess }}</span>
        <button type="button" class="btn-close" @click="actionSuccess = ''">
          ✕
        </button>
      </div>

      <StatsRow
        :users-count="users.length"
        :portfolios-count="portfolios.length"
        :orders-count="orders.length"
        :trades-count="trades.length"
        :holdings-count="holdings.length"
        :tickets-count="tickets.length"
      />

      <TabsBar :active-tab="activeTab" @update:activeTab="activeTab = $event" />

      <UsersPanel
        v-if="activeTab === 'users'"
        :users="users"
        @manage-user="openUserModal"
      />

      <PortfoliosPanel
        v-else-if="activeTab === 'portfolios'"
        :portfolios="portfolios"
      />

      <OrdersPanel
        v-else-if="activeTab === 'orders'"
        :orders="orders"
        @change-status="changeOrderStatus"
      />

      <TradesPanel v-else-if="activeTab === 'trades'" :trades="trades" />

      <HoldingsPanel
        v-else-if="activeTab === 'holdings'"
        :holdings="holdings"
      />

      <MessagesPanel
        v-else-if="activeTab === 'messages'"
        :messages="contactMessages"
        @delete-message="deleteMessage"
      />

      <TicketsPanel
        v-else-if="activeTab === 'tickets'"
        :tickets="tickets"
        :admin-name="adminName"
        @ticket-updated="refreshTickets"
        @manage-user="openTicketUserModal"
      />
    </main>

    <UserManageModal
      :key="
        modalUser
          ? `${modalUser.user_id}-${modalOpen ? 'open' : 'closed'}`
          : 'manage-modal'
      "
      :open="modalOpen"
      :user="modalUser"
      :saving="modalSaving"
      @close="closeUserModal"
      @save="saveUserChanges"
      @password-reset="triggerPasswordReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: "auth" });

type AdminTab =
  | "users"
  | "portfolios"
  | "orders"
  | "trades"
  | "holdings"
  | "messages"
  | "tickets";

const loading = ref(true)
const loadError = ref("")
const actionError = ref("")
const actionSuccess = ref("")
const adminName = ref("")
const activeTab = ref<AdminTab>("users")
const users = ref<any[]>([])
const portfolios = ref<any[]>([])
const orders = ref<any[]>([])
const trades = ref<any[]>([])
const holdings = ref<any[]>([])
const contactMessages = ref<any[]>([])
const tickets = ref<any[]>([])
const modalOpen = ref(false)
const modalUser = ref<any>(null)
const modalSaving = ref(false)

const hasData = computed(() => {
  return (
    users.value.length > 0 ||
    portfolios.value.length > 0 ||
    orders.value.length > 0 ||
    trades.value.length > 0 ||
    holdings.value.length > 0 ||
    contactMessages.value.length > 0 ||
    tickets.value.length > 0
  )
})

function translateOrderStatus(status: string) {
  const map: Record<string, string> = {
    pending: "pending",
    active: "active",
    filled: "filled",
    cancelled: "cancelled",
    rejected: "rejected",
  }
  return map[status] || status
}

async function loadAdminData() {
  loading.value = true
  loadError.value = ""
  try {
    const user = await getDbUser()
    if (!user || (user.status !== "admin" && user.role !== "admin")) {
      navigateTo("/dashboard")
      return
    }
    adminName.value = user.full_name || "Administrator"

    const [
      usersData,
      portfoliosData,
      ordersData,
      tradesData,
      holdingsData,
      contactMessagesData,
      ticketsData,
    ] = await Promise.all([
      adminGetAllUsers(),
      adminGetAllPortfolios(),
      adminGetAllOrders(),
      adminGetAllTrades(),
      adminGetAllHoldings(),
      adminGetContactMessages().catch(() => []),
      adminGetAllTickets().catch((error: any) => {
        actionError.value = error?.message || "Failed to load support tickets."
        return []
      }),
    ])

    users.value = usersData
    portfolios.value = portfoliosData
    orders.value = ordersData
    trades.value = tradesData
    holdings.value = holdingsData
    contactMessages.value = contactMessagesData
    tickets.value = ticketsData
  } catch (error: any) {
    loadError.value = error?.message || "Failed to load admin data."
  } finally {
    loading.value = false
  }
}

async function refreshTickets() {
  try {
    tickets.value = await adminGetAllTickets()
  } catch (error: any) {
    actionError.value = error?.message || "Failed to refresh tickets."
  }
}

function openUserModal(user: any) {
  modalUser.value = { ...user }
  modalOpen.value = true
}

function openTicketUserModal(ticketOrUser: any) {
  if (!ticketOrUser) return
  const matchedUser = users.value.find(
    (item: any) => item.user_id === ticketOrUser.user_id,
  )
  if (matchedUser) {
    openUserModal(matchedUser)
    return
  }
  openUserModal({
    ...ticketOrUser,
    full_name: ticketOrUser.full_name ?? ticketOrUser.user_name ?? "",
    email: ticketOrUser.email ?? ticketOrUser.user_email ?? "",
  })
}

function closeUserModal() {
  modalOpen.value = false
  modalUser.value = null
}

async function saveUserChanges(userDraft: any) {
  if (!userDraft) return
  modalSaving.value = true
  actionError.value = ""
  actionSuccess.value = ""
  try {
    const userId = userDraft.user_id
    await adminUpdateUser(userId, {
      full_name: userDraft.full_name,
      email: userDraft.email,
      preferred_currency: userDraft.preferred_currency,
      status: userDraft.status,
    })
    if (userDraft.role) {
      await setUserRole(userId, userDraft.role)
    }
    const index = users.value.findIndex(
      (item: any) => item.user_id === userId,
    )
    if (index !== -1) {
      users.value.splice(index, 1, { ...users.value[index], ...userDraft })
    }
    actionSuccess.value = "User was updated successfully."
    closeUserModal()
  } catch (error: any) {
    actionError.value = error?.message || String(error)
  } finally {
    modalSaving.value = false
  }
}

async function triggerPasswordReset(email: string) {
  if (!email) return
  actionError.value = ""
  actionSuccess.value = ""
  try {
    await sendPasswordReset(email)
    actionSuccess.value = "Password reset email was sent."
  } catch (error: any) {
    actionError.value = error?.message || String(error)
  }
}

async function changeOrderStatus(orderId: number, newStatus: string) {
  actionError.value = ""
  actionSuccess.value = ""
  try {
    await adminUpdateOrderStatus(orderId, newStatus)
    const order = orders.value.find(
      (item: any) => item.order_id === orderId,
    )
    if (order) order.status = newStatus
    actionSuccess.value = `Order #${orderId} was changed to ${translateOrderStatus(newStatus)}.`
  } catch (error: any) {
    actionError.value = error?.message || String(error)
  }
}

async function deleteMessage(messageId: number) {
  actionError.value = ""
  actionSuccess.value = ""
  try {
    await adminDeleteContactMessage(messageId)
    contactMessages.value = contactMessages.value.filter(
      (message: any) => message.id !== messageId,
    )
    actionSuccess.value = "Message was deleted."
  } catch (error: any) {
    actionError.value = error?.message || String(error)
  }
}

onMounted(async () => {
  await loadAdminData()
})
</script>

<style>
.admin {
  min-height: 100vh;
  background: var(--color-background, #020617);
}
.admin-loading,
.admin-error {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
.admin-error {
  color: #fca5a5;
}
.admin-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}
.action-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
}
.action-banner--error {
  background: rgba(127, 29, 29, 0.28);
  border-color: rgba(239, 68, 68, 0.22);
}
.action-banner--success {
  background: rgba(20, 83, 45, 0.28);
  border-color: rgba(34, 197, 94, 0.22);
}
.btn-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
}
@media (max-width: 720px) {
  .admin-main {
    padding: 1rem;
  }
}
</style>
