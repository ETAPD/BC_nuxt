<template>
  <div class="profile-page">
    <AppNavbar
      :user-name="user ? user.full_name : ''"
      :user-initials="user ? user.initials : ''"
      :user-email="user ? user.email : ''"
      :user-profile-picture="user ? user.profile_picture : ''"
    />

    <main class="profile-main">
      <div v-if="loading" class="loading-state">Načítavam profil…</div>
      <div v-else-if="loadError && !user" class="error-state">
        {{ loadError }}
      </div>

      <template v-else>
        <Transition name="flash">
          <div v-if="successMsg" class="flash-success">✓ {{ successMsg }}</div>
        </Transition>
        <div v-if="loadError" class="flash-error">{{ loadError }}</div>

        <ProfileHeaderCard
          :user="user"
          :uploading-picture="uploadingPicture"
          @edit="openEditProfile(false)"
          @upload-picture="handlePictureUpload"
        />

        <div class="summary-row">
          <AccountSummaryPanel
            :user="user"
            :portfolio-count="portfolioCount"
            :open-orders-count="openOrdersCount"
            :completed-trades-count="completedTradesCount"
            :watchlist-count="watchlistCount"
            :holdings-count="holdingsCount"
          />

          <PortfolioSummaryPanel
            :holdings-total="holdingsTotal"
            :invested-amount="investedAmount"
            :available-cash="availableCash"
            :day-change="dayChange"
            :day-change-pct="dayChangePct"
            :total-pn-l="totalPnL"
            :total-pn-l-pct="totalPnLPct"
          />
        </div>

        <div class="bottom-grid">
          <NotificationsPanel
            :prefs-data="prefs"
            :saving="prefsSaving"
            @save="savePreferences"
          />

          <SecurityPanel
            @open-password="showPasswordModal = true"
            @export="handleExport"
            @logout="handleLogout"
            @open-delete="showDeleteModal = true"
          />

          <FundingMethodsPanel
            :methods-list="fundingMethods"
            :saving="fundingSaving"
            @add="handleAddFunding"
            @remove="handleRemoveFunding"
          />

          <RecentActivityPanel :items="recentActivity" />
        </div>
      </template>
    </main>

    <EditProfileModal
      :model-value="showEditProfile"
      :user="user"
      :save-loading="editSaving"
      @update:modelValue="handleEditProfileVisibility"
      @save-profile="saveProfile"
    />

    <ChangePasswordModal
      :model-value="showPasswordModal"
      :saving="passwordSaving"
      @update:modelValue="showPasswordModal = $event"
      @submit="handleChangePassword"
    />

    <DeleteAccountModal
      :model-value="showDeleteModal"
      :saving="deleteSaving"
      @update:modelValue="showDeleteModal = $event"
      @confirm-delete="handleDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<script lang="ts">
export default defineComponent({
  name: "ProfileView",
  data() {
    return {
      loading: true,
      loadError: "",
      successMsg: "",
      successTimer: null as ReturnType<typeof setTimeout> | null,
      user: null as any,
      portfolio: null as any,
      holdingsCount: 0,
      watchlistCount: 0,
      openOrdersCount: 0,
      completedTradesCount: 0,
      portfolioCount: 1,
      recentActivity: [] as any[],
      prefs: {
        notify_price_alerts: true,
        notify_order_filled: true,
        notify_order_cancelled: true,
        notify_security: true,
      },
      prefsSaving: false,
      fundingMethods: [],
      fundingSaving: false,
      showPasswordModal: false,
      passwordSaving: false,
      showDeleteModal: false,
      deleteSaving: false,
      showEditProfile: false,
      editSaving: false,
      uploadingPicture: false,
    };
  },
  computed: {
    anyModalOpen() {
      return (
        this.showEditProfile || this.showPasswordModal || this.showDeleteModal
      );
    },
    holdingsTotal() {
      return this.portfolio && this.portfolio.total_value
        ? this.portfolio.total_value
        : 0;
    },
    investedAmount() {
      return this.portfolio && this.portfolio.invested
        ? this.portfolio.invested
        : 0;
    },
    availableCash() {
      return (
        (this.portfolio && this.portfolio.total_value
          ? this.portfolio.total_value
          : 0) - (this.holdingsCount > 0 ? this.investedAmount : 0)
      );
    },
    totalPnL() {
      return (
        (this.portfolio && this.portfolio.total_value
          ? this.portfolio.total_value
          : 0) -
        (this.portfolio && this.portfolio.invested
          ? this.portfolio.invested
          : 0)
      );
    },
    totalPnLPct() {
      const inv =
        this.portfolio && this.portfolio.invested ? this.portfolio.invested : 0;
      if (inv === 0) return "0.0";
      return ((this.totalPnL / inv) * 100).toFixed(1);
    },
    dayChange() {
      return this.portfolio && this.portfolio.day_change
        ? this.portfolio.day_change
        : 0;
    },
    dayChangePct() {
      return this.portfolio && this.portfolio.day_change_percent
        ? this.portfolio.day_change_percent
        : 0;
    },
  },
  watch: {
    anyModalOpen: {
      immediate: true,
      handler(open) {
        document.body.style.overflow = open ? "hidden" : "";
      },
    },
  },
  mounted() {
    this.loadProfile();
  },
  beforeUnmount() {
    document.body.style.overflow = "";
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
  },
  methods: {
    flash(message) {
      this.successMsg = message;
      if (this.successTimer) {
        clearTimeout(this.successTimer);
      }
      this.successTimer = setTimeout(() => {
        this.successMsg = "";
      }, 3500);
    },
    formatCurrency(value) {
      if (value == null) return "$0.00";
      return Number(value).toLocaleString("sk-SK", {
        style: "currency",
        currency: "USD",
      });
    },
    async loadProfile() {
      this.loading = true;
      this.loadError = "";
      try {
        const user = await getDbUser();
        if (!user) {
          this.$router.push("/login");
          return;
        }

        this.user = user;
        const portfolio = await getPortfolio(user.user_id);
        this.portfolio = portfolio;

        if (portfolio) {
          const [
            holdings,
            watchlist,
            orders,
            trades,
            prefData,
            fundingMethods,
          ] = await Promise.all([
            getHoldings(portfolio.portfolio_id),
            getWatchlistItems(user.user_id),
            getOpenOrders(portfolio.portfolio_id),
            getAllTrades(portfolio.portfolio_id),
            getUserPreferences(user.user_id),
            getFundingMethods(user.user_id),
          ]);

          this.holdingsCount = holdings.length;
          this.watchlistCount = watchlist.length;
          this.openOrdersCount = orders.length;
          this.completedTradesCount = trades.filter(
            (trade) => trade.trade_type,
          ).length;
          this.fundingMethods = fundingMethods;

          if (prefData) {
            this.prefs = {
              notify_price_alerts:
                typeof prefData.notify_price_alerts !== "undefined"
                  ? prefData.notify_price_alerts
                  : true,
              notify_order_filled:
                typeof prefData.notify_order_filled !== "undefined"
                  ? prefData.notify_order_filled
                  : true,
              notify_order_cancelled:
                typeof prefData.notify_order_cancelled !== "undefined"
                  ? prefData.notify_order_cancelled
                  : true,
              notify_security:
                typeof prefData.notify_security !== "undefined"
                  ? prefData.notify_security
                  : true,
            };
          }

          const recentTrades = await getRecentTrades(portfolio.portfolio_id);
          this.recentActivity = recentTrades.slice(0, 5).map((trade) => ({
            type: "trade",
            icon: trade.trade_type === "BUY" ? "🟢" : "🔴",
            label: `${trade.trade_type} ${trade.symbol}`,
            detail: `${trade.amount} @ ${this.formatCurrency(trade.price)}`,
            time: trade.executed_at,
          }));
        }
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa načítať profil";
      } finally {
        this.loading = false;
      }
    },
    async handlePictureUpload(file) {
      if (!file || !this.user) return;
      this.uploadingPicture = true;
      try {
        const url = await uploadProfilePicture(this.user.user_id, file);
        await updateUserProfile(this.user.user_id, { profile_picture: url });
        this.user = {
          ...this.user,
          profile_picture: url,
        };
        this.flash("Profilová fotka bola aktualizovaná");
      } catch (error) {
        this.loadError =
          error && error.message ? error.message : "Nepodarilo sa nahrať fotku";
      } finally {
        this.uploadingPicture = false;
      }
    },
    openEditProfile() {
      this.showEditProfile = true;
    },
    handleEditProfileVisibility(value) {
      this.showEditProfile = value;
    },
    async saveProfile(payload) {
      if (
        !this.user ||
        !payload ||
        !payload.full_name ||
        !payload.full_name.trim()
      )
        return;
      this.editSaving = true;
      try {
        const computedInitials =
          payload.initials && payload.initials.trim()
            ? payload.initials.trim()
            : payload.full_name.trim().slice(0, 2).toUpperCase();

        await updateUserProfile(this.user.user_id, {
          full_name: payload.full_name.trim(),
          initials: computedInitials,
          phone: payload.phone ? payload.phone.trim() : "",
        });

        this.user = {
          ...this.user,
          full_name: payload.full_name.trim(),
          initials: computedInitials,
          phone: payload.phone ? payload.phone.trim() : "",
        };

        this.handleEditProfileVisibility(false);
        this.flash("Profil bol aktualizovaný");
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa uložiť profil";
      } finally {
        this.editSaving = false;
      }
    },
    async savePreferences(nextPrefs) {
      if (!this.user) return;
      this.prefsSaving = true;
      try {
        await upsertUserPreferences(this.user.user_id, nextPrefs);
        this.prefs = { ...nextPrefs };
        this.flash("Preferencie boli uložené");
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa uložiť preferencie";
      } finally {
        this.prefsSaving = false;
      }
    },
    async handleAddFunding(payload) {
      if (!this.user || !payload || !payload.label || !payload.label.trim())
        return;
      this.fundingSaving = true;
      try {
        await addFundingMethod(this.user.user_id, { ...payload });
        this.fundingMethods = await getFundingMethods(this.user.user_id);
        this.flash("Platobná metóda bola pridaná");
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa pridať metódu";
      } finally {
        this.fundingSaving = false;
      }
    },
    async handleRemoveFunding(id) {
      try {
        await removeFundingMethod(id);
        this.fundingMethods = this.fundingMethods.filter(
          (item) => item.funding_id !== id,
        );
        this.flash("Platobná metóda bola odstránená");
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa odstrániť metódu";
      }
    },
    async handleChangePassword(newPassword) {
      this.passwordSaving = true;
      try {
        await changePassword(newPassword);
        this.showPasswordModal = false;
        this.flash("Heslo bolo zmenené");
      } catch (error) {
        this.loadError =
          error && error.message ? error.message : "Nepodarilo sa zmeniť heslo";
      } finally {
        this.passwordSaving = false;
      }
    },
    async handleLogout() {
      await signOut();
      this.$router.push("/login");
    },
    async handleDeleteAccount() {
      this.deleteSaving = true;
      try {
        await deleteUserAccount();
        await signOut();
        this.$router.push("/");
      } catch (error) {
        this.loadError =
          error && error.message
            ? error.message
            : "Nepodarilo sa odstrániť účet";
      } finally {
        this.deleteSaving = false;
      }
    },
    async handleExport() {
      try {
        await exportUserData();
        this.flash("Export dát bol zahájený");
      } catch (error) {
        this.loadError =
          error && error.message ? error.message : "Export zlyhal";
      }
    },
  },
});
</script>

<style>
.profile-page {
  min-height: 100vh;
  background: var(--color-background);
}

.profile-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.error-state {
  color: #ef4444;
}

.flash-success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.flash-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.flash-enter-active,
.flash-leave-active {
  transition: all 0.3s ease;
}

.flash-enter-from,
.flash-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .summary-row,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-main {
    padding: 1rem;
  }
}
</style>
