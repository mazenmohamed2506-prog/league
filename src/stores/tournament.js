import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export const useTournamentStore = defineStore('tournament', () => {
  const tournaments = useStorage('app_tournaments', [])
  const activeTournamentId = useStorage('app_active_tournament_id', null)

  const activeTournament = computed(() => tournaments.value.find(t => t.id === activeTournamentId.value) || null)

  const teams = computed(() => activeTournament.value?.teams || [])
  const settings = computed(() => activeTournament.value?.settings || {
    type: 'league',
    winPoints: 3, drawPoints: 1, lossPoints: 0, tieBreakerPriority: ['GD', 'GF'],
    cupFormat: 'random',
    cupLegs: 1
  })
  const matches = computed(() => activeTournament.value?.matches || [])
  const manualStandingsOrder = computed(() => activeTournament.value?.manualStandingsOrder || [])

  function createTournament(name, type = 'league') {
    const newTournament = {
      id: Date.now().toString(),
      name: name.trim(),
      teams: [],
      settings: {
        type: type,
        winPoints: 3, drawPoints: 1, lossPoints: 0, tieBreakerPriority: ['GD', 'GF'],
        cupFormat: 'random',
        cupLegs: 1
      },
      matches: [],
      manualStandingsOrder: []
    }
    tournaments.value.push(newTournament)
    activeTournamentId.value = newTournament.id
    return newTournament.id
  }

  function selectTournament(id) { activeTournamentId.value = id }
  
  function deleteTournament(id) {
    tournaments.value = tournaments.value.filter(t => t.id !== id)
    if (activeTournamentId.value === id) activeTournamentId.value = null
  }

  function addTeam(name) {
    if (!activeTournament.value) return
    if (name.trim() && !activeTournament.value.teams.find(t => t.name === name.trim())) {
      activeTournament.value.teams.push({ id: Date.now().toString() + Math.random().toString(36).substring(7), name: name.trim() })
    }
  }

  function removeTeam(id) {
    if (!activeTournament.value) return
    activeTournament.value.teams = activeTournament.value.teams.filter(t => t.id !== id)
  }

  function updateSettings(newSettings) {
    if (!activeTournament.value) return
    activeTournament.value.settings = { ...activeTournament.value.settings, ...newSettings }
  }

  function swapTeamsInStandings(team1Id, team2Id) {
    if (!activeTournament.value || activeTournament.value.settings.type !== 'league') return
    
    let order = [...(activeTournament.value.manualStandingsOrder || [])]
    const allIds = activeTournament.value.teams.map(t => t.id)
    allIds.forEach(id => { if (!order.includes(id)) order.push(id) })
    
    const idx1 = order.indexOf(team1Id)
    const idx2 = order.indexOf(team2Id)
    if (idx1 !== -1 && idx2 !== -1) {
      const temp = order[idx1]
      order[idx1] = order[idx2]
      order[idx2] = temp
    }
    activeTournament.value.manualStandingsOrder = order
  }

  function resetManualStandings() {
    if (activeTournament.value) activeTournament.value.manualStandingsOrder = []
  }

  const getNextPowerOf2 = (n) => Math.pow(2, Math.ceil(Math.log2(n)))
  const getRoundName = (numTeamsRemaining) => {
    if (numTeamsRemaining === 2) return 'Final'
    if (numTeamsRemaining === 4) return 'Semi-Final'
    if (numTeamsRemaining === 8) return 'Quarter-Final'
    return `Round of ${numTeamsRemaining}`
  }

  function generateFixtures() {
    if (!activeTournament.value) return
    activeTournament.value.matches = []
    activeTournament.value.manualStandingsOrder = []
    
    const type = activeTournament.value.settings.type
    let t = [...activeTournament.value.teams]

    if (type === 'league') {
      if (t.length % 2 !== 0) t.push({ id: 'bye', name: 'Bye' })
      const n = t.length
      const rounds = n - 1
      const half = n / 2
      const teamIndices = t.map((_, i) => i).slice(1)

      for (let round = 0; round < rounds; round++) {
        const currentTeamIndices = [0].concat(teamIndices)
        for (let i = 0; i < half; i++) {
          const t1 = t[currentTeamIndices[i]]
          const t2 = t[currentTeamIndices[n - 1 - i]]
          if (t1.id !== 'bye' && t2.id !== 'bye') {
            activeTournament.value.matches.push({
              id: Date.now().toString() + '_' + round + '_' + i,
              round: round + 1, roundName: `Matchday ${round + 1}`,
              team1_id: t1.id, team2_id: t2.id,
              score1: null, score2: null, isPlayed: false, isKnockout: false, legs: 1
            })
          }
        }
        teamIndices.push(teamIndices.shift())
      }
    } else if (type === 'cup') {
      const cupLegs = activeTournament.value.settings.cupLegs
      const cupFormat = activeTournament.value.settings.cupFormat

      let numTeams = t.length
      let numSlots = getNextPowerOf2(numTeams)
      let byesCount = numSlots - numTeams

      let teamsPool = [...t]
      if (cupFormat === 'random') {
        teamsPool = teamsPool.sort(() => 0.5 - Math.random())
      }

      for(let i=0; i<byesCount; i++) {
         teamsPool.push({ id: 'bye', name: 'Bye' })
      }
      
      let totalRounds = Math.log2(numSlots)
      for(let r = 1; r <= totalRounds; r++) {
         let currentSlots = numSlots / Math.pow(2, r - 1)
         let matchesInThisRound = currentSlots / 2
         let rName = getRoundName(currentSlots)
         
         for(let m = 0; m < matchesInThisRound; m++) {
            let matchId = `cup_${r}_${m}`
            let t1_id = null; let t2_id = null;
            
            if (r === 1) {
              t1_id = teamsPool.pop()?.id
              t2_id = teamsPool.pop()?.id
            }
            
            let nextMatchId = r < totalRounds ? `cup_${r+1}_${Math.floor(m/2)}` : null
            let isFinal = r === totalRounds
            let legs = (cupLegs === 2 && !isFinal) ? 2 : 1
            
            let matchObj = {
              id: matchId, round: r, roundName: rName,
              team1_id: t1_id, team2_id: t2_id,
              score1: null, score2: null, score1_leg2: null, score2_leg2: null,
              isPlayed: false, isKnockout: true, legs: legs,
              nextMatchId: nextMatchId, winner_id: null
            }

            if (r === 1) {
              if (t1_id === 'bye') { matchObj.winner_id = t2_id; matchObj.isPlayed = true }
              if (t2_id === 'bye') { matchObj.winner_id = t1_id; matchObj.isPlayed = true }
            }

            activeTournament.value.matches.push(matchObj)
         }
      }
      propagateWinners()
    }
  }

  function propagateWinners() {
    if (!activeTournament.value || activeTournament.value.settings.type !== 'cup') return
    let matches = activeTournament.value.matches

    matches.forEach(m => {
       if (m.winner_id && m.nextMatchId) {
          let nextMatch = matches.find(nx => nx.id === m.nextMatchId)
          if (nextMatch) {
             let currentMatchIndex = parseInt(m.id.split('_')[2])
             if (currentMatchIndex % 2 === 0) {
               nextMatch.team1_id = m.winner_id
             } else {
               nextMatch.team2_id = m.winner_id
             }
          }
       }
    })
  }

  function updateMatchScore(matchId, scores) {
    if (!activeTournament.value) return
    const match = activeTournament.value.matches.find(m => m.id === matchId)
    if (match) {
      match.score1 = scores.score1 !== null ? Number(scores.score1) : null
      match.score2 = scores.score2 !== null ? Number(scores.score2) : null
      
      if (match.legs === 2) {
         match.score1_leg2 = scores.score1_leg2 !== null ? Number(scores.score1_leg2) : null
         match.score2_leg2 = scores.score2_leg2 !== null ? Number(scores.score2_leg2) : null
      }

      if (match.legs === 1) {
         match.isPlayed = match.score1 !== null && match.score2 !== null
      } else {
         match.isPlayed = match.score1 !== null && match.score2 !== null && match.score1_leg2 !== null && match.score2_leg2 !== null
      }

      if (match.isKnockout && match.isPlayed) {
         let total1 = match.score1 + (match.score1_leg2 || 0)
         let total2 = match.score2 + (match.score2_leg2 || 0)
         
         if (total1 > total2) match.winner_id = match.team1_id
         else if (total2 > total1) match.winner_id = match.team2_id
         else match.winner_id = null
         
         if (match.winner_id) propagateWinners()
      }
    }
  }

  function resetTournament() {
    if (!activeTournament.value) return
    activeTournament.value.matches = []
    activeTournament.value.manualStandingsOrder = []
  }

  const standings = computed(() => {
    if (!activeTournament.value || activeTournament.value.settings.type !== 'league') return []
    const table = {}
    
    activeTournament.value.teams.forEach(team => {
      table[team.id] = { id: team.id, name: team.name, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, PTS: 0 }
    })

    activeTournament.value.matches.filter(m => m.isPlayed && !m.isKnockout).forEach(match => {
      const t1 = table[match.team1_id]
      const t2 = table[match.team2_id]
      if (!t1 || !t2) return

      const s1 = match.score1
      const s2 = match.score2

      t1.P += 1; t2.P += 1
      t1.GF += s1; t2.GF += s2
      t1.GA += s2; t2.GA += s1
      t1.GD = t1.GF - t1.GA; t2.GD = t2.GF - t2.GA

      const set = activeTournament.value.settings
      if (s1 > s2) {
        t1.W += 1; t2.L += 1
        t1.PTS += Number(set.winPoints); t2.PTS += Number(set.lossPoints)
      } else if (s1 < s2) {
        t2.W += 1; t1.L += 1
        t2.PTS += Number(set.winPoints); t1.PTS += Number(set.lossPoints)
      } else {
        t1.D += 1; t2.D += 1
        t1.PTS += Number(set.drawPoints); t2.PTS += Number(set.drawPoints)
      }
    })

    const set = activeTournament.value.settings
    const manualOrder = activeTournament.value.manualStandingsOrder || []

    return Object.values(table).sort((a, b) => {
      const idxA = manualOrder.indexOf(a.id)
      const idxB = manualOrder.indexOf(b.id)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1

      if (b.PTS !== a.PTS) return b.PTS - a.PTS
      if (set.tieBreakerPriority[0] === 'GD') {
        if (b.GD !== a.GD) return b.GD - a.GD
        if (b.GF !== a.GF) return b.GF - a.GF
      } else {
        if (b.GF !== a.GF) return b.GF - a.GF
        if (b.GD !== a.GD) return b.GD - a.GD
      }
      return a.name.localeCompare(b.name)
    })
  })

  return { 
    tournaments, activeTournamentId, activeTournament, 
    teams, settings, matches, standings, manualStandingsOrder,
    createTournament, selectTournament, deleteTournament,
    addTeam, removeTeam, updateSettings, generateFixtures, updateMatchScore, resetTournament,
    swapTeamsInStandings, resetManualStandings
  }
})
