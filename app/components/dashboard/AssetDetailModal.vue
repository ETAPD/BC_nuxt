<template>
  <div v-if="showDetail" class="detail-overlay" @click.self="handleClose">
    <div class="detail-modal">
      <div class="detail-header">
        <div class="detail-asset-info">
          <img
            v-if="detailAsset?.image_url"
            :src="detailAsset.image_url"
            :alt="detailAsset.symbol"
            class="detail-asset-img"
          />
          <span v-else class="asset-img-placeholder detail-placeholder">{{
            detailAsset?.symbol?.slice(0, 2)
          }}</span>
          <div>
            <h2 class="detail-symbol">{{ detailAsset?.symbol }}</h2>
            <span class="detail-name">{{ detailAsset?.asset_name }}</span>
          </div>
        </div>
        <button class="detail-close" @click="handleClose">&times;</button>
      </div>

      <div class="detail-price-row">
        <span class="detail-current-price">{{
          formatCurrency(detailAsset?.current_price ?? 0)
        }}</span>
        <span
          v-if="detailPrices.length >= 2"
          :class="['detail-change', chartPriceChange >= 0 ? 'up' : 'down']"
        >
          {{ chartPriceChange >= 0 ? "+" : ""
          }}{{ formatCurrency(chartPriceChange) }} ({{
            chartPriceChangePercent
          }}%)
        </span>
      </div>

      <div class="chart-section">
        <div class="range-tabs">
          <button
            v-for="range in ranges"
            :key="range"
            :class="['range-btn', { active: detailRange === range }]"
            @click="setRange(range)"
          >
            {{ range }}
          </button>
        </div>

        <div v-if="detailLoading" class="chart-loading">Načítavam graf…</div>
        <div v-else-if="detailPrices.length < 2" class="chart-empty">
          Pre tento rozsah nie sú k dispozícii cenové údaje
        </div>
        <div v-else class="chart-container">
          <svg
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            class="price-chart"
            preserveAspectRatio="none"
            @mousemove="onChartMouseMove"
            @mouseleave="onChartMouseLeave"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  :stop-color="chartPriceChange >= 0 ? '#22c55e' : '#ef4444'"
                  stop-opacity="0.3"
                />
                <stop
                  offset="100%"
                  :stop-color="chartPriceChange >= 0 ? '#22c55e' : '#ef4444'"
                  stop-opacity="0.02"
                />
              </linearGradient>
            </defs>

            <line
              v-for="index in 4"
              :key="'grid' + index"
              :x1="chartPadding"
              :y1="
                chartPadding + ((chartHeight - chartPadding * 2) / 4) * index
              "
              :x2="chartWidth - chartPadding"
              :y2="
                chartPadding + ((chartHeight - chartPadding * 2) / 4) * index
              "
              stroke="rgba(59,130,246,0.08)"
              stroke-width="1"
            />

            <path :d="priceChartArea" fill="url(#chartGrad)" />
            <path
              :d="priceChartPath"
              fill="none"
              :stroke="chartPriceChange >= 0 ? '#22c55e' : '#ef4444'"
              stroke-width="2"
              stroke-linejoin="round"
            />

            <template v-if="chartTooltip.show">
              <line
                :x1="chartTooltip.x"
                :y1="chartPadding"
                :x2="chartTooltip.x"
                :y2="chartHeight - chartPadding"
                stroke="rgba(255,255,255,0.25)"
                stroke-width="1"
                stroke-dasharray="3,3"
              />
              <line
                :x1="chartPadding"
                :y1="chartTooltip.y"
                :x2="chartWidth - chartPadding"
                :y2="chartTooltip.y"
                stroke="rgba(255,255,255,0.15)"
                stroke-width="1"
                stroke-dasharray="3,3"
              />
              <circle
                :cx="chartTooltip.x"
                :cy="chartTooltip.y"
                r="4"
                :fill="chartTooltip.change >= 0 ? '#22c55e' : '#ef4444'"
                stroke="white"
                stroke-width="1.5"
              />
            </template>
          </svg>

          <div
            v-if="chartTooltip.show"
            class="chart-tooltip"
            :style="{ left: (chartTooltip.x / chartWidth) * 100 + '%' }"
          >
            <span class="ct-price">{{
              formatCurrency(chartTooltip.price)
            }}</span>
            <span
              :class="['ct-change', chartTooltip.change >= 0 ? 'up' : 'down']"
            >
              {{ chartTooltip.change >= 0 ? "+" : ""
              }}{{ formatCurrency(chartTooltip.change) }} ({{
                chartTooltip.changePct
              }}%)
            </span>
            <span class="ct-date">{{ chartTooltip.date }}</span>
          </div>

          <div class="chart-labels">
            <span>{{ formatCurrency(chartMaxPrice) }}</span>
            <span>{{ formatCurrency(chartMinPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getPriceHistory } from '~/composables/useAssets'

const props = defineProps<{
  showDetail: boolean
  detailAsset: any | null
  formatCurrency: (value: number, currency?: string) => string
}>()

const emit = defineEmits<{
  close: []
}>()

const ranges = ['1h', '24h', '7d', '30d'] as const
const detailRange = ref<'1h' | '24h' | '7d' | '30d'>('24h')
const detailLoading = ref(false)
const detailPrices = ref<any[]>([])
const chartWidth = 600
const chartHeight = 200
const chartPadding = 30
const chartTooltip = ref<any>({
  show: false,
  x: 0,
  y: 0,
  price: 0,
  date: '',
  change: 0,
  changePct: '0',
})

const chartMinPrice = computed(() => {
  const prices = detailPrices.value.map((point: any) => point.price)
  return prices.length ? Math.min(...prices) : 0
})

const chartMaxPrice = computed(() => {
  const prices = detailPrices.value.map((point: any) => point.price)
  return prices.length ? Math.max(...prices) : 0
})

const chartPriceChange = computed(() => {
  const points = detailPrices.value
  if (points.length < 2) return 0
  return Number(points[points.length - 1].price) - Number(points[0].price)
})

const chartPriceChangePercent = computed(() => {
  const points = detailPrices.value
  if (points.length < 2 || Number(points[0].price) === 0) return '0.0'
  return (
    ((Number(points[points.length - 1].price) - Number(points[0].price)) /
      Number(points[0].price)) *
    100
  ).toFixed(2)
})

const priceChartPath = computed(() => {
  const points = detailPrices.value
  if (points.length < 2) return ''
  const prices = points.map((point: any) => Number(point.price))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1
  const width = chartWidth - chartPadding * 2
  const height = chartHeight - chartPadding * 2
  return points
    .map((point: any, index: number) => {
      const x = chartPadding + (index / (points.length - 1)) * width
      const y =
        chartPadding +
        height -
        ((Number(point.price) - minPrice) / priceRange) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const priceChartArea = computed(() => {
  if (!priceChartPath.value) return ''
  const width = chartWidth - chartPadding * 2
  const lastX = chartPadding + width
  const bottomY = chartHeight - chartPadding
  return `${priceChartPath.value} L${lastX},${bottomY} L${chartPadding},${bottomY} Z`
})

watch(
  () => props.showDetail,
  (value) => {
    if (value) {
      detailRange.value = '24h'
      loadPriceData()
    }
  },
  { immediate: true }
)

watch(
  () => props.detailAsset,
  () => {
    if (props.showDetail) {
      detailRange.value = '24h'
      loadPriceData()
    }
  }
)

async function loadPriceData() {
  if (!props.detailAsset?.asset_id || !props.showDetail) return
  detailLoading.value = true
  chartTooltip.value.show = false
  try {
    detailPrices.value = await getPriceHistory(
      props.detailAsset.asset_id,
      detailRange.value,
    )
  } catch {
    detailPrices.value = []
  } finally {
    detailLoading.value = false
  }
}

async function setRange(range: '1h' | '24h' | '7d' | '30d') {
  if (detailRange.value === range) return
  detailRange.value = range
  await loadPriceData()
}

function onChartMouseMove(event: MouseEvent) {
  const points = detailPrices.value
  if (points.length < 2) return
  const svg = event.currentTarget as SVGElement | null
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * chartWidth
  const width = chartWidth - chartPadding * 2
  const relativeX = Math.max(0, Math.min(width, x - chartPadding))
  const pointIndex = Math.round((relativeX / width) * (points.length - 1))
  const point = points[pointIndex]
  if (!point) return
  const prices = points.map((item: any) => Number(item.price))
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1
  const height = chartHeight - chartPadding * 2
  const pointX =
    chartPadding + (pointIndex / (points.length - 1)) * width
  const pointY =
    chartPadding +
    height -
    ((Number(point.price) - minPrice) / priceRange) * height
  const startPrice = Number(points[0].price) || 0
  const change = Number(point.price) - startPrice
  const changePct = startPrice
    ? ((change / startPrice) * 100).toFixed(2)
    : '0.00'
  chartTooltip.value = {
    show: true,
    x: pointX,
    y: pointY,
    price: Number(point.price),
    date: formatDate(point.recorded_at),
    change,
    changePct,
  }
}

function onChartMouseLeave() {
  chartTooltip.value.show = false
}

function formatDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleString('sk-SK')
}

function handleClose() {
  chartTooltip.value.show = false
  detailPrices.value = []
  emit('close')
}
</script>

<style></style>
