<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookie_consent')
  if (!consent) {
    visible.value = true
  }
})

function accept() {
  localStorage.setItem('cookie_consent', 'accepted')
  visible.value = false
}

function decline() {
  localStorage.setItem('cookie_consent', 'declined')
  visible.value = false
}
</script>

<template>
  <Transition name="cookie-slide">
    <div v-if="visible" class="cookie-banner">
      <div class="cookie-inner">
        <div class="cookie-text">
          <span class="cookie-icon">🍪</span>
          <p>
            Táto stránka používa cookies na zlepšenie vášho zážitku. Používaním stránky súhlasíte s
            naším
            <a href="#" @click.prevent>používaním cookies</a>.
          </p>
        </div>
        <div class="cookie-actions">
          <button class="btn-decline" @click="decline">Odmietnuť</button>
          <button class="btn-accept" @click="accept">Prijať</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--color-background-soft, #1a1a2e);
  border-top: 1px solid var(--color-border, rgba(59, 130, 246, 0.15));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.cookie-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cookie-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.cookie-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.cookie-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text, #ccc);
  line-height: 1.5;
}

.cookie-text a {
  color: #3b82f6;
  text-decoration: underline;
}

.cookie-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-decline {
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid var(--color-border, rgba(59, 130, 246, 0.15));
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted, #888);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-decline:hover {
  color: var(--color-white, #fff);
  border-color: var(--color-text-muted, #888);
}

.btn-accept {
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept:hover {
  background: #2563eb;
}

.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .cookie-inner {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }
  .cookie-text {
    justify-content: center;
  }
  .cookie-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
