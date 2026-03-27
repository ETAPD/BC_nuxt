<template>
  <section class="panel holdings-panel">
    <h2 class="panel-title">Držané aktíva</h2>
    <div class="table-wrapper">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Aktívum</th>
            <th>Množstvo</th>
            <th>Cena</th>
            <th>24h</th>
            <th>Hodnota</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="holding in normalizedHoldings"
            :key="holding.holding_id"
            class="holding-row"
            @click="$emit('asset-click', holding)"
          >
            <td>
              <div class="asset-cell">
                <img
                  v-if="holding.image_url && !imageErrors[holding.holding_id]"
                  :src="holding.image_url"
                  :alt="holding.symbol"
                  class="asset-img"
                  @error="markImageError(holding.holding_id)"
                />
                <span v-else class="asset-img-placeholder">{{ holding.symbol?.slice(0, 2) }}</span>
                <div class="asset-info">
                  <span class="asset-symbol">{{ holding.symbol }}</span>
                  <span class="asset-name">{{ holding.asset_name }}</span>
                </div>
              </div>
            </td>
            <td>{{ holding.amount }}</td>
            <td>{{ formatCurrency(holding.current_price) }}</td>
            <td :class="holding.change_24h >= 0 ? 'up' : 'down'">
              {{ formatPercent(holding.change_24h) }}
            </td>
            <td class="bold">{{ formatCurrency(holding.value) }}</td>
          </tr>
          <tr v-if="!normalizedHoldings.length">
            <td colspan="5" class="empty-msg" style="text-align: center; padding: 2rem 0">
              Zatiaľ nemáte žiadne držané aktíva
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HoldingsPanel',
  emits: ['asset-click'],
  props: {
    holdings: { type: Array, default: () => [] },
    formatCurrency: { type: Function, required: true },
  },
  data() {
    return {
      imageErrors: {} as Record<string | number, boolean>,
    }
  },
  computed: {
    normalizedHoldings(): any[] {
      return (this.holdings as any[]).map((holding: any) => ({
        ...holding,
        amount: holding.amount ?? 0,
        current_price: holding.current_price ?? 0,
        value: holding.value ?? 0,
        change_24h: Number(holding.change_24h ?? 0),
      }))
    },
  },
  methods: {
    markImageError(id: string | number) {
      this.imageErrors = {
        ...this.imageErrors,
        [id]: true,
      }
    },

    formatPercent(value: number) {
      const numeric = Number(value || 0)
      return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(4)}%`
    },
  },
})
</script>

<style>
</style>
