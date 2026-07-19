<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans text-slate-800">
    <header class="bg-indigo-600 text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 class="text-2xl font-bold tracking-tight mb-4 md:mb-0">🏆 Tournament Manager</h1>
        <nav class="flex gap-2">
          <RouterLink to="/setup" class="px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Setup</RouterLink>
          <RouterLink to="/matches" class="px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Match Center</RouterLink>
          <RouterLink to="/standings" class="px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors" active-class="bg-indigo-700 font-semibold">Standings</RouterLink>
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
