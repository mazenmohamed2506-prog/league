<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const { standings, matches, settings } = storeToRefs(store)

const isTournamentStarted = computed(() => {
  return matches.value.length > 0
})

const handleMoveUp = (index) => {
  if (index > 0) {
    store.swapTeamsInStandings(standings.value[index].id, standings.value[index - 1].id)
  }
}

const handleMoveDown = (index) => {
  if (index < standings.value.length - 1) {
    store.swapTeamsInStandings(standings.value[index].id, standings.value[index + 1].id)
  }
}

</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-slate-200 pb-4 text-center sm:text-left">
      <div>
        <h2 class="text-3xl font-bold text-slate-800">Standings</h2>
        <p class="text-slate-500 mt-1" v-if="settings.type === 'league'">Current league table and rankings.</p>
        <p class="text-slate-500 mt-1" v-if="settings.type === 'cup'">Cup brackets are viewed in the Match Center.</p>
      </div>
      <button v-if="settings.type === 'league'" @click="store.resetManualStandings" class="w-full sm:w-auto text-sm text-indigo-500 border border-indigo-200 sm:border-transparent hover:text-indigo-700 font-medium px-3 py-2 sm:py-1 rounded-md hover:bg-indigo-50 transition-colors">
        Reset Manual Order
      </button>
    </div>

    <div v-if="settings.type === 'cup'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">🏆</span>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">Cup Tournament</h3>
      <p class="text-slate-500 mb-6 text-sm sm:text-base">Cups do not have a points table. Please check the Match Center to see the knockout bracket.</p>
      <RouterLink to="/matches" class="w-full sm:w-auto inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
        Go to Match Center
      </RouterLink>
    </div>

    <div v-else-if="!isTournamentStarted" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">📊</span>
      </div>
      <h3 class="text-lg font-medium text-slate-800 mb-2">No standings available</h3>
      <p class="text-slate-500 mb-6 text-sm sm:text-base">Generate fixtures in the setup page to view the standings table.</p>
      <RouterLink to="/setup" class="w-full sm:w-auto inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
        Go to Setup
      </RouterLink>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
            <th class="p-4 font-semibold w-16 text-center">Pos</th>
            <th class="p-4 font-semibold">Team</th>
            <th class="p-4 font-semibold text-center w-16" title="Played">P</th>
            <th class="p-4 font-semibold text-center w-16" title="Won">W</th>
            <th class="p-4 font-semibold text-center w-16" title="Drawn">D</th>
            <th class="p-4 font-semibold text-center w-16" title="Lost">L</th>
            <th class="p-4 font-semibold text-center w-16" title="Goals For">GF</th>
            <th class="p-4 font-semibold text-center w-16" title="Goals Against">GA</th>
            <th class="p-4 font-semibold text-center w-16" title="Goal Difference">GD</th>
            <th class="p-4 font-bold text-indigo-600 text-center w-20" title="Points">PTS</th>
            <th class="p-4 font-semibold text-center w-24">Swap</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="(team, index) in standings" 
            :key="team.id"
            class="hover:bg-slate-50 transition-colors group"
            :class="{'bg-green-50/20': index === 0, 'bg-red-50/20': index >= standings.length - 2 && standings.length > 4}"
          >
            <td class="p-4 text-center font-bold" :class="index === 0 ? 'text-green-600' : 'text-slate-500'">
              {{ index + 1 }}
            </td>
            <td class="p-4 font-bold text-slate-800">{{ team.name }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.P }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.W }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.D }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.L }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.GF }}</td>
            <td class="p-4 text-center text-slate-600">{{ team.GA }}</td>
            <td class="p-4 text-center font-medium" :class="team.GD > 0 ? 'text-green-600' : team.GD < 0 ? 'text-red-600' : 'text-slate-500'">
              {{ team.GD > 0 ? '+' : '' }}{{ team.GD }}
            </td>
            <td class="p-4 text-center font-bold text-indigo-700 text-lg">{{ team.PTS }}</td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <button @click="handleMoveUp(index)" :disabled="index === 0" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="handleMoveDown(index)" :disabled="index === standings.length - 1" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
