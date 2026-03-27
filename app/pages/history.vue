<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const router = useRouter();
const loading = ref(true);
const trades = ref<any[]>([]);
const orders = ref<any[]>([]);
const filterType = ref<"all" | "BUY" | "SELL">("all");
const filterPeriod = ref<"all" | "7d" | "30d" | "90d">("all");
const searchQuery = ref("");

onMounted(async () => {
  try {
    const user = await getDbUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const p = await getPortfolio(user.user_id);
    if (!p) {
      loading.value = false;
      return;
    }
    const [t, o] = await Promise.all([
      getAllTrades(p.portfolio_id),
      getOpenOrders(p.portfolio_id),
    ]);
    trades.value = t;
    orders.value = o;
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
});

const filteredTrades = computed(() => {
  let result = trades.value;
  if (filterType.value !== "all") {
    result = result.filter((t: any) => t.trade_type === filterType.value);
  }
  if (filterPeriod.value !== "all") {
    const now = Date.now();
    const days =
      filterPeriod.value === "7d" ? 7 : filterPeriod.value === "30d" ? 30 : 90;
    result = result.filter(
      (t: any) => now - new Date(t.executed_at).getTime() < days * 86400000,
    );
  }
  const q = searchQuery.value.toLowerCase();
  if (q) {
    result = result.filter((t: any) => t.symbol?.toLowerCase().includes(q));
  }
  return result;
});

const totalBuyVolume = computed(() =>
  filteredTrades.value
    .filter((t: any) => t.trade_type === "BUY")
    .reduce((s: number, t: any) => s + t.price * t.amount, 0),
);

const totalSellVolume = computed(() =>
  filteredTrades.value
    .filter((t: any) => t.trade_type === "SELL")
    .reduce((s: number, t: any) => s + t.price * t.amount, 0),
);

const netPL = computed(() => totalSellVolume.value - totalBuyVolume.value);

const buyCount = computed(
  () => filteredTrades.value.filter((t: any) => t.trade_type === "BUY").length,
);
const sellCount = computed(
  () => filteredTrades.value.filter((t: any) => t.trade_type === "SELL").length,
);

function formatCurrency(n: number) {
  return n.toLocaleString("sk-SK", { style: "currency", currency: "USD" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("sk-SK", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="history-page">
    <AppNavbar />

    <div v-if="loading" class="page-loading">Načítavam históriu…</div>

    <main v-else class="history-main">
      <h1 class="page-title">História obchodov</h1>
      <p class="page-subtitle">
        Kompletný záznam všetkých vašich vykonaných obchodov
      </p>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Celkové obchody</span>
          <span class="stat-value">{{ filteredTrades.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Nákupy</span>
          <span class="stat-value up">{{ buyCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Predaje</span>
          <span class="stat-value down">{{ sellCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Objem nákupov</span>
          <span class="stat-value">{{ formatCurrency(totalBuyVolume) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Objem predajov</span>
          <span class="stat-value">{{ formatCurrency(totalSellVolume) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Čistý zisk/strata</span>
          <span :class="['stat-value', netPL >= 0 ? 'up' : 'down']">
            {{ netPL >= 0 ? "+" : "" }}{{ formatCurrency(netPL) }}
          </span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hľadať podľa symbolu…"
          class="search-input"
        />
        <div class="filter-group">
          <button
            v-for="t in ['all', 'BUY', 'SELL'] as const"
            :key="t"
            :class="['filter-btn', { active: filterType === t }]"
            @click="filterType = t"
          >
            {{ t === "all" ? "Všetky" : t }}
          </button>
        </div>
        <div class="filter-group">
          <button
            v-for="p in ['all', '7d', '30d', '90d'] as const"
            :key="p"
            :class="['filter-btn', { active: filterPeriod === p }]"
            @click="filterPeriod = p"
          >
            {{ p === "all" ? "Celé obdobie" : p }}
          </button>
        </div>
      </div>

      <!-- Open Orders -->
      <section v-if="orders.length" class="panel">
        <h2 class="panel-title">Otvorené príkazy ({{ orders.length }})</h2>
        <div class="table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>Strana</th>
                <th>Symbol</th>
                <th>Typ</th>
                <th>Množstvo</th>
                <th>Cena</th>
                <th>Stav</th>
                <th>Vytvorené</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.order_id">
                <td>
                  <span :class="['side-badge', o.order_side.toLowerCase()]">{{
                    o.order_side
                  }}</span>
                </td>
                <td class="bold">{{ o.symbol }}</td>
                <td>{{ o.order_type }}</td>
                <td>{{ o.amount }}</td>
                <td>
                  {{ formatCurrency(o.limit_price ?? o.stop_price ?? 0) }}
                </td>
                <td>
                  <span class="status-badge">{{ o.status }}</span>
                </td>
                <td class="date-col">{{ formatDate(o.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Executed Trades -->
      <section class="panel">
        <h2 class="panel-title">
          Vykonané obchody ({{ filteredTrades.length }})
        </h2>
        <div v-if="!filteredTrades.length" class="empty-msg">
          Žiadne obchody nezodpovedajú vašim filtrom
        </div>
        <div v-else class="table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>Strana</th>
                <th>Symbol</th>
                <th>Množstvo</th>
                <th>Cena</th>
                <th>Celkom</th>
                <th>Dátum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in filteredTrades" :key="t.trade_id">
                <td>
                  <span :class="['side-badge', t.trade_type.toLowerCase()]">{{
                    t.trade_type
                  }}</span>
                </td>
                <td class="bold">{{ t.symbol }}</td>
                <td>{{ t.amount }}</td>
                <td>{{ formatCurrency(t.price) }}</td>
                <td class="bold">{{ formatCurrency(t.price * t.amount) }}</td>
                <td class="date-col">{{ formatDate(t.executed_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--color-background);
}

.history-header {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.history-header-inner {
  max-width: 1200px;
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
.history-nav {
  display: flex;
  gap: 0.5rem;
}
.nav-link {
  padding: 0.4rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}
.nav-link:hover,
.nav-link.active {
  color: var(--color-accent);
  background: rgba(59, 130, 246, 0.08);
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.history-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
  margin: 0 0 0.35rem;
}
.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 1.5rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: center;
}
.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}
.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-white);
}
.stat-value.up {
  color: #22c55e;
}
.stat-value.down {
  color: #ef4444;
}

/* Filters */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 180px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 1rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}
.search-input:focus {
  border-color: var(--color-accent);
}
.filter-group {
  display: flex;
  gap: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.filter-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.2s;
}
.filter-btn.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.15);
}

/* Panels */
.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 1rem;
}

.table-wrap {
  overflow-x: auto;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.history-table th {
  text-align: left;
  padding: 0.65rem 0.85rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.history-table td {
  padding: 0.7rem 0.85rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}
.bold {
  font-weight: 700;
  color: var(--color-white);
}
.date-col {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.side-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.03em;
}
.side-badge.buy {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.side-badge.sell {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.empty-msg {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
  font-size: 0.95rem;
}

.up {
  color: #22c55e;
}
.down {
  color: #ef4444;
}

@media (max-width: 768px) {
  .history-main {
    padding: 1rem;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
