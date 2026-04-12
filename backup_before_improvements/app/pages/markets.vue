<script setup lang="ts">
const loading = ref(true);
const assets = ref<any[]>([]);
const searchQuery = ref("");
const filterType = ref("all");

// Selected asset (inline chart – no modal)
const selectedAsset = ref<any>(null);
const selectedPrices = ref<any[]>([]);
const selectedRange = ref<"1h" | "24h" | "7d" | "30d">("24h");
const chartLoading = ref(false);

// Spotlight carousel
const spotlightAssets = ref<any[]>([]);
const spotlightPrices = ref<Record<string, any[]>>({});
const spotlightIndex = ref(0);
const spotlightPaused = ref(false);
const spotlightFilterType = ref("all");
const spotlightLoading = ref(true);
let spotlightTimer: ReturnType<typeof setInterval> | null = null;

const spotlightCurrent = computed(
  () => spotlightAssets.value[spotlightIndex.value] ?? null,
);
const spotlightCurrentPrices = computed(() => {
  const a = spotlightCurrent.value;
  return a ? (spotlightPrices.value[a.asset_id] ?? []) : [];
});

const spotPriceChange = computed(() => {
  const pts = spotlightCurrentPrices.value;
  if (pts.length < 2) return 0;
  return pts[pts.length - 1].price - pts[0].price;
});

const spotPriceChangePct = computed(() => {
  const pts = spotlightCurrentPrices.value;
  if (pts.length < 2 || pts[0].price === 0) return "0.0";
  return (
    ((pts[pts.length - 1].price - pts[0].price) / pts[0].price) *
    100
  ).toFixed(2);
});

const spotSummaryStats = computed(() => {
  const pts = spotlightCurrentPrices.value;
  if (!pts.length) {
    return {
      open: 0,
      high: 0,
      low: 0,
      spreadPct: "0.00",
    };
  }

  const prices = pts.map((p: any) => p.price);
  const open = pts[0]?.price ?? 0;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const spreadPct =
    open === 0 ? "0.00" : (((high - low) / open) * 100).toFixed(2);

  return {
    open,
    high,
    low,
    spreadPct,
  };
});

async function loadSpotlightData() {
  const pool =
    spotlightFilterType.value === "all"
      ? assets.value
      : assets.value.filter(
          (a: any) => a.asset_type === spotlightFilterType.value,
        );
  const picked = pool.slice(0, 5);
  spotlightAssets.value = picked;
  spotlightIndex.value = 0;
  spotlightLoading.value = true;
  const priceMap: Record<string, any[]> = {};
  for (const a of picked) {
    try {
      priceMap[a.asset_id] = await getPriceHistory(a.asset_id, "24h");
    } catch {
      priceMap[a.asset_id] = [];
    }
  }
  spotlightPrices.value = priceMap;
  spotlightLoading.value = false;
}

function startSpotlightCycle() {
  stopSpotlightCycle();
  spotlightTimer = setInterval(() => {
    if (!spotlightPaused.value && spotlightAssets.value.length > 1) {
      spotlightIndex.value =
        (spotlightIndex.value + 1) % spotlightAssets.value.length;
    }
  }, 5000);
}

function stopSpotlightCycle() {
  if (spotlightTimer) clearInterval(spotlightTimer);
}

function selectSpotlight(idx: number) {
  spotlightIndex.value = idx;
}

function toggleSpotlightPause() {
  spotlightPaused.value = !spotlightPaused.value;
}

watch(spotlightFilterType, () => {
  loadSpotlightData();
});

let refreshTimer: ReturnType<typeof setInterval> | null = null;

const assetTypes = computed(() => {
  const types = new Set(assets.value.map((a: any) => a.asset_type));
  return ["all", ...Array.from(types)];
});

const filteredAssets = computed(() => {
  let result = assets.value;
  if (filterType.value !== "all") {
    result = result.filter((a: any) => a.asset_type === filterType.value);
  }
  const q = searchQuery.value.toLowerCase();
  if (q) {
    result = result.filter(
      (a: any) =>
        a.symbol?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q),
    );
  }
  return result;
});

onMounted(async () => {
  try {
    assets.value = await getAssets();
    // Auto-select first asset for chart
    if (assets.value.length) {
      selectAsset(assets.value[0]);
    }
  } catch {
    // silent
  } finally {
    loading.value = false;
  }
  await loadSpotlightData();
  startSpotlightCycle();
  refreshTimer = setInterval(async () => {
    try {
      assets.value = await getAssets();
    } catch {
      // silent
    }
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  stopSpotlightCycle();
});

// Inline chart
const chartWidth = 700;
const chartHeight = 260;
const chartPadding = 40;

const chartPriceChange = computed(() => {
  const pts = selectedPrices.value;
  if (pts.length < 2) return 0;
  return pts[pts.length - 1].price - pts[0].price;
});

const chartPriceChangePercent = computed(() => {
  const pts = selectedPrices.value;
  if (pts.length < 2 || pts[0].price === 0) return "0.0";
  return (
    ((pts[pts.length - 1].price - pts[0].price) / pts[0].price) *
    100
  ).toFixed(2);
});

const chartSummaryStats = computed(() => {
  const pts = selectedPrices.value;
  if (!pts.length) {
    return {
      open: 0,
      high: 0,
      low: 0,
      spreadPct: "0.00",
    };
  }

  const prices = pts.map((p: any) => p.price);
  const open = pts[0]?.price ?? 0;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const spreadPct =
    open === 0 ? "0.00" : (((high - low) / open) * 100).toFixed(2);

  return {
    open,
    high,
    low,
    spreadPct,
  };
});

// Chart tooltip ref (from PriceChart component)
const mainChartRef = ref<InstanceType<typeof PriceChart> | null>(null);
const mainChartTooltip = computed(
  () =>
    mainChartRef.value?.tooltip ?? {
      show: false,
      x: 0,
      y: 0,
      price: 0,
      date: "",
      change: 0,
      changePct: "0",
    },
);

async function selectAsset(asset: any) {
  selectedAsset.value = asset;
  await loadPriceData();
}

function onAssetHover(asset: any) {
  selectAsset(asset);
}

async function loadPriceData() {
  if (!selectedAsset.value) return;
  chartLoading.value = true;
  try {
    selectedPrices.value = await getPriceHistory(
      selectedAsset.value.asset_id,
      selectedRange.value,
    );
  } catch {
    selectedPrices.value = [];
  } finally {
    chartLoading.value = false;
  }
}

watch(selectedRange, () => {
  if (selectedAsset.value) loadPriceData();
});

function formatCurrency(n: number) {
  return n.toLocaleString("sk-SK", { style: "currency", currency: "USD" });
}
</script>

<template>
  <div class="markets-page">
    <AppNavbar />

    <main class="markets-main">
      <div class="markets-top">
        <h1 class="page-title">Trhy</h1>
        <p class="page-subtitle">
          Prehľad všetkých dostupných aktív a ich aktuálnych cien
        </p>
      </div>

      <!-- Spotlight Carousel -->
      <div class="spotlight-section">
        <div class="spotlight-header">
          <h2 class="spotlight-title">Cenový prehľad</h2>
          <div class="spotlight-controls">
            <div class="spotlight-type-filters">
              <button
                v-for="t in assetTypes"
                :key="'sf-' + t"
                :class="[
                  'spot-filter-btn',
                  { active: spotlightFilterType === t },
                ]"
                @click="spotlightFilterType = t"
              >
                {{ t === "all" ? "Všetky" : t }}
              </button>
            </div>
            <button class="spot-pause-btn" @click="toggleSpotlightPause">
              {{ spotlightPaused ? "&#9654;" : "&#10074;&#10074;" }}
            </button>
          </div>
        </div>

        <div v-if="spotlightLoading" class="spotlight-loading">
          Načítavam prehľad…
        </div>
        <div v-else-if="!spotlightAssets.length" class="spotlight-loading">
          Žiadne aktíva v tejto kategórii
        </div>
        <div v-else class="spotlight-body">
          <div class="spotlight-info-row">
            <div class="spotlight-asset-info">
              <img
                v-if="spotlightCurrent?.image_url"
                :src="spotlightCurrent.image_url"
                :alt="spotlightCurrent.symbol"
                class="spotlight-img"
              />
              <span
                v-else
                class="asset-img-placeholder spotlight-placeholder"
                >{{ spotlightCurrent?.symbol?.slice(0, 2) }}</span
              >
              <div>
                <span class="spotlight-symbol">{{
                  spotlightCurrent?.symbol
                }}</span>
                <span class="spotlight-name">{{ spotlightCurrent?.name }}</span>
              </div>
            </div>
            <div class="spotlight-price-info">
              <span class="spotlight-price">{{
                formatCurrency(spotlightCurrent?.base_price ?? 0)
              }}</span>
              <span
                v-if="spotlightCurrentPrices.length >= 2"
                :class="[
                  'spotlight-change',
                  spotPriceChange >= 0 ? 'up' : 'down',
                ]"
              >
                {{ spotPriceChange >= 0 ? "+" : "" }}{{ spotPriceChangePct }}%
              </span>
            </div>
          </div>

          <div
            v-if="spotlightCurrentPrices.length >= 2"
            class="spotlight-chart-wrap"
          >
            <PriceChart
              :prices="spotlightCurrentPrices"
              :width="700"
              :height="220"
              :padding="30"
              gradient-id="spotGrad"
              :show-tooltip="true"
              :show-grid-labels="false"
              :show-grid-lines="true"
              :grid-line-count="4"
            />
          </div>
          <div v-else class="spotlight-chart-empty">
            Cenové údaje nie sú k dispozícii
          </div>

          <div
            v-if="spotlightCurrentPrices.length >= 2"
            class="chart-summary-grid spotlight-summary-grid"
          >
            <div class="summary-card">
              <span class="summary-label">Otvorenie</span>
              <span class="summary-value">{{
                formatCurrency(spotSummaryStats.open)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Maximum</span>
              <span class="summary-value">{{
                formatCurrency(spotSummaryStats.high)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Minimum</span>
              <span class="summary-value">{{
                formatCurrency(spotSummaryStats.low)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Rozpätie</span>
              <span class="summary-value"
                >{{ spotSummaryStats.spreadPct }}%</span
              >
            </div>
          </div>

          <div class="spotlight-dots">
            <button
              v-for="(a, i) in spotlightAssets"
              :key="a.asset_id"
              :class="['spot-dot', { active: i === spotlightIndex }]"
              :title="a.symbol"
              @click="selectSpotlight(i)"
            >
              {{ a.symbol }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main content: Chart + Table side by side -->
      <div class="markets-content">
        <!-- Left: Chart panel -->
        <div class="chart-panel">
          <div v-if="selectedAsset" class="chart-panel-header">
            <div class="chart-asset-info">
              <img
                v-if="selectedAsset.image_url"
                :src="selectedAsset.image_url"
                :alt="selectedAsset.symbol"
                class="chart-asset-img"
              />
              <span v-else class="asset-img-placeholder chart-placeholder">{{
                selectedAsset.symbol?.slice(0, 2)
              }}</span>
              <div>
                <h2 class="chart-symbol">{{ selectedAsset.symbol }}</h2>
                <span class="chart-name">{{ selectedAsset.name }}</span>
              </div>
            </div>
            <div class="chart-price-row">
              <span class="chart-current-price">{{
                formatCurrency(selectedAsset.base_price ?? 0)
              }}</span>
              <span
                v-if="selectedPrices.length >= 2"
                :class="['chart-change', chartPriceChange >= 0 ? 'up' : 'down']"
              >
                {{ chartPriceChange >= 0 ? "+" : ""
                }}{{ formatCurrency(chartPriceChange) }} ({{
                  chartPriceChangePercent
                }}%)
              </span>
            </div>
            <div class="chart-meta">
              <div class="meta-item">
                <span class="meta-label">Typ</span>
                <span class="meta-value">{{ selectedAsset.asset_type }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Zmena 24h</span>
                <span
                  :class="[
                    'meta-value',
                    (selectedAsset.change_24h ?? 0) >= 0 ? 'up' : 'down',
                  ]"
                >
                  {{ (selectedAsset.change_24h ?? 0) >= 0 ? "+" : ""
                  }}{{ (selectedAsset.change_24h ?? 0).toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>

          <div class="range-tabs">
            <button
              v-for="r in ['1h', '24h', '7d', '30d']"
              :key="r"
              :class="['range-btn', { active: selectedRange === r }]"
              @click="selectedRange = r as '1h' | '24h' | '7d' | '30d'"
            >
              {{ r }}
            </button>
          </div>

          <div
            v-if="selectedPrices.length >= 2 && mainChartTooltip.show"
            class="chart-hover-strip"
          >
            <div class="hover-stat">
              <span class="hover-stat-label">Cena bodu</span>
              <span class="hover-stat-value">{{
                formatCurrency(mainChartTooltip.price)
              }}</span>
            </div>
            <div class="hover-stat">
              <span class="hover-stat-label">Zmena od začiatku</span>
              <span
                :class="[
                  'hover-stat-value',
                  mainChartTooltip.change >= 0 ? 'up' : 'down',
                ]"
              >
                {{ mainChartTooltip.change >= 0 ? "+" : ""
                }}{{ formatCurrency(mainChartTooltip.change) }} ({{
                  mainChartTooltip.changePct
                }}%)
              </span>
            </div>
            <div class="hover-stat">
              <span class="hover-stat-label">Čas bodu</span>
              <span class="hover-stat-value muted">{{
                mainChartTooltip.date
              }}</span>
            </div>
          </div>

          <div v-if="chartLoading" class="chart-loading">Načítavam graf…</div>
          <div v-else-if="!selectedAsset" class="chart-empty">
            Podržte kurzor nad aktívom pre zobrazenie grafu
          </div>
          <PriceChart
            v-else
            ref="mainChartRef"
            :prices="selectedPrices"
            :width="chartWidth"
            :height="chartHeight"
            :padding="chartPadding"
            gradient-id="mktChartGrad"
            :show-tooltip="true"
            :show-grid-labels="true"
            :show-grid-lines="true"
            :grid-line-count="4"
          />

          <div v-if="selectedPrices.length >= 2" class="chart-summary-grid">
            <div class="summary-card">
              <span class="summary-label">Otvorenie</span>
              <span class="summary-value">{{
                formatCurrency(chartSummaryStats.open)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Maximum</span>
              <span class="summary-value">{{
                formatCurrency(chartSummaryStats.high)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Minimum</span>
              <span class="summary-value">{{
                formatCurrency(chartSummaryStats.low)
              }}</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">Rozpätie</span>
              <span class="summary-value"
                >{{ chartSummaryStats.spreadPct }}%</span
              >
            </div>
          </div>
        </div>

        <!-- Right: Scrollable asset list -->
        <div class="list-panel">
          <div class="filter-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Hľadať podľa názvu alebo symbolu…"
              class="search-input"
            />
            <div class="type-filters">
              <button
                v-for="t in assetTypes"
                :key="t"
                :class="['filter-btn', { active: filterType === t }]"
                @click="filterType = t"
              >
                {{ t === "all" ? "Všetky" : t }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="markets-loading">Načítavam aktíva…</div>

          <div v-else class="assets-table-wrap">
            <table class="assets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aktívum</th>
                  <th>Cena</th>
                  <th>Zmena 24h</th>
                  <th>Typ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(a, idx) in filteredAssets"
                  :key="a.asset_id"
                  :class="[
                    'asset-row',
                    {
                      'asset-row-active':
                        selectedAsset?.asset_id === a.asset_id,
                    },
                  ]"
                  @mouseenter="onAssetHover(a)"
                  @click="selectAsset(a)"
                >
                  <td class="rank">{{ idx + 1 }}</td>
                  <td>
                    <div class="asset-cell">
                      <img
                        v-if="a.image_url"
                        :src="a.image_url"
                        :alt="a.symbol"
                        class="asset-img"
                        @error="a._imgErr = true"
                      />
                      <span v-else class="asset-img-placeholder">{{
                        a.symbol?.slice(0, 2)
                      }}</span>
                      <div class="asset-info">
                        <span class="asset-symbol">{{ a.symbol }}</span>
                        <span class="asset-name">{{ a.name }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="price-col">{{ formatCurrency(a.base_price) }}</td>
                  <td
                    :class="[
                      'change-col',
                      (a.change_24h ?? 0) >= 0 ? 'up' : 'down',
                    ]"
                  >
                    {{ (a.change_24h ?? 0) >= 0 ? "+" : ""
                    }}{{ (a.change_24h ?? 0).toFixed(2) }}%
                  </td>
                  <td>
                    <span class="type-badge">{{ a.asset_type }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!filteredAssets.length" class="no-results">
              Žiadne aktíva nezodpovedajú vášmu vyhľadávaniu
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.markets-page {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}

.markets-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.markets-top {
  margin-bottom: 1.5rem;
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
  margin: 0;
}

/* === Side-by-side layout === */
.markets-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(470px, 500px);
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

/* Chart Panel (left) */
.chart-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chart-panel::-webkit-scrollbar {
  display: none;
}

.chart-panel-header {
  margin-bottom: 1rem;
}

.chart-asset-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.chart-asset-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.chart-placeholder {
  width: 44px;
  height: 44px;
  font-size: 0.8rem;
}
.chart-symbol {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-white);
  margin: 0;
}
.chart-name {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.chart-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.chart-current-price {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
}
.chart-change {
  font-size: 0.95rem;
  font-weight: 600;
}

.chart-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}
.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-white);
  text-transform: capitalize;
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
  transition: all 0.2s;
}
.range-btn.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-white);
  border-color: rgba(59, 130, 246, 0.3);
}

.chart-hover-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0 0 0.9rem;
}

.hover-stat,
.hover-strip-placeholder {
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.14);
  border-radius: var(--radius-sm);
  padding: 0.75rem 0.9rem;
  min-height: 62px;
}

.hover-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.hover-stat-label {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.hover-stat-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-white);
  line-height: 1.2;
}

.hover-stat-value.muted,
.hover-strip-placeholder {
  color: var(--color-text-muted);
}

.hover-strip-placeholder {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.84rem;
}

.chart-container {
  position: relative;
}

.chart-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}
.summary-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: var(--radius-sm);
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 84px;
}
.summary-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}
.summary-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
}

.price-chart {
  width: 100%;
  height: 260px;
  background: rgba(59, 130, 246, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

/* Grid price labels */
.chart-grid-labels {
  position: absolute;
  top: 0;
  right: 8px;
  bottom: 0;
  pointer-events: none;
}
.grid-label {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  background: var(--color-background-soft);
  padding: 0 4px;
  border-radius: 3px;
}
.gl-price {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  font-weight: 600;
  white-space: nowrap;
}
.gl-change {
  font-size: 0.58rem;
  font-weight: 700;
  white-space: nowrap;
}

.chart-loading,
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

/* Chart Tooltip */
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

/* List Panel (right, scrollable) */
.list-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.search-input {
  width: 100%;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
  color: var(--color-white);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: var(--color-accent);
}

.type-filters {
  display: flex;
  gap: 0.2rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.filter-btn {
  padding: 0.4rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.2s;
  text-transform: capitalize;
  flex: 1;
  text-align: center;
}
.filter-btn.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.15);
}
.filter-btn:hover:not(.active) {
  color: var(--color-white);
}

.markets-loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 3rem 0;
  font-size: 0.95rem;
}

.assets-table-wrap {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 60vh;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.assets-table-wrap::-webkit-scrollbar {
  display: none;
}

.assets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: fixed;
}
.assets-table th:nth-child(1),
.assets-table td:nth-child(1) {
  width: 34px;
}
.assets-table th:nth-child(2),
.assets-table td:nth-child(2) {
  width: 42%;
}
.assets-table th:nth-child(3),
.assets-table td:nth-child(3) {
  width: 25%;
  white-space: nowrap;
}
.assets-table th:nth-child(4),
.assets-table td:nth-child(4) {
  width: 19%;
  white-space: nowrap;
}
.assets-table th:nth-child(5),
.assets-table td:nth-child(5) {
  width: 14%;
  text-align: right;
  padding-right: 1rem;
}
.assets-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  position: sticky;
  top: 0;
  background: var(--color-background-soft);
  z-index: 2;
}
.assets-table td {
  padding: 0.65rem 0.75rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
}
.asset-row {
  cursor: pointer;
  transition: background 0.15s;
}
.asset-row:hover td {
  background: rgba(59, 130, 246, 0.06);
}
.asset-row-active td {
  background: rgba(59, 130, 246, 0.1);
}

.rank {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  width: 30px;
}
.asset-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.asset-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
.asset-img-placeholder {
  width: 30px;
  height: 30px;
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
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--color-accent);
  text-transform: uppercase;
  flex-shrink: 0;
}
.asset-info {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}
.asset-symbol {
  font-weight: 700;
  color: var(--color-white);
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.asset-name {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price-col {
  font-weight: 700;
  color: var(--color-white);
}
.change-col {
  font-weight: 600;
}
.up {
  color: #22c55e;
}
.down {
  color: #ef4444;
}
.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.14rem 0.46rem;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-accent);
  white-space: nowrap;
  max-width: 100%;
}
.no-results {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem;
  font-size: 0.85rem;
}

/* Spotlight */
.spotlight-section {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.spotlight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.spotlight-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
}
.spotlight-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.spotlight-type-filters {
  display: flex;
  gap: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.spot-filter-btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.2s;
  text-transform: capitalize;
}
.spot-filter-btn.active {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.15);
}
.spot-filter-btn:hover:not(.active) {
  color: var(--color-white);
}
.spot-pause-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.spot-pause-btn:hover {
  color: var(--color-white);
  border-color: var(--color-text-muted);
}
.spotlight-loading {
  text-align: center;
  color: var(--color-text-muted);
  padding: 3rem 0;
}
.spotlight-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.spotlight-asset-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.spotlight-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.spotlight-placeholder {
  width: 44px;
  height: 44px;
  font-size: 0.8rem;
}
.spotlight-symbol {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-white);
  display: block;
}
.spotlight-name {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.spotlight-price-info {
  text-align: right;
}
.spotlight-price {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-white);
  display: block;
}
.spotlight-change {
  font-size: 0.85rem;
  font-weight: 600;
}
.spotlight-chart-wrap {
  position: relative;
  margin-bottom: 1rem;
}
.spotlight-chart {
  width: 100%;
  height: 180px;
  background: rgba(59, 130, 246, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.spotlight-chart-labels {
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
.spotlight-chart-labels span {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  background: var(--color-background-soft);
  padding: 0 4px;
}
.spotlight-chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.spotlight-dots {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.spot-dot {
  padding: 0.3rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.spot-dot.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-white);
  border-color: rgba(59, 130, 246, 0.3);
}
.spot-dot:hover:not(.active) {
  color: var(--color-white);
}

@media (max-width: 1100px) {
  .markets-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .markets-content {
    grid-template-columns: 1fr;
  }
  .chart-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .assets-table-wrap {
    max-height: 50vh;
  }
  .markets-main {
    padding: 1rem;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .assets-table th:first-child,
  .assets-table td:first-child {
    display: none;
  }
}
</style>

@media (max-width: 900px) { .chart-hover-strip { grid-template-columns: 1fr; } }
