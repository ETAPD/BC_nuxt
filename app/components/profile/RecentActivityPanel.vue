<template>
  <section class="panel">
    <h2 class="panel-title">Nedávna aktivita</h2>

    <div v-if="items && items.length" class="activity-list">
      <div v-for="(item, index) in items" :key="index" class="activity-item">
        <span class="act-icon">{{ item.icon }}</span>
        <div class="act-info">
          <span class="act-label">{{ item.label }}</span>
          <span class="act-detail">{{ item.detail }}</span>
        </div>
        <span class="act-time">{{ timeAgo(item.time) }}</span>
      </div>
    </div>

    <div v-else class="empty-msg">Zatiaľ žiadna aktivita</div>
  </section>
</template>

<script>
export default {
  name: 'RecentActivityPanel',
  props: {
    items: {
      type: Array,
      default() {
        return []
      },
    },
  },
  methods: {
    timeAgo(dateStr) {
      if (!dateStr) return '—'
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Práve teraz'
      if (mins < 60) return `pred ${mins} min`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `pred ${hrs} hod`
      return `pred ${Math.floor(hrs / 24)} d`
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.act-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.act-info {
  flex: 1;
  min-width: 0;
}

.act-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-white);
}

.act-detail {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.act-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.empty-msg {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  text-align: center;
  padding: 1.5rem 0;
}
</style>
