<script setup lang="ts">
const team = [
  { name: 'Alex Carter', role: 'CEO a zakladateľ', initials: 'AC' },
  { name: 'Sarah Kim', role: 'Vedúca obchodovania', initials: 'SK' },
  { name: 'James Liu', role: 'CTO', initials: 'JL' },
  { name: 'Maya Patel', role: 'Hlavná kvantitatívna analytička', initials: 'MP' },
]

const values = [
  {
    title: 'Transparentnosť',
    desc: 'Žiadne skryté poplatky, žiadne navýšenie spreadov. Čo vidíte, s tým obchodujete.',
  },
  {
    title: 'Rýchlosť',
    desc: 'Sub-milisekundové smerovanie príkazov a dátové toky v reálnom čase na všetkých trhoch.',
  },
  {
    title: 'Bezpečnosť',
    desc: 'Bankové šifrovanie, studené úložisko a regulačný súlad po celom svete.',
  },
]
</script>

<template>
  <section id="about" class="section about">
    <div class="container">
      <div class="about-intro">
        <span class="badge"><span class="badge-dot"></span> O nás</span>
        <h2>Vytvorené obchodníkmi,<br /><span class="text-green">pre obchodníkov</span></h2>
        <p class="about-lead">
          Sme tím skúsených obchodníkov, kvantitatívnych analytikov a inžinierov s poslaním
          demokratizovať prístup k profesionálnym obchodným nástrojom a finančnej analytike.
        </p>
      </div>

      <div class="values-section">
        <h3 class="section-title">Naše princípy</h3>
        <p class="section-subtitle">Základ každého obchodu na našej platforme.</p>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="card value-card">
            <h4>{{ value.title }}</h4>
            <p>{{ value.desc }}</p>
          </div>
        </div>
      </div>

      <div class="team-section">
        <h3 class="section-title">Náš tím</h3>
        <p class="section-subtitle">Ľudia, ktorí stoja za platformou.</p>
        <div class="team-grid">
          <div v-for="member in team" :key="member.name" class="team-card card">
            <div class="avatar">{{ member.initials }}</div>
            <h4>{{ member.name }}</h4>
            <p>{{ member.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-intro {
  text-align: center;
  margin-bottom: 4rem;
}
.badge {
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
  margin-bottom: 1.5rem;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  display: inline-block;
}
.about-intro h2 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}
.text-green {
  color: #3b82f6;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
}
.about-lead {
  max-width: 650px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
  line-height: 1.8;
}

.values-section {
  margin-bottom: 4rem;
}
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.value-card {
  text-align: center;
  padding: 2.5rem 2rem;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.03), transparent);
  border-color: rgba(59, 130, 246, 0.08);
}
.value-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
}
.value-card h4 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #3b82f6;
}
.value-card p {
  font-size: 0.95rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.team-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.03), transparent);
  border-color: rgba(59, 130, 246, 0.08);
}
.team-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
}
.team-card h4 {
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}
.team-card p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .about-intro h2 {
    font-size: 2.2rem;
  }
  .values-grid {
    grid-template-columns: 1fr;
  }
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
