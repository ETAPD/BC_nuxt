<script setup lang="ts">
const stats = [
  { value: '99,9%', label: 'Dostupnosť' },
  { value: '<10ms', label: 'Vykonanie' },
  { value: '50K+', label: 'Obchodníci' },
  { value: '24/7', label: 'Trhy' },
]

const features = [
  {
    icon: '\u{1F4C8}',
    title: 'Grafy v reálnom čase',
    desc: 'Pokročilé sviečkové grafy s technickými indikátormi, nástrojmi na kreslenie a viacčasovou analýzou.',
  },
  {
    icon: '\u{1F4B0}',
    title: 'Nákup / Predaj',
    desc: 'Trhové, limitné a stop príkazy s okamžitým vykonaním. Spravujte pozície jedným kliknutím.',
  },
  {
    icon: '\u{1F440}',
    title: 'Inteligentný sledovací zoznam',
    desc: 'Sledujte obľúbené aktíva s vlastnými upozorneniami, cenovými cieľmi a notifikáciami v reálnom čase.',
  },
  {
    icon: '\u{1F512}',
    title: 'Bezpečné účty',
    desc: 'Dvojfaktorová autentifikácia, šifrované dáta a podniková úroveň zabezpečenia pre vaše prostriedky.',
  },
  {
    icon: '\u{1F451}',
    title: 'Členské úrovne',
    desc: 'Plány Zadarmo, Pro a Elite — od základov simulovaného obchodovania po dáta v reálnom čase, pokročilé grafy a API prístup.',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Analytika portfólia',
    desc: 'Podrobné sledovanie zisku a straty, metriky rizík, sektorová expozícia a porovnávanie výkonnosti.',
  },
]
</script>

<template>
  <section id="features" class="section">
    <div class="container">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>

      <div class="features-header">
        <span class="section-badge"><span class="badge-dot"></span> Funkcie platformy</span>
        <h2 class="section-title">
          Všetko, čo potrebujete na <span class="text-green">obchodovanie</span>
        </h2>
        <p class="section-subtitle">
          Profesionálne nástroje navrhnuté pre začiatočníkov aj pokročilých obchodníkov.
        </p>
      </div>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="card feature-card">
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.04), rgba(59, 130, 246, 0.01));
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  margin-bottom: 5rem;
}
.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.features-header {
  text-align: center;
  margin-bottom: 3rem;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  display: inline-block;
}
.text-green {
  color: #3b82f6;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.feature-card {
  text-align: left;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.03), transparent);
  border-color: rgba(59, 130, 246, 0.08);
}
.feature-card:hover {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.06);
}
.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: var(--radius-sm);
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
}
.feature-card h3 {
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
}
.feature-card p {
  font-size: 0.9rem;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
