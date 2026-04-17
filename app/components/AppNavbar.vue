<script setup lang="ts">
// Navigacny panel - notifikacie, profil, menu
const router = useRouter();
const route = useRoute();
const supabase = useSupabase();

const props = defineProps<{
  userName?: string;
  userInitials?: string;
  userEmail?: string;
  userProfilePicture?: string;
}>();

const localName = ref(props.userName || "");
const localInitials = ref(props.userInitials || "");
const localEmail = ref(props.userEmail || "");
const localProfilePicture = ref(props.userProfilePicture || "");
const isAdmin = ref(false);
const showProfileMenu = ref(false);

const showNotifications = ref(false);
const notifications = ref<any[]>([]);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length,
);

const displayName = computed(() => props.userName || localName.value || "User");
const displayInitials = computed(
  () => props.userInitials || localInitials.value || "U",
);
const displayEmail = computed(() => props.userEmail || localEmail.value || "");
const displayPicture = computed(
  () => props.userProfilePicture || localProfilePicture.value || "",
);

// Navigacne linky
const navLinks = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/markets", label: "Trhy" },
  { path: "/history", label: "História" },
];

// Aktivny odkaz
function isActive(path: string) {
  return route.path === path;
}

// Prepinanie menu
function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) showNotifications.value = false;
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showProfileMenu.value = false;
}

// Navigacne funkcie
function goToProfile() {
  showProfileMenu.value = false;
  router.push("/profile");
}

function goToHistory() {
  showProfileMenu.value = false;
  router.push("/history");
}

function goToSupport() {
  showProfileMenu.value = false;
  router.push("/support");
}

function goToAdmin() {
  showProfileMenu.value = false;
  router.push("/admin");
}

// Odhlasenie
async function handleSignOut() {
  showProfileMenu.value = false;
  await signOut();
  router.push("/login");
}

// Notifikacie
function markAsRead(id: number) {
  const n = notifications.value.find((n) => n.id === id);
  if (n) n.read = true;
  saveNotifications();
}

function markAllRead() {
  notifications.value.forEach((n) => (n.read = true));
  saveNotifications();
}

// Nacitanie notifikacii
function loadNotifications() {
  try {
    const key = `notifications_${displayEmail.value}`;
    const raw = localStorage.getItem(key);
    if (raw) notifications.value = JSON.parse(raw);
  } catch {
  }
}

function saveNotifications() {
  try {
    const key = `notifications_${displayEmail.value}`;
    localStorage.setItem(key, JSON.stringify(notifications.value));
  } catch {
  }
}

// Pridanie notifikacie
function addNotification(title: string, message: string) {
  notifications.value.unshift({
    id: Date.now(),
    title,
    message,
    time: new Date().toISOString(),
    read: false,
  });
  if (notifications.value.length > 50) notifications.value.pop();
  saveNotifications();
}

onMounted(async () => {
  if (!props.userName) {
    try {
      const dbUser = await getDbUser();
      if (dbUser) {
        localName.value =
          dbUser.full_name || dbUser.email?.split("@")[0] || "User";
        localInitials.value =
          dbUser.initials || localName.value.substring(0, 2).toUpperCase();
        localEmail.value = dbUser.email || "";
        localProfilePicture.value = dbUser.profile_picture || "";
      }
    } catch {
    }
  }
  checkIsAdmin().then((v) => (isAdmin.value = v));

  loadNotifications();

  const loginKey = `last_login_notif_${displayEmail.value}`;
  const lastNotif = localStorage.getItem(loginKey);
  const now = Date.now();
  if (!lastNotif || now - Number(lastNotif) > 60000) {
    addNotification(
      "Vitajte späť!",
      `Prihlásili ste sa o ${new Date().toLocaleTimeString()}`,
    );
    localStorage.setItem(loginKey, String(now));
  }
});

let realtimeSub: any = null;

onMounted(() => {
  realtimeSub = supabase
    .channel("navbar-trades")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "trades" },
      (payload: any) => {
        const t = payload.new;
        if (t) {
          addNotification(
            `Príkaz vykonaný: ${t.trade_type} ${t.symbol}`,
            `${t.amount} @ $${Number(t.price).toFixed(2)}`,
          );
        }
      },
    )
    .subscribe();
});

onUnmounted(() => {
  if (realtimeSub) supabase.removeChannel(realtimeSub);
});

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".nav-user-section")) {
    showProfileMenu.value = false;
    showNotifications.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutsideClick));
onUnmounted(() => document.removeEventListener("click", handleOutsideClick));
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <NuxtLink to="/" class="brand">
        <span class="brand-icon">&#9670;</span>
        <span class="brand-text">ApexMarkets</span>
      </NuxtLink>

      <nav class="app-nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          :class="['app-nav-link', { active: isActive(link.path) }]"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="nav-user-section">
        <button
          class="notif-bell"
          @click.stop="toggleNotifications"
          :title="`${unreadCount} unread`"
        >
          <span class="bell-icon">&#128276;</span>
          <span v-if="unreadCount > 0" class="notif-badge">{{
            unreadCount > 9 ? "9+" : unreadCount
          }}</span>
        </button>

        <div v-if="showNotifications" class="notif-dropdown" @click.stop>
          <div class="notif-header">
            <span class="notif-title">Oznámenia</span>
            <button
              v-if="unreadCount > 0"
              class="notif-mark-all"
              @click="markAllRead"
            >
              Označiť všetky ako prečítané
            </button>
          </div>
          <div class="notif-list">
            <div v-if="!notifications.length" class="notif-empty">
              Zatiaľ žiadne oznámenia
            </div>
            <button
              v-for="n in notifications"
              :key="n.id"
              :class="['notif-item', { unread: !n.read }]"
              @click="markAsRead(n.id)"
            >
              <div class="notif-dot" v-if="!n.read"></div>
              <div class="notif-content">
                <div class="notif-item-title">{{ n.title }}</div>
                <div class="notif-item-msg">{{ n.message }}</div>
                <div class="notif-item-time">
                  {{ new Date(n.time).toLocaleString() }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="profile-trigger" @click.stop="toggleProfileMenu">
          <img
            v-if="displayPicture"
            :src="displayPicture"
            alt=""
            class="user-avatar-img"
            @error="localProfilePicture = ''"
          />
          <span v-else class="user-avatar">{{ displayInitials }}</span>
          <span class="user-name-text">{{ displayName }}</span>
          <span class="profile-arrow">&#9662;</span>
        </div>

        <div v-if="showProfileMenu" class="profile-dropdown" @click.stop>
          <div class="profile-dropdown-header">
            <img
              v-if="displayPicture"
              :src="displayPicture"
              alt=""
              class="user-avatar-img sm"
              @error="localProfilePicture = ''"
            />
            <span v-else class="user-avatar sm">{{ displayInitials }}</span>
            <div>
              <div class="pd-name">{{ displayName }}</div>
              <div class="pd-email">{{ displayEmail }}</div>
            </div>
          </div>
          <div class="pd-divider"></div>
          <button class="pd-item" @click="goToProfile">
            <span>&#9881;</span> Nastavenia profilu
          </button>
          <button class="pd-item" @click="goToHistory">
            <span>&#128200;</span> História obchodov
          </button>
          <button class="pd-item" @click="goToSupport">
            <span>&#128172;</span> Podpora
          </button>
          <button v-if="isAdmin" class="pd-item" @click="goToAdmin">
            <span>&#9733;</span> Admin panel
          </button>
          <div class="pd-divider"></div>
          <button class="pd-item pd-danger" @click="handleSignOut">
            <span>&#x2192;</span> Odhlásiť sa
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-white);
  font-weight: 700;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.brand-icon {
  color: var(--color-accent);
  font-size: 1.4rem;
}

/* Nav Links */
.app-nav {
  display: flex;
  gap: 0.25rem;
}

.app-nav-link {
  padding: 0.45rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all 0.2s;
}

.app-nav-link:hover {
  color: var(--color-white);
  background: rgba(59, 130, 246, 0.06);
}

.app-nav-link.active {
  color: var(--color-accent);
  background: rgba(59, 130, 246, 0.1);
  font-weight: 600;
}

/* User Section */
.nav-user-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

/* Notification Bell */
.notif-bell {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
  display: flex;
  align-items: center;
}

.notif-bell:hover {
  background: rgba(59, 130, 246, 0.08);
}

.bell-icon {
  font-size: 1.2rem;
}

.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  font-size: 0.6rem;
  font-weight: 700;
  background: #ef4444;
  color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

/* Notification Dropdown */
.notif-dropdown {
  position: absolute;
  top: 100%;
  right: 40px;
  margin-top: 0.5rem;
  width: 360px;
  max-height: 440px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 200;
  animation: slideDown 0.15s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.notif-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-white);
}

.notif-mark-all {
  font-size: 0.75rem;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.notif-mark-all:hover {
  text-decoration: underline;
}

.notif-list {
  max-height: 380px;
  overflow-y: auto;
}

.notif-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(59, 130, 246, 0.04);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  font-family: inherit;
}

.notif-item:hover {
  background: rgba(59, 130, 246, 0.04);
}

.notif-item.unread {
  background: rgba(59, 130, 246, 0.06);
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
  margin-top: 5px;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-item-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 0.15rem;
}

.notif-item-msg {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-bottom: 0.2rem;
}

.notif-item-time {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  opacity: 0.7;
}

/* Profile Trigger */
.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.profile-trigger:hover {
  background: rgba(59, 130, 246, 0.06);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-avatar.sm {
  width: 36px;
  height: 36px;
  font-size: 0.8rem;
}

.user-avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.user-avatar-img.sm {
  width: 36px;
  height: 36px;
}

.user-name-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-white);
}

.profile-arrow {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

/* Profile Dropdown */
.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 240px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 200;
  animation: slideDown 0.15s ease;
}

.profile-dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
}

.pd-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-white);
}

.pd-email {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.pd-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}

.pd-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
}

.pd-item:hover {
  background: rgba(59, 130, 246, 0.06);
  color: var(--color-white);
}

.pd-danger {
  color: #ef4444;
}

.pd-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

@media (max-width: 768px) {
  .app-header-inner {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .app-nav {
    gap: 0.1rem;
  }

  .app-nav-link {
    padding: 0.35rem 0.5rem;
    font-size: 0.78rem;
  }

  .user-name-text {
    display: none;
  }

  .notif-dropdown {
    width: 300px;
    right: 0;
  }
}
</style>
