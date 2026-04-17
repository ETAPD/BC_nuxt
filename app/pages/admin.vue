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
      <StatsRow
        :users-count="usersTotal || users.length"
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
      <div v-if="activeTab === 'users' && usersTotalPages > 1" class="pagination-controls">
        <button :disabled="usersPage <= 1" @click="prevUsersPage">← Predchádzajúca</button>
        <span>Strana {{ usersPage }} / {{ usersTotalPages }}</span>
        <button :disabled="usersPage >= usersTotalPages" @click="nextUsersPage">Nasledujúca →</button>
      </div>

      <LazyPortfoliosPanel
        v-else-if="activeTab === 'portfolios'"
        :portfolios="portfolios"
      />

      <LazyOrdersPanel
        v-else-if="activeTab === 'orders'"
        :orders="orders"
        @change-status="changeOrderStatus"
      />

      <LazyTradesPanel v-else-if="activeTab === 'trades'" :trades="trades" />

      <LazyHoldingsPanel
        v-else-if="activeTab === 'holdings'"
        :holdings="holdings"
      />

      <LazyMessagesPanel
        v-else-if="activeTab === 'messages'"
        :messages="contactMessages"
        @delete-message="deleteMessage"
      />

      <LazyTicketsPanel
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
// Admin panel - pouzivatelia, portfolia, objednavky, tikety
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: "auth" });

useHead({
  title: "Admin | TradeProjekt",
  meta: [
    { name: "description", content: "Administrátorský panel pre správu používateľov a systému." },
    { name: "robots", content: "noindex, nofollow" },
  ],
});

const toast = useToast();

// Typy
type AdminTab =
  | "users"
  | "portfolios"
  | "orders"
  | "trades"
  | "holdings"
  | "messages"
  | "tickets";

// Stav nacitavania
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

const usersPage = ref(1)
const usersPerPage = 50
const usersTotal = ref(0)
// Paginacia pouzivatelov
const usersTotalPages = computed(() => Math.ceil(usersTotal.value / usersPerPage))

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

// Pomocne funkcie
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

// Nacitanie pouzivatelov
async function loadUsers(page = 1) {
  const result = await adminGetAllUsers(page, usersPerPage);
  users.value = result.users;
  usersTotal.value = result.total;
  usersPage.value = page;
}

async function nextUsersPage() {
  if (usersPage.value < usersTotalPages.value) {
    await loadUsers(usersPage.value + 1);
  }
}

async function prevUsersPage() {
  if (usersPage.value > 1) {
    await loadUsers(usersPage.value - 1);
  }
}

// Nacitanie admin dat
async function loadAdminData() {
  loading.value = true
  loadError.value = ""
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      navigateTo("/dashboard")
      return
    }
    const user = await getDbUser()
    if (!user) {
      navigateTo("/dashboard")
      return
    }
    adminName.value = user.full_name || "Administrator"

    const [
      _,
      portfoliosData,
      ordersData,
      tradesData,
      holdingsData,
      contactMessagesData,
      ticketsData,
    ] = await Promise.all([
      loadUsers(1),
      adminGetAllPortfolios(),
      adminGetAllOrders(),
      adminGetAllTrades(),
      adminGetAllHoldings(),
      adminGetContactMessages().catch(() => []),
      adminGetAllTickets().catch((err: any) => {
        toast.error(err?.message || "Nepodarilo sa načítať tikety.");
        return []
      }),
    ])

    portfolios.value = portfoliosData
    orders.value = ordersData
    trades.value = tradesData
    holdings.value = holdingsData
    contactMessages.value = contactMessagesData
    tickets.value = ticketsData
  } catch (error: any) {
    loadError.value = error?.message || "Failed to load admin data."
    toast.error(loadError.value);
  } finally {
    loading.value = false
  }
}

async function refreshTickets() {
  try {
    tickets.value = await adminGetAllTickets()
  } catch (error: any) {
    toast.error(error?.message || "Nepodarilo sa obnoviť tikety.");
  }
}

// Sprava pouzivatelov
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

// Ulozenie zmien pouzivatela
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
    await logAdminAction("update_user", "user", userId, `Updated: ${userDraft.full_name}`);
    await createAdminNotification(userId, 'Zmena účtu', 'Váš profil bol aktualizovaný administrátorom.');
    toast.success("Používateľ bol úspešne aktualizovaný.");
    closeUserModal()
  } catch (error: any) {
    toast.error(error?.message || String(error));
  } finally {
    modalSaving.value = false
  }
}

async function triggerPasswordReset(email: string) {
  if (!email) return
  try {
    await sendPasswordReset(email)
    await logAdminAction("password_reset", "user", email, `Password reset sent to ${email}`);
    toast.success("E-mail na reset hesla bol odoslaný.");
  } catch (error: any) {
    toast.error(error?.message || String(error));
  }
}

// Zmena stavu objednavky
async function changeOrderStatus(orderId: number, newStatus: string) {
  try {
    await adminUpdateOrderStatus(orderId, newStatus)
    const order = orders.value.find(
      (item: any) => item.order_id === orderId,
    )
    if (order) {
      order.status = newStatus
      const userId = order.portfolios?.user_id
      if (userId) {
        await createAdminNotification(userId, 'Zmena príkazu', `Váš príkaz #${orderId} bol zmenený na: ${translateOrderStatus(newStatus)}.`)
      }
    }
    await logAdminAction("change_order_status", "order", orderId, `Status → ${newStatus}`);
    toast.success(`Príkaz #${orderId} bol zmenený na ${translateOrderStatus(newStatus)}.`);
  } catch (error: any) {
    toast.error(error?.message || String(error));
  }
}

// Mazanie sprav
async function deleteMessage(messageId: number) {
  try {
    await adminDeleteContactMessage(messageId)
    contactMessages.value = contactMessages.value.filter(
      (message: any) => message.id !== messageId,
    )
    await logAdminAction("delete_message", "contact_message", messageId, "Message deleted");
    toast.success("Správa bola vymazaná.");
  } catch (error: any) {
    toast.error(error?.message || String(error));
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
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  color: #cbd5e1;
}
.pagination-controls button {
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.pagination-controls button:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.7);
}
.pagination-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (max-width: 720px) {
  .admin-main {
    padding: 1rem;
  }
}
</style>
