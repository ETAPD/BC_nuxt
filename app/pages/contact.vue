<script setup lang="ts">
// Kontaktna stranka - formular a info
useHead({
  title: "Kontakt | TradeProjekt",
  meta: [
    { name: "description", content: "Kontaktujte nás — rádi vám pomôžeme s akýmkoľvek problémom." },
  ],
});

// Stav formulara
const form = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const submitted = ref(false);
const loading = ref(false);
const error = ref("");

// Odoslanie formulara
async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await submitContactMessage({
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      subject: form.value.subject.trim(),
      message: form.value.message.trim(),
    });
    submitted.value = true;
  } catch (e: any) {
    error.value = e.message || "Failed to send message. Please try again.";
  } finally {
    loading.value = false;
  }
}

// Reset formulara
function resetForm() {
  submitted.value = false;
  error.value = "";
  form.value = { name: "", email: "", subject: "", message: "" };
}
</script>

<template>
  <div class="contact">
    <section class="contact-hero section">
      <div class="container">
        <span class="hero-badge">Kontakt</span>
        <h1>Porozprávajme <span class="gradient-text">sa</span></h1>
        <p class="contact-lead">
          Máte otázku alebo projekt na mysli? Radi si vás vypočujeme.
        </p>
      </div>
    </section>

    <section class="contact-content section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Kontaktujte nás</h2>
            <p class="info-desc">
              Vyplňte formulár a náš tím sa vám ozve do 24 hodín.
            </p>

            <div class="info-items">
              <div class="info-item">
                <span class="info-icon">&#9993;</span>
                <div>
                  <h4>E-mail</h4>
                  <p>hello@projekt.dev</p>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon">&#128205;</span>
                <div>
                  <h4>Adresa</h4>
                  <p>Bratislava, Slovensko</p>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon">&#128222;</span>
                <div>
                  <h4>Telefón</h4>
                  <p>+421 900 000 000</p>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-form-wrapper card">
            <div v-if="submitted" class="success-message">
              <span class="success-icon">&#10003;</span>
              <h3>Správa odoslaná!</h3>
              <p>Ďakujeme, že ste nás kontaktovali. Čoskoro sa vám ozveme.</p>
              <button class="btn btn-outline" @click="resetForm">
                Odoslať ďalšiu
              </button>
            </div>

            <form v-else @submit.prevent="handleSubmit" class="contact-form">
              <div v-if="error" class="form-error">{{ error }}</div>
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Meno</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    placeholder="Vaše meno"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="email">E-mail</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="vy@priklad.sk"
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="subject">Predmet</label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  placeholder="Ako vám môžeme pomôcť?"
                  required
                />
              </div>
              <div class="form-group">
                <label for="message">Správa</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                  placeholder="Povedzte nám o vašom projekte..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                class="btn btn-primary submit-btn"
                :disabled="loading"
              >
                {{ loading ? "Odosiela sa…" : "Odoslať správu" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-hero {
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

.contact-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(
    135deg,
    var(--color-accent) 0%,
    var(--color-accent-secondary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.contact-lead {
  max-width: 500px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

/* Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  align-items: start;
}

/* Info */
.contact-info h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.info-desc {
  color: var(--color-text-muted);
  margin-bottom: 2.5rem;
  line-height: 1.8;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(108, 99, 255, 0.1);
  border-radius: var(--radius-sm);
  font-size: 1.15rem;
  flex-shrink: 0;
}

.info-item h4 {
  color: var(--color-white);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.info-item p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

/* Form */
.contact-form-wrapper {
  padding: 2.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.form-group input,
.form-group textarea {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: var(--color-white);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color var(--transition-fast);
  outline: none;
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-gray-lighter);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-accent);
}

.submit-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
}

/* Success */
.success-message {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-accent),
    var(--color-accent-secondary)
  );
  color: var(--color-white);
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

.success-message h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.success-message p {
  margin-bottom: 2rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .contact-hero h1 {
    font-size: 2.2rem;
  }
  .contact-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
