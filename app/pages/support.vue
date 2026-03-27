<template>
  <div class="support-page">
    <AppNavbar />

    <main class="support-main">
      <header class="support-hero">
        <h1>Centrum podpory</h1>
        <p>Nájdite odpovede na časté otázky alebo nám pošlite tiket.</p>
      </header>

      <nav class="support-tabs">
        <button
          :class="['support-tab', { active: activeTab === 'faq' }]"
          @click="activeTab = 'faq'"
        >
          Časté otázky
        </button>
        <button
          :class="['support-tab', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          Odoslať tiket
        </button>
        <button
          :class="['support-tab', { active: activeTab === 'tickets' }]"
          @click="activeTab = 'tickets'"
        >
          Moje tikety
        </button>
      </nav>

      <!-- FAQ -->
      <section v-if="activeTab === 'faq'" class="faq-section">
        <div class="faq-list">
          <details v-for="(faq, i) in faqs" :key="i" class="faq-item">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <!-- Odoslať tiket -->
      <section v-if="activeTab === 'create'" class="ticket-section">
        <div class="ticket-section__header">
          <div>
            <h2>Nenašli ste odpoveď?</h2>
            <p>Pošlite nám tiket a ozveme sa vám čo najskôr.</p>
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

      <!-- Moje tikety -->
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
    </main>
  </div>
</template>

<script lang="ts">
import { mapWritableState } from "pinia";

export default defineComponent({
  name: "SupportView",
  data() {
    return {
      isLoggedIn: false,
      user: null as any,
      submitLoading: false,
      successMsg: "",
      errorMsg: "",
      successTimer: null as ReturnType<typeof setTimeout> | null,
      subjectOptions: [
        "Problém s príkazom",
        "Problém s vkladom / výberom",
        "Problém s prihlásením",
        "Otázka k portfóliu",
        "Zmena osobných údajov",
        "Technický problém",
        "Nahlásenie chyby",
      ],
      faqs: [
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
      ],
    };
  },
  computed: {
    ...mapWritableState(useSupportFormStore, [
      "activeTab",
      "selectedSubject",
      "customSubject",
      "message",
    ]),
    finalSubject() {
      return this.selectedSubject === "__other"
        ? this.customSubject.trim()
        : this.selectedSubject;
    },
    isFormValid() {
      return this.finalSubject.length > 0 && this.message.trim().length > 0;
    },
  },
  async mounted() {
    try {
      const user = await getDbUser();
      if (user) {
        this.user = user;
        this.isLoggedIn = true;
      }
    } catch {
      // not logged in
    }
  },
  beforeUnmount() {
    if (this.successTimer) clearTimeout(this.successTimer);
  },
  methods: {
    async submitTicket() {
      if (!this.isFormValid || !this.user) return;
      this.submitLoading = true;
      this.errorMsg = "";
      this.successMsg = "";
      try {
        await createTicket(
          this.user.user_id,
          this.finalSubject,
          this.message.trim(),
          this.user.full_name || "Používateľ",
        );
        this.successMsg = "Tiket bol úspešne odoslaný. Čoskoro sa vám ozveme.";
        this.selectedSubject = "";
        this.customSubject = "";
        this.message = "";
        this.successTimer = setTimeout(() => {
          this.successMsg = "";
        }, 5000);
      } catch (err: any) {
        this.errorMsg = err?.message || "Nepodarilo sa odoslať tiket.";
      } finally {
        this.submitLoading = false;
      }
    },
  },
});
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background: var(--color-background);
}
.support-main {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem;
}
.support-hero {
  text-align: center;
  margin-bottom: 2.5rem;
}
.support-hero h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-white);
  margin: 0 0 0.5rem;
}
.support-hero p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
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
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
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
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
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
  padding: 0 1.25rem 1rem;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  font-size: 0.92rem;
}

/* Ticket form */
.ticket-section {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}
.ticket-section__header {
  margin-bottom: 1.25rem;
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
@media (max-width: 640px) {
  .support-main {
    padding: 1rem;
  }
  .support-hero h1 {
    font-size: 1.5rem;
  }
}
</style>
