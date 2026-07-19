<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const { matches, teams } = storeToRefs(store)

const getTeamName = (id) => {
  if (id === 'bye') return 'Bye'
  const team = teams.value.find(t => t.id === id)
  return team ? team.name : 'Unknown'
}

// Group matches by round
const matchesByRound = computed(() => {
  const grouped = {}
  matches.value.forEach(match => {
    if (!grouped[match.round]) {
      grouped[match.round] = []
    }
    grouped[match.round].push(match)
  })
  return grouped
})

const handleSaveScore = (match) => {
  if (match.score1 !== null && match.score1 !== '' && match.score2 !== null && match.score2 !== '') {
    store.updateMatchScore(match.id, match.score1, match.score2)
  }
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex justify-between items-end border-b border-slate-200 pb-4">
      <div>
        <h2 class="text-3xl font-bold text-slate-800">Match Center</h2>
        <p class="text-slate-500 mt-1">Record the results for all tournament fixtures.</p>
      </div>
      <button @click="store.resetTournament" class="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
        Reset Tournament
      </button>
    </div>

    <div v-if="matches.length === 0" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">📅</span>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">No fixtures generated yet</h3>
      <p class="text-slate-500 mb-6">Go to the setup page to add teams and generate the schedule.</p>
      <RouterLink to="/setup" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
        Go to Setup
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div v-for="(roundMatches, round) in matchesByRound" :key="round" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-700">Round {{ round }}</h3>
          <span class="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
            {{ roundMatches.filter(m => m.isPlayed).length }} / {{ roundMatches.length }} Played
          </span>
        </div>
        
        <div class="divide-y divide-slate-100">
          <div v-for="match in roundMatches" :key="match.id" class="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors" :class="{'bg-green-50/30': match.isPlayed}">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              
              <div class="flex-1 w-full flex items-center justify-between sm:justify-end gap-3 text-right">
                <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team1_id)">{{ getTeamName(match.team1_id) }}</span>
                <input 
                  v-model="match.score1" 
                  type="number" 
                  min="0"
                  class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="{'bg-slate-100': match.isPlayed}"
                >
              </div>
              
              <div class="text-slate-400 font-bold px-2">VS</div>
              
              <div class="flex-1 w-full flex items-center justify-between sm:justify-start gap-3 flex-row-reverse sm:flex-row text-left">
                <input 
                  v-model="match.score2" 
                  type="number" 
                  min="0"
                  class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="{'bg-slate-100': match.isPlayed}"
                >
                <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team2_id)">{{ getTeamName(match.team2_id) }}</span>
              </div>

            </div>
            
            <div class="mt-4 flex justify-center">
              <button 
                @click="handleSaveScore(match)"
                class="text-sm font-medium px-4 py-1.5 rounded-full transition-all"
                :class="match.isPlayed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
              >
                {{ match.isPlayed ? 'Update Score' : 'Save Score' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
