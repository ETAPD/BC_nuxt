<script setup lang="ts">
const supabase = useSupabase();

const mobileMenuOpen = ref(false);
const scrolled = ref(false);
const activeSection = ref("hero");
const isLoggedIn = ref(false);

const navLinks = [
  { name: "Domov", target: "hero" },
  { name: "Funkcie", target: "features" },
  { name: "O nás", target: "about" },
  { name: "Členstvo", target: "services" },
  { name: "Referencie", target: "comments" },
  { name: "Kontakt", target: "contact" },
];

function scrollTo(id: string) {
  mobileMenuOpen.value = false;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function handleScroll() {
  scrolled.value = window.scrollY > 50;
  const sections = navLinks.map((l) => l.target);
  for (let i = sections.length - 1; i >= 0; i--) {
    const target = sections[i]!;
    const el = document.getElementById(target);
    if (el && el.getBoundingClientRect().top <= 120) {
      activeSection.value = target;
      break;
    }
  }
}

let authUnsub: (() => void) | null = null;

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  supabase.auth.getSession().then(({ data }) => {
    isLoggedIn.value = !!data.session;
  });
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session;
  });
  authUnsub = data.subscription.unsubscribe;
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  authUnsub?.();
});
</script>

<template>
  <header class="navbar" :class="{ scrolled }">
    <div class="navbar-inner">
      <a class="logo" href="#" @click.prevent="scrollTo('hero')">
        <span class="logo-icon">&#9670;</span>
        <span class="logo-text">ApexMarkets</span>
      </a>

      <nav class="nav-links" :class="{ open: mobileMenuOpen }">
        <a
          v-for="link in navLinks"
          :key="link.target"
          :href="'#' + link.target"
          class="nav-link"
          :class="{ active: activeSection === link.target }"
          @click.prevent="scrollTo(link.target)"
        >
          {{ link.name }}
        </a>
        <div class="nav-auth">
          <a href="/markets" class="nav-link auth-link">Trhy</a>
          <template v-if="isLoggedIn">
            <a href="/dashboard" class="btn btn-primary nav-cta">Dashboard</a>
          </template>
          <template v-else>
            <a href="/login" class="nav-link auth-link">Prihlásenie</a>
            <a href="/register" class="btn btn-primary nav-cta">Registrácia</a>
          </template>
        </div>
      </nav>

      <button
        class="mobile-toggle"
        @click="mobileMenuOpen = !mobileMenuOpen"
        aria-label="Toggle menu"
      >
        <span :class="{ active: mobileMenuOpen }"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  transition:
    background var(--transition-normal),
    border-color var(--transition-normal);
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: rgba(10, 14, 26, 0.9);
  backdrop-filter: blur(20px);
  border-bottom-color: rgba(59, 130, 246, 0.08);
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-white);
  font-size: 1.25rem;
  font-weight: 700;
}
.logo-icon {
  color: #3b82f6;
  font-size: 1.5rem;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.nav-link {
  padding: 0.5rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}
.nav-link:hover,
.nav-link.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.nav-auth {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.75rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--color-border);
}
.auth-link {
  color: var(--color-text-muted);
}
.nav-cta {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 20px;
  position: relative;
}
.mobile-toggle span,
.mobile-toggle span::before,
.mobile-toggle span::after {
  display: block;
  width: 28px;
  height: 2px;
  background: var(--color-white);
  border-radius: 2px;
  transition: all var(--transition-normal);
  position: absolute;
}
.mobile-toggle span {
  top: 9px;
}
.mobile-toggle span::before {
  content: "";
  top: -8px;
}
.mobile-toggle span::after {
  content: "";
  top: 8px;
}
.mobile-toggle span.active {
  background: transparent;
}
.mobile-toggle span.active::before {
  transform: rotate(45deg);
  top: 0;
}
.mobile-toggle span.active::after {
  transform: rotate(-45deg);
  top: 0;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }
  .nav-links {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 26, 0.97);
    backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-normal);
    z-index: 99;
  }
  .nav-links.open {
    opacity: 1;
    pointer-events: auto;
  }
  .nav-link {
    font-size: 1.25rem;
    padding: 0.75rem 1.5rem;
  }
  .nav-auth {
    flex-direction: column;
    border-left: none;
    border-top: 1px solid var(--color-border);
    margin-left: 0;
    padding-left: 0;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  .nav-cta {
    margin-top: 0.5rem;
  }
}
</style>
