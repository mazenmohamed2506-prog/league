<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const { matches, teams } = storeToRefs(store)

const searchQuery = ref('')

const getTeamName = (id) => {
  if (id === 'bye') return 'Bye'
  if (!id) return 'TBD'
  const team = teams.value.find(t => t.id === id)
  return team ? team.name : 'Unknown'
}

const matchesByRound = computed(() => {
  const grouped = {}
  
  const filteredMatches = matches.value.filter(match => {
    if (!searchQuery.value.trim()) return true
    
    const team1Name = getTeamName(match.team1_id).toLowerCase()
    const team2Name = getTeamName(match.team2_id).toLowerCase()
    const query = searchQuery.value.trim().toLowerCase()
    
    return team1Name.includes(query) || team2Name.includes(query)
  })

  filteredMatches.forEach(match => {
    const key = match.roundName || `Round ${match.round}`
    if (!grouped[key]) {
      grouped[key] = { round: match.round, matches: [] }
    }
    grouped[key].matches.push(match)
  })
  return Object.values(grouped).sort((a, b) => a.round - b.round)
})

const handleSaveScore = (match) => {
  if (match.legs === 2) {
    if (match.score1 !== null && match.score2 !== null && match.score1_leg2 !== null && match.score2_leg2 !== null) {
      store.updateMatchScore(match.id, { 
        score1: match.score1, score2: match.score2,
        score1_leg2: match.score1_leg2, score2_leg2: match.score2_leg2
      })
    }
  } else {
    if (match.score1 !== null && match.score2 !== null) {
      store.updateMatchScore(match.id, { score1: match.score1, score2: match.score2 })
    }
  }
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-slate-200 pb-4 text-center sm:text-left">
      <div>
        <h2 class="text-3xl font-bold text-slate-800">Match Center</h2>
        <p class="text-slate-500 mt-1">Record the results for all tournament fixtures.</p>
      </div>
      <button @click="store.resetTournament" class="w-full sm:w-auto text-sm text-red-500 border border-red-200 sm:border-transparent hover:text-red-700 font-medium px-3 py-2 sm:py-1 rounded-md hover:bg-red-50 transition-colors">
        Reset Tournament
      </button>
    </div>

    <div v-if="matches.length > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-2">
      <div class="relative w-full sm:max-w-xs">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by team name..." 
          class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
        >
      </div>
    </div>

    <div v-if="matches.length === 0" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">📅</span>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">No fixtures generated yet</h3>
      <p class="text-slate-500 mb-6 text-sm sm:text-base">Go to the setup page to add teams and generate the schedule.</p>
      <RouterLink to="/setup" class="w-full sm:w-auto inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
        Go to Setup
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div v-for="group in matchesByRound" :key="group.round" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-700">{{ group.matches[0].roundName || `Round ${group.round}` }}</h3>
          <span class="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
            {{ group.matches.filter(m => m.isPlayed).length }} / {{ group.matches.length }} Played
          </span>
        </div>
        
        <div class="divide-y divide-slate-100">
          <div v-for="match in group.matches" :key="match.id" class="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors" :class="{'bg-green-50/30': match.isPlayed, 'opacity-60': !match.team1_id || !match.team2_id}">
            
            <div v-if="!match.team1_id || !match.team2_id" class="text-center text-slate-500 py-4">
               Waiting for previous rounds...
            </div>
            <div v-else>
               <div v-if="match.legs === 1" class="flex flex-col sm:flex-row items-center gap-4">
                 <div class="flex-1 w-full flex items-center justify-between sm:justify-end gap-3 text-right">
                   <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team1_id)">
                     <span v-if="match.winner_id === match.team1_id" class="text-green-600 mr-1">✓</span>
                     {{ getTeamName(match.team1_id) }}
                   </span>
                   <input v-model="match.score1" type="number" min="0" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}" :disabled="match.team1_id === 'bye' || match.team2_id === 'bye'">
                 </div>
                 <div class="text-slate-400 font-bold px-2">VS</div>
                 <div class="flex-1 w-full flex items-center justify-between sm:justify-start gap-3 flex-row-reverse sm:flex-row text-left">
                   <input v-model="match.score2" type="number" min="0" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}" :disabled="match.team1_id === 'bye' || match.team2_id === 'bye'">
                   <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team2_id)">
                     {{ getTeamName(match.team2_id) }}
                     <span v-if="match.winner_id === match.team2_id" class="text-green-600 ml-1">✓</span>
                   </span>
                 </div>
               </div>

               <div v-if="match.legs === 2" class="space-y-4">
                 <div class="flex flex-col sm:flex-row items-center gap-4">
                   <div class="flex-1 w-full flex items-center justify-between sm:justify-end gap-3 text-right">
                     <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team1_id)">{{ getTeamName(match.team1_id) }}</span>
                     <input v-model="match.score1" type="number" min="0" placeholder="L1" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}">
                   </div>
                   <div class="text-slate-400 text-xs font-bold px-2 whitespace-nowrap">LEG 1</div>
                   <div class="flex-1 w-full flex items-center justify-between sm:justify-start gap-3 flex-row-reverse sm:flex-row text-left">
                     <input v-model="match.score2" type="number" min="0" placeholder="L1" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}">
                     <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team2_id)">{{ getTeamName(match.team2_id) }}</span>
                   </div>
                 </div>
                 
                 <div class="flex flex-col sm:flex-row items-center gap-4">
                   <div class="flex-1 w-full flex items-center justify-between sm:justify-end gap-3 text-right">
                     <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team2_id)">
                        <span v-if="match.winner_id === match.team1_id" class="text-green-600 mr-1">✓</span>
                        {{ getTeamName(match.team2_id) }} (Away)
                     </span>
                     <input v-model="match.score2_leg2" type="number" min="0" placeholder="L2" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}">
                   </div>
                   <div class="text-slate-400 text-xs font-bold px-2 whitespace-nowrap">LEG 2</div>
                   <div class="flex-1 w-full flex items-center justify-between sm:justify-start gap-3 flex-row-reverse sm:flex-row text-left">
                     <input v-model="match.score1_leg2" type="number" min="0" placeholder="L2" class="w-16 text-center font-bold text-lg py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :class="{'bg-slate-100': match.isPlayed}">
                     <span class="font-semibold text-slate-800 truncate" :title="getTeamName(match.team1_id)">
                        {{ getTeamName(match.team1_id) }} (Away)
                        <span v-if="match.winner_id === match.team2_id" class="text-green-600 ml-1">✓</span>
                     </span>
                   </div>
                 </div>
                 
                 <div v-if="match.isPlayed" class="text-center text-sm font-bold text-indigo-600 bg-indigo-50 py-1 rounded-md mt-2">
                    Agg: {{ (match.score1 + match.score1_leg2) }} - {{ (match.score2 + match.score2_leg2) }}
                 </div>
               </div>
               
               <div class="mt-4 flex justify-center" v-if="match.team1_id !== 'bye' && match.team2_id !== 'bye'">
                 <button 
                   @click="handleSaveScore(match)"
                   class="text-sm font-medium px-4 py-1.5 rounded-full transition-all"
                   :class="match.isPlayed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
                 >
                   {{ match.isPlayed ? 'Update Score' : 'Save Score' }}
                 </button>
               </div>
               <div v-else class="text-center text-sm text-slate-400 mt-2">
                  Auto-advanced (Bye)
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
