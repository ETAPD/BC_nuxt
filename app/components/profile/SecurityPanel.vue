<template>
  <section class="panel">
    <h2 class="panel-title">Bezpečnosť</h2>
    <div class="security-actions">
      <button class="sec-btn" @click="$emit('open-password')">
        <span class="sec-icon">🔑</span>
        <div>
          <span class="sec-label">Zmeniť heslo</span>
          <span class="sec-desc">Aktualizujte svoje prihlasovacie heslo</span>
        </div>
      </button>

      <button class="sec-btn" @click="$emit('export')">
        <span class="sec-icon">📦</span>
        <div>
          <span class="sec-label">Exportovať dáta</span>
          <span class="sec-desc">Stiahnuť všetky vaše údaje</span>
        </div>
      </button>

      <button class="sec-btn" @click="$emit('logout')">
        <span class="sec-icon">🚪</span>
        <div>
          <span class="sec-label">Odhlásiť sa</span>
          <span class="sec-desc">Ukončiť aktuálnu reláciu</span>
        </div>
      </button>

      <button class="sec-btn sec-btn--danger" @click="$emit('open-delete')">
        <span class="sec-icon">⚠️</span>
        <div>
          <span class="sec-label">Odstrániť účet</span>
          <span class="sec-desc">Nezvratná akcia — všetky dáta budú vymazané</span>
        </div>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SecurityPanel',
  emits: ['open-password', 'export', 'logout', 'open-delete'],
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

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sec-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-family: inherit;
  color: var(--color-text);
}

.sec-btn:hover {
  border-color: var(--color-border-hover);
  background: rgba(59, 130, 246, 0.04);
}

.sec-btn--danger {
  border-color: rgba(239, 68, 68, 0.15);
}

.sec-btn--danger:hover {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}

.sec-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.sec-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-white);
}

.sec-desc {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}
</style>
