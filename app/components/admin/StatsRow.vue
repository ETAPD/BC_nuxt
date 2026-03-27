<template>
  <section class="stats-row">
    <div class="stat-card">
      <span class="stat-num">{{ usersCount }}</span>
      <span class="stat-label">Používatelia</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ portfoliosCount }}</span>
      <span class="stat-label">Portfóliá</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ ordersCount }}</span>
      <span class="stat-label">Príkazy</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ tradesCount }}</span>
      <span class="stat-label">Obchody</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ holdingsCount }}</span>
      <span class="stat-label">Držby</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">{{ ticketsCount }}</span>
      <span class="stat-label">Tikety</span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatsRow',
  props: {
    usersCount: { type: Number, required: true },
    portfoliosCount: { type: Number, required: true },
    ordersCount: { type: Number, required: true },
    tradesCount: { type: Number, required: true },
    holdingsCount: { type: Number, required: true },
    ticketsCount: { type: Number, required: true },
  },
})
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.stat-num {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
}
.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 700px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
