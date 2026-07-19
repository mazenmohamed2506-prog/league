<script setup>
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'

const store = useTournamentStore()
const { standings } = storeToRefs(store)
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="border-b border-slate-200 pb-4">
      <h2 class="text-3xl font-bold text-slate-800">Tournament Standings</h2>
      <p class="text-slate-500 mt-1">Live leaderboard updated dynamically based on your custom points settings.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-800 text-slate-200 text-sm uppercase tracking-wider">
              <th class="px-4 py-4 text-center font-semibold w-16">Rank</th>
              <th class="px-4 py-4 font-semibold">Club</th>
              <th class="px-4 py-4 text-center font-semibold" title="Played">MP</th>
              <th class="px-4 py-4 text-center font-semibold text-green-400" title="Won">W</th>
              <th class="px-4 py-4 text-center font-semibold text-yellow-400" title="Drawn">D</th>
              <th class="px-4 py-4 text-center font-semibold text-red-400" title="Lost">L</th>
              <th class="px-4 py-4 text-center font-semibold hidden md:table-cell" title="Goals For">GF</th>
              <th class="px-4 py-4 text-center font-semibold hidden md:table-cell" title="Goals Against">GA</th>
              <th class="px-4 py-4 text-center font-semibold" title="Goal Difference">GD</th>
              <th class="px-4 py-4 text-center font-bold text-indigo-300 text-base" title="Points">Pts</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-700">
            <tr 
              v-for="(team, index) in standings" 
              :key="team.id"
              class="hover:bg-slate-50 transition-colors"
              :class="{'bg-green-50/30': index === 0, 'bg-slate-50/50': index % 2 !== 0}"
            >
              <td class="px-4 py-4 text-center font-medium">
                <span v-if="index === 0" class="text-xl" title="1st Place">🥇</span>
                <span v-else-if="index === 1" class="text-xl" title="2nd Place">🥈</span>
                <span v-else-if="index === 2" class="text-xl" title="3rd Place">🥉</span>
                <span v-else class="text-slate-500">{{ index + 1 }}</span>
              </td>
              <td class="px-4 py-4 font-bold text-slate-900">{{ team.name }}</td>
              <td class="px-4 py-4 text-center">{{ team.P }}</td>
              <td class="px-4 py-4 text-center">{{ team.W }}</td>
              <td class="px-4 py-4 text-center">{{ team.D }}</td>
              <td class="px-4 py-4 text-center">{{ team.L }}</td>
              <td class="px-4 py-4 text-center hidden md:table-cell text-slate-500">{{ team.GF }}</td>
              <td class="px-4 py-4 text-center hidden md:table-cell text-slate-500">{{ team.GA }}</td>
              <td class="px-4 py-4 text-center font-medium" :class="team.GD > 0 ? 'text-green-600' : team.GD < 0 ? 'text-red-500' : ''">
                {{ team.GD > 0 ? '+' : '' }}{{ team.GD }}
              </td>
              <td class="px-4 py-4 text-center font-black text-indigo-700 text-lg">{{ team.PTS }}</td>
            </tr>
            <tr v-if="standings.length === 0">
              <td colspan="10" class="px-4 py-12 text-center text-slate-400 bg-slate-50">
                No teams available. Add teams to view standings.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
