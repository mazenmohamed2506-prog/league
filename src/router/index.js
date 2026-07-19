import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/setup'
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

export default router
