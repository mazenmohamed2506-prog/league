<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const { activeTournament } = storeToRefs(store)
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans text-slate-800">
    <header class="bg-indigo-600 text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 md:mb-0 w-full md:w-auto text-center sm:text-left">
          <h1 class="text-2xl font-bold tracking-tight truncate">🏆 {{ activeTournament ? activeTournament.name : 'Tournament Manager' }}</h1>
          <RouterLink v-if="activeTournament" to="/" class="text-sm bg-indigo-500 hover:bg-indigo-400 px-3 py-1.5 rounded-md transition-colors border border-indigo-400 whitespace-nowrap">
            &larr; All Tournaments
          </RouterLink>
        </div>
        <nav v-if="activeTournament" class="flex flex-wrap justify-center gap-2 w-full md:w-auto">
          <RouterLink to="/setup" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Setup</RouterLink>
          <RouterLink to="/matches" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Match Center</RouterLink>
          <RouterLink to="/standings" class="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Standings</RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
      <RouterView />
    </main>
    
    <footer class="bg-slate-100 border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
      Built with Vue 3, Pinia & Tailwind CSS
    </footer>
  </div>
</template>

<style>
/* Any global styles can go here if needed, but Tailwind should handle most */
</style>
