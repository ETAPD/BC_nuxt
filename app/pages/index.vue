<script setup lang="ts">
// Domovska stranka - hero, platformove funkcie, recenzie, kontakt
useHead({
  title: "TradeProjekt — Investičná platforma",
  meta: [
    { name: "description", content: "Simulované obchodovanie s akciami, kryptomenami a ETF. Začnite zadarmo." },
    { name: "og:title", content: "TradeProjekt — Investičná platforma" },
    { name: "og:description", content: "Simulované obchodovanie s akciami, kryptomenami a ETF." },
  ],
});

const router = useRouter();

// Navigacia na dashboard
function goToDashboard() {
  router.push("/dashboard");
}

// Typy
type NavLink = {
  name: string;
  target: string;
};

type MarketItem = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
};

type FeatureCard = {
  title: string;
  description: string;
  tag: string;
};

type PlatformPoint = {
  title: string;
  description: string;
};

// Staticke data
const navLinks: NavLink[] = [
  { name: "Domov", target: "hero" },
  { name: "Funkcie", target: "features" },
  { name: "O nás", target: "about" },
  { name: "Členstvo", target: "services" },
  { name: "Referencie", target: "comments" },
  { name: "Kontakt", target: "contact" },
];

const marketItems: MarketItem[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    price: "$214.32",
    change: "+2.14%",
    positive: true,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$972.11",
    change: "+4.86%",
    positive: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: "$441.08",
    change: "+1.28%",
    positive: true,
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: "$186.49",
    change: "-1.18%",
    positive: false,
  },
];

const featureCards: FeatureCard[] = [
  {
    tag: "Realtime",
    title: "Dáta a watchlist bez zbytočného chaosu",
    description:
      "Sledujte vybrané akcie, ETF aj kryptomeny na jednom mieste a majte svoje obľúbené tituly vždy po ruke.",
  },
  {
    tag: "Charting",
    title: "Prehľadné grafy a jasná analýza",
    description:
      "Pracujte s čistou vizualizáciou trendov, porovnávajte vývoj aktív a analyzujte pohyb trhu bez zbytočného rozptyľovania.",
  },
  {
    tag: "Portfolio",
    title: "Prehľad portfólia a výkonu v jednom toku",
    description:
      "Majte pod kontrolou celkovú hodnotu účtu, denný výsledok aj vývoj otvorených pozícií bez zdĺhavého prepínania.",
  },
];

const platformPoints: PlatformPoint[] = [
  {
    title: "Pokročilé rozhranie",
    description:
      "Moderný fintech dizajn, ktorý zostáva čitateľný, prehľadný a pohodlný aj pri dlhšom používaní.",
  },
  {
    title: "Rýchla orientácia",
    description:
      "Hierarchia obsahu je navrhnutá tak, aby používateľ okamžite videl najdôležitejšie informácie o trhu aj portfóliu.",
  },
  {
    title: "Pripravené na dashboard",
    description:
      "Platformu možno ďalej rozširovať o reálne trhové dáta, nové nástroje a detailnejšie analytické prehľady.",
  },
];

const heroMainImage = "/assets/img/Futures-in-Stock-Market.webp";
const heroSecondaryImage = "/assets/img/hero-trading.png";
const platformImage = "/assets/img/Trading-account.png";
const splitImage = "/assets/img/chart-trading.png";

// Scroll na sekciu
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <div class="app-wrapper">
    <NavBar />

    <main>
      <section id="hero" class="hero-section">
        <div class="hero-bg" aria-hidden="true">
          <div class="bg-blur bg-blur-1"></div>
          <div class="bg-blur bg-blur-2"></div>
          <div class="bg-grid"></div>
        </div>

        <div class="page-container hero-layout">
          <div class="hero-copy">
            <p class="eyebrow">STOCKS · ETF · CRYPTO</p>
            <h1>
              Obchodujte inteligentne s
              <span>prehľadnou a modernou platformou</span>
              pre každý typ investora.
            </h1>
            <p class="hero-text">
              Sledujte akcie, ETF a kryptomeny na jednom mieste. Získajte rýchly
              prehľad o trhu, analyzujte vývoj cien a spravujte svoje portfólio
              v rozhraní navrhnutom pre každodenné obchodovanie aj dlhodobé
              investovanie.
            </p>

            <div class="hero-actions">
              <button class="btn btn-primary" @click="goToDashboard">
                Začať obchodovať
              </button>
              <button class="btn btn-secondary" @click="scrollTo('features')">
                Pozrieť platformu
              </button>
            </div>

            <div class="hero-stats">
              <div class="hero-stat">
                <strong>120+</strong>
                <span>trhov na sledovanie</span>
              </div>
              <div class="hero-stat">
                <strong>99.9%</strong>
                <span>stabilita rozhrania</span>
              </div>
              <div class="hero-stat">
                <strong>24/7</strong>
                <span>prehľad o trhu</span>
              </div>
            </div>
          </div>

          <div class="hero-media">
            <div class="hero-image-card hero-image-card-main">
              <img :src="heroMainImage" alt="Rast trhu a obchodný graf" />
              <div class="floating-card floating-card-top">
                <span class="floating-label">Signal</span>
                <strong>BUY momentum</strong>
                <small>NVDA · 5m trend</small>
              </div>
            </div>

            <div class="mini-market-card">
              <div class="mini-card-header">
                <span class="mini-label">Market overview</span>
                <span class="mini-live"><i></i> Live</span>
              </div>

              <div class="mini-market-list">
                <div
                  v-for="asset in marketItems"
                  :key="asset.symbol"
                  class="mini-market-row"
                >
                  <div>
                    <strong>{{ asset.symbol }}</strong>
                    <p>{{ asset.name }}</p>
                  </div>
                  <div class="mini-market-right">
                    <strong>{{ asset.price }}</strong>
                    <span
                      :class="[
                        'change-pill',
                        asset.positive ? 'positive' : 'negative',
                      ]"
                    >
                      {{ asset.change }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="platform-section">
        <div class="page-container">
          <div class="section-heading">
            <span class="section-kicker">Platforma</span>
            <h2>Všetko, čo potrebujete na obchodovanie</h2>
            <p>
              Naša platforma spája trhové dáta, prehľadné grafy a správu
              portfólia do jedného prostredia. Vďaka tomu máte dôležité
              informácie vždy po ruke a môžete reagovať na pohyby trhu rýchlo a
              s istotou.
            </p>
          </div>

          <div class="feature-highlight">
            <div class="feature-visual">
              <img
                :src="platformImage"
                alt="Trading účet a buy sell rozhranie"
              />
              <div class="feature-badge">
                <span>Trend strength</span>
                <strong>+12.8%</strong>
              </div>
            </div>

            <div class="feature-content">
              <div class="info-card">
                <span class="info-eyebrow">Market view</span>
                <h3>Majte trh pod kontrolou v reálnom čase</h3>
                <p>
                  Získajte okamžitý prehľad o vývoji cien, sledujte
                  najdôležitejšie pohyby na trhu a pracujte s informáciami v
                  rozhraní, ktoré je navrhnuté tak, aby bolo rýchle,
                  zrozumiteľné a pripravené na každodenné rozhodovanie.
                </p>
              </div>

              <div class="points-list">
                <div
                  v-for="point in platformPoints"
                  :key="point.title"
                  class="point-item"
                >
                  <span class="point-dot"></span>
                  <div>
                    <h4>{{ point.title }}</h4>
                    <p>{{ point.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="feature-grid">
            <article
              v-for="card in featureCards"
              :key="card.title"
              class="feature-card"
            >
              <span class="card-tag">{{ card.tag }}</span>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
              <a href="#" @click.prevent="scrollTo('contact')">Zistiť viac</a>
            </article>
          </div>

          <div class="platform-split">
            <div class="split-copy">
              <span class="section-kicker">Rozhranie</span>
              <h3>Rozhranie vytvorené pre rýchle rozhodovanie</h3>
              <p>
                Každá časť platformy je navrhnutá tak, aby používateľ rýchlo
                našiel to, čo potrebuje — od sledovaných titulov, cez aktuálne
                signály, až po výkon portfólia. Výsledkom je čisté a
                profesionálne prostredie vhodné pre začiatočníkov aj pokročilých
                investorov.
              </p>

              <div class="metrics-row">
                <div class="metric-card">
                  <span>Watchlists</span>
                  <strong>12</strong>
                </div>
                <div class="metric-card">
                  <span>Signals</span>
                  <strong>38</strong>
                </div>
                <div class="metric-card">
                  <span>Execution</span>
                  <strong>0.12s</strong>
                </div>
              </div>
            </div>

            <div class="split-visual">
              <div class="split-image-wrap">
                <img :src="splitImage" alt="Trading graf a rastúci trend" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" class="content-shell">
        <div class="page-container shell-inner">
          <AboutSection />
        </div>
      </section>

      <section id="services" class="content-shell alt-shell">
        <div class="page-container shell-inner">
          <ServicesSection />
        </div>
      </section>

      <section id="comments" class="content-shell">
        <div class="page-container shell-inner">
          <CommentsCarousel />
        </div>
      </section>

      <section id="contact" class="content-shell last-shell">
        <div class="page-container shell-inner">
          <ContactSection />
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="page-container footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="logo" href="#" @click.prevent="scrollTo('hero')">
              <span class="logo-mark"></span>
              <span class="logo-text">ApexMarkets</span>
            </a>
            <p class="footer-desc">
              Moderná obchodná platforma zameraná na prehľadnosť, rýchly prístup
              k dátam a komfortné sledovanie trhov v jednom prostredí.
            </p>
          </div>

          <div class="footer-col">
            <h4>Navigácia</h4>
            <a
              v-for="link in navLinks"
              :key="link.target"
              :href="'#' + link.target"
              @click.prevent="scrollTo(link.target)"
            >
              {{ link.name }}
            </a>
          </div>

          <div class="footer-col">
            <h4>Platforma</h4>
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 ApexMarkets. Všetky práva vyhradené.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

* {
  box-sizing: border-box;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #f4f7fb;
  background:
    radial-gradient(
      circle at top left,
      rgba(77, 113, 255, 0.16),
      transparent 32%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgba(0, 207, 255, 0.12),
      transparent 22%
    ),
    linear-gradient(180deg, #07101b 0%, #08111d 38%, #060b12 100%);
}

main {
  flex: 1;
}

.page-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 9.5rem 0 7rem;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.038) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.038) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.92), transparent 92%);
}

.bg-blur {
  position: absolute;
  border-radius: 999px;
  filter: blur(50px);
}

.bg-blur-1 {
  width: 340px;
  height: 340px;
  left: -90px;
  top: 70px;
  background: rgba(78, 110, 255, 0.24);
}

.bg-blur-2 {
  width: 320px;
  height: 320px;
  right: -90px;
  top: 130px;
  background: rgba(0, 206, 255, 0.16);
}

.hero-layout {
  display: grid;
  grid-template-columns: 1.02fr 0.98fr;
  gap: 3.5rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-copy {
  max-width: 590px;
}

.eyebrow,
.section-kicker,
.info-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7f92ad;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 1.1rem 0 1.25rem;
  font-size: clamp(2.8rem, 5.5vw, 5.25rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
  font-weight: 800;
  max-width: 11ch;
}

.hero-copy h1 span {
  color: #c8d6ff;
}

.hero-text {
  margin: 0;
  max-width: 560px;
  font-size: 1.08rem;
  line-height: 1.8;
  color: #a7b4c8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 2rem;
}

.btn {
  border: 0;
  border-radius: 999px;
  padding: 0.95rem 1.45rem;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    opacity 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  color: #081019;
  background: linear-gradient(135deg, #6fe0ff 0%, #7e8dff 100%);
  box-shadow: 0 18px 40px rgba(76, 127, 255, 0.22);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  color: #e8eef8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 2.25rem;
}

.hero-stat {
  padding: 1rem 1rem 1.05rem;
  border-radius: 20px;
  background: rgba(10, 18, 31, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
}

.hero-stat strong {
  display: block;
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
}

.hero-stat span {
  display: block;
  margin-top: 0.28rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #8fa0b9;
}

.hero-media {
  position: relative;
  min-height: 680px;
  padding-left: 22px;
  padding-right: 14px;
  padding-bottom: 72px;
}

.hero-image-card {
  position: relative;
  width: min(100%, 520px);
  aspect-ratio: 3 / 2;
  border-radius: 34px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero-image-card-main {
  margin-left: auto;
}

.hero-image-card-secondary {
  position: absolute;
  left: 0;
  bottom: 110px;
  width: min(62%, 320px);
  border-radius: 28px;
  z-index: 2;
  box-shadow:
    0 24px 55px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero-image-card img,
.split-image-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background: #0a111d;
}

.feature-visual img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
  background: #0a111d;
}

.floating-card {
  position: absolute;
  backdrop-filter: blur(18px);
  background: rgba(8, 14, 25, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  box-shadow: 0 22px 38px rgba(0, 0, 0, 0.24);
}

.floating-card-top {
  left: 18px;
  bottom: 18px;
  padding: 0.95rem 1rem;
  max-width: 220px;
}

.floating-card-side {
  right: 14px;
  bottom: 14px;
  padding: 0.8rem 0.9rem;
  max-width: 190px;
}

.floating-label {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #84c8ff;
}

.floating-card strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.1rem;
}

.floating-card small {
  display: block;
  margin-top: 0.22rem;
  color: #91a2ba;
}

.mini-market-card {
  position: absolute;
  right: 14px;
  bottom: -42px;
  width: min(100%, 360px);
  padding: 1.1rem;
  border-radius: 26px;
  background: rgba(8, 14, 25, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 28px 50px rgba(0, 0, 0, 0.3);
}

.mini-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.mini-label {
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7f92ad;
}

.mini-live {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  color: #d9eef7;
}

.mini-live i {
  position: relative;
  top: 2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #58f0b4;
  box-shadow: 0 0 0 6px rgba(88, 240, 180, 0.12);
}

.mini-market-list {
  display: grid;
  gap: 0.7rem;
}

.mini-market-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0.95rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

.mini-market-row strong {
  font-size: 0.96rem;
}

.mini-market-row p {
  margin: 0.22rem 0 0;
  font-size: 0.82rem;
  color: #8ea0ba;
}

.mini-market-right {
  text-align: right;
}

.change-pill {
  display: inline-block;
  margin-top: 0.28rem;
  padding: 0.26rem 0.52rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.positive {
  color: #7df0c4;
  background: rgba(52, 186, 127, 0.14);
}

.negative {
  color: #ff8d9f;
  background: rgba(255, 87, 120, 0.14);
}

.platform-section {
  position: relative;
  padding: 8rem 0 4.5rem;
}

.section-heading {
  max-width: 760px;
  margin-bottom: 4rem;
}

.section-heading h2 {
  margin: 0.8rem 0 1rem;
  font-size: clamp(2rem, 4.2vw, 3.4rem);
  line-height: 1.06;
  letter-spacing: -0.045em;
}

.section-heading p {
  margin: 0;
  color: #9dacbf;
  font-size: 1.05rem;
  line-height: 1.78;
}

.feature-highlight {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 3rem;
}

.feature-visual {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0a111d;
  box-shadow: 0 24px 58px rgba(0, 0, 0, 0.2);
}

.feature-badge {
  position: absolute;
  left: 24px;
  bottom: 24px;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(8, 14, 25, 0.8);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-badge span {
  display: block;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8aa0c8;
}

.feature-badge strong {
  display: block;
  margin-top: 0.26rem;
  font-size: 1.18rem;
}

.feature-content {
  display: grid;
  gap: 1rem;
}

.info-card,
.feature-card,
.metric-card {
  background: rgba(10, 18, 31, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}

.info-card {
  padding: 1.4rem;
  border-radius: 24px;
}

.info-card h3 {
  margin: 0.78rem 0 0.8rem;
  font-size: 1.55rem;
  line-height: 1.15;
}

.info-card p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.78;
  color: #9dadbf;
}

.points-list {
  display: grid;
  gap: 0.8rem;
}

.point-item {
  display: flex;
  gap: 0.85rem;
  padding: 1rem 1.05rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.point-dot {
  width: 11px;
  height: 11px;
  margin-top: 0.48rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #67dcff 0%, #7a89ff 100%);
  flex: 0 0 auto;
}

.point-item h4 {
  margin: 0 0 0.28rem;
  font-size: 1rem;
}

.point-item p {
  margin: 0;
  color: #98abc2;
  line-height: 1.6;
  font-size: 0.94rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.feature-card {
  padding: 1.35rem;
  border-radius: 24px;
}

.card-tag {
  display: inline-flex;
  padding: 0.3rem 0.58rem;
  border-radius: 999px;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #99d7ff;
  background: rgba(111, 174, 255, 0.12);
}

.feature-card h3 {
  margin: 1rem 0 0.75rem;
  font-size: 1.25rem;
  line-height: 1.2;
}

.feature-card p {
  margin: 0;
  color: #95a8c0;
  line-height: 1.7;
  font-size: 0.96rem;
}

.feature-card a {
  display: inline-block;
  margin-top: 1rem;
  color: #d7e7ff;
  text-decoration: none;
  font-weight: 700;
}

.platform-split {
  margin-top: 3.25rem;
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 1rem;
  align-items: center;
}

.split-copy {
  padding: 1.5rem 0.25rem;
}

.split-copy h3 {
  margin: 0.8rem 0 0.9rem;
  font-size: clamp(1.7rem, 3.4vw, 2.65rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.split-copy p {
  margin: 0;
  color: #9dacbf;
  line-height: 1.8;
  font-size: 1rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1.4rem;
}

.metric-card {
  padding: 1rem 1.05rem;
  border-radius: 20px;
}

.metric-card span {
  display: block;
  color: #8397b3;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.metric-card strong {
  display: block;
  margin-top: 0.42rem;
  font-size: 1.45rem;
}

.split-image-wrap {
  aspect-ratio: 3 / 2;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0a111d;
  box-shadow: 0 24px 58px rgba(0, 0, 0, 0.2);
}

.content-shell {
  padding: 3.5rem 0;
}

.alt-shell {
  padding-top: 1.75rem;
}

.shell-inner {
  border-radius: 32px;
  background: rgba(9, 15, 26, 0.66);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.last-shell {
  padding-bottom: 7rem;
}

.footer {
  background: rgba(4, 8, 14, 0.94);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-inner {
  padding: 3.2rem 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.72rem;
  text-decoration: none;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 800;
}

.logo-mark {
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background: linear-gradient(135deg, #67dcff 0%, #7a89ff 100%);
  box-shadow: 0 0 22px rgba(107, 175, 255, 0.34);
}

.footer-desc {
  max-width: 340px;
  margin-top: 1rem;
  color: #8da0b8;
  line-height: 1.7;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
}

.footer-col h4 {
  margin: 0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ffffff;
}

.footer-col a {
  color: #8fa0b7;
  text-decoration: none;
}

.footer-bottom {
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-bottom p {
  margin: 0;
  color: #7f92aa;
  text-align: center;
  font-size: 0.88rem;
}

@media (max-width: 1080px) {
  .hero-layout,
  .feature-highlight,
  .platform-split {
    grid-template-columns: 1fr;
  }

  .hero-media {
    min-height: auto;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
  }

  .hero-image-card-main,
  .hero-image-card {
    margin: 0 auto;
  }

  .hero-image-card-secondary {
    position: relative;
    left: auto;
    bottom: auto;
    width: min(100%, 520px);
    margin: 1rem auto 0;
  }

  .mini-market-card {
    position: relative;
    right: auto;
    bottom: auto;
    margin: 1rem auto 0;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-visual {
    aspect-ratio: auto;
    min-height: auto;
    order: 2;
    max-height: 420px;
    overflow: hidden;
  }

  .feature-visual img {
    height: auto;
    max-width: 100%;
    max-height: 420px;
    object-fit: cover;
    display: block;
  }

  .feature-content {
    order: 1;
  }

  .feature-highlight {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 760px) {
  .page-container {
    width: min(100% - 24px, 1180px);
  }

  .hero-section {
    padding-top: 7rem;
  }

  .hero-copy h1 {
    max-width: none;
  }

  .hero-stats,
  .metrics-row,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .floating-card-top {
    left: 12px;
    bottom: 12px;
    max-width: calc(100% - 24px);
  }

  .section-heading h2 {
    font-size: 2.1rem;
  }
}
</style>
