import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export const useTournamentStore = defineStore('tournament', () => {
  const teams = useStorage('tournament_teams', [])
  const settings = useStorage('tournament_settings', {
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
    tieBreakerPriority: ['GD', 'GF']
  })
  const matches = useStorage('tournament_matches', [])

  function addTeam(name) {
    if (name.trim() && !teams.value.find(t => t.name === name.trim())) {
      teams.value.push({ id: Date.now().toString(), name: name.trim() })
    }
  }

  function removeTeam(id) {
    teams.value = teams.value.filter(t => t.id !== id)
  }

  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
  }

  function generateFixtures() {
    matches.value = []
    let t = [...teams.value]
    
    // If odd number of teams, add a dummy team for byes
    if (t.length % 2 !== 0) {
      t.push({ id: 'bye', name: 'Bye' })
    }

    const n = t.length
    const rounds = n - 1
    const half = n / 2

    const teamIndices = t.map((_, i) => i).slice(1) // 1 to n-1

    for (let round = 0; round < rounds; round++) {
      const currentTeamIndices = [0].concat(teamIndices)

      for (let i = 0; i < half; i++) {
        const t1 = t[currentTeamIndices[i]]
        const t2 = t[currentTeamIndices[n - 1 - i]]
        
        // Skip match if someone is playing the 'bye' dummy
        if (t1.id !== 'bye' && t2.id !== 'bye') {
          matches.value.push({
            id: Date.now().toString() + '_' + round + '_' + i,
            round: round + 1,
            team1_id: t1.id,
            team2_id: t2.id,
            score1: null,
            score2: null,
            isPlayed: false
          })
        }
      }

      // Rotate array for next round
      teamIndices.push(teamIndices.shift())
    }
  }

  function updateMatchScore(matchId, score1, score2) {
    const match = matches.value.find(m => m.id === matchId)
    if (match) {
      match.score1 = Number(score1)
      match.score2 = Number(score2)
      match.isPlayed = true
    }
  }

  function resetTournament() {
    matches.value = []
  }

  const standings = computed(() => {
    const table = {}
    
    // Initialize table
    teams.value.forEach(team => {
      table[team.id] = {
        id: team.id,
        name: team.name,
        P: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        PTS: 0
      }
    })

    // Process matches
    matches.value.filter(m => m.isPlayed).forEach(match => {
      const t1 = table[match.team1_id]
      const t2 = table[match.team2_id]
      
      // If team was removed after generating fixtures, skip
      if (!t1 || !t2) return

      const s1 = match.score1
      const s2 = match.score2

      t1.P += 1
      t2.P += 1
      t1.GF += s1
      t2.GF += s2
      t1.GA += s2
      t2.GA += s1
      t1.GD = t1.GF - t1.GA
      t2.GD = t2.GF - t2.GA

      if (s1 > s2) {
        t1.W += 1
        t2.L += 1
        t1.PTS += Number(settings.value.winPoints)
        t2.PTS += Number(settings.value.lossPoints)
      } else if (s1 < s2) {
        t2.W += 1
        t1.L += 1
        t2.PTS += Number(settings.value.winPoints)
        t1.PTS += Number(settings.value.lossPoints)
      } else {
        t1.D += 1
        t2.D += 1
        t1.PTS += Number(settings.value.drawPoints)
        t2.PTS += Number(settings.value.drawPoints)
      }
    })

    // Sort by PTS, then GD, then GF
    return Object.values(table).sort((a, b) => {
      if (b.PTS !== a.PTS) return b.PTS - a.PTS
      if (settings.value.tieBreakerPriority[0] === 'GD') {
        if (b.GD !== a.GD) return b.GD - a.GD
        if (b.GF !== a.GF) return b.GF - a.GF
      } else {
        if (b.GF !== a.GF) return b.GF - a.GF
        if (b.GD !== a.GD) return b.GD - a.GD
      }
      return a.name.localeCompare(b.name)
    })
  })

  return { teams, settings, matches, addTeam, removeTeam, updateSettings, generateFixtures, updateMatchScore, resetTournament, standings }
})
