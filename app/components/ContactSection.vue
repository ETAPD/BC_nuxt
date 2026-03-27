<script setup lang="ts">
import { ref } from "vue";

const form = ref({ name: "", email: "", subject: "", message: "" });
const submitted = ref(false);

function handleSubmit() {
  submitted.value = true;
}
function resetForm() {
  submitted.value = false;
  form.value = { name: "", email: "", subject: "", message: "" };
}
</script>

<template>
  <section id="contact" class="section contact">
    <div class="container">
      <div class="contact-intro">
        <span class="badge"><span class="badge-dot"></span> Kontakt</span>
        <h2>Kontaktujte <span class="text-green">nás</span></h2>
        <p class="contact-lead">
          Otázky ohľadom obchodovania, členstva alebo partnerstiev? Sme tu, aby
          sme vám pomohli.
        </p>
      </div>

      <div class="contact-grid">
        <div class="contact-info">
          <h3>Napíšte nám</h3>
          <p class="info-desc">
            Náš tím podpory odpovedá do 2 hodín počas obchodných hodín.
          </p>
          <div class="info-items">
            <div class="info-item">
              <span class="info-icon">&#9993;</span>
              <div>
                <h4>E-mail</h4>
                <p>support@apexmarkets.com</p>
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
            <p>Ozveme sa vám čo najskôr.</p>
            <button class="btn btn-outline" @click="resetForm">
              Odoslať ďalšiu
            </button>
          </div>
          <form v-else @submit.prevent="handleSubmit" class="contact-form">
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
                placeholder="Účet, obchodovanie, partnerstvo..."
                required
              />
            </div>
            <div class="form-group">
              <label for="message">Správa</label>
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                placeholder="Poveďte nám, ako vám môžeme pomôcť..."
                required
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary submit-btn">
              Odoslať správu
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-intro {
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
.contact-intro h2 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}
.text-green {
  color: #3b82f6;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
}
.contact-lead {
  max-width: 500px;
  margin: 0 auto;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  align-items: start;
}
.contact-info h3 {
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
  background: rgba(59, 130, 246, 0.08);
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

.contact-form-wrapper {
  padding: 2.5rem;
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.03), transparent);
  border-color: rgba(59, 130, 246, 0.1);
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
  border: 1px solid rgba(59, 130, 246, 0.1);
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
  border-color: #3b82f6;
}
.submit-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
}

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
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #000;
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
  .contact-intro h2 {
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
