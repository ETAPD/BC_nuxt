<script setup lang="ts">
interface PlanDetail {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

const plans: PlanDetail[] = [
  {
    name: "Zadarmo",
    price: "0 €",
    period: "/navždy",
    tagline:
      "Základy simulovaného obchodovania — kreditná karta nie je potrebná",
    features: [
      "1 portfólio simulovaného obchodovania",
      "Oneskoré údaje o akciách (15 min)",
      "Sledovací zoznam 10 akcií",
      "Základný prehľad portfólia",
      "Komunitná podpora",
    ],
    highlight: false,
    cta: "Začať zadarmo",
  },
  {
    name: "Pro",
    price: "29 €",
    period: "/mesiac",
    tagline: "Odomknite plný obchodný zážitok",
    features: [
      "Údaje o akciách v reálnom čase",
      "Neobmedzené simulované obchody",
      "Pokročilé grafy a indikátory",
      "Viacero portfólií",
      "Rozšírený sledovací zoznam (50 akcií)",
      "Prioritná podpora",
    ],
    highlight: true,
    cta: "Prejsť na Pro",
  },
  {
    name: "Elite",
    price: "99 €",
    period: "/mesiac",
    tagline: "Profesionálne nástroje pre pokročilých používateľov",
    features: [
      "Všetko z Pro",
      "API prístup pre automatizované obchodovanie",
      "Pokročilé analýzy a dashboardy",
      "Vlastné cenové upozornenia",
      "Exportovateľné obchodné a výkonnostné reporty",
      "Osobný správca účtu",
    ],
    highlight: false,
    cta: "Prejsť na Elite",
  },
];

interface PlatformFeature {
  icon: string;
  title: string;
  desc: string;
}

const platformFeatures: PlatformFeature[] = [
  {
    icon: "&#128200;",
    title: "Simulované obchodovanie",
    desc: "Cvičte obchodovanie s virtuálnymi peniazmi. Budujte sebadôveru a testujte stratégie bez finančného rizika.",
  },
  {
    icon: "&#128202;",
    title: "Údaje v reálnom čase",
    desc: "Členovia Pro a Elite získajú živé ceny akcií, takže každý simulovaný obchod odráža skutočné trhové podmienky.",
  },
  {
    icon: "&#128203;",
    title: "Pokročilé grafy",
    desc: "Sviečkové grafy, kĺzavé priemery, RSI, MACD a ďalšie — všetko zabudované v platforme.",
  },
  {
    icon: "&#128176;",
    title: "Analytika portfólia",
    desc: "Sledujte zisk a stratu, pozrite si rozdelenie alokácie a porovnajte svoju simulovanú výkonnosť v čase.",
  },
  {
    icon: "&#128268;",
    title: "API prístup",
    desc: "Členovia Elite môžu pripojiť externé nástroje, vytvárať vlastné boty alebo exportovať dáta cez naše REST API.",
  },
  {
    icon: "&#128227;",
    title: "Vlastné upozornenia",
    desc: "Nastavte si cenové ciele a dostávajte upozornenia, keď akcie dosiahnu vaše úrovne — dostupné v pláne Elite.",
  },
];
</script>

<template>
  <div class="services">
    <!-- Hero -->
    <section class="services-hero section">
      <div class="container">
        <span class="hero-badge">Členské plány</span>
        <h1>
          Vyberte si správny plán pre váš<br /><span class="gradient-text"
            >zážitok z obchodovania s akciami</span
          >
        </h1>
        <p class="services-lead">
          Či sa učíte alebo zlepšujete — vyberte si plán, ktorý vyhovuje vašim
          obchodným cieľom.
        </p>
      </div>
    </section>

    <!-- Plans Grid -->
    <section class="plans-section section">
      <div class="container">
        <div class="plans-grid">
          <div
            v-for="plan in plans"
            :key="plan.name"
            class="plan-card"
            :class="{ highlight: plan.highlight }"
          >
            <span v-if="plan.highlight" class="popular-badge"
              >Najpopulárnejší</span
            >
            <h3>{{ plan.name }}</h3>
            <p class="plan-tagline">{{ plan.tagline }}</p>
            <div class="plan-price">
              <span class="price">{{ plan.price }}</span>
              <span class="period">{{ plan.period }}</span>
            </div>
            <ul class="plan-features">
              <li v-for="f in plan.features" :key="f">
                <span class="check">&#10003;</span> {{ f }}
              </li>
            </ul>
            <NuxtLink
              to="/register"
              class="btn"
              :class="plan.highlight ? 'btn-primary' : 'btn-outline'"
              >{{ plan.cta }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Features -->
    <section class="features-section section">
      <div class="container">
        <h2 class="section-title">Čo je zahrnuté</h2>
        <p class="section-subtitle">
          Všetko, čo potrebujete na sledovanie akcií, analýzu a simulované
          obchodovanie.
        </p>
        <div class="features-grid">
          <div
            v-for="feat in platformFeatures"
            :key="feat.title"
            class="card feature-card"
          >
            <span class="feature-icon" v-html="feat.icon"></span>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="process section">
      <div class="container">
        <h2 class="section-title">Ako to funguje</h2>
        <p class="section-subtitle">
          Od registrácie po prvý simulovaný obchod za pár minút.
        </p>
        <div class="process-steps">
          <div class="step">
            <span class="step-num">01</span>
            <h3>Vytvoriť účet</h3>
            <p>
              Zaregistrujte sa za menej ako 60 sekúnd. Bezplatný plán nevyžaduje
              platobné údaje.
            </p>
          </div>
          <div class="step">
            <span class="step-num">02</span>
            <h3>Vybrať si plán</h3>
            <p>
              Začnite zadarmo alebo prejdite na Pro/Elite pre dáta v reálnom
              čase a pokročilé nástroje.
            </p>
          </div>
          <div class="step">
            <span class="step-num">03</span>
            <h3>Vytvoriť sledovací zoznam</h3>
            <p>
              Sledujte akcie, ktoré vás zaujímajú, a monitorujte ich výkonnosť.
            </p>
          </div>
          <div class="step">
            <span class="step-num">04</span>
            <h3>Začať obchodovať</h3>
            <p>
              Realizujte simulované obchody, testujte stratégie a zdožaľujte
              svoje zručnosti bez rizika.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta section">
      <div class="container">
        <div class="cta-box">
          <h2>Pripravení začať obchodovať?</h2>
          <p>
            Vytvorte si bezplatný účet a realizujte svoj prvý simulovaný obchod
            ešte dnes.
          </p>
          <NuxtLink to="/register" class="btn btn-primary"
            >Vytvoriť bezplatný účet</NuxtLink
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.services-hero {
  text-align: center;
  padding-top: 6rem;
}

.hero-badge {
  display: inline-block;
  padding: 0.4rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-full);
  color: #3b82f6;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.services-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.services-lead {
  max-width: 550px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.plan-card {
  position: relative;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.03), transparent);
  border: 1px solid rgba(59, 130, 246, 0.08);
  border-radius: var(--radius-md);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.plan-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
}

.plan-card.highlight {
  border-color: rgba(59, 130, 246, 0.35);
  background: linear-gradient(
    145deg,
    rgba(59, 130, 246, 0.06),
    rgba(59, 130, 246, 0.02)
  );
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.08);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 1rem;
  background: #3b82f6;
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plan-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: var(--color-white);
}

.plan-tagline {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.plan-price {
  margin-bottom: 1.5rem;
}

.price {
  font-size: 2.75rem;
  font-weight: 800;
  color: #3b82f6;
}

.period {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.plan-features li {
  font-size: 0.9rem;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.check {
  color: #3b82f6;
  font-weight: 700;
  font-size: 0.85rem;
}

.plan-card .btn {
  width: 100%;
  justify-content: center;
  text-align: center;
  text-decoration: none;
}

/* Platform Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(59, 130, 246, 0.1);
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
  color: var(--color-text-muted);
  flex: 1;
}

/* Process */
.process-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.step {
  text-align: center;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
}

.step h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.step p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* CTA */
.cta-box {
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(59, 130, 246, 0.03) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-lg);
  padding: 4rem 2rem;
}

.cta-box h2 {
  margin-bottom: 0.75rem;
}

.cta-box p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .services-hero h1 {
    font-size: 2.2rem;
  }
  .plans-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
  .process-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
