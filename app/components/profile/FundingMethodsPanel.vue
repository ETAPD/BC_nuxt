<template>
  <section class="panel">
    <div class="panel-header-row">
      <h2 class="panel-title">Platobné metódy</h2>
      <button class="btn btn-sm" @click="toggleAdd">
        {{ showAddFunding ? '✕' : '+ Pridať' }}
      </button>
    </div>

    <div v-if="showAddFunding" class="funding-form">
      <div class="ff-row">
        <label>Typ</label>
        <select v-model="newFunding.method_type">
          <option value="bank">Banka</option>
          <option value="card">Karta</option>
          <option value="crypto">Krypto</option>
        </select>
      </div>

      <div class="ff-row">
        <label>Názov</label>
        <input
          v-model="newFunding.label"
          type="text"
          placeholder="napr. Slovenská sporiteľňa"
        />
      </div>

      <div class="ff-row">
        <label>Posledné 4 číslice</label>
        <input
          v-model="newFunding.last_four"
          type="text"
          maxlength="4"
          placeholder="1234"
          @input="sanitizeLastFour"
        />
      </div>

      <label class="default-row">
        <input v-model="newFunding.is_default" type="checkbox" />
        <span class="toggle-label">Predvolená metóda</span>
      </label>

      <button class="btn btn-accent" :disabled="saving" @click="submitAdd">
        {{ saving ? 'Pridávam…' : 'Pridať metódu' }}
      </button>
    </div>

    <div v-if="methodsList && methodsList.length" class="funding-list">
      <div v-for="fm in methodsList" :key="fm.funding_id" class="funding-item">
        <span class="fm-icon">{{ fundingIcon(fm.method_type) }}</span>
        <div class="fm-info">
          <span class="fm-label">{{ fm.label }}</span>
          <span class="fm-detail">
            {{ fm.method_type }} {{ fm.last_four ? `•••• ${fm.last_four}` : '' }}
          </span>
        </div>
        <span v-if="fm.is_default" class="fm-default">Predvolená</span>
        <button class="fm-remove" title="Odstrániť" @click="$emit('remove', fm.funding_id)">
          ✕
        </button>
      </div>
    </div>

    <div v-else-if="!showAddFunding" class="empty-msg">Žiadne platobné metódy</div>
  </section>
</template>

<script>
export default {
  name: 'FundingMethodsPanel',
  props: {
    methodsList: {
      type: Array,
      default() {
        return []
      },
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['add', 'remove'],
  data() {
    return {
      showAddFunding: false,
      newFunding: this.getEmptyFunding(),
    }
  },
  methods: {
    getEmptyFunding() {
      return {
        method_type: 'bank',
        label: '',
        last_four: '',
        is_default: false,
      }
    },
    toggleAdd() {
      this.showAddFunding = !this.showAddFunding
      if (!this.showAddFunding) {
        this.newFunding = this.getEmptyFunding()
      }
    },
    sanitizeLastFour() {
      this.newFunding.last_four = String(this.newFunding.last_four || '').replace(/\D/g, '').slice(0, 4)
    },
    fundingIcon(type) {
      if (type === 'bank') return '🏦'
      if (type === 'card') return '💳'
      if (type === 'crypto') return '₿'
      return '💰'
    },
    submitAdd() {
      if (!this.newFunding.label.trim()) return
      this.$emit('add', { ...this.newFunding, label: this.newFunding.label.trim() })
      this.newFunding = this.getEmptyFunding()
      this.showAddFunding = false
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

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-background-mute);
  color: var(--color-white);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--color-border-hover);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.funding-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1rem;
  padding: 0.85rem;
  background: rgba(59, 130, 246, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.ff-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ff-row label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.ff-row input,
.ff-row select {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  color: var(--color-white);
  font-family: inherit;
  font-size: 0.88rem;
}

.ff-row select option {
  background: var(--color-background);
  color: var(--color-white);
}

.default-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.toggle-label {
  font-size: 0.88rem;
  color: var(--color-text);
  font-weight: 500;
}

.funding-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.funding-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.fm-icon {
  font-size: 1.2rem;
}

.fm-info {
  flex: 1;
  min-width: 0;
}

.fm-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-white);
}

.fm-detail {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

.fm-default {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
}

.fm-remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  transition: color 0.15s;
}

.fm-remove:hover {
  color: #ef4444;
}

.empty-msg {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  text-align: center;
  padding: 1.5rem 0;
}
</style>
