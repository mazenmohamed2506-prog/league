<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'
import { useRouter } from 'vue-router'

const store = useTournamentStore()
const { tournaments } = storeToRefs(store)
const router = useRouter()

const newTournamentName = ref('')
const tournamentType = ref('league')
const errorMsg = ref('')

const handleCreateTournament = () => {
  if (!newTournamentName.value.trim()) {
    errorMsg.value = 'Tournament name cannot be empty.'
    return
  }
  
  store.createTournament(newTournamentName.value, tournamentType.value)
  newTournamentName.value = ''
  tournamentType.value = 'league'
  errorMsg.value = ''
  
  router.push('/setup')
}

const handleSelectTournament = (id) => {
  store.selectTournament(id)
  router.push('/setup')
}

const handleDeleteTournament = (id) => {
  if (confirm('Are you sure you want to delete this tournament? All its data will be lost.')) {
    store.deleteTournament(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="text-center py-8">
      <h2 class="text-4xl font-bold text-slate-800 mb-4">Tournaments Dashboard</h2>
      <p class="text-slate-500 text-lg">Manage all your tournaments in one place.</p>
    </div>

    <!-- Create Tournament Form -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h3 class="text-xl font-semibold text-slate-800">Create New Tournament</h3>
      </div>
      <div class="p-6">
        <form @submit.prevent="handleCreateTournament" class="flex flex-col sm:flex-row gap-3">
          <input 
            v-model="newTournamentName" 
            type="text" 
            placeholder="e.g. Summer League 2024" 
            class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
          <select v-model="tournamentType" class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white">
            <option value="league">League (دوري)</option>
            <option value="cup">Cup (كأس)</option>
          </select>
          <button type="submit" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap">
            Create
          </button>
        </form>
        <p v-if="errorMsg" class="text-red-500 text-sm mt-3">{{ errorMsg }}</p>
      </div>
    </div>

    <!-- Tournaments List -->
    <div>
      <h3 class="text-2xl font-bold text-slate-700 mb-6">Your Tournaments</h3>
      
      <div v-if="tournaments.length === 0" class="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        No tournaments yet. Create one above to get started!
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="t in tournaments" :key="t.id" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group relative">
          <div class="flex justify-between items-start mb-2">
            <h4 class="text-xl font-bold text-slate-800 truncate pr-2" :title="t.name">{{ t.name }}</h4>
            <span class="text-xs font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
              {{ t.settings?.type === 'cup' ? 'Cup' : 'League' }}
            </span>
          </div>
          <div class="text-slate-500 text-sm mb-6 flex gap-4">
            <span><span class="font-semibold text-slate-700">{{ t.teams.length }}</span> Teams</span>
            <span><span class="font-semibold text-slate-700">{{ t.matches.filter(m => m.isPlayed).length }} / {{ t.matches.length }}</span> Matches</span>
          </div>
          
          <div class="flex gap-2">
            <button @click="handleSelectTournament(t.id)" class="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors text-center">
              Manage
            </button>
            <button @click="handleDeleteTournament(t.id)" class="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
