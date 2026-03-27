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

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AssetDetailModal",
  emits: ["close"],
  props: {
    showDetail: { type: Boolean, default: false },
    detailAsset: { type: Object, default: null },
    formatCurrency: { type: Function, required: true },
  },
  data() {
    return {
      ranges: ["1h", "24h", "7d", "30d"],
      detailRange: "24h" as "1h" | "24h" | "7d" | "30d",
      detailLoading: false,
      detailPrices: [] as any[],
      chartWidth: 600,
      chartHeight: 200,
      chartPadding: 30,
      chartTooltip: {
        show: false,
        x: 0,
        y: 0,
        price: 0,
        date: "",
        change: 0,
        changePct: "0",
      } as any,
    };
  },
  computed: {
    chartMinPrice(): number {
      const prices = (this.detailPrices as any[]).map(
        (point: any) => point.price,
      );
      return prices.length ? Math.min(...prices) : 0;
    },
    chartMaxPrice(): number {
      const prices = (this.detailPrices as any[]).map(
        (point: any) => point.price,
      );
      return prices.length ? Math.max(...prices) : 0;
    },
    chartPriceChange(): number {
      const points = this.detailPrices as any[];
      if (points.length < 2) return 0;
      return Number(points[points.length - 1].price) - Number(points[0].price);
    },
    chartPriceChangePercent(): string {
      const points = this.detailPrices as any[];
      if (points.length < 2 || Number(points[0].price) === 0) return "0.0";
      return (
        ((Number(points[points.length - 1].price) - Number(points[0].price)) /
          Number(points[0].price)) *
        100
      ).toFixed(2);
    },
    priceChartPath(): string {
      const points = this.detailPrices as any[];
      if (points.length < 2) return "";
      const prices = points.map((point: any) => Number(point.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;
      const width = this.chartWidth - this.chartPadding * 2;
      const height = this.chartHeight - this.chartPadding * 2;
      return points
        .map((point: any, index: number) => {
          const x = this.chartPadding + (index / (points.length - 1)) * width;
          const y =
            this.chartPadding +
            height -
            ((Number(point.price) - minPrice) / priceRange) * height;
          return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    },
    priceChartArea(): string {
      if (!this.priceChartPath) return "";
      const width = this.chartWidth - this.chartPadding * 2;
      const lastX = this.chartPadding + width;
      const bottomY = this.chartHeight - this.chartPadding;
      return `${this.priceChartPath} L${lastX},${bottomY} L${this.chartPadding},${bottomY} Z`;
    },
  },
  watch: {
    showDetail: {
      immediate: true,
      handler(value: boolean) {
        if (value) {
          this.detailRange = "24h";
          this.loadPriceData();
        }
      },
    },
    detailAsset() {
      if (this.showDetail) {
        this.detailRange = "24h";
        this.loadPriceData();
      }
    },
  },
  methods: {
    async loadPriceData() {
      if (!this.detailAsset?.asset_id || !this.showDetail) return;
      this.detailLoading = true;
      this.chartTooltip.show = false;
      try {
        this.detailPrices = await getPriceHistory(
          this.detailAsset.asset_id,
          this.detailRange,
        );
      } catch {
        this.detailPrices = [];
      } finally {
        this.detailLoading = false;
      }
    },
    async setRange(range: "1h" | "24h" | "7d" | "30d") {
      if (this.detailRange === range) return;
      this.detailRange = range;
      await this.loadPriceData();
    },
    onChartMouseMove(event: MouseEvent) {
      const points = this.detailPrices as any[];
      if (points.length < 2) return;
      const svg = event.currentTarget as SVGElement | null;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * this.chartWidth;
      const width = this.chartWidth - this.chartPadding * 2;
      const relativeX = Math.max(0, Math.min(width, x - this.chartPadding));
      const pointIndex = Math.round((relativeX / width) * (points.length - 1));
      const point = points[pointIndex];
      if (!point) return;
      const prices = points.map((item: any) => Number(item.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;
      const height = this.chartHeight - this.chartPadding * 2;
      const pointX =
        this.chartPadding + (pointIndex / (points.length - 1)) * width;
      const pointY =
        this.chartPadding +
        height -
        ((Number(point.price) - minPrice) / priceRange) * height;
      const startPrice = Number(points[0].price) || 0;
      const change = Number(point.price) - startPrice;
      const changePct = startPrice
        ? ((change / startPrice) * 100).toFixed(2)
        : "0.00";
      this.chartTooltip = {
        show: true,
        x: pointX,
        y: pointY,
        price: Number(point.price),
        date: this.formatDate(point.recorded_at),
        change,
        changePct,
      };
    },
    onChartMouseLeave() {
      this.chartTooltip.show = false;
    },
    formatDate(value: string) {
      if (!value) return "";
      return new Date(value).toLocaleString("sk-SK");
    },
    handleClose() {
      this.chartTooltip.show = false;
      this.detailPrices = [];
      this.$emit("close");
    },
  },
});
</script>

<style></style>
