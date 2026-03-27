<template>
  <section class="panel">
    <div class="panel-header-row">
      <h2 class="panel-title">Správy od administrátora</h2>
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
    </div>

    <div v-if="notifications && notifications.length" class="notif-list">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notif-item', { 'notif-item--unread': !n.is_read }]"
        @click="$emit('read', n)"
      >
        <div v-if="!n.is_read" class="notif-dot"></div>
        <div class="notif-content">
          <span class="notif-title">{{ n.title }}</span>
          <span class="notif-msg">{{ n.message }}</span>
          <span class="notif-time">{{ timeAgo(n.created_at) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-msg">Zatiaľ žiadne správy</div>
  </section>
</template>

<script>
export default {
  name: 'AdminNotificationsPanel',
  props: {
    notifications: {
      type: Array,
      default() {
        return []
      },
    },
  },
  emits: ['read'],
  computed: {
    unreadCount() {
      return this.notifications.filter((item) => !item.is_read).length
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

.panel-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.panel-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
}

.notif-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--color-accent);
  color: #000;
  border-radius: 99px;
  padding: 0.1rem 0.5rem;
  min-width: 1.4rem;
  text-align: center;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.1s;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item--unread {
  background: rgba(var(--color-accent-rgb, 79, 140, 255), 0.05);
  border-radius: var(--radius-sm);
  padding-left: 0.5rem;
}

.notif-dot {
  flex-shrink: 0;
  margin-top: 0.35rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
}

.notif-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.notif-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

.notif-msg {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.45;
  white-space: pre-line;
}

.notif-time {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}

.empty-msg {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  text-align: center;
  padding: 1.5rem 0;
}
</style>
