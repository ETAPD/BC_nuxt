<script setup lang="ts">
// Registracia pouzivatela - viac-krokovy formular
useHead({
  title: "Registrácia | TradeProjekt",
  meta: [
    { name: "description", content: "Vytvorte si účet a začnite obchodovať." },
    { name: "robots", content: "noindex, nofollow" },
  ],
});

const router = useRouter();

// Stav krokov
const step = ref(1);
const form = ref({
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
  phone: "",
  country: "",
  agreeTerms: false,
});
const error = ref("");
const loading = ref(false);
const success = ref(false);

// Vypocitane nazvy krokov
const stepTitle = computed(() => {
  if (step.value === 1) return "Začnite";
  if (step.value === 2) return "Zabezpečte si účet";
  return "Osobné údaje";
});

const stepSubtitle = computed(() => {
  if (step.value === 1) return "Zadajte svoj e-mail pre začiatok";
  if (step.value === 2) return "Vytvorte si silné heslo";
  return "Povedzte nám niečo o sebe";
});

// Validacia
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Navigacia medzi krokmi
function nextStep() {
  error.value = "";

  if (step.value === 1) {
    if (!form.value.email.trim()) {
      error.value = "E-mail je povinný.";
      return;
    }
    if (!validateEmail(form.value.email)) {
      error.value = "Zadajte platnú e-mailovú adresu.";
      return;
    }
    step.value = 2;
  } else if (step.value === 2) {
    if (form.value.password.length < 8) {
      error.value = "Heslo musí mať aspoň 8 znakov.";
      return;
    }
    if (form.value.password !== form.value.confirmPassword) {
      error.value = "Heslá sa nezhodujú.";
      return;
    }
    step.value = 3;
  }
}

function prevStep() {
  error.value = "";
  if (step.value > 1) step.value--;
}

// Odoslanie registracie
async function handleRegister() {
  error.value = "";

  if (!form.value.name.trim()) {
    error.value = "Celé meno je povinné.";
    return;
  }
  if (!form.value.agreeTerms) {
    error.value = "Musíte súhlasiť s Podmienkami používania.";
    return;
  }

  loading.value = true;

  try {
    const data = await signUp(
      form.value.email,
      form.value.password,
      form.value.name,
      form.value.phone || undefined,
      form.value.country || undefined,
    );

    if (data.session) {
      router.push("/dashboard");
    } else {
      success.value = true;
    }
  } catch (err: any) {
    error.value = err.message || "Registrácia zlyhala. Skúste to znova.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-bg">
      <div class="bg-glow"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="register-container">
      <div class="register-card">
        <div class="card-header">
          <NuxtLink to="/" class="back-link"
            >&larr; Späť na domovskú stránku</NuxtLink
          >
          <div class="brand">
            <span class="brand-icon">&#9670;</span>
            <span class="brand-text">ApexMarkets</span>
          </div>

          <div v-if="!success" class="steps-indicator">
            <div
              class="step-dot"
              :class="{ active: step >= 1, current: step === 1 }"
            >
              <span class="dot-num">1</span>
              <span class="dot-label">E-mail</span>
            </div>
            <div class="step-line" :class="{ filled: step >= 2 }"></div>
            <div
              class="step-dot"
              :class="{ active: step >= 2, current: step === 2 }"
            >
              <span class="dot-num">2</span>
              <span class="dot-label">Heslo</span>
            </div>
            <div class="step-line" :class="{ filled: step >= 3 }"></div>
            <div
              class="step-dot"
              :class="{ active: step >= 3, current: step === 3 }"
            >
              <span class="dot-num">3</span>
              <span class="dot-label">Údaje</span>
            </div>
          </div>

          <h1>{{ success ? "Skontrolujte svôj e-mail" : stepTitle }}</h1>
          <p class="subtitle">{{ success ? "" : stepSubtitle }}</p>
        </div>

        <form
          v-if="!success && step === 1"
          @submit.prevent="nextStep"
          class="register-form"
        >
          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="form-group">
            <label for="reg-email">E-mailová adresa</label>
            <input
              id="reg-email"
              v-model="form.email"
              type="email"
              placeholder="vy@priklad.sk"
              required
              autocomplete="email"
            />
          </div>

          <button type="submit" class="btn btn-primary submit-btn">
            Pokračovať s e-mailom &rarr;
          </button>

          <div class="card-footer-inline">
            <p>Už máte účet? <NuxtLink to="/login">Prihlásiť sa</NuxtLink></p>
          </div>
        </form>

        <form
          v-if="!success && step === 2"
          @submit.prevent="nextStep"
          class="register-form"
        >
          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="email-badge">
            <span class="badge-icon">&#9993;</span>
            <span>{{ form.email }}</span>
            <button type="button" class="badge-edit" @click="prevStep">
              Zmeniť
            </button>
          </div>

          <div class="form-group">
            <label for="reg-password">Heslo</label>
            <input
              id="reg-password"
              v-model="form.password"
              type="password"
              placeholder="Min. 8 znakov"
              required
              autocomplete="new-password"
            />
            <div class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :class="{
                    weak: form.password.length > 0 && form.password.length < 8,
                    medium:
                      form.password.length >= 8 && form.password.length < 12,
                    strong: form.password.length >= 12,
                  }"
                  :style="{
                    width:
                      form.password.length === 0
                        ? '0%'
                        : form.password.length < 8
                          ? '33%'
                          : form.password.length < 12
                            ? '66%'
                            : '100%',
                  }"
                ></div>
              </div>
              <span class="strength-label" v-if="form.password.length > 0">
                {{
                  form.password.length < 8
                    ? "Príliš krátke"
                    : form.password.length < 12
                      ? "Dobré"
                      : "Silné"
                }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="reg-confirm">Potvrdenie hesla</label>
            <input
              id="reg-confirm"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Zopakujte heslo"
              required
              autocomplete="new-password"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-ghost back-btn"
              @click="prevStep"
            >
              &larr; Späť
            </button>
            <button type="submit" class="btn btn-primary submit-btn">
              Pokračovať &rarr;
            </button>
          </div>
        </form>

        <form
          v-if="!success && step === 3"
          @submit.prevent="handleRegister"
          class="register-form"
        >
          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="form-group">
            <label for="reg-name"
              >Celé meno <span class="required">*</span></label
            >
            <input
              id="reg-name"
              v-model="form.name"
              type="text"
              placeholder="Ján Novák"
              required
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label for="reg-phone">
              Telefónne číslo
              <span class="optional-badge">Voliteľné</span>
            </label>
            <input
              id="reg-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+421 900 000 000"
              autocomplete="tel"
            />
            <p class="field-hint warning-hint">
              <span class="hint-icon">&#9888;</span>
              Odporúčané pre obnovu účtu a dvojfaktorovú autentifikáciu. Bez
              telefónneho čísla môže byť obnova strateného hesla zložitejšia.
            </p>
          </div>

          <div class="form-group">
            <label for="reg-country">
              Krajina
              <span class="optional-badge">Voliteľné</span>
            </label>
            <select
              id="reg-country"
              v-model="form.country"
              autocomplete="country-name"
            >
              <option value="">Vyberte svoju krajinu</option>
              <option value="SK">Slovensko</option>
              <option value="CZ">Česká republika</option>
              <option value="US">Spojené štáty</option>
              <option value="GB">Veľká Británia</option>
              <option value="DE">Nemecko</option>
              <option value="FR">Francúzsko</option>
              <option value="PL">Poľsko</option>
              <option value="AT">Rakúsko</option>
              <option value="CH">Švajčiarsko</option>
              <option value="NL">Holandsko</option>
              <option value="CA">Kanada</option>
              <option value="AU">Austrália</option>
              <option value="JP">Japonsko</option>
              <option value="KR">Južná Kórea</option>
              <option value="SG">Singapur</option>
              <option value="OTHER">Iná</option>
            </select>
          </div>

          <label class="checkbox-group">
            <input type="checkbox" v-model="form.agreeTerms" />
            <span>
              Súhlasím s <a href="#">Podmienkami používania</a> a
              <a href="#">Zásadami ochrany osobných údajov</a>
            </span>
          </label>

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-ghost back-btn"
              @click="prevStep"
            >
              &larr; Späť
            </button>
            <button
              type="submit"
              class="btn btn-primary submit-btn"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              {{ loading ? "Vytváram účet..." : "Vytvoriť účet" }}
            </button>
          </div>
        </form>

        <div v-if="success" class="success-box">
          <span class="success-icon">&#9993;</span>
          <p>
            Poslali sme potvrdzovací odkaz na <strong>{{ form.email }}</strong
            >. Kliknite naň, aby ste aktivovali svoj účet.
          </p>
          <NuxtLink
            to="/login"
            class="btn btn-primary"
            style="margin-top: 1.5rem"
          >
            Prejsť na prihlásenie
          </NuxtLink>
        </div>
      </div>

      <div class="register-features">
        <div class="feature">
          <span class="feature-icon">&#128200;</span>
          <div>
            <h3>Dáta v reálnom čase</h3>
            <p>
              Živé trhové dáta s latenciou pod 10ms na všetkých hlavných
              burzách.
            </p>
          </div>
        </div>
        <div class="feature">
          <span class="feature-icon">&#128274;</span>
          <div>
            <h3>Banková úroveň zabezpečenia</h3>
            <p>
              256-bitové šifrovanie, 2FA a studené úložisko pre vaše aktíva.
            </p>
          </div>
        </div>
        <div class="feature">
          <span class="feature-icon">&#127942;</span>
          <div>
            <h3>Nulové provízie</h3>
            <p>
              Bezplatné simulované obchodovanie zahrnuté. Prejdite na Pro alebo
              Elite pre dáta v reálnom čase a pokročilé nástroje.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background: var(--color-background);
}

.register-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

.register-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  width: 100%;
  align-items: center;
}

.register-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3rem;
}

.back-link {
  display: inline-block;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 2rem;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-accent);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.brand-icon {
  color: var(--color-accent);
  font-size: 1.5rem;
}

.brand-text {
  color: var(--color-white);
  font-size: 1.25rem;
  font-weight: 700;
}

/* ── Step indicator ── */
.steps-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 2rem;
}

.step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  position: relative;
}

.dot-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--color-background-mute);
  border: 2px solid var(--color-border);
  color: var(--color-text-muted);
  transition: all 0.3s ease;
}

.step-dot.active .dot-num {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.step-dot.current .dot-num {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.dot-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.step-dot.active .dot-label {
  color: var(--color-accent);
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--color-border);
  margin: 0 0.5rem;
  margin-bottom: 1.2rem;
  transition: background 0.3s ease;
}

.step-line.filled {
  background: var(--color-accent);
}

.card-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-white);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #ef4444;
}

.optional-badge {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-background-mute);
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
}

.form-group input,
.form-group select {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.8rem 1rem;
  color: var(--color-white);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color var(--transition-fast);
  outline: none;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.form-group select option {
  background: var(--color-background-soft);
  color: var(--color-white);
}

.form-group input::placeholder {
  color: var(--color-gray-lighter);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-accent);
}

/* ── Email badge (step 2) ── */
.email-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: var(--color-white);
}

.badge-icon {
  font-size: 1rem;
}

.badge-edit {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
}

.badge-edit:hover {
  text-decoration: underline;
}

/* ── Password strength ── */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition:
    width 0.3s ease,
    background 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #22c55e;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-muted);
}

/* ── Phone hint ── */
.field-hint {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.warning-hint {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
  color: #f59e0b;
}

.hint-icon {
  margin-right: 0.25rem;
}

/* ── Checkbox ── */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 0.15rem;
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.checkbox-group a {
  color: var(--color-accent);
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

/* ── Form actions ── */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.back-btn {
  padding: 0.8rem 1.25rem;
  font-size: 0.9rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-white);
  border-color: var(--color-white);
}

.submit-btn {
  flex: 1;
  justify-content: center;
  padding: 0.9rem;
  font-size: 1rem;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Inline footer (step 1) ── */
.card-footer-inline {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.5rem;
}

.card-footer-inline p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.card-footer-inline a {
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
}

/* ── Success box ── */
.success-box {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.success-box p {
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ── Features sidebar ── */
.register-features {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.feature {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: var(--radius-md);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature h3 {
  font-size: 1.1rem;
  margin-bottom: 0.35rem;
}

.feature p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .register-features {
    order: 2;
  }

  .register-card {
    padding: 2rem;
  }

  .card-header h1 {
    font-size: 1.6rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .back-btn {
    text-align: center;
  }
}
</style>
