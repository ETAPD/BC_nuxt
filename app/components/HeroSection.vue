<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const tickerItems = [
  { symbol: 'BTC/USD', price: '67,842.50', change: '+3.24%', up: true },
  { symbol: 'ETH/USD', price: '3,521.80', change: '+1.87%', up: true },
  { symbol: 'AAPL', price: '189.34', change: '-0.52%', up: false },
  { symbol: 'TSLA', price: '248.92', change: '+2.11%', up: true },
  { symbol: 'EUR/USD', price: '1.0842', change: '-0.15%', up: false },
  { symbol: 'GOLD', price: '2,341.60', change: '+0.78%', up: true },
]

const portfolioValue = ref(0)
const targetValue = 1247835
let animFrame: number

function animateCounter() {
  const duration = 2000
  const start = performance.now()
  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    portfolioValue.value = Math.floor(eased * targetValue)
    if (progress < 1) animFrame = requestAnimationFrame(step)
  }
  animFrame = requestAnimationFrame(step)
}

onMounted(() => animateCounter())
onUnmounted(() => cancelAnimationFrame(animFrame))
</script>

<template>
  <section id="hero" class="hero">
    <div class="hero-bg">
      <div class="hero-glow"></div>
      <div class="hero-grid"></div>
    </div>

    <div class="ticker-bar">
      <div class="ticker-track">
        <div v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i" class="ticker-item">
          <span class="ticker-symbol">{{ item.symbol }}</span>
          <span class="ticker-price">{{ item.price }}</span>
          <span class="ticker-change" :class="item.up ? 'up' : 'down'">{{ item.change }}</span>
        </div>
      </div>
    </div>

    <div class="container hero-content">
      <span class="hero-badge">
        <span class="badge-dot"></span>
        Živá obchodná platforma
      </span>
      <h1 class="hero-title">
        Obchodujte múdrejšie.<br />
        <span class="gradient-text">Profitujte rýchlejšie.</span>
      </h1>
      <p class="hero-desc">
        Trhové dáta v reálnom čase, pokročilé vykonávanie príkazov a výkonná správa portfólia.
        Pridajte sa k tisícom obchodníkov budujúcich svoju finančnú budúcnosť.
      </p>

      <div class="hero-dashboard">
        <div class="dash-card">
          <span class="dash-label">Hodnota portfólia</span>
          <span class="dash-value">${{ portfolioValue.toLocaleString() }}</span>
          <span class="dash-change up">+12,4 % tento mesiac</span>
        </div>
        <div class="dash-card">
          <span class="dash-label">Otvorené príkazy</span>
          <span class="dash-value">7</span>
          <span class="dash-change">3 nákup &middot; 4 predaj</span>
        </div>
        <div class="dash-card">
          <span class="dash-label">Sledovací zoznam</span>
          <span class="dash-value">24</span>
          <span class="dash-change up">5 na signáli</span>
        </div>
      </div>

      <div class="hero-actions">
        <button class="btn btn-primary" @click="scrollTo('contact')">Začať obchodovať</button>
        <button class="btn btn-outline" @click="scrollTo('features')">Zobraziť funkcie</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero-glow {
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 900px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

.ticker-bar {
  position: relative;
  z-index: 2;
  width: 100%;
  overflow: hidden;
  background: rgba(59, 130, 246, 0.04);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  padding: 0.6rem 0;
  margin-top: 4rem;
}
.ticker-track {
  display: flex;
  gap: 2.5rem;
  animation: scroll-ticker 30s linear infinite;
  width: max-content;
}
@keyframes scroll-ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.ticker-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-size: 0.8rem;
}
.ticker-symbol {
  color: var(--color-white);
  font-weight: 700;
}
.ticker-price {
  color: var(--color-text-muted);
}
.ticker-change.up {
  color: #22c55e;
}
.ticker-change.down {
  color: #ef4444;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 4rem 2rem 6rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.25rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-full);
  color: #3b82f6;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 2rem;
  letter-spacing: 0.02em;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.hero-title {
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}
.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc {
  max-width: 580px;
  margin: 0 auto 2.5rem;
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--color-text-muted);
}

.hero-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 640px;
}
.dash-card {
  background: rgba(59, 130, 246, 0.04);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: var(--radius-md);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}
.dash-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-weight: 600;
}
.dash-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-white);
}
.dash-change {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.dash-change.up {
  color: #22c55e;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-desc {
    font-size: 1rem;
  }
  .hero-dashboard {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
  .ticker-bar {
    margin-top: 3.5rem;
  }
}
</style>
