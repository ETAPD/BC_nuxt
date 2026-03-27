<template>
  <section class="panel">
    <h2 class="panel-title">Prehľad účtu</h2>
    <div class="summary-grid">
      <div class="sg-item">
        <span class="sg-label">Stav účtu</span>
        <span :class="['sg-value', 'status-text-' + ((user && user.status) || 'active')]">
          {{ (user && user.status) || 'active' }}
        </span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Členstvo</span>
        <span class="sg-value capitalize">{{ (user && user.role) || 'basic' }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Členom od</span>
        <span class="sg-value">{{ formatDate(user && user.created_at) }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Portfóliá</span>
        <span class="sg-value">{{ portfolioCount }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Otvorené príkazy</span>
        <span class="sg-value">{{ openOrdersCount }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Dokončené obchody</span>
        <span class="sg-value">{{ completedTradesCount }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Sledovací zoznam</span>
        <span class="sg-value">{{ watchlistCount }}</span>
      </div>
      <div class="sg-item">
        <span class="sg-label">Držané aktíva</span>
        <span class="sg-value">{{ holdingsCount }}</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AccountSummaryPanel',
  props: {
    user: {
      type: Object,
      default: null,
    },
    portfolioCount: {
      type: Number,
      default: 0,
    },
    openOrdersCount: {
      type: Number,
      default: 0,
    },
    completedTradesCount: {
      type: Number,
      default: 0,
    },
    watchlistCount: {
      type: Number,
      default: 0,
    },
    holdingsCount: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    formatDate(value) {
      if (!value) return '—'
      return new Date(value).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.35rem;
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.sg-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sg-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.sg-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-white);
}

.sg-value.capitalize {
  text-transform: capitalize;
}

.status-text-active {
  color: #22c55e;
}
.status-text-suspended {
  color: #f59e0b;
}
.status-text-admin {
  color: #ef4444;
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
