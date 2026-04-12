<script setup lang="ts">
const router = useRouter();

const form = ref({
  email: "",
  password: "",
});
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    await signIn(form.value.email, form.value.password);
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.message || "Nesprávny e-mail alebo heslo.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-glow"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <NuxtLink to="/" class="back-link"
            >&larr; Späť na domovskú stránku</NuxtLink
          >
          <div class="brand">
            <span class="brand-icon">&#9670;</span>
            <span class="brand-text">ApexMarkets</span>
          </div>
          <h1>Vitajte späť</h1>
          <p class="subtitle">
            Prihláste sa pre prístup k vášmu obchodnému dashboardu
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="form-group">
            <label for="login-email">E-mailová adresa</label>
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              placeholder="vy@priklad.sk"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="login-password">Heslo</label>
            <input
              id="login-password"
              v-model="form.password"
              type="password"
              placeholder="Vaše heslo"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary submit-btn"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Prihlasovanie..." : "Prihlásiť sa" }}
          </button>
        </form>

        <div class="card-footer">
          <p>
            Nemáte účet? <NuxtLink to="/register">Zaregistrujte sa</NuxtLink>
          </p>
        </div>
      </div>

      <div class="login-side">
        <div class="side-content">
          <h2>
            Obchodujte múdrejšie.<br /><span class="text-accent"
              >Profitujte rýchlejšie.</span
            >
          </h2>
          <p>
            Prístup k trhovým dátam v reálnom čase, pokročilému vykonávaniu
            príkazov a výkonným nástrojom na správu portfólia — všetko na jednom
            mieste.
          </p>
          <div class="side-stats">
            <div class="side-stat">
              <span class="stat-value">50K+</span>
              <span class="stat-label">Aktívni obchodníci</span>
            </div>
            <div class="side-stat">
              <span class="stat-value">$2,4B</span>
              <span class="stat-label">Zobchodovaný objem</span>
            </div>
            <div class="side-stat">
              <span class="stat-value">99,9%</span>
              <span class="stat-label">Dostupnosť</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background: var(--color-background);
}

.login-bg {
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

.login-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  width: 100%;
  align-items: center;
}

.login-card {
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

.login-form {
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
}

.form-group input {
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

.form-group input::placeholder {
  color: var(--color-gray-lighter);
}

.form-group input:focus {
  border-color: var(--color-accent);
}

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 0.9rem;
  font-size: 1rem;
  margin-top: 0.5rem;
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
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.card-footer p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.card-footer a {
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
}

/* Side panel */
.login-side {
  display: flex;
  align-items: center;
}

.side-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.text-accent {
  color: var(--color-accent);
}

.side-content > p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.side-stats {
  display: flex;
  gap: 2rem;
}

.side-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-white);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .login-side {
    order: 2;
  }

  .login-card {
    padding: 2rem;
  }

  .card-header h1 {
    font-size: 1.6rem;
  }

  .side-content h2 {
    font-size: 1.8rem;
  }

  .side-stats {
    gap: 1.5rem;
  }
}
</style>
