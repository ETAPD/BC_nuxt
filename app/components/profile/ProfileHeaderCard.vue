<template>
  <section class="profile-card">
    <div class="pc-left">
      <div class="pc-avatar-wrap">
        <img
          v-if="user && user.profile_picture"
          :src="user.profile_picture"
          alt=""
          class="pc-avatar-img"
        />
        <span v-else class="pc-avatar-initials">{{ (user && user.initials) || 'U' }}</span>
        <label class="pc-avatar-upload" title="Zmeniť fotku">
          <input
            type="file"
            accept="image/*"
            hidden
            :disabled="uploadingPicture"
            @change="onFileChange"
          />
          <span>{{ uploadingPicture ? '…' : '📷' }}</span>
        </label>
      </div>

      <div class="pc-info">
        <h1 class="pc-name">{{ (user && user.full_name) || 'Používateľ' }}</h1>
        <span class="pc-email">{{ user && user.email }}</span>
        <div class="pc-meta">
          <span v-if="user && user.country" class="pc-meta-item">🌍 {{ user.country }}</span>
          <span class="pc-meta-item">💱 {{ (user && user.preferred_currency) || 'USD' }}</span>
        </div>
      </div>
    </div>

    <div class="pc-right">
      <span :class="['status-badge', 'status-' + ((user && user.status) || 'active')]">
        {{ (user && user.status) || 'active' }}
      </span>
      <span :class="['role-badge', 'role-' + ((user && user.role) || 'basic')]">
        {{ (user && user.role) || 'basic' }}
      </span>
      <button class="btn btn-accent" @click="$emit('edit')">Upraviť profil</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProfileHeaderCard',
  props: {
    user: {
      type: Object,
      default: null,
    },
    uploadingPicture: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['edit', 'upload-picture'],
  methods: {
    onFileChange(event) {
      const file = event.target && event.target.files ? event.target.files[0] : null
      if (file) {
        this.$emit('upload-picture', file)
      }
      if (event.target) {
        event.target.value = ''
      }
    },
  },
}
</script>

<style scoped>
.profile-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.pc-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.pc-avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.pc-avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(59, 130, 246, 0.25);
}

.pc-avatar-initials {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.18);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
  border: 3px solid rgba(59, 130, 246, 0.25);
}

.pc-avatar-upload {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  border: 2px solid var(--color-background-soft);
  transition: transform 0.15s;
}

.pc-avatar-upload:hover {
  transform: scale(1.1);
}

.pc-name {
  margin: 0 0 0.15rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-white);
}

.pc-email {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.pc-meta {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.45rem;
  flex-wrap: wrap;
}

.pc-meta-item {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  background: rgba(59, 130, 246, 0.06);
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.pc-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.status-badge,
.role-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}
.status-suspended {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.status-admin {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.role-basic {
  background: rgba(100, 116, 139, 0.12);
  color: #94a3b8;
}
.role-pro {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.role-premium {
  background: rgba(234, 179, 8, 0.12);
  color: #eab308;
}
.role-admin {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-background-mute);
  color: var(--color-white);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--color-border-hover);
}

.btn-accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.btn-accent:hover {
  background: rgba(59, 130, 246, 0.85);
}

@media (max-width: 900px) {
  .profile-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .pc-right {
    align-self: flex-start;
  }
}

@media (max-width: 640px) {
  .pc-avatar-wrap {
    width: 60px;
    height: 60px;
  }

  .pc-avatar-img,
  .pc-avatar-initials {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }

  .pc-name {
    font-size: 1.2rem;
  }
}
</style>
