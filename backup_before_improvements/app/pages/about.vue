<script setup lang="ts">
const team = [
  { name: 'Alex Carter', role: 'CEO a zakladateľ', initials: 'AC' },
  { name: 'Sarah Kim', role: 'Hlavná dizajnérka', initials: 'SK' },
  { name: 'James Liu', role: 'CTO', initials: 'JL' },
  { name: 'Maya Patel', role: 'Hlavná vývojárka', initials: 'MP' },
]

const values = [
  {
    title: 'Inovácia',
    desc: 'Posúvame hranice a späť konvencie, aby sme priniesli prelomové riešenia.',
  },
  {
    title: 'Kvalita',
    desc: 'Každý riadok kódu, každý pixel je vytvorený s precíznosťou a starostlivosťou.',
  },
  { title: 'Transparentnosť', desc: 'Otvorená komunikácia a čestná spolupráca sú naším základom.' },
]
</script>

<template>
  <div class="about">
    <!-- Hero -->
    <section class="about-hero section">
      <div class="container">
        <span class="hero-badge">O nás</span>
        <h1>Budujeme<br /><span class="gradient-text">budúcnosť webu</span></h1>
        <p class="about-lead">
          Sme tím vášnivých inžinierov, dizajnérov a stratégov oddanej tvorbe výnimočných
          digitálnych zážitkov, ktoré posúvajú hranice možného.
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="values section">
      <div class="container">
        <h2 class="section-title">Naše hodnoty</h2>
        <p class="section-subtitle">Princípy, ktorými sa riadime vo všetkom, čo robíme.</p>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="card value-card">
            <h3>{{ value.title }}</h3>
            <p>{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="team section">
      <div class="container">
        <h2 class="section-title">Spoznajte tím</h2>
        <p class="section-subtitle">Ľudia, ktorí stoja za produktom.</p>
        <div class="team-grid">
          <div v-for="member in team" :key="member.name" class="team-card card">
            <div class="avatar">{{ member.initials }}</div>
            <h3>{{ member.name }}</h3>
            <p>{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-hero {
  text-align: center;
  padding-top: 6rem;
}

.hero-badge {
  display: inline-block;
  padding: 0.4rem 1.25rem;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  border-radius: var(--radius-full);
  color: var(--color-accent);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.about-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-lead {
  max-width: 650px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
  line-height: 1.8;
}

/* Values */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.value-card {
  text-align: center;
  padding: 2.5rem 2rem;
}

.value-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--color-accent);
}

.value-card p {
  font-size: 0.95rem;
}

/* Team */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.team-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-white);
}

.team-card h3 {
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.team-card p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .about-hero h1 {
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
