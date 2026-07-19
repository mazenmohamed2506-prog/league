import { createRouter, createWebHistory } from 'vue-router'
import { useTournamentStore } from '@/stores/tournament'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/SetupView.vue')
    },
    {
      path: '/matches',
      name: 'matches',
      component: () => import('../views/MatchCenterView.vue')
    },
    {
      path: '/standings',
      name: 'standings',
      component: () => import('../views/StandingsView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = useTournamentStore()
  if (to.name !== 'dashboard' && !store.activeTournamentId) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
