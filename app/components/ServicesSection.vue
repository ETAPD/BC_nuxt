<script setup lang="ts">
// Sekcia sluzieb - plany a proces
const router = useRouter();

function goToDashboard() {
  router.push({ name: "dashboard" });
}

interface Plan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

// Cenove plany
const plans: Plan[] = [
  {
    name: "Zadarmo",
    price: "0 €",
    period: "/navždy",
    tagline: "Začnite jednoducho so sledovaním trhu a portfólia",
    features: [
      "1 investičné portfólio",
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
    tagline: "Pre vážnych obchodníkov, ktorí chcú plný zážitok",
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
    tagline: "Plný prístup s analytikou, upozorneniami a API",
    features: [
      "Všetko z Pro",
      "API prístup",
      "Pokročilé analýzy a reporty",
      "Vlastné cenové upozornenia",
      "Exportovateľné obchodné reporty",
      "Osobný správca účtu",
    ],
    highlight: false,
    cta: "Prejsť na Elite",
  },
];

// Kroky procesu
const steps = [
  {
    num: "01",
    title: "Vytvorte účet",
    desc: "Zaregistrujte sa za menej ako 60 sekúnd. Bezplatný plán nevyžaduje kreditnú kartu.",
  },
  {
    num: "02",
    title: "Vyberte si plán",
    desc: "Začnite zadarmo alebo odomknite funkcie Pro a Elite pre hlbší obchodný zážitok.",
  },
  {
    num: "03",
    title: "Vytvorte sledovací zoznam",
    desc: "Sledujte akcie, ktoré vás zaujímajú, s reálnymi alebo oneskorými dátami podľa vášho plánu.",
  },
  {
    num: "04",
    title: "Začnite obchodovať",
    desc: "Realizujte simulované obchody, analyzujte svoju výkonnosť a zdožaľujte svoju stratégiu bez rizika.",
  },
];
</script>

<template>
  <section id="services" class="section services">
    <div class="container">
      <div class="services-intro">
        <span class="badge"><span class="badge-dot"></span> Členstvo</span>
        <h2>
          Plány pre sledovanie akcií, analýzu a
          <span class="text-green">obchodovanie</span>
        </h2>
        <p class="services-lead">
          Vyberte si správny plán pre váš zážitok z obchodovania s akciami.
          Žiadne skryté poplatky.
        </p>
      </div>

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
          <button
            class="btn"
            :class="plan.highlight ? 'btn-primary' : 'btn-outline'"
            @click="goToDashboard"
          >
            {{ plan.cta }}
          </button>
        </div>
      </div>

      <div class="process">
        <h3 class="section-title">Ako to funguje</h3>
        <p class="section-subtitle">
          Od registrácie po prvý simulovaný obchod za pár minút.
        </p>
        <div class="process-steps">
          <div v-for="step in steps" :key="step.num" class="step">
            <span class="step-num">{{ step.num }}</span>
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services-intro {
  text-align: center;
  margin-bottom: 3rem;
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
.services-intro h2 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}
.text-green {
  color: #3b82f6;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
}
.services-lead {
  max-width: 550px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

/* Plans */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 5rem;
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
}

/* Process */
.process {
  margin-top: 2rem;
}
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
.step h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.step p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .services-intro h2 {
    font-size: 2.2rem;
  }
  .plans-grid {
    grid-template-columns: 1fr;
  }
  .process-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
