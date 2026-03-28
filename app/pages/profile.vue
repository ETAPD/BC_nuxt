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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

definePageMeta({ middleware: "auth" });

const router = useRouter()

const loading = ref(true)
const loadError = ref("")
const successMsg = ref("")
const successTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const user = ref<any>(null)
const portfolio = ref<any>(null)
const holdingsCount = ref(0)
const watchlistCount = ref(0)
const openOrdersCount = ref(0)
const completedTradesCount = ref(0)
const portfolioCount = ref(1)
const recentActivity = ref<any[]>([])
const prefs = ref({
  notify_price_alerts: true,
  notify_order_filled: true,
  notify_order_cancelled: true,
  notify_security: true,
})
const prefsSaving = ref(false)
const fundingMethods = ref<any[]>([])
const fundingSaving = ref(false)
const showPasswordModal = ref(false)
const passwordSaving = ref(false)
const showDeleteModal = ref(false)
const deleteSaving = ref(false)
const showEditProfile = ref(false)
const editSaving = ref(false)
const uploadingPicture = ref(false)

const anyModalOpen = computed(() => {
  return showEditProfile.value || showPasswordModal.value || showDeleteModal.value
})

const holdingsTotal = computed(() => {
  return portfolio.value?.total_value ?? 0
})

const investedAmount = computed(() => {
  return portfolio.value?.invested ?? 0
})

const availableCash = computed(() => {
  return (portfolio.value?.total_value ?? 0) - (holdingsCount.value > 0 ? investedAmount.value : 0)
})

const totalPnL = computed(() => {
  return (portfolio.value?.total_value ?? 0) - (portfolio.value?.invested ?? 0)
})

const totalPnLPct = computed(() => {
  const inv = portfolio.value?.invested ?? 0
  if (inv === 0) return "0.0"
  return ((totalPnL.value / inv) * 100).toFixed(1)
})

const dayChange = computed(() => {
  return portfolio.value?.day_change ?? 0
})

const dayChangePct = computed(() => {
  return portfolio.value?.day_change_percent ?? 0
})

watch(anyModalOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : ""
}, { immediate: true })

function flash(message: string) {
  successMsg.value = message
  if (successTimer.value) {
    clearTimeout(successTimer.value)
  }
  successTimer.value = setTimeout(() => {
    successMsg.value = ""
  }, 3500)
}

function formatCurrency(value: any) {
  if (value == null) return "$0.00"
  return Number(value).toLocaleString("sk-SK", {
    style: "currency",
    currency: "USD",
  })
}

async function loadProfile() {
  loading.value = true
  loadError.value = ""
  try {
    const userData = await getDbUser()
    if (!userData) {
      router.push("/login")
      return
    }

    user.value = userData
    const portfolioData = await getPortfolio(userData.user_id)
    portfolio.value = portfolioData

    if (portfolioData) {
      const [
        holdings,
        watchlist,
        orders,
        trades,
        prefData,
        fundingMethodsData,
      ] = await Promise.all([
        getHoldings(portfolioData.portfolio_id),
        getWatchlistItems(userData.user_id),
        getOpenOrders(portfolioData.portfolio_id),
        getAllTrades(portfolioData.portfolio_id),
        getUserPreferences(userData.user_id),
        getFundingMethods(userData.user_id),
      ])

      holdingsCount.value = holdings.length
      watchlistCount.value = watchlist.length
      openOrdersCount.value = orders.length
      completedTradesCount.value = trades.filter(
        (trade: any) => trade.trade_type,
      ).length
      fundingMethods.value = fundingMethodsData

      if (prefData) {
        prefs.value = {
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
        }
      }

      const recentTrades = await getRecentTrades(portfolioData.portfolio_id)
      recentActivity.value = recentTrades.slice(0, 5).map((trade: any) => ({
        type: "trade",
        icon: trade.trade_type === "BUY" ? "🟢" : "🔴",
        label: `${trade.trade_type} ${trade.symbol}`,
        detail: `${trade.amount} @ ${formatCurrency(trade.price)}`,
        time: trade.executed_at,
      }))
    }
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa načítať profil"
  } finally {
    loading.value = false
  }
}

async function handlePictureUpload(file: File) {
  if (!file || !user.value) return
  uploadingPicture.value = true
  try {
    const url = await uploadProfilePicture(user.value.user_id, file)
    await updateUserProfile(user.value.user_id, { profile_picture: url })
    user.value = { ...user.value, profile_picture: url }
    flash("Profilová fotka bola aktualizovaná")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa nahrať fotku"
  } finally {
    uploadingPicture.value = false
  }
}

function openEditProfile() {
  showEditProfile.value = true
}

function handleEditProfileVisibility(value: boolean) {
  showEditProfile.value = value
}

async function saveProfile(payload: any) {
  if (!user.value || !payload?.full_name?.trim()) return
  editSaving.value = true
  try {
    const computedInitials =
      payload.initials?.trim()
        ? payload.initials.trim()
        : payload.full_name.trim().slice(0, 2).toUpperCase()

    await updateUserProfile(user.value.user_id, {
      full_name: payload.full_name.trim(),
      initials: computedInitials,
      phone: payload.phone ? payload.phone.trim() : "",
    })

    user.value = {
      ...user.value,
      full_name: payload.full_name.trim(),
      initials: computedInitials,
      phone: payload.phone ? payload.phone.trim() : "",
    }

    handleEditProfileVisibility(false)
    flash("Profil bol aktualizovaný")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa uložiť profil"
  } finally {
    editSaving.value = false
  }
}

async function savePreferences(nextPrefs: any) {
  if (!user.value) return
  prefsSaving.value = true
  try {
    await upsertUserPreferences(user.value.user_id, nextPrefs)
    prefs.value = { ...nextPrefs }
    flash("Preferencie boli uložené")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa uložiť preferencie"
  } finally {
    prefsSaving.value = false
  }
}

async function handleAddFunding(payload: any) {
  if (!user.value || !payload?.label?.trim()) return
  fundingSaving.value = true
  try {
    await addFundingMethod(user.value.user_id, { ...payload })
    fundingMethods.value = await getFundingMethods(user.value.user_id)
    flash("Platobná metóda bola pridaná")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa pridať metódu"
  } finally {
    fundingSaving.value = false
  }
}

async function handleRemoveFunding(id: number) {
  try {
    await removeFundingMethod(id)
    fundingMethods.value = fundingMethods.value.filter(
      (item: any) => item.funding_id !== id,
    )
    flash("Platobná metóda bola odstránená")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa odstrániť metódu"
  }
}

async function handleChangePassword(newPassword: string) {
  passwordSaving.value = true
  try {
    await changePassword(newPassword)
    showPasswordModal.value = false
    flash("Heslo bolo zmenené")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa zmeniť heslo"
  } finally {
    passwordSaving.value = false
  }
}

async function handleLogout() {
  await signOut()
  router.push("/login")
}

async function handleDeleteAccount() {
  deleteSaving.value = true
  try {
    await deleteUserAccount()
    await signOut()
    router.push("/")
  } catch (error: any) {
    loadError.value = error?.message ?? "Nepodarilo sa odstrániť účet"
  } finally {
    deleteSaving.value = false
  }
}

async function handleExport() {
  try {
    await exportUserData()
    flash("Export dát bol zahájený")
  } catch (error: any) {
    loadError.value = error?.message ?? "Export zlyhal"
  }
}

onMounted(() => {
  loadProfile()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ""
  if (successTimer.value) {
    clearTimeout(successTimer.value)
  }
})
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
