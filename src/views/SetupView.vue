<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '@/stores/tournament'
import { useRouter } from 'vue-router'

const store = useTournamentStore()
const { teams, settings } = storeToRefs(store)
const router = useRouter()

const newTeamName = ref('')
const errorMsg = ref('')

const handleAddTeam = () => {
  if (!newTeamName.value.trim()) {
    errorMsg.value = 'Team name cannot be empty.'
    return
  }
  if (teams.value.find(t => t.name.toLowerCase() === newTeamName.value.trim().toLowerCase())) {
    errorMsg.value = 'Team already exists.'
    return
  }
  store.addTeam(newTeamName.value)
  newTeamName.value = ''
  errorMsg.value = ''
}

const handleRemoveTeam = (id) => {
  store.removeTeam(id)
}

const handleGenerateFixtures = () => {
  if (teams.value.length < 2) {
    errorMsg.value = 'Add at least 2 teams to generate fixtures.'
    return
  }
  store.generateFixtures()
  router.push('/matches')
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 class="text-xl font-semibold text-slate-800">Teams</h2>
        <p class="text-sm text-slate-500 mt-1">Add or remove teams participating in the tournament.</p>
      </div>
      <div class="p-6">
        <form @submit.prevent="handleAddTeam" class="flex gap-3 mb-6">
          <input 
            v-model="newTeamName" 
            type="text" 
            placeholder="Enter team name..." 
            class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
          <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            Add Team
          </button>
        </form>
        <p v-if="errorMsg" class="text-red-500 text-sm mb-4">{{ errorMsg }}</p>

        <div v-if="teams.length === 0" class="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          No teams added yet. Add teams to start the tournament.
        </div>
        
        <ul v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <li v-for="team in teams" :key="team.id" class="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg group hover:border-indigo-200 transition-colors">
            <span class="font-medium text-slate-700">{{ team.name }}</span>
            <button @click="handleRemoveTeam(team.id)" class="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove Team">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 class="text-xl font-semibold text-slate-800">Tournament Settings</h2>
        <p class="text-sm text-slate-500 mt-1">Configure points awarded for matches.</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Points for Win</label>
            <input v-model.number="settings.winPoints" type="number" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Points for Draw</label>
            <input v-model.number="settings.drawPoints" type="number" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Points for Loss</label>
            <input v-model.number="settings.lossPoints" type="number" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button 
        @click="handleGenerateFixtures" 
        :disabled="teams.length < 2"
        class="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
      >
        Generate Fixtures 🚀
      </button>
    </div>
  </div>
</template>
