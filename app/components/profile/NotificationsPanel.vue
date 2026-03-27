<template>
  <section class="panel">
    <h2 class="panel-title">Notifikácie</h2>
    <div class="pref-form">
      <p class="pref-hint">Vyberte, na čo chcete dostávať upozornenia.</p>

      <label class="toggle-row">
        <span class="toggle-switch">
          <input v-model="localPrefs.notify_price_alerts" type="checkbox" />
          <span class="toggle-track"></span>
        </span>
        <div class="toggle-text">
          <span class="toggle-label">Cenové upozornenia</span>
          <span class="toggle-desc">Upozornenie na výrazné zmeny cien aktív</span>
        </div>
      </label>

      <label class="toggle-row">
        <span class="toggle-switch">
          <input v-model="localPrefs.notify_order_filled" type="checkbox" />
          <span class="toggle-track"></span>
        </span>
        <div class="toggle-text">
          <span class="toggle-label">Vyplnené príkazy</span>
          <span class="toggle-desc">Keď sa váš obchodný príkaz vykoná</span>
        </div>
      </label>

      <label class="toggle-row">
        <span class="toggle-switch">
          <input v-model="localPrefs.notify_order_cancelled" type="checkbox" />
          <span class="toggle-track"></span>
        </span>
        <div class="toggle-text">
          <span class="toggle-label">Zrušené príkazy</span>
          <span class="toggle-desc">Keď je príkaz zrušený alebo vyprší</span>
        </div>
      </label>

      <label class="toggle-row">
        <span class="toggle-switch">
          <input v-model="localPrefs.notify_security" type="checkbox" />
          <span class="toggle-track"></span>
        </span>
        <div class="toggle-text">
          <span class="toggle-label">Bezpečnostné upozornenia</span>
          <span class="toggle-desc">Nové prihlásenia a zmeny hesla</span>
        </div>
      </label>
    </div>

    <Transition name="save-bar">
      <div v-if="changed" class="sticky-save-bar">
        <span class="ssb-msg">💾 Chcete uložiť zmeny v notifikáciách?</span>
        <div class="ssb-actions">
          <button class="btn" @click="discard">Zahodiť</button>
          <button class="btn btn-accent" :disabled="saving" @click="emitSave">
            {{ saving ? 'Ukladám…' : 'Uložiť zmeny' }}
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script>
export default {
  name: 'NotificationsPanel',
  props: {
    prefsData: {
      type: Object,
      default() {
        return {
          notify_price_alerts: true,
          notify_order_filled: true,
          notify_order_cancelled: true,
          notify_security: true,
        }
      },
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['save'],
  data() {
    return {
      localPrefs: this.clonePrefs(this.prefsData),
      originalPrefs: this.clonePrefs(this.prefsData),
    }
  },
  computed: {
    changed() {
      return JSON.stringify(this.localPrefs) !== JSON.stringify(this.originalPrefs)
    },
  },
  watch: {
    prefsData: {
      immediate: true,
      deep: true,
      handler(value) {
        this.localPrefs = this.clonePrefs(value)
        this.originalPrefs = this.clonePrefs(value)
      },
    },
  },
  methods: {
    clonePrefs(value) {
      return {
        notify_price_alerts: value && typeof value.notify_price_alerts !== 'undefined' ? value.notify_price_alerts : true,
        notify_order_filled: value && typeof value.notify_order_filled !== 'undefined' ? value.notify_order_filled : true,
        notify_order_cancelled: value && typeof value.notify_order_cancelled !== 'undefined' ? value.notify_order_cancelled : true,
        notify_security: value && typeof value.notify_security !== 'undefined' ? value.notify_security : true,
      }
    },
    discard() {
      this.localPrefs = this.clonePrefs(this.originalPrefs)
    },
    emitSave() {
      this.$emit('save', this.clonePrefs(this.localPrefs))
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

.pref-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pref-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--color-border);
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-switch input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 22px;
}

.toggle-track {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 99px;
  transition: background 0.2s;
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.toggle-switch input:checked + .toggle-track {
  background: var(--color-accent);
}

.toggle-switch input:checked + .toggle-track::after {
  transform: translateX(18px);
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.toggle-label {
  font-size: 0.88rem;
  color: var(--color-text);
  font-weight: 500;
}

.toggle-desc {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.sticky-save-bar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-background-soft);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  z-index: 200;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  min-width: 380px;
  flex-wrap: wrap;
}

.ssb-msg {
  font-size: 0.88rem;
  color: var(--color-text);
  flex: 1;
}

.ssb-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.save-bar-enter-active,
.save-bar-leave-active {
  transition: all 0.25s ease;
}

.save-bar-enter-from,
.save-bar-leave-to {
  opacity: 0;
  transform: translate(-50%, 14px);
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

.btn-accent:hover {
  background: rgba(59, 130, 246, 0.85);
}

@media (max-width: 640px) {
  .sticky-save-bar {
    min-width: 0;
    width: calc(100vw - 2rem);
    bottom: 1rem;
  }
}
</style>
