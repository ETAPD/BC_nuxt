<template>
  <div class="support-page">
    <AppNavbar />

    <main class="support-main">
      <header class="support-hero">
        <div class="hero-left">
          <span class="hero-icon">🛟</span>
          <div>
            <h1>Centrum podpory</h1>
            <p>Nájdite odpovede na časté otázky alebo nám pošlite tiket.</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">&lt; 2h</span>
            <span class="hero-stat-label">Priemerná odpoveď</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">24/7</span>
            <span class="hero-stat-label">Dostupnosť</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">98%</span>
            <span class="hero-stat-label">Spokojnosť</span>
          </div>
        </div>
      </header>

      <div class="contact-cards">
        <div class="contact-card">
          <span class="contact-card-icon">📧</span>
          <div>
            <h3>E-mail</h3>
            <p>support@tradeprojekt.sk</p>
          </div>
        </div>
        <div class="contact-card">
          <span class="contact-card-icon">💬</span>
          <div>
            <h3>Live chat</h3>
            <p>Cez tiketový systém nižšie</p>
          </div>
        </div>
        <div class="contact-card">
          <span class="contact-card-icon">🕐</span>
          <div>
            <h3>Pracovná doba</h3>
            <p>Po – Pi: 8:00 – 20:00</p>
          </div>
        </div>
      </div>

      <nav class="support-tabs">
        <button
          :class="['support-tab', { active: activeTab === 'faq' }]"
          @click="activeTab = 'faq'"
        >
          📖 Časté otázky
        </button>
        <button
          :class="['support-tab', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          ✉️ Odoslať tiket
        </button>
        <button
          :class="['support-tab', { active: activeTab === 'tickets' }]"
          @click="activeTab = 'tickets'"
        >
          📋 Moje tikety
        </button>
      </nav>

      <section v-if="activeTab === 'faq'" class="faq-section">
        <div class="faq-grid">
          <div v-for="cat in faqCategories" :key="cat.title" class="faq-category">
            <h3 class="faq-cat-title">{{ cat.icon }} {{ cat.title }}</h3>
            <div class="faq-list">
              <details v-for="(faq, i) in cat.items" :key="i" class="faq-item">
                <summary>{{ faq.question }}</summary>
                <p>{{ faq.answer }}</p>
              </details>
            </div>
          </div>
        </div>

        <div class="faq-cta">
          <p>Nenašli ste odpoveď? <button class="link-btn" @click="activeTab = 'create'">Pošlite nám tiket →</button></p>
        </div>
      </section>

      <section v-if="activeTab === 'create'" class="ticket-section">
        <div class="ticket-section__header">
          <div>
            <h2>✉️ Nenašli ste odpoveď?</h2>
            <p>Pošlite nám tiket a ozveme sa vám čo najskôr.</p>
          </div>
          <div class="ticket-response-badge">
            <span class="badge-dot"></span>
            Priemerná odpoveď do 2 hodín
          </div>
        </div>

        <div v-if="!isLoggedIn" class="ticket-login-notice">
          <p>
            Pre odoslanie tiketu sa musíte
            <NuxtLink to="/login">prihlásiť</NuxtLink>.
          </p>
        </div>

        <form v-else class="ticket-form" @submit.prevent="submitTicket">
          <div class="form-row">
            <label for="ticket-subject">Predmet</label>
            <select id="ticket-subject" v-model="selectedSubject">
              <option value="" disabled>Vyberte predmet…</option>
              <option v-for="opt in subjectOptions" :key="opt" :value="opt">
                {{ opt }}
              </option>
              <option value="__other">Iné</option>
            </select>
          </div>

          <div v-if="selectedSubject === '__other'" class="form-row">
            <label for="ticket-custom-subject">Vlastný predmet</label>
            <input
              id="ticket-custom-subject"
              v-model="customSubject"
              type="text"
              placeholder="Zadajte predmet…"
            />
          </div>

          <div class="form-row">
            <label for="ticket-message">Správa</label>
            <textarea
              id="ticket-message"
              v-model="message"
              rows="6"
              placeholder="Popíšte váš problém alebo otázku…"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitLoading || !isFormValid"
            >
              {{ submitLoading ? "Odosielam…" : "Odoslať tiket" }}
            </button>
          </div>

          <Transition name="flash">
            <div v-if="successMsg" class="flash-success">
              ✓ {{ successMsg }}
            </div>
          </Transition>
          <div v-if="errorMsg" class="flash-error">{{ errorMsg }}</div>
        </form>
      </section>

      <section v-if="activeTab === 'tickets'">
        <div v-if="!isLoggedIn" class="ticket-login-notice-standalone">
          <p>
            Pre zobrazenie tiketov sa musíte
            <NuxtLink to="/login">prihlásiť</NuxtLink>.
          </p>
        </div>
        <UserTicketsPanel
          v-else-if="user"
          :user-id="user.user_id"
          :user-name="user.full_name || 'Používateľ'"
        />
      </section>

      <section class="tips-section">
        <h3>💡 Tipy pre rýchle riešenie</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <span class="tip-num">1</span>
            <p>Pred odoslaním tiketu skontrolujte sekciu <strong>Časté otázky</strong>.</p>
          </div>
          <div class="tip-card">
            <span class="tip-num">2</span>
            <p>Uveďte čo <strong>najpresnejší popis</strong> problému vrátane krokov na zopakovanie.</p>
          </div>
          <div class="tip-card">
            <span class="tip-num">3</span>
            <p>Skontrolujte stav tiketov v záložke <strong>Moje tikety</strong> — odpovede dostanete tam.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// Podpora - FAQ, tikety, kontakt
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { createTicket } from '../composables/useSupportTickets'

definePageMeta({ middleware: "auth" });

useHead({
  title: "Podpora | TradeProjekt",
  meta: [
    { name: "description", content: "Centrum podpory — časté otázky a tiketový systém." },
    { name: "robots", content: "noindex, nofollow" },
  ],
});

const store = useSupportFormStore()
const { activeTab, selectedSubject, customSubject, message } = storeToRefs(store)

const isLoggedIn = ref(false)
const user = ref<any>(null)
const submitLoading = ref(false)
const successMsg = ref("")
const errorMsg = ref("")
const successTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const subjectOptions = [
  "Problém s príkazom",
  "Problém s vkladom / výberom",
  "Problém s prihlásením",
  "Otázka k portfóliu",
  "Zmena osobných údajov",
  "Technický problém",
  "Nahlásenie chyby",
]

const faqs = [
  {
    question: "Ako vytvorím nový príkaz?",
    answer:
      'Prejdite na Dashboard, vyberte aktívum na paneli "Nový príkaz", zvoľte typ (tržový, limitný alebo stop-loss), zadajte množstvo a potvrďte odoslanie.',
  },
  {
    question: "Ako zmením heslo?",
    answer:
      'Prejdite do Profilu a v sekcii "Zabezpečenie" kliknite na "Zmeniť heslo". Zadajte nové heslo a potvrďte.',
  },
  {
    question: "Kde nájdem históriu obchodov?",
    answer:
      'Kompletná história obchodov je dostupná v sekcii "História" v navigačnom paneli.',
  },
  {
    question: "Ako pridám platobný spôsob?",
    answer:
      'V Profile nájdete sekciu "Platobné metódy", kde môžete pridať bankový účet alebo kartu.',
  },
  {
    question: "Ako kontaktujem podporu?",
    answer:
      'Môžete použiť formulár nižšie na tejto stránke, alebo napísať tiket priamo z profilu v sekcii "Podpora".',
  },
  {
    question: "Čo znamenajú stavy príkazov?",
    answer:
      "Čakajúci – príkaz čaká na spracovanie. Aktívny – príkaz je na trhu. Vyplnený – príkaz bol úspešne vykonaný. Zrušený/Zamietnutý – príkaz bol zrušený alebo zamietnutý.",
  },
  {
    question: "Ako zruším príkaz?",
    answer:
      'Na Dashboarde v sekcii "Otvorené príkazy" nájdete aktívne príkazy. Kliknite na "Zrušiť" pri príkaze, ktorý chcete zrušiť.',
  },
  {
    question: "Aké typy členstva sú dostupné?",
    answer:
      "Ponúkame Basic, Pro a Premium členstvo. Každá úroveň ponúka rôzne výhody, ako nižšie poplatky a rozšírené analytiky.",
  },
]

// FAQ data
const faqCategories = [
  {
    icon: '📈',
    title: 'Obchodovanie',
    items: [
      {
        question: 'Ako vytvorím nový príkaz?',
        answer: 'Prejdite na Dashboard, vyberte aktívum na paneli "Nový príkaz", zvoľte typ (tržový, limitný alebo stop-loss), zadajte množstvo a potvrďte odoslanie.',
      },
      {
        question: 'Čo znamenajú stavy príkazov?',
        answer: 'Čakajúci – príkaz čaká na spracovanie. Aktívny – príkaz je na trhu. Vyplnený – príkaz bol úspešne vykonaný. Zrušený/Zamietnutý – príkaz bol zrušený alebo zamietnutý.',
      },
      {
        question: 'Ako zruším príkaz?',
        answer: 'Na Dashboarde v sekcii "Otvorené príkazy" nájdete aktívne príkazy. Kliknite na "Zrušiť" pri príkaze, ktorý chcete zrušiť.',
      },
      {
        question: 'Aký je rozdiel medzi tržným a limitným príkazom?',
        answer: 'Tržný príkaz sa vykoná okamžite za aktuálnu cenu. Limitný príkaz sa vykoná až keď cena dosiahne vami stanovenú úroveň.',
      },
      {
        question: 'Kde nájdem históriu obchodov?',
        answer: 'Kompletná história obchodov je dostupná v sekcii "História" v navigačnom paneli.',
      },
    ],
  },
  {
    icon: '👤',
    title: 'Účet a profil',
    items: [
      {
        question: 'Ako zmením heslo?',
        answer: 'Prejdite do Profilu a v sekcii "Zabezpečenie" kliknite na "Zmeniť heslo". Zadajte aktuálne a nové heslo a potvrďte.',
      },
      {
        question: 'Ako zmením osobné údaje?',
        answer: 'V sekcii Profil kliknite na tlačidlo "Upraviť profil" a vyplňte požadované zmeny.',
      },
      {
        question: 'Aké typy členstva sú dostupné?',
        answer: 'Ponúkame Basic, Pro a Premium členstvo. Každá úroveň ponúka rôzne výhody, ako nižšie poplatky a rozšírené analytiky.',
      },
      {
        question: 'Ako vymažem svoj účet?',
        answer: 'V sekcii Profil → Zabezpečenie nájdete možnosť "Vymazať účet". Táto akcia je nevratná a vymaže všetky vaše dáta.',
      },
    ],
  },
  {
    icon: '💳',
    title: 'Platby a financie',
    items: [
      {
        question: 'Ako pridám platobný spôsob?',
        answer: 'V Profile nájdete sekciu "Platobné metódy", kde môžete pridať bankový účet alebo kartu.',
      },
      {
        question: 'Ako dlho trvá spracovanie vkladu?',
        answer: 'Bankové prevody sa spracúvajú do 1-3 pracovných dní. Kartové platby sú zvyčajne okamžité.',
      },
      {
        question: 'Aké sú poplatky za obchodovanie?',
        answer: 'Poplatky závisia od vašej úrovne členstva. Basic: 0,5%, Pro: 0,25%, Premium: 0,1% z hodnoty obchodu.',
      },
    ],
  },
  {
    icon: '🔒',
    title: 'Bezpečnosť',
    items: [
      {
        question: 'Je moje konto bezpečné?',
        answer: 'Áno. Používame šifrovanie SSL, bezpečné tokeny a automatické odhlásenie po nečinnosti. Vaše heslo je hashované a nikdy sa neukladá v čitateľnej forme.',
      },
      {
        question: 'Čo robiť ak som zabudol heslo?',
        answer: 'Na prihlasovacej stránke kliknite na "Zabudnuté heslo" a zadajte svoj e-mail. Dostanete odkaz na obnovenie hesla.',
      },
      {
        question: 'Ako kontaktujem podporu?',
        answer: 'Môžete použiť tiketový formulár na tejto stránke, stránku Kontakt, alebo napísať na support@tradeprojekt.sk.',
      },
    ],
  },
]

const finalSubject = computed(() => {
  return selectedSubject.value === "__other"
    ? customSubject.value.trim()
    : selectedSubject.value
})

const isFormValid = computed(() => {
  return finalSubject.value.length > 0 && message.value.trim().length > 0
})

onMounted(async () => {
  try {
    const userData = await getDbUser()
    if (userData) {
      user.value = userData
      isLoggedIn.value = true
    }
  } catch {
  }
})

onBeforeUnmount(() => {
  if (successTimer.value) clearTimeout(successTimer.value)
})

async function submitTicket() {
  if (!isFormValid.value || !user.value) return
  submitLoading.value = true
  errorMsg.value = ""
  successMsg.value = ""
  try {
    await createTicket(
      user.value.user_id,
      finalSubject.value,
      message.value.trim(),
      user.value.full_name || "Používateľ",
    )
    successMsg.value = "Tiket bol úspešne odoslaný. Čoskoro sa vám ozveme."
    selectedSubject.value = ""
    customSubject.value = ""
    message.value = ""
    successTimer.value = setTimeout(() => {
      successMsg.value = ""
    }, 5000)
  } catch (err: any) {
    errorMsg.value = err?.message || "Nepodarilo sa odoslať tiket."
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background: var(--color-background);
}
.support-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}
.support-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-icon {
  font-size: 2.2rem;
  flex-shrink: 0;
}
.support-hero h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-white);
  margin: 0 0 0.25rem;
}
.support-hero p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
}
.hero-stats {
  display: flex;
  gap: 0.75rem;
}
.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  min-width: 100px;
}
.hero-stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-accent);
}
.hero-stat-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

/* Contact bar */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.contact-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  transition: border-color var(--transition-fast);
}
.contact-card:hover {
  border-color: var(--color-accent);
}
.contact-card-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.contact-card h3 {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0;
}
.contact-card p {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin: 0;
}

/* Tabs */
.support-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.support-tab {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
  font-family: inherit;
}
.support-tab:hover {
  color: var(--color-white);
}
.support-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.ticket-login-notice-standalone {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.ticket-login-notice-standalone a {
  color: var(--color-accent);
  font-weight: 600;
}

/* FAQ */
.faq-section {
  margin-bottom: 0;
}
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  align-items: start;
}
.faq-category {
  margin-bottom: 0;
}
.faq-cat-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.faq-cta {
  text-align: center;
  padding: 1.5rem;
  margin-top: 1rem;
  background: var(--color-background-soft);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.92rem;
}
.faq-cta p {
  margin: 0;
}
.link-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  transition: opacity var(--transition-fast);
}
.link-btn:hover {
  opacity: 0.8;
}
.faq-item {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}
.faq-item[open] {
  border-color: var(--color-accent);
}
.faq-item summary {
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--color-white);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.faq-item summary::after {
  content: "+";
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}
.faq-item[open] summary::after {
  content: "−";
  color: var(--color-accent);
}
.faq-item summary::-webkit-details-marker {
  display: none;
}
.faq-item p {
  padding: 0 1rem 0.75rem;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
  font-size: 0.85rem;
}

/* Ticket form */
.ticket-section {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}
.ticket-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.ticket-section__header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 0.3rem;
}
.ticket-section__header p {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.92rem;
}
.ticket-response-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #22c55e;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 1.5s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.ticket-login-notice {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-muted);
}
.ticket-login-notice a {
  color: var(--color-accent);
  font-weight: 600;
}
.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.85rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-fast);
}
.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: var(--color-accent);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
.btn {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  padding: 0.6rem 1.1rem;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  filter: brightness(1.15);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.flash-success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
}
.flash-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
}
.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.3s;
}
.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}
/* Tips section */
.tips-section {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}
.tips-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 1rem;
  text-align: center;
}
.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.tip-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  text-align: center;
  position: relative;
}
.tip-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.tip-card p {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
}
@media (max-width: 768px) {
  .support-main {
    padding: 1rem;
  }
  .support-hero {
    flex-direction: column;
    text-align: center;
  }
  .hero-left {
    flex-direction: column;
  }
  .support-hero h1 {
    font-size: 1.5rem;
  }
  .hero-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
  .contact-cards {
    grid-template-columns: 1fr;
  }
  .faq-grid {
    grid-template-columns: 1fr;
  }
  .tips-grid {
    grid-template-columns: 1fr;
  }
  .ticket-section__header {
    flex-direction: column;
  }
}
</style>
