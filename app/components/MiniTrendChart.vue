<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    change: number
    seedKey: string
    width?: number
    height?: number
    pointsCount?: number
    gradientId?: string
  }>(),
  {
    width: 84,
    height: 28,
    pointsCount: 8,
    gradientId: '',
  },
)

const actualGradientId = computed(() => props.gradientId || `mini-grad-${props.seedKey}`)

function createPoints() {
  const chars = (props.seedKey || 'XX').split('')
  const seed = chars.reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0)
  const normalized = Math.max(-1, Math.min(1, Number(props.change || 0) / 35))
  const baseStart = 0.52 - normalized * 0.18
  const baseEnd = 0.52 + normalized * 0.18
  const pts = [] as Array<{ x: number; y: number }>

  for (let i = 0; i < props.pointsCount; i++) {
    const t = i / (props.pointsCount - 1)
    const wave = Math.sin(t * Math.PI * 2 + seed * 0.07) * 0.09
    const ripple = Math.cos(t * Math.PI * 4 + seed * 0.03) * 0.035
    const trend = baseStart + (baseEnd - baseStart) * t
    const yNorm = Math.max(0.12, Math.min(0.88, trend + wave + ripple))
    pts.push({
      x: Number((t * props.width).toFixed(2)),
      y: Number((yNorm * props.height).toFixed(2)),
    })
  }
  return pts
}

const points = computed(() => createPoints())

const linePath = computed(() =>
  points.value.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' '),
)

const areaPath = computed(() => {
  if (!points.value.length) return ''
  return `${linePath.value} L${props.width},${props.height} L0,${props.height} Z`
})

const strokeColor = computed(() => (props.change >= 0 ? '#4ade80' : '#fb7185'))
const fillColorStart = computed(() => (props.change >= 0 ? '#34d399' : '#fb7185'))
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="mini-trend-chart" preserveAspectRatio="none">
    <defs>
      <linearGradient :id="actualGradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="fillColorStart" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="fillColorStart" stop-opacity="0.03" />
      </linearGradient>
    </defs>
    <path :d="areaPath" :fill="`url(#${actualGradientId})`" />
    <path
      :d="linePath"
      fill="none"
      :stroke="strokeColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.mini-trend-chart {
  display: block;
}
</style>
