<template>
  <div class="dashboard">
    <AppNavbar
      :user-name="userName"
      :user-initials="userInitials"
      :user-email="userEmail"
      :user-profile-picture="userProfilePicture"
    />

    <div v-if="isGuest" class="guest-banner">
      <p>
        PrezerÃ¡te si dashboard ako <strong>hosÅ¥</strong>.
        <NuxtLink to="/register" class="guest-link">Zaregistrujte sa</NuxtLink>
        alebo
        <NuxtLink to="/login" class="guest-link">prihlÃ¡ste sa</NuxtLink> pre
        plnÃ½ prÃ­stup.
      </p>
    </div>

    <div v-if="loading" class="dash-loading">
      <p>NaÄÃ­tavam dashboardâ€¦</p>
    </div>
    <div v-else-if="loadError" class="dash-error">
      <p>{{ loadError }}</p>
    </div>

    <main v-else class="dash-main">
      <PortfolioSummary
        :portfolio="portfolio"
        :available-cash="availableCash"
        :open-orders-count="openOrders.length"
        :format-currency="formatCurrency"
      />

      <div class="dash-grid">
        <HoldingsPanel
          :holdings="holdings"
          :format-currency="formatCurrency"
          @asset-click="openAssetDetail"
        />

        <OrderPanel
          :assets="assets"
          :holdings="holdings"
          :available-cash="availableCash"
          :user-limits="userLimits"
          :submitting="orderSubmitting"
          :submit-error="orderSubmitError"
          :submit-success="orderSubmitSuccess"
          :format-currency="formatCurrency"
          @submit-order="handleSubmitOrder"
        />
      </div>

      <div class="dash-grid-bottom">
        <WatchlistPanel
          :assets="assets"
          :watchlist="watchlist"
          :max-watchlist="userLimits.max_watchlist"
          :format-currency="formatCurrency"
          @add="handleAddWatchlist"
          @remove="handleRemoveWatchlist"
        />

        <OpenOrdersPanel
          :open-orders="openOrders"
          :format-currency="formatCurrency"
          @edit="startEditOrder"
          @cancel="handleCancelOrder"
        />

        <RecentTradesPanel
          :recent-trades="recentTrades"
          :format-currency="formatCurrency"
        />
      </div>

      <OrderEditModal
        :editing-order="editingOrder"
        :saving="editSaving"
        @close="cancelEditOrder"
        @save="saveEditOrder"
      />

      <AssetDetailModal
        :show-detail="showDetail"
        :detail-asset="detailAsset"
        :format-currency="formatCurrency"
        @close="closeDetail"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
// Dashboard - portfolio, objednavky, watchlist, obchody
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ middleware: "auth" });

useHead({
  title: "Dashboard | TradeProjekt",
  meta: [
    { name: "description", content: "PrehÄ¾ad vÃ¡Å¡ho investiÄnÃ©ho portfÃ³lia a obchodnÃ½ch aktivÃ­t." },
    { name: "robots", content: "noindex, nofollow" },
  ],
});

// Typy
type DashboardAsset = any
type DashboardHolding = any
type DashboardOrder = any
type DashboardTrade = any
type DashboardUserLimits = {
  role: string
  max_watchlist: number
  max_open_orders: number
  max_holdings: number
  can_export: boolean
  can_use_stop_orders: boolean
}

// Stav nacitavania a UI
const loading = ref(true)
const loadError = ref("")
const isGuest = ref(false)
const userName = ref("")
const userInitials = ref("U")
const userEmail = ref("")
const userProfilePicture = ref("")
const portfolio = ref<any>(null)
const holdings = ref<DashboardHolding[]>([])
const watchlist = ref<any[]>([])
const openOrders = ref<DashboardOrder[]>([])
const recentTrades = ref<DashboardTrade[]>([])
const assets = ref<DashboardAsset[]>([])
const userLimits = ref<DashboardUserLimits>({
  role: "basic",
  max_watchlist: 5,
  max_open_orders: 3,
  max_holdings: 5,
  can_export: false,
  can_use_stop_orders: false,
})
// ID portfolia a pouzivatela
const portfolioId = ref(0)
const currentUserId = ref(0)
const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null)
const showDetail = ref(false)
const detailAsset = ref<any>(null)
const editingOrder = ref<any>(null)
const editSaving = ref(false)
const orderSubmitting = ref(false)
const orderSubmitError = ref("")
const orderSubmitSuccess = ref(false)

// Vypocitane hodnoty portfolia
const holdingsTotal = computed(() => {
  return holdings.value.reduce(
    (sum: number, holding: DashboardHolding) => sum + (holding.value ?? 0),
    0,
  )
})

const availableCash = computed(() => {
  const totalValue = portfolio.value?.total_value ?? 0
  return totalValue - holdingsTotal.value
})

// Nacitanie dat dashboardu
async function loadDashboard() {
  try {
    const user = await getDbUser()
    if (!user) {
      isGuest.value = true
      userName.value = "HosÅ¥"
      userInitials.value = "H"
      loading.value = false
      return
    }

    userName.value = user.full_name || "PouÅ¾Ã­vateÄ¾"
    userInitials.value = user.initials || "U"
    userEmail.value = user.email || ""
    userProfilePicture.value = user.profile_picture || ""
    currentUserId.value = user.user_id

    const portfolioData = await getPortfolio(user.user_id)
    portfolio.value = portfolioData
    if (portfolioData) {
      portfolioId.value = portfolioData.portfolio_id
    }

    await refreshData()

    try {
      const limits = await getUserLimits()
      if (limits) {
        userLimits.value = limits
      }
    } catch {
    }
  } catch (error: any) {
    loadError.value = error?.message || "Nepodarilo sa naÄÃ­taÅ¥ dashboard"
  } finally {
    loading.value = false
  }
}

// Obnovenie dat
async function refreshData() {
  try {
    if (!currentUserId.value) return

    const requests: Promise<any>[] = [
      getPortfolio(currentUserId.value),
      getWatchlistItems(currentUserId.value),
      getAssets(),
    ]

    if (portfolioId.value) {
      requests.splice(
        1,
        0,
        getHoldings(portfolioId.value),
        getOpenOrders(portfolioId.value),
        getRecentTrades(portfolioId.value),
      )
    } else {
      requests.splice(
        1,
        0,
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([]),
      )
    }

    const [
      portfolioData,
      holdingsData,
      openOrdersData,
      recentTradesData,
      watchlistData,
      assetsData,
    ] = await Promise.all(requests)

    portfolio.value = portfolioData
    if (portfolioData && !portfolioId.value) {
      portfolioId.value = portfolioData.portfolio_id
    }

    holdings.value = holdingsData
    openOrders.value = openOrdersData
    recentTrades.value = recentTradesData
    watchlist.value = watchlistData
    assets.value = assetsData
  } catch {
  }
}

// Spracovanie objednavky
async function handleSubmitOrder(payload: any) {
  if (!portfolioId.value) return

  orderSubmitting.value = true
  orderSubmitError.value = ""
  orderSubmitSuccess.value = false

  try {
    await placeOrder({
      portfolio_id: portfolioId.value,
      ...payload,
    })

    await refreshData()
    orderSubmitSuccess.value = true
    setTimeout(() => {
      orderSubmitSuccess.value = false
    }, 2000)
  } catch (error: any) {
    orderSubmitError.value = error?.message || "Nepodarilo sa zadaÅ¥ prÃ­kaz"
  } finally {
    orderSubmitting.value = false
  }
}

// Detail aktiva
function openAssetDetail(holding: DashboardHolding) {
  detailAsset.value = holding
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  detailAsset.value = null
}

// Watchlist operacie
async function handleAddWatchlist(symbol: string) {
  if (!currentUserId.value || !symbol.trim()) return
  const normalizedSymbol = symbol.trim().toUpperCase()
  const asset = assets.value.find(
    (item: DashboardAsset) => item.symbol === normalizedSymbol,
  )

  try {
    await addWatchlistItem(
      currentUserId.value,
      normalizedSymbol,
      asset?.base_price ?? 0,
    )
    watchlist.value = await getWatchlistItems(currentUserId.value)
  } catch (error: any) {
    loadError.value =
      error?.message || "Nepodarilo sa pridaÅ¥ do sledovanÃ©ho zoznamu"
  }
}

async function handleRemoveWatchlist(itemId: number) {
  try {
    await removeWatchlistItem(itemId)
    watchlist.value = await getWatchlistItems(currentUserId.value)
  } catch (error: any) {
    loadError.value =
      error?.message || "Nepodarilo sa odstrÃ¡niÅ¥ zo sledovanÃ©ho zoznamu"
  }
}

// Zrusenie objednavky
async function handleCancelOrder(orderId: number) {
  try {
    await cancelOrder(orderId)
    openOrders.value = await getOpenOrders(portfolioId.value)
  } catch (error: any) {
    loadError.value = error?.message || "Nepodarilo sa zruÅ¡iÅ¥ prÃ­kaz"
  }
}

// Uprava objednavky
function startEditOrder(order: DashboardOrder) {
  editingOrder.value = order
}

function cancelEditOrder() {
  editingOrder.value = null
}

async function saveEditOrder(payload: {
  orderId: number
  updates: Record<string, any>
}) {
  if (!payload?.orderId) return

  editSaving.value = true
  try {
    await updateOrder(payload.orderId, payload.updates)
    openOrders.value = await getOpenOrders(portfolioId.value)
    editingOrder.value = null
  } catch (error: any) {
    loadError.value = error?.message || "Nepodarilo sa upraviÅ¥ prÃ­kaz"
  } finally {
    editSaving.value = false
  }
}

// Formatovanie meny
function formatCurrency(value: number) {
  return Number(value || 0).toLocaleString("sk-SK", {
    style: "currency",
    currency: "USD",
  })
}

onMounted(async () => {
  await loadDashboard()
  refreshTimer.value = setInterval(refreshData, 15000)
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<style>
.guest-banner {
  background: linear-gradient(135deg, #1a2a3a 0%, #0d1b2a 100%);
  border-bottom: 1px solid rgba(0, 207, 255, 0.25);
  padding: 0.85rem 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: #c8d6ff;
}

.guest-link {
  color: #6fe0ff;
  font-weight: 600;
  text-decoration: none;
}

.guest-link:hover {
  text-decoration: underline;
}

.dashboard {
  min-height: 100vh;
  background: var(--color-background);
}

/* â”€â”€ Header â”€â”€ */
.dash-header {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.dash-header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-white);
  font-weight: 700;
  font-size: 1.15rem;
}

.brand-icon {
  color: var(--color-accent);
  font-size: 1.4rem;
}

.dash-nav {
  display: flex;
  gap: 0.5rem;
}

.dash-nav-link {
  padding: 0.4rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.dash-nav-link:hover,
.dash-nav-link.active {
  color: var(--color-accent);
  background: rgba(59, 130, 246, 0.08);
}

.dash-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.profile-trigger:hover {
  background: rgba(59, 130, 246, 0.08);
}

.profile-arrow {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

/* â”€â”€ Profile Dropdown â”€â”€ */
.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 240px;
  z-index: 60;
  padding: 0.5rem 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.profile-dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
}

.user-avatar.sm {
  width: 32px;
  height: 32px;
  font-size: 0.7rem;
}

.pd-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-white);
}

.pd-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.pd-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.3rem 0;
}

.pd-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background var(--transition-fast);
  text-align: left;
}

.pd-item:hover {
  background: rgba(59, 130, 246, 0.08);
}

.pd-item.pd-danger {
  color: #ef4444;
}

.pd-item.pd-danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
}

.user-name {
  color: var(--color-white);
  font-size: 0.9rem;
  font-weight: 500;
}

.sign-out-btn {
  display: none;
}

/* â”€â”€ Main â”€â”€ */
.dash-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* â”€â”€ Portfolio Summary â”€â”€ */
.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.summary-card .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.summary-card .value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
}

.summary-card .value.up {
  color: #22c55e;
}

.summary-card .change {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.summary-card .change.up {
  color: #22c55e;
}

.main-value {
  border-color: rgba(59, 130, 246, 0.2);
  background: linear-gradient(
    145deg,
    rgba(59, 130, 246, 0.06),
    var(--color-background-soft)
  );
}

/* â”€â”€ Panels â”€â”€ */
.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--color-white);
}

/* â”€â”€ Grid Layout â”€â”€ */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.dash-grid-bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* â”€â”€ Holdings Table â”€â”€ */
.table-wrapper {
  overflow-x: auto;
}

.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.dash-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.dash-table td {
  padding: 0.75rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}

.dash-table tr:hover td {
  background: rgba(59, 130, 246, 0.03);
}

.asset-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.asset-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.asset-img-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2),
    rgba(129, 140, 248, 0.2)
  );
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  text-transform: uppercase;
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.asset-symbol {
  font-weight: 700;
  color: var(--color-white);
}

.asset-name {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.bold {
  font-weight: 700;
  color: var(--color-white);
}

.up {
  color: #22c55e;
}

.down {
  color: #ef4444;
}

/* â”€â”€ Order Form â”€â”€ */
.order-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  padding: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.tab.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.12);
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.order-form label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.order-form input,
.order-form select {
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

.order-form input:focus,
.order-form select:focus {
  border-color: var(--color-accent);
}

.order-btn {
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.buy-btn {
  background: #22c55e;
  color: #fff;
}

.buy-btn:hover {
  background: #16a34a;
}

.sell-btn {
  background: #ef4444;
  color: #fff;
}

.sell-btn:hover {
  background: #dc2626;
}

.order-success {
  text-align: center;
  color: #22c55e;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem;
  background: rgba(34, 197, 94, 0.08);
  border-radius: var(--radius-sm);
}

/* â”€â”€ Watchlist â”€â”€ */
.watchlist {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.watch-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}

.watch-item:last-child {
  border-bottom: none;
}

.watch-symbol {
  font-weight: 700;
  color: var(--color-white);
  min-width: 60px;
}

.watch-price {
  flex: 1;
  color: var(--color-text);
  font-size: 0.9rem;
}

.watch-change {
  font-size: 0.85rem;
  font-weight: 600;
}

/* â”€â”€ Open Orders â”€â”€ */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}

.order-type {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.order-type.buy {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.order-type.sell {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-symbol {
  font-weight: 600;
  color: var(--color-white);
  font-size: 0.9rem;
}

.order-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.order-amount {
  font-size: 0.85rem;
  color: var(--color-text);
}

.order-status {
  font-size: 0.75rem;
  color: var(--color-accent);
  font-weight: 600;
}

/* â”€â”€ Recent Trades â”€â”€ */
.trades-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.trade-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  font-size: 0.85rem;
}

.trade-item:last-child {
  border-bottom: none;
}

.trade-type {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.trade-type.buy {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.trade-type.sell {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.trade-symbol {
  font-weight: 600;
  color: var(--color-white);
  min-width: 40px;
}

.trade-amount {
  color: var(--color-text);
}

.trade-price {
  color: var(--color-text);
  flex: 1;
}

.trade-time {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

/* â”€â”€ Responsive â”€â”€ */
@media (max-width: 1024px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }

  .dash-grid-bottom {
    grid-template-columns: 1fr;
  }

  .portfolio-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dash-main {
    padding: 1rem;
  }

  .portfolio-summary {
    grid-template-columns: 1fr;
  }

  .dash-header-inner {
    padding: 0.75rem 1rem;
  }

  .user-name {
    display: none;
  }
}

/* â”€â”€ Loading / Error â”€â”€ */
.dash-loading,
.dash-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.dash-error {
  color: #ef4444;
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.order-error {
  text-align: center;
  color: #ef4444;
  font-size: 0.85rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: var(--radius-sm);
}

/* â”€â”€ Market Price Row â”€â”€ */
.market-price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: var(--radius-sm);
}

.market-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.market-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
}

.market-change {
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: auto;
}

/* â”€â”€ Order Type Tabs â”€â”€ */
.type-tabs {
  display: flex;
  gap: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.type-btn {
  flex: 1;
  padding: 0.45rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.type-btn.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.15);
}

.unit-label {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

/* â”€â”€ Order Summary â”€â”€ */
.order-summary {
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.summary-row .bold {
  color: var(--color-white);
  font-weight: 700;
}

/* â”€â”€ Confirmation Modal â”€â”€ */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirm-modal {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  max-width: 380px;
  width: 100%;
}

.confirm-modal h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: 1.25rem;
}

.confirm-details {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.confirm-row span:last-child {
  color: var(--color-white);
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-actions .btn {
  flex: 1;
  padding: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: center;
}

.confirm-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.confirm-cancel:hover {
  border-color: var(--color-text-muted);
}

/* â”€â”€ Status Badges â”€â”€ */
.status-pending {
  color: #f59e0b;
}

.status-active {
  color: var(--color-accent);
}

.status-filled {
  color: #22c55e;
}

.status-cancelled {
  color: #ef4444;
  opacity: 0.7;
}

/* â”€â”€ Holding Row Clickable â”€â”€ */
.holding-row {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.holding-row:hover td {
  background: rgba(59, 130, 246, 0.06) !important;
}

/* â”€â”€ Asset Detail Modal â”€â”€ */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.detail-modal {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detail-asset-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-asset-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.detail-placeholder {
  width: 44px;
  height: 44px;
  font-size: 0.85rem;
}

.detail-symbol {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-white);
  margin: 0;
}

.detail-name {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.detail-close {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.detail-close:hover {
  color: var(--color-white);
  border-color: var(--color-text-muted);
}

.detail-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.detail-current-price {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
}

.detail-change {
  font-size: 0.95rem;
  font-weight: 600;
}

/* â”€â”€ Detail Tabs â”€â”€ */
.detail-tabs {
  display: flex;
  gap: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
}

.detail-tab {
  flex: 1;
  padding: 0.55rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.detail-tab.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.12);
}

/* â”€â”€ Chart â”€â”€ */
.chart-section {
  min-height: 200px;
}

.range-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.range-btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.range-btn.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-white);
  border-color: rgba(59, 130, 246, 0.3);
}

.chart-container {
  position: relative;
}

.price-chart {
  width: 100%;
  height: 200px;
  background: rgba(59, 130, 246, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.chart-labels {
  position: absolute;
  top: 0;
  right: 8px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
  pointer-events: none;
}

.chart-labels span {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  background: var(--color-background);
  padding: 0 4px;
}

.chart-loading,
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

/* â”€â”€ Profit Tab â”€â”€ */
.profit-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.profit-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.profit-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.profit-val {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
}

.profit-val.up {
  color: #22c55e;
}

.profit-val.down {
  color: #ef4444;
}

.trades-heading {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 1.25rem 0 0.75rem;
}

.detail-trades-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 200px;
  overflow-y: auto;
}

.detail-trade-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  font-size: 0.85rem;
}

.dt-amount {
  color: var(--color-white);
  font-weight: 600;
}

.dt-price {
  color: var(--color-text-muted);
  flex: 1;
}

.dt-total {
  color: var(--color-text);
  font-weight: 600;
}

.dt-time {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

/* â”€â”€ Panel Header â”€â”€ */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--color-accent);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.add-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* â”€â”€ Watchlist Add Form â”€â”€ */
.watchlist-add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.wl-select {
  flex: 1;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  color: var(--color-white);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
}

.add-confirm-btn {
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.add-confirm-btn:hover {
  background: #2563eb;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  transition: all var(--transition-fast);
  opacity: 0;
}

.watch-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.empty-msg {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: 1rem 0;
  text-align: center;
}

/* â”€â”€ Edit Order Button â”€â”€ */
.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--color-accent);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* â”€â”€ Edit Input (shared) â”€â”€ */
.edit-input {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.85rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  width: 100%;
  transition: border-color var(--transition-fast);
}

.edit-input:focus {
  border-color: var(--color-accent);
}

/* â”€â”€ Chart Tooltip â”€â”€ */
.chart-tooltip {
  position: absolute;
  top: -8px;
  transform: translateX(-50%);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.65rem;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 140px;
}

.ct-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-white);
}

.ct-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.ct-date {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

/* â”€â”€ Form Hint â”€â”€ */
.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.form-hint.warn {
  color: #f59e0b;
}

/* Disabled order button */
.order-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* â”€â”€ History Modal â”€â”€ */
.history-modal {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.history-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.history-stat {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: center;
}

.hs-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.hs-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
}

.hs-value.up {
  color: #22c55e;
}
.hs-value.down {
  color: #ef4444;
}

.history-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.history-header-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px 100px;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.history-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 100px 100px;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  align-items: center;
}

.history-row:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .history-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .history-header-row,
  .history-row {
    grid-template-columns: 50px 1fr 60px 80px;
  }
  .history-header-row span:nth-child(5),
  .history-header-row span:nth-child(6),
  .history-row span:nth-child(5),
  .history-row .bold,
  .history-row .trade-time {
    display: none;
  }
}
</style>
