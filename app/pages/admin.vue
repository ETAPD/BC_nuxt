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
        :messages-count="contactMessages.length"
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
definePageMeta({ middleware: "auth" });
</script>

<script lang="ts">
type AdminTab =
  | "users"
  | "portfolios"
  | "orders"
  | "trades"
  | "holdings"
  | "messages"
  | "tickets";

export default defineComponent({
  name: "AdminView",
  data() {
    return {
      loading: true,
      loadError: "",
      actionError: "",
      actionSuccess: "",
      adminName: "",
      activeTab: "users" as AdminTab,
      users: [] as any[],
      portfolios: [] as any[],
      orders: [] as any[],
      trades: [] as any[],
      holdings: [] as any[],
      contactMessages: [] as any[],
      tickets: [] as any[],
      modalOpen: false,
      modalUser: null as any | null,
      modalSaving: false,
    };
  },
  computed: {
    hasData(): boolean {
      return (
        this.users.length > 0 ||
        this.portfolios.length > 0 ||
        this.orders.length > 0 ||
        this.trades.length > 0 ||
        this.holdings.length > 0 ||
        this.contactMessages.length > 0 ||
        this.tickets.length > 0
      );
    },
  },
  async mounted() {
    await this.loadAdminData();
  },
  methods: {
    translateOrderStatus(status: string) {
      const map: Record<string, string> = {
        pending: "pending",
        active: "active",
        filled: "filled",
        cancelled: "cancelled",
        rejected: "rejected",
      };
      return map[status] || status;
    },
    async loadAdminData() {
      this.loading = true;
      this.loadError = "";
      try {
        const user = await getDbUser();
        if (!user || (user.status !== "admin" && user.role !== "admin")) {
          this.$router.push("/dashboard");
          return;
        }
        this.adminName = user.full_name || "Administrator";

        const [
          users,
          portfolios,
          orders,
          trades,
          holdings,
          contactMessages,
          tickets,
        ] = await Promise.all([
          adminGetAllUsers(),
          adminGetAllPortfolios(),
          adminGetAllOrders(),
          adminGetAllTrades(),
          adminGetAllHoldings(),
          adminGetContactMessages().catch(() => []),
          adminGetAllTickets().catch((error: any) => {
            this.actionError =
              error?.message || "Failed to load support tickets.";
            return [];
          }),
        ]);

        this.users = users;
        this.portfolios = portfolios;
        this.orders = orders;
        this.trades = trades;
        this.holdings = holdings;
        this.contactMessages = contactMessages;
        this.tickets = tickets;
      } catch (error: any) {
        this.loadError = error?.message || "Failed to load admin data.";
      } finally {
        this.loading = false;
      }
    },
    async refreshTickets() {
      try {
        this.tickets = await adminGetAllTickets();
      } catch (error: any) {
        this.actionError = error?.message || "Failed to refresh tickets.";
      }
    },
    openUserModal(user: any) {
      this.modalUser = { ...user };
      this.modalOpen = true;
    },
    openTicketUserModal(ticketOrUser: any) {
      if (!ticketOrUser) return;

      const matchedUser = this.users.find(
        (item: any) => item.user_id === ticketOrUser.user_id,
      );
      if (matchedUser) {
        this.openUserModal(matchedUser);
        return;
      }

      this.openUserModal({
        ...ticketOrUser,
        full_name: ticketOrUser.full_name ?? ticketOrUser.user_name ?? "",
        email: ticketOrUser.email ?? ticketOrUser.user_email ?? "",
      });
    },
    closeUserModal() {
      this.modalOpen = false;
      this.modalUser = null;
    },
    async saveUserChanges(userDraft: any) {
      if (!userDraft) return;
      this.modalSaving = true;
      this.actionError = "";
      this.actionSuccess = "";
      try {
        const userId = userDraft.user_id;
        await adminUpdateUser(userId, {
          full_name: userDraft.full_name,
          email: userDraft.email,
          preferred_currency: userDraft.preferred_currency,
          status: userDraft.status,
        });
        if (userDraft.role) {
          await setUserRole(userId, userDraft.role);
        }
        const index = this.users.findIndex(
          (item: any) => item.user_id === userId,
        );
        if (index !== -1) {
          this.users.splice(index, 1, { ...this.users[index], ...userDraft });
        }
        this.actionSuccess = "User was updated successfully.";
        this.closeUserModal();
      } catch (error: any) {
        this.actionError = error?.message || String(error);
      } finally {
        this.modalSaving = false;
      }
    },
    async triggerPasswordReset(email: string) {
      if (!email) return;
      this.actionError = "";
      this.actionSuccess = "";
      try {
        await sendPasswordReset(email);
        this.actionSuccess = "Password reset email was sent.";
      } catch (error: any) {
        this.actionError = error?.message || String(error);
      }
    },
    async changeOrderStatus(orderId: number, newStatus: string) {
      this.actionError = "";
      this.actionSuccess = "";
      try {
        await adminUpdateOrderStatus(orderId, newStatus);
        const order = this.orders.find(
          (item: any) => item.order_id === orderId,
        );
        if (order) order.status = newStatus;
        this.actionSuccess = `Order #${orderId} was changed to ${this.translateOrderStatus(newStatus)}.`;
      } catch (error: any) {
        this.actionError = error?.message || String(error);
      }
    },
    async deleteMessage(messageId: number) {
      this.actionError = "";
      this.actionSuccess = "";
      try {
        await adminDeleteContactMessage(messageId);
        this.contactMessages = this.contactMessages.filter(
          (message: any) => message.id !== messageId,
        );
        this.actionSuccess = "Message was deleted.";
      } catch (error: any) {
        this.actionError = error?.message || String(error);
      }
    },
  },
});
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
