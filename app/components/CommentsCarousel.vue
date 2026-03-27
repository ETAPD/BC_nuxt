<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Comment {
  id: number
  author: string
  role: string
  content: string
  avatar_url: string | null
  created_at: string
}

const MOCK_COMMENTS: Comment[] = [
  { id: 1, author: 'Alex Novak', role: 'Day Trader', content: 'Platform execution is lightning fast. My scalping strategy improved immediately. The charts and order flow are top-notch.', avatar_url: null, created_at: '2026-03-18T12:00:00Z' },
  { id: 2, author: 'Maya Chen', role: 'Portfolio Manager', content: 'Clean dashboards and reliable data. Managing client allocations is much easier now. The watchlist features save me hours.', avatar_url: null, created_at: '2026-03-16T09:30:00Z' },
  { id: 3, author: 'Diego Ruiz', role: 'Swing Trader', content: 'Buy and sell orders are straightforward. The UI reduces mistakes and the one-click trading is a game changer.', avatar_url: null, created_at: '2026-03-14T18:20:00Z' },
  { id: 4, author: 'Sara Patel', role: 'Quant Researcher', content: 'API access and export tools saved us hours. The Elite membership gives access to higher frequency data for backtesting.', avatar_url: null, created_at: '2026-03-10T14:05:00Z' },
  { id: 5, author: 'Jonas Weber', role: 'Retail Investor', content: 'Finally a platform that balances power and simplicity. Registration took 30 seconds and I was trading within minutes.', avatar_url: null, created_at: '2026-03-08T07:45:00Z' },
]

const comments = ref<Comment[]>([])
const currentIndex = ref(0)
const isLoading = ref(true)
const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null)
const isTransitioning = ref(false)

async function fetchComments() {
  isLoading.value = true
  await new Promise((r) => setTimeout(r, 400))
  comments.value = MOCK_COMMENTS.slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  isLoading.value = false
}

const visibleComments = computed(() => {
  if (comments.value.length === 0) return []
  const total = comments.value.length
  const indices: number[] = []
  for (let i = -1; i <= 1; i++) {
    indices.push((currentIndex.value + i + total) % total)
  }
  return indices.map((idx) => ({ ...comments.value[idx]!, _index: idx }))
})

function next() {
  if (isTransitioning.value || comments.value.length === 0) return
  isTransitioning.value = true
  currentIndex.value = (currentIndex.value + 1) % comments.value.length
  setTimeout(() => (isTransitioning.value = false), 500)
  resetAutoplay()
}

function prev() {
  if (isTransitioning.value || comments.value.length === 0) return
  isTransitioning.value = true
  currentIndex.value = (currentIndex.value - 1 + comments.value.length) % comments.value.length
  setTimeout(() => (isTransitioning.value = false), 500)
  resetAutoplay()
}

function goTo(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = index
  setTimeout(() => (isTransitioning.value = false), 500)
  resetAutoplay()
}

function startAutoplay() { autoplayInterval.value = setInterval(next, 5000) }
function resetAutoplay() {
  if (autoplayInterval.value) clearInterval(autoplayInterval.value)
  startAutoplay()
}
function getInitials(name: string) { return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) }
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => { fetchComments(); startAutoplay() })
onUnmounted(() => { if (autoplayInterval.value) clearInterval(autoplayInterval.value) })
</script>

<template>
  <section id="comments" class="comments-section">
    <div class="section-bg">
      <div class="grid-overlay"></div>
      <div class="glow-green"></div>
    </div>
    <div class="container">
      <div class="section-header">
        <span class="section-badge"><span class="badge-icon">&#9679;</span> Live Testimonials</span>
        <h2 class="section-title">What Our <span class="text-green">Traders</span> Say</h2>
        <p class="section-desc">Real feedback from traders and investors using our platform every day.</p>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading market sentiment...</p>
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <span class="empty-icon">&#128172;</span>
        <p>No comments yet. Be the first to share your experience!</p>
      </div>

      <div v-else class="carousel-wrapper">
        <button class="carousel-btn carousel-btn-prev" @click="prev" aria-label="Previous comment">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div class="carousel-track">
          <div v-for="(comment, i) in visibleComments" :key="comment.id + '-' + comment._index" class="carousel-card"
            :class="{ 'card-center': i === 1, 'card-left': i === 0, 'card-right': i === 2 }">
            <div class="card-top">
              <div class="quote-icon">&#10077;</div>
              <div class="card-stars"><span v-for="s in 5" :key="s">&#9733;</span></div>
            </div>
            <p class="card-content">{{ comment.content }}</p>
            <div class="card-footer">
              <div class="card-avatar" v-if="comment.avatar_url"><img :src="comment.avatar_url" :alt="comment.author" /></div>
              <div class="card-avatar card-avatar-initials" v-else>{{ getInitials(comment.author) }}</div>
              <div class="card-info">
                <span class="card-author">{{ comment.author }}</span>
                <span class="card-role">{{ comment.role }}</span>
              </div>
              <span class="card-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="card-accent"></div>
          </div>
        </div>

        <button class="carousel-btn carousel-btn-next" @click="next" aria-label="Next comment">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div class="carousel-dots">
          <button v-for="(_, i) in comments" :key="i" class="dot" :class="{ active: i === currentIndex }" @click="goTo(i)" :aria-label="'Go to comment ' + (i + 1)"></button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comments-section { position: relative; padding: 6rem 0; overflow: hidden; background: #0a0e1a; }
.section-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(0,255,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
.glow-green {
  position: absolute; top: -40%; left: 50%; transform: translateX(-50%);
  width: 800px; height: 800px;
  background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%); border-radius: 50%;
}
.container { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

.section-header { text-align: center; margin-bottom: 4rem; }
.section-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 1rem; background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.2); border-radius: 9999px;
  font-size: 0.8rem; font-weight: 600; color: #3b82f6;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.25rem;
}
.badge-icon { font-size: 0.5rem; animation: pulse-dot 2s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.section-title { font-size: 2.75rem; font-weight: 800; color: #fff; margin-bottom: 1rem; line-height: 1.15; }
.text-green { color: #3b82f6; text-shadow: 0 0 40px rgba(59,130,246,0.3); }
.section-desc { font-size: 1.1rem; color: #7a8a7a; max-width: 520px; margin: 0 auto; }

.loading-state, .empty-state { text-align: center; padding: 4rem 2rem; color: #7a8a7a; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 1rem; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

.carousel-wrapper { position: relative; display: flex; align-items: center; gap: 1rem; }
.carousel-track { display: flex; justify-content: center; align-items: center; gap: 1.5rem; flex: 1; min-height: 340px; perspective: 1000px; }

.carousel-card {
  position: relative;
  background: linear-gradient(145deg, #0f1724 0%, #0c1220 100%);
  border: 1px solid rgba(59,130,246,0.12); border-radius: 16px;
  padding: 2rem; width: 360px; min-height: 280px;
  display: flex; flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4,0,0.2,1); overflow: hidden; flex-shrink: 0;
}
.carousel-card::before { content: ''; position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(145deg, rgba(59,130,246,0.04), transparent); pointer-events: none; }
.card-center { transform: scale(1); opacity: 1; z-index: 2; border-color: rgba(59,130,246,0.25); box-shadow: 0 0 60px rgba(59,130,246,0.08), 0 20px 40px rgba(0,0,0,0.4); }
.card-left, .card-right { transform: scale(0.88); opacity: 0.5; z-index: 1; filter: blur(1px); }
.card-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, #3b82f6, transparent); opacity: 0; transition: opacity 0.3s; }
.card-center .card-accent { opacity: 1; }

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.quote-icon { font-size: 2rem; color: #3b82f6; opacity: 0.4; line-height: 1; }
.card-stars { display: flex; gap: 0.15rem; color: #3b82f6; font-size: 0.85rem; }
.card-content { flex: 1; font-size: 0.95rem; line-height: 1.7; color: #b8c4d4; margin-bottom: 1.5rem; }
.card-footer { display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(59,130,246,0.08); }
.card-avatar { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(59,130,246,0.3); flex-shrink: 0; }
.card-avatar img { width: 100%; height: 100%; object-fit: cover; }
.card-avatar-initials { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f1e3d, #1e3058); color: #3b82f6; font-size: 0.8rem; font-weight: 700; }
.card-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.card-author { color: #e2e8f0; font-weight: 600; font-size: 0.9rem; }
.card-role { color: #3b82f6; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.card-date { color: #64748b; font-size: 0.75rem; white-space: nowrap; }

.carousel-btn {
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(59,130,246,0.2); background: rgba(59,130,246,0.06);
  color: #3b82f6; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.25s ease; flex-shrink: 0; z-index: 3;
}
.carousel-btn:hover { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.4); box-shadow: 0 0 20px rgba(59,130,246,0.15); }

.carousel-dots { position: absolute; bottom: -2.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; }
.dot { width: 8px; height: 8px; border-radius: 9999px; border: none; background: rgba(59,130,246,0.15); cursor: pointer; transition: all 0.3s ease; padding: 0; }
.dot.active { width: 28px; background: #3b82f6; box-shadow: 0 0 12px rgba(59,130,246,0.4); }

@media (max-width: 960px) {
  .card-left, .card-right { display: none; }
  .carousel-card { width: 100%; max-width: 460px; }
  .section-title { font-size: 2rem; }
}
@media (max-width: 600px) {
  .comments-section { padding: 4rem 0; }
  .carousel-card { padding: 1.5rem; min-height: auto; }
  .section-title { font-size: 1.65rem; }
  .carousel-btn { width: 36px; height: 36px; }
}
</style>
