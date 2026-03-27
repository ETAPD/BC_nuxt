<template>
  <section class="admin-panel">
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="Hľadať podľa mena, e-mailu alebo ID…" />
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Meno</th>
            <th>E-mail</th>
            <th>Mena</th>
            <th>Stav</th>
            <th>Členstvo</th>
            <th>Vytvorené</th>
            <th class="th-actions">Akcie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td class="bold">{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.preferred_currency }}</td>
            <td>
              <span :class="['status-badge', 'status-' + (user.status || 'active')]">
                {{ user.status }}
              </span>
            </td>
            <td>
              <span :class="['role-badge', 'role-' + (user.role || 'basic')]">
                {{ user.role || 'basic' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions-cell">
              <button type="button" class="btn btn-sm" @click="$emit('manage-user', user)">
                Spravovať
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="empty-table">Žiadni používatelia.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'UsersPanel',
  emits: ['manage-user'],
  props: {
    users: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: '',
    }
  },
  computed: {
    filteredUsers(): any[] {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return this.users
      return this.users.filter((user: any) => {
        return (
          user.email?.toLowerCase().includes(q) ||
          user.full_name?.toLowerCase().includes(q) ||
          String(user.user_id).includes(q)
        )
      })
    },
  },
  methods: {
    formatDate(value: string) {
      if (!value) return '—'
      return new Date(value).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
})
</script>

<style scoped>
.admin-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}
.search-bar {
  margin-bottom: 1rem;
}
.search-bar input {
  width: 100%;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.85rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-bar input:focus {
  border-color: var(--color-accent);
}
.table-wrapper {
  max-height: 520px;
  overflow-y: auto;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.admin-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  vertical-align: middle;
  position: sticky;
  top: 0;
  background: var(--color-background-soft);
  z-index: 1;
}
.admin-table td {
  padding: 0.75rem;
  color: var(--color-text);
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  vertical-align: middle;
}
.admin-table tr:hover td {
  background: rgba(59, 130, 246, 0.03);
}
.bold {
  font-weight: 700;
  color: var(--color-white);
}
.status-badge,
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.status-active,
.status-admin {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.status-suspended,
.status-inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.role-basic {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-accent);
}
.role-pro {
  background: rgba(168, 85, 247, 0.12);
  color: #a78bfa;
}
.role-premium,
.role-admin {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.th-actions {
  text-align: right;
  white-space: nowrap;
}
.actions-cell {
  text-align: right;
  white-space: nowrap;
  width: 1%;
}
.btn {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn:hover {
  color: var(--color-accent);
  background: rgba(59, 130, 246, 0.08);
}
.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}
.empty-table {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
