<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { contextIntakeFields, contextOffsets, contextQuestionEnds, contextQuestionStats, contextResponseOptions, contextScenes, contexts, defaults, groups, questions, stats } from './data'

const screen = ref('home')
const mobileMenu = ref(false)
const profileMenu = ref(false)
const createProfileOpen = ref(false)
const manageProfileOpen = ref(false)
const newProfileName = ref('')
const editProfileName = ref('')
const profiles = ref([])
const activeProfileId = ref('')
const compareProfileIds = ref([])
let hydratingProfile = false
const assessmentIndex = ref(0)
const assessmentAnswers = reactive({})
const contextIntake = reactive({ workType: 'knowledge', workSetting: 'shared', learningType: 'self', living: 'alone', relationship: 'none', friendsPattern: 'small' })
const contextAnswers = reactive({})
const contextScores = reactive({})
const contextWeights = reactive({})
const contextAssessmentId = ref('work')
const contextAssessmentIndex = ref(0)
const contextSetupCompleted = ref(false)
const lastCompletedContextId = ref('')
const scores = reactive({ ...defaults })
const selectedContext = ref('self')
const compareContext = ref('work')
const visualContext = ref('self')
const activeGroup = ref('all')
const detailStat = ref(null)
const checkinOpen = ref(false)
const savedNotice = ref('')
const wearable = reactive({ loaded: false, name: '', size: 0, updated: '', metrics: [] })

const navItems = [
  { id: 'map', label: 'My map' },
  { id: 'compare', label: 'Compare profiles' },
  { id: 'worlds', label: 'Different worlds' },
  { id: 'rhythms', label: 'Observed rhythms' },
  { id: 'about', label: 'What it’s for' },
  { id: 'method', label: 'How it works' },
]

const currentContext = computed(() => contexts.find(c => c.id === selectedContext.value))
const compared = computed(() => contexts.find(c => c.id === compareContext.value))
const activeProfile = computed(() => profiles.value.find(profile => profile.id === activeProfileId.value))
const comparisonProfiles = computed(() => profiles.value.filter(profile => compareProfileIds.value.includes(profile.id)).slice(0, 5))
const profileColors = ['#ef6a4c', '#2e8b72', '#687cc7', '#dda338', '#9567a4']

function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))) }
function contextualScore(id, contextId) {
  if (contextId === 'self') return scores[id]
  if (contextScores[contextId]?.[id] !== undefined) return contextScores[contextId][id]
  return clamp(scores[id] + (contextOffsets[contextId]?.[id] || 0))
}

const availableContexts = computed(() => contexts.filter(context => {
  if (context.id === 'self' || context.id === 'friends' || context.id === 'home' || context.id === 'holiday') return true
  if (context.id === 'work') return contextIntake.workType !== 'none'
  if (context.id === 'learning') return contextIntake.learningType !== 'none'
  if (context.id === 'partner') return contextIntake.relationship !== 'none'
  return true
}))

const activeContextQuestion = computed(() => {
  const statId = contextQuestionStats[contextAssessmentIndex.value]
  const context = contexts.find(item => item.id === contextAssessmentId.value)
  const scene = contextScenes[context?.id]?.[statId] || contextPrompt(statId, context)
  return { stat: statId, text: `${scene} ${contextQuestionEnds[statId] || ''}`.trim(), options: contextResponseOptions[statId] }
})
function isContextComplete(contextId) { return contextQuestionStats.every(statId => contextScores[contextId]?.[statId] !== undefined) }
const unfinishedContexts = computed(() => availableContexts.value.filter(context => context.id !== 'self' && !isContextComplete(context.id)))
const nextContext = computed(() => unfinishedContexts.value[0] || null)
const completedContextCount = computed(() => availableContexts.value.filter(context => context.id !== 'self' && isContextComplete(context.id)).length)
const measuredContexts = computed(() => availableContexts.value.filter(context => context.id !== 'self' && isContextComplete(context.id)))
const contextProgress = computed(() => {
  const total = availableContexts.value.filter(context => context.id !== 'self').length
  return { completed: completedContextCount.value, total, percentage: total ? Math.round(completedContextCount.value / total * 100) : 0 }
})

function acrossContextScore(statId) {
  const measured = measuredContexts.value.filter(context => contextScores[context.id]?.[statId] !== undefined)
  if (!measured.length) return null
  const totalWeight = measured.reduce((sum, context) => sum + Number(contextWeights[context.id] || 1), 0)
  return Math.round(measured.reduce((sum, context) => sum + contextScores[context.id][statId] * Number(contextWeights[context.id] || 1), 0) / totalWeight)
}

const baselineStats = computed(() => stats.map(stat => ({ stat, value: acrossContextScore(stat.id) })).filter(item => item.value !== null))
const baselineMeanGap = computed(() => baselineStats.value.length ? Math.round(baselineStats.value.reduce((sum,item) => sum + Math.abs(item.value - scores[item.stat.id]), 0) / baselineStats.value.length) : null)
const widestContextRange = computed(() => {
  if (measuredContexts.value.length < 2) return null
  return stats.map(stat => {
    const values = measuredContexts.value.map(context => contextScores[context.id]?.[stat.id]).filter(value => value !== undefined)
    return { stat, range: values.length > 1 ? Math.max(...values) - Math.min(...values) : 0 }
  }).sort((a,b) => b.range - a.range)[0]
})

const contextDifferences = computed(() => stats.map(stat => ({
  stat, base: scores[stat.id], context: contextualScore(stat.id, compareContext.value),
  delta: contextualScore(stat.id, compareContext.value) - scores[stat.id],
})).sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta)))
const obviousDifferences = computed(() => contextDifferences.value.filter(item => Math.abs(item.delta) >= 14).slice(0, 5))
const clearSimilarities = computed(() => contextDifferences.value.filter(item => Math.abs(item.delta) <= 5).slice(0, 5))
const contextMeasured = computed(() => isContextComplete(compareContext.value))
const contextSpread = computed(() => Math.max(0, ...stats.map(stat => {
  const values = availableContexts.value.filter(c => c.id !== 'self' && isContextComplete(c.id)).map(c => contextualScore(stat.id, c.id))
  return values.length ? Math.max(scores[stat.id], ...values) - Math.min(scores[stat.id], ...values) : 0
})))

const followUpIndicators = computed(() => [
  { id:'sensory', title:'Sensory sensitivity & load', signal:'Sensitivity, filtering and recovery', active:scores.sensitivity>=70 || scores.filtering<=35, detail:'Explore which sensory channels, environments and recovery strategies matter. This is broader than any single diagnosis.' },
  { id:'attention-depth', title:'Deep-focus attention style', signal:'Focus, switching and interruption recovery', active:scores.focus>=75 && scores.switching<=45, detail:'Explore hyperfocus, task re-entry, interest effects and the cost of interruption.' },
  { id:'attention-shift', title:'Variable or novelty-led attention', signal:'Switching, starting, finishing and variety', active:scores.variety>=70 || (scores.starting<=40 && scores.finishing<=45), detail:'Explore activation, time structure, novelty and attention regulation; a follow-up could screen relevant ADHD-like patterns without diagnosing.' },
  { id:'cognitive', title:'Advanced learning / cognitive complexity', signal:'Curiosity, systems thinking, detail and memory', active:[scores.curiosity,scores.bigPicture,scores.detail,scores.memory].filter(v=>v>=75).length>=3, detail:'Explore learning speed, abstraction, intensity and educational fit. Self-report cannot establish giftedness or intelligence; that requires appropriate standardised assessment.' },
  { id:'social-context', title:'Social expression across contexts', signal:'Sociability, expression and directness vary by setting', active:contextSpread.value>=22, detail:'Explore familiarity, role demands, masking or adaptation, felt safety and recovery cost rather than assuming one “true” social self.' },
  { id:'predictability', title:'Predictability & change', signal:'Change comfort, structure and planning', active:scores.change<=40 || scores.structure>=78, detail:'Explore preparation time, uncertainty, routines and the difference between capable adaptation and low-cost adaptation.' },
  { id:'autistic-patterns', title:'Autistic-style sensory/social patterns', signal:'A combination, never one score', active:scores.sensitivity>=75 && scores.filtering<=45 && (scores.change<=45 || scores.directness>=75), detail:'A future follow-up could explore lifelong sensory, communication, routine and interest patterns. This map alone cannot indicate autism.' },
  { id:'energy', title:'Recovery & sustainable demand', signal:'Recovery speed plus context shifts', active:scores.recovery<=40, detail:'Explore whether cognitive, social or sensory effort predicts delayed fatigue, and which forms of rest actually restore usable capacity.' },
])

const visibleStats = computed(() => activeGroup.value === 'all' ? stats : stats.filter(s => s.group === activeGroup.value))
const standoutStats = computed(() => [...stats].sort((a, b) => scores[b.id] - scores[a.id]).slice(0, 4))
const reloadCost = computed(() => clamp((100 - scores.switching) * .55 + (100 - scores.filtering) * .45))
const radarStats = ['focus', 'switching', 'detail', 'bigPicture', 'starting', 'planning', 'sociability', 'sensitivity'].map(id => stats.find(stat => stat.id === id))
const groupScores = computed(() => groups.map(group => {
  const members = stats.filter(stat => stat.group === group.id)
  return { ...group, value: Math.round(members.reduce((sum, stat) => sum + contextualScore(stat.id, visualContext.value), 0) / members.length) }
}))

const anonymousAdjectives = ['Quiet', 'Curious', 'Amber', 'Patient', 'Swift', 'Gentle', 'Bright', 'Hidden', 'Clever', 'Calm', 'Mossy', 'Silver', 'Warm', 'Steady', 'Wild']
const anonymousNouns = ['Kestrel', 'Otter', 'Cedar', 'Comet', 'Badger', 'Finch', 'Willow', 'Fox', 'Harbor', 'Heron', 'Acorn', 'Lynx', 'Meadow', 'Orbit', 'Raven']

function randomIndex(length) {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1)
    globalThis.crypto.getRandomValues(value)
    return value[0] % length
  }
  return Math.floor(Math.random() * length)
}

function suggestProfileName() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const name = `${anonymousAdjectives[randomIndex(anonymousAdjectives.length)]} ${anonymousNouns[randomIndex(anonymousNouns.length)]}`
    if (!profiles.value.some(profile => profile.name.toLowerCase() === name.toLowerCase())) return name
  }
  return `Private Profile ${profiles.value.length + 1}`
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function polarPoint(index, total, radius) {
  const angle = (Math.PI * 2 * index / total) - Math.PI / 2
  return { x: 160 + Math.cos(angle) * radius, y: 160 + Math.sin(angle) * radius }
}

function radarPolygon(contextId, fraction = null) {
  return radarStats.map((stat, index) => {
    const score = fraction === null ? contextualScore(stat.id, contextId) : fraction * 100
    const point = polarPoint(index, radarStats.length, 18 + (score / 100) * 105)
    return `${point.x},${point.y}`
  }).join(' ')
}

function profileRadarPolygon(profile, fraction = null) {
  return radarStats.map((stat, index) => {
    const score = fraction === null ? (profile.scores?.[stat.id] ?? 50) : fraction * 100
    const point = polarPoint(index, radarStats.length, 18 + (score / 100) * 105)
    return `${point.x},${point.y}`
  }).join(' ')
}

function baselineRadarPolygon(fraction = null) {
  return radarStats.map((stat, index) => {
    const score = fraction === null ? (acrossContextScore(stat.id) ?? scores[stat.id]) : fraction * 100
    const point = polarPoint(index, radarStats.length, 18 + score / 100 * 105)
    return `${point.x},${point.y}`
  }).join(' ')
}

function profileGroupScore(profile, groupId) {
  const members = stats.filter(stat => stat.group === groupId)
  return Math.round(members.reduce((sum, stat) => sum + (profile.scores?.[stat.id] ?? 50), 0) / members.length)
}

function intakeLabel(fieldId) {
  const field = contextIntakeFields.find(item => item.id === fieldId)
  return field?.options.find(option => option[0] === contextIntake[fieldId])?.[1]?.toLowerCase() || ''
}

function contextSubject(contextId) {
  if (contextId === 'work') return `${intakeLabel('workType')} in a ${intakeLabel('workSetting')} setting`
  if (contextId === 'learning') return intakeLabel('learningType')
  if (contextId === 'home') return intakeLabel('living')
  if (contextId === 'friends') return intakeLabel('friendsPattern')
  if (contextId === 'partner') return intakeLabel('relationship')
  if (contextId === 'holiday') return 'time away from ordinary obligations'
  return 'ordinary life'
}

function contextPrompt(statId, context) {
  const prompts = {
    focus: `During ${contextSubject(context.id)}, when something needs sustained attention, what most often happens?`,
    switching: `During ${contextSubject(context.id)}, an interruption pulls you from an active task or conversation. How easily does the original thread return?`,
    starting: `In ${contextSubject(context.id)}, a necessary but unexciting activity is ready to begin. What is most typical?`,
    planning: `When something moderately complex must happen in ${contextSubject(context.id)}, how does a route usually form?`,
    sociability: `After an ordinary amount of contact in ${contextSubject(context.id)}, what is the effect on your usable social energy?`,
    expressing: `In ${contextSubject(context.id)}, something important needs to be communicated. How available are the words?`,
    directness: `When expectations are unclear in ${contextSubject(context.id)}, which communication style feels most workable?`,
    sensitivity: `During ${contextSubject(context.id)}, how present are background sounds, movement, light, atmosphere or other people’s signals?`,
    change: `A reasonable plan changes unexpectedly during ${contextSubject(context.id)}. What happens internally and practically?`,
    recovery: `After a demanding period in ${contextSubject(context.id)}, how quickly does usable capacity—not merely mental activity—return?`,
  }
  return prompts[statId] || `How does this usually appear during ${context.label.toLowerCase()}?`
}

function startContextAssessment(contextId) {
  if (!contextSetupCompleted.value) { screen.value = 'context-setup'; return }
  contextAssessmentId.value = contextId
  contextAssessmentIndex.value = 0
  screen.value = 'context-assessment'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function answerContext(value) {
  const statId = contextQuestionStats[contextAssessmentIndex.value]
  if (!contextAnswers[contextAssessmentId.value]) contextAnswers[contextAssessmentId.value] = {}
  contextAnswers[contextAssessmentId.value][statId] = value
  if (contextAssessmentIndex.value < contextQuestionStats.length - 1) contextAssessmentIndex.value++
  else finishContextAssessment()
}

function finishContextAssessment() {
  const contextId = contextAssessmentId.value
  contextScores[contextId] = { ...(contextScores[contextId] || {}), ...(contextAnswers[contextId] || {}) }
  if (!contextWeights[contextId]) contextWeights[contextId] = 1
  lastCompletedContextId.value = contextId
  compareContext.value = contextId
  const remaining = availableContexts.value.find(context => context.id !== 'self' && !isContextComplete(context.id))
  saveLocal(remaining ? `${contexts.find(c => c.id === contextId)?.label} complete · ${remaining.label} is next` : 'All available contexts are complete')
  screen.value = 'worlds'
}

function saveContextSetup() {
  contextSetupCompleted.value = true
  if (!availableContexts.value.some(context => context.id === compareContext.value)) compareContext.value = 'friends'
  saveLocal('Context setup saved locally')
  screen.value = 'worlds'
}

function startJourney() {
  if (!contextSetupCompleted.value) go('context-setup')
  else if (!activeProfile.value?.completed) beginAssessment()
  else if (nextContext.value) startContextAssessment(nextContext.value.id)
  else go('map')
}

function differenceMeaning(item) {
  const direction = item.delta > 0 ? 'more available' : 'less available'
  const meanings = {
    focus:'attention may be supported by interest, clarity, interruption level or role demands',
    switching:'task boundaries and interruptions may create a different reload cost',
    starting:'urgency, accountability, clarity or personal interest may change activation',
    planning:'the setting may invite advance mapping or make improvisation more useful',
    sociability:'familiarity, role expectations and group format may change social energy',
    expressing:'felt safety, time to formulate and communication norms may affect expression',
    directness:'the relationship or role may change how safe explicit communication feels',
    sensitivity:'environmental intensity or available control may change how much input stays foregrounded',
    change:'predictability, ownership and preparation time may affect adaptation',
    recovery:'the mix of cognitive, social and sensory demand may alter recovery time',
  }
  return `${item.stat.label} is ${direction} here (${item.delta > 0 ? '+' : ''}${item.delta}). This suggests ${meanings[item.stat.id] || 'the context changes how this tendency is expressed'}. It does not establish why.`
}

function persistProfiles() {
  localStorage.setItem('neuroprofile-profiles-v01', JSON.stringify({
    activeProfileId: activeProfileId.value,
    compareProfileIds: compareProfileIds.value,
    profiles: profiles.value,
  }))
}

function syncActiveProfile() {
  const profile = activeProfile.value
  if (!profile) return
  profile.scores = { ...scores }
  profile.answers = { ...assessmentAnswers }
  profile.contextIntake = { ...contextIntake }
  profile.contextAnswers = JSON.parse(JSON.stringify(contextAnswers))
  profile.contextScores = JSON.parse(JSON.stringify(contextScores))
  profile.contextWeights = { ...contextWeights }
  profile.contextSetupCompleted = contextSetupCompleted.value
  profile.updatedAt = new Date().toISOString()
}

function switchProfile(id) {
  if (id === activeProfileId.value) { profileMenu.value = false; return }
  syncActiveProfile()
  const target = profiles.value.find(profile => profile.id === id)
  if (!target) return
  hydratingProfile = true
  activeProfileId.value = id
  Object.assign(scores, Object.fromEntries(stats.map(stat => [stat.id, target.scores?.[stat.id] ?? 50])))
  Object.keys(assessmentAnswers).forEach(key => delete assessmentAnswers[key])
  Object.assign(assessmentAnswers, target.answers || {})
  Object.assign(contextIntake, { workType: 'knowledge', workSetting: 'shared', learningType: 'self', living: 'alone', relationship: 'none', friendsPattern: 'small' }, target.contextIntake || {})
  Object.keys(contextAnswers).forEach(key => delete contextAnswers[key])
  Object.assign(contextAnswers, target.contextAnswers || {})
  Object.keys(contextScores).forEach(key => delete contextScores[key])
  Object.assign(contextScores, target.contextScores || {})
  Object.keys(contextWeights).forEach(key => delete contextWeights[key])
  Object.assign(contextWeights, target.contextWeights || {})
  contextSetupCompleted.value = Boolean(target.contextSetupCompleted)
  hydratingProfile = false
  profileMenu.value = false
  persistProfiles()
  savedNotice.value = `Switched to ${target.name}`
}

function openCreateProfile() {
  newProfileName.value = suggestProfileName()
  createProfileOpen.value = true
  profileMenu.value = false
}

function regenerateProfileName() {
  newProfileName.value = suggestProfileName()
}

function createProfile() {
  const name = newProfileName.value.trim() || suggestProfileName()
  const profile = {
    id: makeId(), name,
    scores: Object.fromEntries(stats.map(stat => [stat.id, 50])),
    answers: {}, contextIntake: {}, contextAnswers: {}, contextScores: {}, contextWeights: {}, contextSetupCompleted: false, completed: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  syncActiveProfile()
  profiles.value.push(profile)
  compareProfileIds.value.push(profile.id)
  switchProfile(profile.id)
  createProfileOpen.value = false
  persistProfiles()
  go('context-setup')
}

function renameActiveProfile(name) {
  const clean = name.trim()
  if (!clean || !activeProfile.value) return
  activeProfile.value.name = clean
  activeProfile.value.updatedAt = new Date().toISOString()
  persistProfiles()
  savedNotice.value = 'Profile renamed'
}

function openManageProfile() {
  editProfileName.value = activeProfile.value?.name || ''
  manageProfileOpen.value = true
  profileMenu.value = false
}

function deleteActiveProfile() {
  if (profiles.value.length <= 1 || !activeProfile.value) return
  if (!confirm(`Delete ${activeProfile.value.name} from this browser?`)) return
  const removedId = activeProfileId.value
  profiles.value = profiles.value.filter(profile => profile.id !== removedId)
  compareProfileIds.value = compareProfileIds.value.filter(id => id !== removedId)
  manageProfileOpen.value = false
  switchProfile(profiles.value[0].id)
  persistProfiles()
  savedNotice.value = 'Profile deleted'
}

function toggleComparedProfile(id) {
  if (compareProfileIds.value.includes(id)) {
    if (compareProfileIds.value.length > 1) compareProfileIds.value = compareProfileIds.value.filter(profileId => profileId !== id)
  } else if (compareProfileIds.value.length < 5) compareProfileIds.value.push(id)
  persistProfiles()
}

function go(id) {
  screen.value = id
  mobileMenu.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function beginAssessment() {
  assessmentIndex.value = 0
  screen.value = 'assessment'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function answer(value) {
  const q = questions[assessmentIndex.value]
  assessmentAnswers[q.stat] = value
  if (assessmentIndex.value < questions.length - 1) assessmentIndex.value++
  else finishAssessment()
}

function finishAssessment() {
  Object.entries(assessmentAnswers).forEach(([key, val]) => { scores[key] = clamp(val) })
  if (activeProfile.value) activeProfile.value.completed = true
  const upcoming = contextSetupCompleted.value ? nextContext.value : null
  saveLocal(upcoming ? `General map complete · ${upcoming.label} is next` : 'Your map has been updated')
  screen.value = upcoming ? 'worlds' : 'map'
}

function saveLocal(message = 'Saved on this device') {
  if (hydratingProfile) return
  syncActiveProfile()
  persistProfiles()
  savedNotice.value = message
  setTimeout(() => savedNotice.value = '', 2600)
}

function resetLocal() {
  if (!confirm('Erase every local profile from this browser and restore one anonymous example?')) return
  localStorage.removeItem('neuroprofile-v01')
  localStorage.removeItem('neuroprofile-profiles-v01')
  const replacement = { id: makeId(), name: suggestProfileName(), scores: { ...defaults }, answers: {}, contextIntake: {}, contextAnswers: {}, contextScores: {}, contextWeights: {}, contextSetupCompleted: false, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  profiles.value = [replacement]
  activeProfileId.value = replacement.id
  compareProfileIds.value = [replacement.id]
  Object.assign(scores, defaults)
  Object.keys(assessmentAnswers).forEach(k => delete assessmentAnswers[k])
  persistProfiles()
  savedNotice.value = 'Local profile erased'
}

function exportProfile() {
  const payload = {
    $schema: 'https://example.org/neuroprofile/schema/0.1/profile.json',
    schemaVersion: '0.1.0',
    createdDate: new Date().toISOString().slice(0, 10),
    locale: 'en',
    displayName: activeProfile.value?.name || null,
    profile: {
      scores: stats.map(stat => ({
        construct: stat.id,
        category: stat.group === 'fit' ? 'preference' : 'trait_self_report',
        value: scores[stat.id], scale: { min: 0, max: 100 },
        evidence: 'self_report', percentile: null,
      })),
      contexts: contexts.filter(c => c.id !== 'self').map(context => ({
        id: `context.${context.id}`,
        measured: Boolean(contextScores[context.id]),
        scores: stats.filter(stat => contextScores[context.id]?.[stat.id] !== undefined).map(stat => ({
          construct: stat.id, category: 'context_expression',
          value: contextualScore(stat.id, context.id), evidence: 'retrospective_self_report',
        })),
      })),
      contextIntake: { ...contextIntake },
      contextSetupCompleted: contextSetupCompleted.value,
      acrossContextBaseline: stats.map(stat => ({ construct: stat.id, value: acrossContextScore(stat.id), scale: { min: 0, max: 100 } })).filter(item => item.value !== null),
      contextWeights: { ...contextWeights },
    },
    provenance: { applicationVersion: '0.1.0', constructRegistry: '0.1.0' },
    privacy: { rawResponsesIncluded: false, rawWearableIncluded: false, locationIncluded: false, exactTimestampsIncluded: false },
    limitations: { diagnostic: false },
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `neuroprofile-${payload.createdDate}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  savedNotice.value = 'Private summary exported'
}

function importWearable(event) {
  const file = event.target.files?.[0]
  if (!file) return
  wearable.loaded = true
  wearable.name = file.name
  wearable.size = file.size
  wearable.updated = new Date(file.lastModified).toLocaleDateString()
  wearable.metrics = [
    { label: 'Sleep timing', status: 'Detected', confidence: 'Good for trends' },
    { label: 'Daily movement', status: 'Detected', confidence: 'Good for trends' },
    { label: 'Heart rate', status: 'Detected', confidence: 'Personal baseline' },
    { label: 'Location', status: 'Excluded', confidence: 'Privacy default' },
  ]
}

function openStat(stat) { detailStat.value = stat }

onMounted(() => {
  const collection = localStorage.getItem('neuroprofile-profiles-v01')
  try {
    if (collection) {
      const data = JSON.parse(collection)
      profiles.value = Array.isArray(data.profiles) ? data.profiles : []
      activeProfileId.value = profiles.value.some(profile => profile.id === data.activeProfileId) ? data.activeProfileId : profiles.value[0]?.id
      compareProfileIds.value = Array.isArray(data.compareProfileIds) ? data.compareProfileIds.filter(id => profiles.value.some(profile => profile.id === id)).slice(0, 5) : []
    }
  } catch { localStorage.removeItem('neuroprofile-profiles-v01') }

  if (!profiles.value.length) {
    let migratedScores = { ...defaults }
    let migratedAnswers = {}
    const legacy = localStorage.getItem('neuroprofile-v01')
    try {
      if (legacy) {
        const parsed = JSON.parse(legacy)
        migratedScores = { ...migratedScores, ...(parsed.scores || {}) }
        migratedAnswers = parsed.assessmentAnswers || {}
      }
    } catch { localStorage.removeItem('neuroprofile-v01') }
    const first = { id: makeId(), name: suggestProfileName(), scores: migratedScores, answers: migratedAnswers, contextIntake: {}, contextAnswers: {}, contextScores: {}, contextWeights: {}, contextSetupCompleted: false, completed: Object.keys(migratedAnswers).length > 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    profiles.value = [first]
    activeProfileId.value = first.id
  }

  if (!compareProfileIds.value.length) compareProfileIds.value = profiles.value.slice(0, 5).map(profile => profile.id)
  const selected = activeProfile.value
  hydratingProfile = true
  if (selected) {
    Object.assign(scores, selected.scores || defaults)
    Object.keys(assessmentAnswers).forEach(key => delete assessmentAnswers[key])
    Object.assign(assessmentAnswers, selected.answers || {})
    Object.assign(contextIntake, selected.contextIntake || {})
    Object.assign(contextAnswers, selected.contextAnswers || {})
    Object.assign(contextScores, selected.contextScores || {})
    Object.assign(contextWeights, selected.contextWeights || {})
    contextSetupCompleted.value = Boolean(selected.contextSetupCompleted)
  }
  hydratingProfile = false
  persistProfiles()
})

watch(scores, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
watch(assessmentAnswers, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
watch(contextIntake, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
watch(contextAnswers, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
watch(contextScores, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
watch(contextWeights, () => { if (!hydratingProfile) saveLocal('') }, { deep: true, flush: 'sync' })
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="brand" @click="go('home')" aria-label="Neuroprofile home">
        <span class="brand-mark"><i></i><i></i><i></i><i></i></span>
        <span>neuroprofile</span>
      </button>
      <nav :class="{ open: mobileMenu }" aria-label="Primary navigation">
        <button v-for="item in navItems" :key="item.id" :class="{ active: screen === item.id }" @click="go(item.id)">{{ item.label }}</button>
      </nav>
      <div class="top-actions">
        <span class="privacy-pill"><span></span> Private by design</span>
        <button class="icon-button menu-button" @click="mobileMenu = !mobileMenu" aria-label="Toggle menu">☰</button>
        <div class="profile-switcher">
          <button class="profile-trigger" @click="profileMenu = !profileMenu" :aria-expanded="profileMenu" aria-haspopup="menu">
            <span>{{ activeProfile?.name?.charAt(0) || 'P' }}</span><b>{{ activeProfile?.name || 'Profile' }}</b><i>⌄</i>
          </button>
          <div v-if="profileMenu" class="profile-menu" role="menu">
            <small>Profiles on this device</small>
            <button v-for="profile in profiles" :key="profile.id" :class="{ active: profile.id === activeProfileId }" @click="switchProfile(profile.id)">
              <span>{{ profile.name.charAt(0) }}</span><b>{{ profile.name }}</b><i>{{ profile.id === activeProfileId ? '✓' : '' }}</i>
            </button>
            <div class="profile-menu-actions">
              <button @click="openCreateProfile">＋ Add profile</button>
              <button @click="openManageProfile">Manage current</button>
              <button @click="profileMenu=false;go('compare')">Compare profiles</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main>
      <section v-if="screen === 'home'" class="home-view">
        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow"><span>✦</span> Understand yourself without putting yourself in a box</p>
            <h1>Your mind.<br><em>In context.</em></h1>
            <p class="lede">Build a nuanced map of how you think, work, connect and recharge — including how different people, places and energy levels bring out different parts of you.</p>
            <div class="hero-actions">
              <button class="primary large" @click="startJourney">Start with my worlds <span>→</span></button>
              <button class="text-button" @click="go('method')">See how it works <span>↗</span></button>
            </div>
            <div class="trust-row">
              <span>✓ No diagnosis</span><span>✓ No fixed types</span><span>✓ Your data stays with you</span>
            </div>
          </div>
          <div class="hero-visual" aria-label="Example multidimensional profile">
            <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="orbit orbit-c"></div>
            <div class="map-card map-card-a"><span class="mini-icon coral">◉</span><b>Focus</b><strong>82</strong><small>Deep & sustained</small></div>
            <div class="map-card map-card-b"><span class="mini-icon green">◇</span><b>Perspective</b><strong>81</strong><small>Many lenses</small></div>
            <div class="map-card map-card-c"><span class="mini-icon gold">✦</span><b>Curiosity</b><strong>91</strong><small>Discovery driven</small></div>
            <div class="map-card map-card-d"><span class="mini-icon blue">≈</span><b>Recovery</b><strong>38</strong><small>Needs more time</small></div>
            <div class="center-token"><span>you</span><small>not a type</small></div>
          </div>
        </div>
        <div class="home-strip">
          <div><span>01</span><b>Describe your worlds first</b><p>A few broad answers make later scenarios recognisable and relevant to your life.</p></div>
          <div><span>02</span><b>Map one context at a time</b><p>Work through the suggested setting, then continue with the next unfinished one.</p></div>
          <div><span>03</span><b>Compare what changes</b><p>See stable patterns, context shifts and possible meanings without treating either as better.</p></div>
        </div>
        <div class="manifesto-section">
          <div class="section-kicker">A personal operating manual</div>
          <h2>More useful than four letters.<br><em>More human than a score.</em></h2>
          <div class="manifesto-grid">
            <article><span class="article-num">01</span><h3>Traits are not types</h3><p>You are not one of sixteen kinds of person. Every dimension remains continuous, and qualities that look opposite can coexist.</p></article>
            <article><span class="article-num">02</span><h3>Context changes expression</h3><p>The way you act at work may differ from how you feel with a close friend. That variation is meaningful, not a contradiction.</p></article>
            <article><span class="article-num">03</span><h3>Cost matters</h3><p>Being capable of something does not mean it is effortless. Your map distinguishes expression, capacity, preference and energy cost.</p></article>
          </div>
        </div>
      </section>

      <section v-else-if="screen === 'assessment'" class="assessment-view">
        <div class="assessment-top">
          <button class="back-link" @click="go('home')">← Leave assessment</button>
          <span>{{ assessmentIndex + 1 }} of {{ questions.length }}</span>
        </div>
        <div class="progress"><i :style="{ width: `${((assessmentIndex + 1) / questions.length) * 100}%` }"></i></div>
        <div class="question-panel">
          <div class="question-meta">{{ stats.find(s => s.id === questions[assessmentIndex].stat)?.label }} · General self</div>
          <h2>{{ questions[assessmentIndex].text }}</h2>
          <p>Choose the scenario that has been most familiar during the last six months. If two fit, choose the one that happens without special effort or support.</p>
          <div class="answer-scale">
            <button v-for="(option, optionIndex) in questions[assessmentIndex].options" :key="option.value" @click="answer(option.value)">
              <span>{{ String.fromCharCode(65 + optionIndex) }}</span><b>{{ option.label }}</b><small>{{ option.detail }}</small>
            </button>
          </div>
          <button v-if="assessmentIndex > 0" class="text-button previous" @click="assessmentIndex--">← Previous question</button>
        </div>
        <p class="assessment-note">These behaviourally anchored scenarios reduce abstract scale interpretation, but they remain self-report. The prototype is descriptive, non-diagnostic and not yet psychometrically validated.</p>
      </section>

      <section v-else-if="screen === 'context-setup'" class="context-setup-view">
        <div class="page-intro"><p class="eyebrow">Step 1 · Recommended before the assessments</p><h1>First, describe<br><em>your worlds.</em></h1><p>Only broad categories are requested. They decide which context maps are relevant and help the scenarios resemble your life—without asking for employers, schools, addresses or names.</p></div>
        <div class="context-intake-grid">
          <label v-for="field in contextIntakeFields" :key="field.id"><span>{{ field.label }}</span><select v-model="contextIntake[field.id]"><option v-for="option in field.options" :key="option[0]" :value="option[0]">{{ option[1] }}</option></select></label>
        </div>
        <div class="setup-summary"><div><span class="section-kicker">Your tailored route</span><h2>{{ availableContexts.filter(c=>c.id!=='self').length }} context assessments match this profile</h2><p>You can change this setup later. Each setting is scored separately, and after every completed assessment the next unfinished one will be suggested.</p></div><button class="primary large" @click="saveContextSetup">Save & show first assessment →</button></div>
      </section>

      <section v-else-if="screen === 'context-assessment'" class="assessment-view context-question-view">
        <div class="assessment-top"><button class="back-link" @click="go('worlds')">← Leave this context</button><span>{{ contexts.find(c=>c.id===contextAssessmentId)?.label }} · {{ contextAssessmentIndex + 1 }} of {{ contextQuestionStats.length }}</span></div>
        <div class="progress"><i :style="{ width: `${((contextAssessmentIndex + 1) / contextQuestionStats.length) * 100}%` }"></i></div>
        <div class="question-panel">
          <div class="question-meta">{{ stats.find(s => s.id === activeContextQuestion.stat)?.label }} · {{ contexts.find(c=>c.id===contextAssessmentId)?.label }}</div>
          <h2>{{ activeContextQuestion.text }}</h2>
          <p><b>Picture this in your setting: {{ contextSubject(contextAssessmentId) }}.</b> Choose what is most typical during the last six months—not what you can do on your best day.</p>
          <div class="answer-scale"><button v-for="(option, optionIndex) in activeContextQuestion.options" :key="option.value" @click="answerContext(option.value)"><span>{{ String.fromCharCode(65 + optionIndex) }}</span><b>{{ option.label }}</b><small>{{ option.detail }}</small></button></div>
          <button v-if="contextAssessmentIndex > 0" class="text-button previous" @click="contextAssessmentIndex--">← Previous question</button>
        </div>
        <p class="assessment-note">The scenario is tailored from broad context information. It still measures retrospective self-perception; repeated in-the-moment check-ins can provide a stronger estimate later.</p>
      </section>

      <section v-else-if="screen === 'map'" class="dashboard-view">
        <div class="dashboard-heading">
          <div><p class="eyebrow">Your general map</p><h1>A whole person,<br><em>not a label.</em></h1></div>
          <div class="heading-actions"><button class="secondary" @click="beginAssessment">Retake map</button><button class="primary" @click="exportProfile">Export JSON ↓</button></div>
        </div>
        <div class="summary-card">
          <div class="summary-copy">
            <span class="summary-label">Your signature pattern</span>
            <h2>Curious systems builder</h2>
            <p>You combine strong curiosity, detail and big-picture thinking. You tend to work best with meaningful autonomy and enough uninterrupted time to build a coherent model.</p>
            <div class="evidence-line"><span>Based on</span><b v-for="stat in standoutStats" :key="stat.id">{{ stat.label }} {{ scores[stat.id] }}</b></div>
          </div>
          <div class="summary-rings">
            <div v-for="(stat, i) in standoutStats" :key="stat.id" class="ring" :style="{ '--score': scores[stat.id], '--ring': groups.find(g => g.id === stat.group)?.color, '--i': i }">
              <span>{{ stat.label }}</span><b>{{ scores[stat.id] }}</b>
            </div>
          </div>
        </div>

        <div class="visual-section">
          <div class="visual-heading">
            <div><span class="section-kicker">Your profile, as a shape</span><h2>A web of tendencies—not a score to maximise.</h2></div>
            <div class="visual-contexts" aria-label="Choose visualised context">
              <button v-for="context in contexts" :key="context.id" :class="{ active: visualContext === context.id }" @click="visualContext = context.id">{{ context.label }}</button>
            </div>
          </div>
          <div class="visual-grid">
            <article class="radar-card">
              <div class="chart-title"><div><span>Personality web</span><h3>{{ contexts.find(c => c.id === visualContext)?.label }}</h3></div><div class="radar-legend"><span v-if="visualContext !== 'self'"><i class="base"></i>General</span><span><i></i>{{ contexts.find(c => c.id === visualContext)?.label }}</span></div></div>
              <div class="radar-wrap">
                <svg viewBox="0 0 320 320" role="img" :aria-label="`Profile web for ${contexts.find(c => c.id === visualContext)?.label}`">
                  <polygon v-for="level in [.25,.5,.75,1]" :key="level" :points="radarPolygon('self', level)" class="radar-gridline" />
                  <line v-for="(_, index) in radarStats" :key="`axis-${index}`" x1="160" y1="160" :x2="polarPoint(index, radarStats.length, 123).x" :y2="polarPoint(index, radarStats.length, 123).y" class="radar-axis" />
                  <polygon v-if="visualContext !== 'self'" :points="radarPolygon('self')" class="radar-shape radar-base" />
                  <polygon :points="radarPolygon(visualContext)" class="radar-shape radar-current" />
                  <circle v-for="(stat,index) in radarStats" :key="`dot-${stat.id}`" :cx="polarPoint(index, radarStats.length, 18 + contextualScore(stat.id, visualContext) / 100 * 105).x" :cy="polarPoint(index, radarStats.length, 18 + contextualScore(stat.id, visualContext) / 100 * 105).y" r="3.5" class="radar-dot" />
                  <text v-for="(stat,index) in radarStats" :key="`label-${stat.id}`" :x="polarPoint(index, radarStats.length, 145).x" :y="polarPoint(index, radarStats.length, 145).y" :text-anchor="polarPoint(index, radarStats.length, 145).x < 145 ? 'end' : polarPoint(index, radarStats.length, 145).x > 175 ? 'start' : 'middle'" dominant-baseline="middle" class="radar-label">{{ stat.label }}</text>
                </svg>
              </div>
              <p class="chart-note">Distance from the centre shows the current estimate for each independent dimension. A larger area does not mean a better profile.</p>
              <div class="sr-only"><span v-for="stat in radarStats" :key="`accessible-${stat.id}`">{{ stat.label }}: {{ contextualScore(stat.id, visualContext) }}. </span></div>
            </article>

            <article class="domain-card">
              <div class="chart-title"><div><span>Domain overview</span><h3>Five parts of the map</h3></div></div>
              <div class="domain-orbits">
                <button v-for="(group,index) in groupScores" :key="group.id" class="domain-bubble" :style="{ '--domain': group.color, '--value': group.value, '--index': index }" @click="activeGroup=group.id">
                  <span>{{ group.label }}</span><b>{{ group.value }}</b><small>{{ group.id === 'fit' ? 'preference' : 'average' }}</small>
                </button>
                <div class="domain-center"><span>your</span><b>map</b></div>
              </div>
              <p class="chart-note">These rings summarise related stats for navigation. Open a domain to see the individual dimensions; the average is not a clinical or normative score.</p>
            </article>
          </div>
        </div>

        <div class="filter-row">
          <div class="group-tabs"><button :class="{active:activeGroup==='all'}" @click="activeGroup='all'">All stats</button><button v-for="group in groups" :key="group.id" :class="{active:activeGroup===group.id}" @click="activeGroup=group.id"><i :style="{background:group.color}"></i>{{ group.label }}</button></div>
          <span>Tap a stat to understand it</span>
        </div>
        <div class="stats-grid">
          <button v-for="stat in visibleStats" :key="stat.id" class="stat-card" @click="openStat(stat)">
            <div class="stat-head"><span class="stat-symbol" :style="{color:groups.find(g=>g.id===stat.group)?.color}">{{ stat.group === 'thinking' ? '◉' : stat.group === 'doing' ? '↗' : stat.group === 'connecting' ? '◇' : stat.group === 'regulation' ? '≈' : '✦' }}</span><span class="stat-kind">{{ stat.group === 'fit' ? 'Preference' : 'Trait' }}</span><b>{{ scores[stat.id] }}</b></div>
            <h3>{{ stat.label }}</h3><p>{{ stat.description }}</p>
            <div class="stat-track"><i :style="{ width: scores[stat.id] + '%', background: groups.find(g=>g.id===stat.group)?.color }"></i></div>
            <div class="stat-ends"><span>{{ stat.low }}</span><span>{{ stat.high }}</span></div>
          </button>
        </div>

        <div class="insight-row">
          <article class="insight-card dark"><span>Context insight</span><h3>Your focus is deep, but interruptions may have a {{ reloadCost }}% reload cost.</h3><button @click="go('worlds')">Explore different worlds →</button></article>
          <article class="insight-card paper"><span>Energy economy</span><h3>Purpose and independence look energising. Rapid recovery may need more support.</h3><button @click="go('rhythms')">Open observed rhythms →</button></article>
        </div>
      </section>

      <section v-else-if="screen === 'compare'" class="compare-profiles-view">
        <div class="page-intro compare-intro"><p class="eyebrow">Profiles on this device</p><h1>Different maps.<br><em>One clear view.</em></h1><p>Compare patterns without ranking people. Select up to five locally stored profiles; names can be real, nicknames or anonymous suggestions.</p></div>
        <div class="compare-controls">
          <div><span class="section-kicker">Shown in comparison</span><p>{{ comparisonProfiles.length }} of {{ Math.min(profiles.length, 5) }} selected</p></div>
          <div class="profile-chips">
            <button v-for="(profile,index) in profiles" :key="profile.id" :class="{ selected: compareProfileIds.includes(profile.id) }" @click="toggleComparedProfile(profile.id)">
              <i :style="{ background: profileColors[index % profileColors.length] }"></i>{{ profile.name }} <span>{{ compareProfileIds.includes(profile.id) ? '✓' : '+' }}</span>
            </button>
            <button class="add-chip" @click="openCreateProfile">＋ New profile</button>
          </div>
        </div>

        <div class="comparison-dashboard">
          <article class="comparison-radar-card">
            <div class="chart-title"><div><span>Overlay view</span><h3>Personality webs</h3></div></div>
            <div class="radar-wrap">
              <svg viewBox="0 0 320 320" role="img" aria-label="Overlaid personality webs for selected profiles">
                <polygon v-for="level in [.25,.5,.75,1]" :key="level" :points="radarPolygon('self', level)" class="radar-gridline" />
                <line v-for="(_, index) in radarStats" :key="`compare-axis-${index}`" x1="160" y1="160" :x2="polarPoint(index, radarStats.length, 123).x" :y2="polarPoint(index, radarStats.length, 123).y" class="radar-axis" />
                <polygon v-for="(profile,index) in comparisonProfiles" :key="profile.id" :points="profileRadarPolygon(profile)" class="profile-radar-shape" :style="{ stroke: profileColors[profiles.findIndex(p => p.id === profile.id) % profileColors.length], fill: profileColors[profiles.findIndex(p => p.id === profile.id) % profileColors.length] }" />
                <text v-for="(stat,index) in radarStats" :key="`compare-label-${stat.id}`" :x="polarPoint(index, radarStats.length, 145).x" :y="polarPoint(index, radarStats.length, 145).y" :text-anchor="polarPoint(index, radarStats.length, 145).x < 145 ? 'end' : polarPoint(index, radarStats.length, 145).x > 175 ? 'start' : 'middle'" dominant-baseline="middle" class="radar-label">{{ stat.label }}</text>
              </svg>
            </div>
            <div class="profile-legend"><span v-for="profile in comparisonProfiles" :key="profile.id"><i :style="{ background: profileColors[profiles.findIndex(p => p.id === profile.id) % profileColors.length] }"></i>{{ profile.name }}</span></div>
            <p class="chart-note">Overlaps show similarity on these eight dimensions. Shape and area do not represent overall ability, value or compatibility.</p>
          </article>

          <article class="domain-comparison-card">
            <div class="chart-title"><div><span>Exact overview</span><h3>Domain patterns</h3></div></div>
            <div class="domain-compare-list">
              <div v-for="group in groups" :key="group.id" class="domain-compare-row">
                <div><b>{{ group.label }}</b><small>{{ group.id === 'fit' ? 'preference' : 'descriptive average' }}</small></div>
                <div class="profile-domain-bars">
                  <div v-for="profile in comparisonProfiles" :key="profile.id"><span>{{ profile.name }}</span><i><b :style="{ width: profileGroupScore(profile, group.id) + '%', background: profileColors[profiles.findIndex(p => p.id === profile.id) % profileColors.length] }"></b></i><strong>{{ profileGroupScore(profile, group.id) }}</strong></div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="profile-overview-grid">
          <article v-for="(profile,index) in comparisonProfiles" :key="profile.id">
            <div class="profile-card-head"><span :style="{ background: profileColors[profiles.findIndex(p => p.id === profile.id) % profileColors.length] }">{{ profile.name.charAt(0) }}</span><div><h3>{{ profile.name }}</h3><small>{{ profile.completed ? 'Assessment completed' : 'Example / unfinished map' }}</small></div></div>
            <p>Strongest current signals</p>
            <div class="profile-highlights"><span v-for="stat in [...stats].sort((a,b)=>(profile.scores?.[b.id]??50)-(profile.scores?.[a.id]??50)).slice(0,3)" :key="stat.id">{{ stat.label }} <b>{{ profile.scores?.[stat.id] ?? 50 }}</b></span></div>
            <button class="secondary" @click="switchProfile(profile.id);go('map')">Open this map →</button>
          </article>
        </div>
        <p class="comparison-boundary"><b>Keep comparisons humane.</b> These are self-report estimates for conversation and reflection—not rankings, diagnoses, hiring evidence or predictions of relationship success.</p>
      </section>

      <section v-else-if="screen === 'worlds'" class="worlds-view">
        <div class="page-intro context-page-head"><div><p class="eyebrow">Your context layer</p><h1>You contain<br><em>different worlds.</em></h1><p>Variation is not inconsistency. It shows which qualities become available, required or costly around different people and situations.</p></div><button class="secondary" @click="go('context-setup')">Edit context setup</button></div>
        <div class="journey-guide" :class="{needsSetup:!contextSetupCompleted}">
          <div class="journey-progress"><span :class="{done:contextSetupCompleted}"><i>{{ contextSetupCompleted ? '✓' : '1' }}</i><b>Describe your worlds</b><small>{{ contextSetupCompleted ? 'Complete' : 'Recommended first step' }}</small></span><span :class="{done:contextProgress.completed>0}"><i>{{ contextProgress.completed ? '✓' : '2' }}</i><b>Measure each context</b><small>{{ contextProgress.completed }} of {{ contextProgress.total }} complete</small></span><span :class="{done:contextProgress.completed>=2}"><i>{{ contextProgress.completed>=2 ? '✓' : '3' }}</i><b>Compare patterns</b><small>Useful after two contexts</small></span></div>
          <div class="journey-meter"><i :style="{width: contextSetupCompleted ? `${20 + contextProgress.percentage * .8}%` : '4%'}"></i></div>
          <div v-if="!contextSetupCompleted" class="journey-next"><div><span>Recommended now</span><h2>Describe your worlds before answering context questions.</h2><p>This determines which settings apply and gives the questions realistic details without collecting identifying information.</p></div><button class="primary" @click="go('context-setup')">Describe my worlds →</button></div>
          <div v-else-if="!activeProfile?.completed" class="journey-next"><div><span>Recommended first assessment</span><h2>Create the general-self reference map.</h2><p>This gives every later context a consistent baseline. After completion, the first applicable world will be suggested automatically.</p></div><button class="primary" @click="beginAssessment">Measure general self →</button></div>
          <div v-else-if="nextContext" class="journey-next"><div><span>{{ lastCompletedContextId ? `${contexts.find(c=>c.id===lastCompletedContextId)?.label} complete · next step` : 'Recommended next assessment' }}</span><h2>Continue with {{ nextContext.label.toLowerCase() }}.</h2><p>{{ nextContext.description }} · Twelve recognisable situations, approximately four minutes.</p></div><button class="primary" @click="startContextAssessment(nextContext.id)">Start {{ nextContext.label.toLowerCase() }} →</button></div>
          <div v-else class="journey-next complete"><div><span>Context set complete</span><h2>All applicable worlds have been measured.</h2><p>You can now compare shapes, revisit a context, or add short check-ins over time.</p></div><button class="secondary" @click="checkinOpen=true">Add a check-in</button></div>
        </div>
        <div v-if="measuredContexts.length" class="baseline-panel">
          <div class="baseline-summary"><span class="section-kicker">Across-context baseline</span><h2>Your measured-worlds reference</h2><p>A weighted average of completed context assessments. It describes reported expression across measured settings; General self remains your separately measured self-perception.</p><div class="baseline-facts"><span><b>{{ measuredContexts.length }}</b> measured context{{ measuredContexts.length===1?'':'s' }}</span><span><b>{{ baselineMeanGap }}</b> average points from General self</span><span v-if="widestContextRange"><b>{{ widestContextRange.range }}</b> widest range · {{ widestContextRange.stat.label }}</span></div></div>
          <div class="baseline-weights"><span>How representative is each context of ordinary life?</span><label v-for="context in measuredContexts" :key="context.id"><b>{{ context.label }}</b><select v-model.number="contextWeights[context.id]"><option :value="1">Occasional</option><option :value="2">Sometimes</option><option :value="3">Often</option><option :value="4">Most days</option></select></label><small>Weights change the baseline, never the original context scores. With one measured context, the baseline equals that context.</small></div>
        </div>
        <div class="context-picker" role="tablist" aria-label="Select context">
          <button v-for="context in availableContexts.filter(c=>c.id!=='self')" :key="context.id" :class="{active:compareContext===context.id}" @click="compareContext=context.id"><span>{{ context.icon }}</span><b>{{ context.label }}</b><small>{{ isContextComplete(context.id) ? '✓ Measured' : contextScores[context.id] ? 'Update needed' : 'Not measured yet' }}</small></button>
        </div>
        <div v-if="!contextMeasured" class="measure-context-callout"><div><span class="section-kicker">Illustrative estimate</span><h2>{{ compared.label }} has not been questioned yet.</h2><p>The preview currently uses a clearly marked example offset. Complete twelve tailored scenarios to replace it with this profile’s answers.</p></div><button class="primary" @click="startContextAssessment(compareContext)">Measure {{ compared.label.toLowerCase() }} →</button></div>
        <div v-else class="measured-context-bar"><span>✓ Based on 12 context-specific scenarios</span><button @click="startContextAssessment(compareContext)">Retake this context</button></div>
        <div class="context-radar-panel">
          <div><span class="section-kicker">Contrasting shapes</span><h2>General self and {{ compared.label.toLowerCase() }}</h2><p>The outline makes stable areas and context-dependent expression visible at once.</p><div class="radar-legend"><span><i class="base"></i>General self</span><span v-if="measuredContexts.length"><i class="baseline"></i>Across-context</span><span><i></i>{{ compared.label }}</span></div></div>
          <div class="radar-wrap"><svg viewBox="0 0 320 320" role="img" :aria-label="`General profile contrasted with ${compared.label}`"><polygon v-for="level in [.25,.5,.75,1]" :key="level" :points="radarPolygon('self', level)" class="radar-gridline"/><line v-for="(_, index) in radarStats" :key="index" x1="160" y1="160" :x2="polarPoint(index, radarStats.length, 123).x" :y2="polarPoint(index, radarStats.length, 123).y" class="radar-axis"/><polygon :points="radarPolygon('self')" class="radar-shape radar-base"/><polygon v-if="measuredContexts.length" :points="baselineRadarPolygon()" class="radar-shape radar-baseline"/><polygon :points="radarPolygon(compareContext)" class="radar-shape radar-current"/><text v-for="(stat,index) in radarStats" :key="stat.id" :x="polarPoint(index, radarStats.length, 145).x" :y="polarPoint(index, radarStats.length, 145).y" :text-anchor="polarPoint(index, radarStats.length, 145).x < 145 ? 'end' : polarPoint(index, radarStats.length, 145).x > 175 ? 'start' : 'middle'" dominant-baseline="middle" class="radar-label">{{ stat.label }}</text></svg></div>
        </div>
        <div class="world-comparison">
          <div class="comparison-head"><div><span>Comparing</span><h2>General self <i>with</i> {{ compared.label }}</h2></div><div class="legend"><span><i class="general"></i>General</span><span><i class="contextual"></i>{{ compared.label }}</span></div></div>
          <div class="comparison-list">
            <div v-for="stat in stats.filter(s => s.group !== 'fit').slice(0,18)" :key="stat.id" class="comparison-item">
              <div class="comparison-name"><b>{{ stat.label }}</b><small>{{ stat.technical }}</small></div>
              <div class="dual-track"><i class="general" :style="{width:scores[stat.id]+'%'}"></i><i class="contextual" :style="{width:contextualScore(stat.id, compareContext)+'%'}"></i></div>
              <div class="comparison-values"><span>{{ scores[stat.id] }}</span><b :class="{up:contextualScore(stat.id,compareContext)>scores[stat.id],down:contextualScore(stat.id,compareContext)<scores[stat.id]}">{{ contextualScore(stat.id, compareContext) }} <small>{{ contextualScore(stat.id,compareContext)-scores[stat.id] > 0 ? '+' : '' }}{{ contextualScore(stat.id,compareContext)-scores[stat.id] }}</small></b></div>
            </div>
          </div>
        </div>
        <div class="context-findings">
          <article><span class="section-kicker">Most visible differences</span><h2>What changes here</h2><div v-if="obviousDifferences.length" class="finding-list"><p v-for="item in obviousDifferences" :key="item.stat.id"><b>{{ item.stat.label }} <i>{{ item.delta > 0 ? '+' : '' }}{{ item.delta }}</i></b><span>{{ differenceMeaning(item) }}</span></p></div><p v-else class="quiet-finding">No difference crosses the current 14-point highlight threshold. That itself suggests fairly stable expression across these measured dimensions.</p></article>
          <article><span class="section-kicker">Closest matches</span><h2>What stays similar</h2><div class="similarity-list"><p v-for="item in clearSimilarities" :key="item.stat.id"><b>{{ item.stat.label }}</b><span>{{ Math.abs(item.delta) }} point{{ Math.abs(item.delta)===1?'':'s' }} apart</span></p></div><small>Similarity means the two estimates are within five points. It does not imply the experience or energy cost is identical.</small></article>
        </div>
        <div class="context-actions"><button class="primary" @click="checkinOpen=true">Add a one-minute check-in</button><p>Repeated check-ins can later estimate within-person variability with less reliance on broad retrospective memory.</p></div>

        <div class="followup-section"><div class="followup-heading"><span class="section-kicker">Future optional modules</span><h2>Areas worth exploring—not conclusions.</h2><p>These indicators only decide which follow-up questionnaires might be relevant. They must never be presented as diagnoses, intelligence estimates or clinical probabilities.</p></div><div class="indicator-grid"><article v-for="indicator in followUpIndicators" :key="indicator.id" :class="{active:indicator.active}"><span>{{ indicator.active ? 'Pattern present' : 'Available later' }}</span><h3>{{ indicator.title }}</h3><b>{{ indicator.signal }}</b><p>{{ indicator.detail }}</p><button disabled>Follow-up questionnaire · planned</button></article></div></div>
      </section>

      <section v-else-if="screen === 'rhythms'" class="rhythms-view">
        <div class="page-intro"><p class="eyebrow">Optional wearable layer</p><h1>Notice your<br><em>living rhythms.</em></h1><p>Bring in a local wearable export to explore sleep timing, movement, activation and recovery alongside your own experience.</p></div>
        <div v-if="!wearable.loaded" class="import-panel">
          <div class="import-art"><span class="watch-ring"></span><span class="pulse-line">⌁</span></div>
          <div class="import-copy"><span class="section-kicker">Private local import</span><h2>Your data stays with you.</h2><p>This prototype previews the privacy and data flow. It does not upload the selected file or send it to a server.</p>
            <label class="primary file-button">Choose Garmin or CSV file<input type="file" accept=".fit,.csv,.json,.zip" @change="importWearable"></label>
            <small>Supported preview: FIT, CSV, JSON and ZIP · GPS excluded by default</small>
          </div>
        </div>
        <template v-else>
          <div class="file-summary"><div><span class="file-icon">⌁</span><div><b>{{ wearable.name }}</b><small>{{ Math.max(1,Math.round(wearable.size/1024)) }} KB · Modified {{ wearable.updated }}</small></div></div><span class="local-badge">✓ Local only</span></div>
          <div class="metric-preview"><article v-for="metric in wearable.metrics" :key="metric.label"><span>{{ metric.status }}</span><h3>{{ metric.label }}</h3><p>{{ metric.confidence }}</p></article></div>
          <div class="rhythm-dashboard">
            <article class="sleep-card"><span>Example rhythm preview</span><h2>Sleep regularity</h2><strong>± 42<small> min</small></strong><div class="sleep-bars"><i v-for="n in [44,62,53,76,71,82,65,69,84,74,90,80,73,88]" :key="n" :style="{height:n+'%'}"></i></div><p>Timing is more regular on weekdays. This is example data until full parsing is connected.</p></article>
            <article class="activation-card"><span>Activation × self-report</span><h2>Two signals, kept separate</h2><div class="signal-row"><span>Felt stress</span><i><b style="width:31%"></b></i><strong>Low</strong></div><div class="signal-row"><span>Physical activation</span><i><b style="width:72%"></b></i><strong>High</strong></div><p>A difference can reflect excitement, movement, caffeine, illness or sensor error. The application does not decide for you.</p></article>
          </div>
        </template>
        <div class="wearable-instructions">
          <div class="wearable-help-heading"><span class="section-kicker">How to get your data</span><h2>Start with an export you can inspect.</h2><p>Choose the smallest export that answers your question. Files stay on this device in the current prototype; exact location and raw GPS are excluded from the reduced profile export.</p></div>
          <div class="wearable-help-grid">
            <article><span>Garmin · recommended</span><h3>Wellness data</h3><ol><li>Open Garmin Connect in a web browser.</li><li>Open your profile, then Account Settings and Account Information.</li><li>Choose a date under Export Wellness Data.</li><li>Download the ZIP containing sleep, stress, HRV, steps and related FIT files.</li></ol><a href="https://support.garmin.com/en-US/?faq=W1TvTPW8JZ6LfJSfK512Q8" target="_blank" rel="noreferrer">Official Garmin export guide ↗</a></article>
            <article><span>Garmin · longer history</span><h3>Full account archive</h3><ol><li>Open Garmin Account Data Management.</li><li>Choose Export Your Data, then Request Data Export.</li><li>Garmin emails a download link when the archive is ready.</li><li>Select only relevant wellness files before local import.</li></ol><a href="https://support.garmin.com/en-US/?faq=W1TvTPW8JZ6LfJSfK512Q8" target="_blank" rel="noreferrer">Official Garmin instructions ↗</a></article>
            <article><span>Other ecosystems</span><h3>Apple Health or Google Fit</h3><p>Apple Health can export its full local health archive from the Health app’s profile menu. Google Fit data can be requested through Google Takeout. These formats need dedicated parsers before the prototype can analyse them.</p><div><a href="https://support.apple.com/en-us/108779" target="_blank" rel="noreferrer">Apple Health instructions ↗</a><a href="https://support.google.com/fit/answer/3024190?hl=en" target="_blank" rel="noreferrer">Google Fit export ↗</a></div></article>
          </div>
          <p class="wearable-api-note"><b>For a future automatic connection:</b> Garmin’s Health API provides all-day summaries such as sleep, heart rate, steps and stress, but it is a developer integration—not the anonymous local-file route used here. <a href="https://developer.garmin.com/gc-developer-program/health-api/" target="_blank" rel="noreferrer">Garmin Health API ↗</a></p>
        </div>
        <div class="wearable-principles"><article><b>Compare with yourself</b><p>Personal baselines are usually more useful than population rankings for physiological signals.</p></article><article><b>Trends over moments</b><p>Repeated patterns matter more than a single night or a single vendor score.</p></article><article><b>Observation, not diagnosis</b><p>Consumer wearable data cannot determine mood, personality or medical conditions.</p></article></div>
      </section>

      <section v-else-if="screen === 'about'" class="about-view">
        <div class="about-hero">
          <p class="eyebrow">The general idea</p>
          <h1>A map,<br><em>not a label.</em></h1>
          <p>Most personality tools ask what kind of person you are. Neuroprofile asks how you tend to think, learn, act and communicate; what gives you energy; and which environments help different parts of you become available.</p>
          <button class="primary large" @click="startJourney">Start guided mapping <span>→</span></button>
        </div>

        <div class="about-thesis">
          <span class="section-kicker">Why this exists</span>
          <div>
            <h2>More detail than a type.<br>More context than a score.</h2>
            <p>Two people can receive the same personality label while differing substantially in focus, communication, sensory sensitivity, preferred group size and recovery needs. Compressing those differences into a category loses useful information.</p>
            <p>Neuroprofile keeps dimensions continuous. A high or low score is not automatically better: it describes a tendency, preference or capability that may be helpful in some circumstances and costly in others.</p>
          </div>
        </div>

        <div class="idea-grid">
          <article><span>01</span><h3>You are not exactly the same everywhere</h3><p>Different parts of you may appear at work, with unfamiliar people, with a best friend, in a relationship, under time pressure or on holiday. This variation is meaningful information, not inconsistency.</p></article>
          <article><span>02</span><h3>Capability is not the same as preference</h3><p>You may be highly capable of leading, socialising or adapting while preferring less of it—or while paying a substantial energy cost afterward.</p></article>
          <article><span>03</span><h3>Current state is not a permanent trait</h3><p>Low Energy, poor sleep or overload can temporarily affect Focus, Starting and Social Capacity. The profile keeps temporary state separate from longer-term tendencies.</p></article>
          <article><span>04</span><h3>Observations support, but do not overrule</h3><p>Optional wearable data can reveal patterns in sleep, movement and physiological activation. It remains separate from your own experience and cannot determine personality, mood or meaning.</p></article>
        </div>

        <div class="four-lenses">
          <div><span class="section-kicker">A more precise context model</span><h2>What you show is only one part of the story.</h2></div>
          <div class="lens-list">
            <article><b>Expression</b><p>What you actually show in a situation.</p></article>
            <article><b>Capacity</b><p>What you can do when it is needed.</p></article>
            <article><b>Preference</b><p>What you would naturally choose.</p></article>
            <article><b>Cost</b><p>How much energy or recovery it requires.</p></article>
          </div>
        </div>

        <div class="uses-section">
          <div class="uses-heading"><span class="section-kicker">What can you do with your results?</span><h2>A map becomes useful when it changes the questions you can ask.</h2><p>The results are designed to support reflection, communication and small experiments—not to deliver a final verdict about who you are.</p></div>
          <div class="uses-list">
            <article><span>01</span><div><h3>Build a personal operating manual</h3><p>Describe the conditions under which you think clearly, communicate effectively, sustain energy and recover.</p></div></article>
            <article><span>02</span><div><h3>Design a better working environment</h3><p>Explore protected focus time, meeting patterns, written instructions, autonomy, structure and recovery without treating a job as inherently suitable or unsuitable.</p></div></article>
            <article><span>03</span><div><h3>Communicate more precisely</h3><p>Replace broad labels with practical descriptions of how you process information, interact and regain energy.</p></div></article>
            <article><span>04</span><div><h3>Understand relationship dynamics</h3><p>Notice how Directness, Sociability, expression and recovery change with familiarity, trust, group size and role.</p></div></article>
            <article><span>05</span><div><h3>Improve learning experiments</h3><p>Compare immersion and variety, external notes and mental memory, overview-first and detail-first approaches, or different distraction levels.</p></div></article>
            <article><span>06</span><div><h3>Recognise hidden energy costs</h3><p>See where visible competence may conceal substantial preparation, filtering, adaptation or recovery.</p></div></article>
            <article><span>07</span><div><h3>Identify supportive environments</h3><p>Examine noise, predictability, interruption, social density, autonomy, urgency and access to quiet recovery.</p></div></article>
            <article><span>08</span><div><h3>Choose skills to develop</h3><p>Select a personally meaningful skill such as Starting, Planning, Expressing, Boundaries or Interruption Recovery—without calling the current level a defect.</p></div></article>
            <article><span>09</span><div><h3>Run small personal experiments</h3><p>Turn observations into short, reversible trials with outcomes you can track. The result remains a hypothesis, not proof of cause.</p></div></article>
            <article><span>10</span><div><h3>Track change over time</h3><p>Distinguish relatively stable patterns from changes associated with sleep, workload, health, relationships, practice or life transitions.</p></div></article>
            <article><span>11</span><div><h3>Prepare for a professional conversation</h3><p>Organise contexts, strategies, energy patterns and questions before speaking with a clinician, therapist, coach or occupational specialist.</p></div></article>
            <article><span>12</span><div><h3>Communicate accommodation needs</h3><p>Share practical needs—such as written instructions or uninterrupted work—without disclosing an entire personal profile.</p></div></article>
            <article><span>13</span><div><h3>Use your result in other tools</h3><p>Export selected, structured JSON for personal applications, alternative visualisations or consented research. Your data stays with you until you choose to share it.</p></div></article>
          </div>
        </div>

        <div class="not-for-section">
          <div><span class="section-kicker">Important boundaries</span><h2>What should the results not be used for?</h2></div>
          <div class="not-for-grid">
            <p>Not to diagnose or exclude a condition</p><p>Not to determine worth or intelligence</p><p>Not to prescribe treatment</p><p>Not for employee selection</p><p>Not to predict relationships or happiness with certainty</p><p>Not to override your own experience</p>
          </div>
        </div>

        <div class="ownership-block">
          <span class="ownership-mark">◎</span>
          <div><span class="section-kicker">Your profile belongs to you</span><h2>Your data stays with you.</h2><p>No account is required. Assessment and scoring happen in your browser, saving is optional, and exporting is an explicit action under your control. An exported profile can become identifiable when shared, so you can inspect and reduce it first.</p></div>
        </div>

        <div class="about-ending">
          <p>No questionnaire can capture an entire person. Self-perception is imperfect, contexts change, skills develop and wearables make mistakes.</p>
          <h2>Your profile is not your identity.<br><em>It is a tool for exploring how you work.</em></h2>
          <button class="primary large" @click="startJourney">Start guided mapping <span>→</span></button>
        </div>
      </section>

      <section v-else-if="screen === 'method'" class="method-view">
        <div class="page-intro"><p class="eyebrow">Transparent by design</p><h1>Serious method.<br><em>Common language.</em></h1><p>The playful character sheet is only the surface. Underneath, every stat has a stable construct, evidence source, context and limitation.</p></div>
        <div class="method-stack">
          <article><span>01</span><div><h2>Continuous dimensions</h2><p>No INFJ-style assignment and no artificial cut between two nearly identical people. Scores stay on a continuum, and no direction is universally better.</p></div><code>trait.value: 0…100</code></article>
          <article><span>02</span><div><h2>Separate kinds of evidence</h2><p>Self-report, context reports, optional tasks and wearable observations remain visible as distinct sources. Agreement adds confidence; disagreement adds information.</p></div><code>evidence: self_report</code></article>
          <article><span>03</span><div><h2>Context before conclusions</h2><p>Expression, capacity, preference and cost are measured separately. A socially capable person may still prefer less interaction or need more recovery afterward.</p></div><code>context.cost: 0…100</code></article>
          <article><span>04</span><div><h2>Advice as experiment</h2><p>Suggestions are small, reversible quests with outcomes to observe. They are never framed as guaranteed predictions or treatment.</p></div><code>causalClaim: false</code></article>
          <article><span>05</span><div><h2>Measured contexts, not assumed personalities</h2><p>Broad life-context answers tailor the scenarios. Each context keeps its own responses and evidence status; a highlighted difference is an observation to investigate, not an explanation of cause.</p></div><code>context.measured: true</code></article>
        </div>
        <div class="research-note"><span class="section-kicker">Research direction</span><h2>Why repeat measurement by context?</h2><p>Personality science supports both relative stability and meaningful within-person variability. Repeated real-world sampling can reduce some limitations of broad retrospective reports, although it introduces its own burden and response biases. The next methodological step should therefore combine tailored retrospective scenarios with short repeated check-ins, then validate the resulting scales independently.</p><div><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5596082/" target="_blank" rel="noreferrer">Dynamic personality science ↗</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10779927/" target="_blank" rel="noreferrer">Ecological momentary assessment ↗</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12044207/" target="_blank" rel="noreferrer">Variability and response bias ↗</a></div></div>
        <div class="privacy-block"><div><span class="privacy-orbit">◎</span></div><div><span class="section-kicker">Your data belongs to you</span><h2>No account. No analytics. No hidden profile.</h2><p>Assessment and scoring run in the browser. Saving is device-local. Export is explicit and inspectable. Exact timestamps, locations and raw wearable streams stay out of the privacy-reduced export.</p><div class="privacy-actions"><button class="primary" @click="exportProfile">Export private JSON</button><button class="danger-link" @click="resetLocal">Erase local data</button></div></div></div>
        <p class="prototype-warning"><b>Prototype status:</b> The interaction model and scoring architecture are functional, but the current questions and scores are illustrative. Public use requires psychometric validation, licensing review, accessibility testing and independent expert review.</p>
      </section>
    </main>

    <footer v-if="screen !== 'assessment'">
      <button class="brand" @click="go('home')"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>neuroprofile</span></button>
      <p>A private map of how you think, work, connect and recharge.</p>
      <div><button @click="go('about')">What it’s for</button><button @click="go('method')">Methodology</button><button @click="go('method')">Privacy</button><button @click="exportProfile">Export</button></div>
      <small>Descriptive, not diagnostic · Prototype v0.1</small>
    </footer>

    <div v-if="detailStat" class="modal-backdrop" @click.self="detailStat=null">
      <section class="stat-modal" role="dialog" aria-modal="true" :aria-label="`${detailStat.label} details`">
        <button class="close" @click="detailStat=null" aria-label="Close">×</button>
        <span class="modal-kicker">{{ detailStat.group === 'fit' ? 'Preference' : 'Trait' }} · {{ detailStat.technical }}</span>
        <h2>{{ detailStat.label }} <b>{{ scores[detailStat.id] }}</b></h2><p class="modal-lede">{{ detailStat.description }}</p>
        <div class="modal-scale"><span>{{ detailStat.low }}</span><i><b :style="{width:scores[detailStat.id]+'%',background:groups.find(g=>g.id===detailStat.group)?.color}"></b></i><span>{{ detailStat.high }}</span></div>
        <div class="modal-grid"><article><b>Possible advantage</b><p>{{ scores[detailStat.id] > 65 ? `Your ${detailStat.label.toLowerCase()} is likely to become a noticeable part of how you approach the right tasks.` : `You may use ${detailStat.label.toLowerCase()} selectively rather than by default.` }}</p></article><article><b>Context question</b><p>Where does this quality become easier, more useful or more costly to express?</p></article></div>
        <small>This is a self-report estimate, not a percentile or demonstrated ability.</small>
      </section>
    </div>

    <div v-if="checkinOpen" class="modal-backdrop" @click.self="checkinOpen=false">
      <section class="checkin-modal" role="dialog" aria-modal="true" aria-label="Context check-in"><button class="close" @click="checkinOpen=false">×</button><span class="modal-kicker">One-minute check-in</span><h2>How are you, right now?</h2><label>Context<select v-model="selectedContext"><option v-for="context in contexts" :key="context.id" :value="context.id">{{ context.label }}</option></select></label><label>Available energy<input type="range" min="0" max="100" value="58"></label><label>Focus available<input type="range" min="0" max="100" value="72"></label><label>Social effort<input type="range" min="0" max="100" value="41"></label><button class="primary full" @click="checkinOpen=false;savedNotice='Check-in saved locally'">Save check-in</button></section>
    </div>

    <div v-if="createProfileOpen" class="modal-backdrop" @click.self="createProfileOpen=false">
      <section class="profile-modal" role="dialog" aria-modal="true" aria-label="Add profile">
        <button class="close" @click="createProfileOpen=false">×</button><span class="modal-kicker">A separate local map</span><h2>Add a profile</h2>
        <p>Use any name you recognise. The suggestion is random, memorable and does not need to identify the person.</p>
        <label>Profile name<input v-model="newProfileName" maxlength="48" @keyup.enter="createProfile"></label>
        <button class="suggest-name" @click="regenerateProfileName">↻ Suggest another anonymous name</button>
        <div class="modal-actions"><button class="secondary" @click="createProfileOpen=false">Cancel</button><button class="primary" @click="createProfile">Create & start map</button></div>
        <small>Stored only in this browser unless you explicitly export it.</small>
      </section>
    </div>

    <div v-if="manageProfileOpen" class="modal-backdrop" @click.self="manageProfileOpen=false">
      <section class="profile-modal" role="dialog" aria-modal="true" aria-label="Manage current profile">
        <button class="close" @click="manageProfileOpen=false">×</button><span class="modal-kicker">Current profile</span><h2>Manage {{ activeProfile?.name }}</h2>
        <label>Profile name<input v-model="editProfileName" maxlength="48" @keyup.enter="renameActiveProfile(editProfileName);manageProfileOpen=false"></label>
        <div class="modal-actions"><button class="danger-link" :disabled="profiles.length <= 1" @click="deleteActiveProfile">Delete profile</button><button class="primary" @click="renameActiveProfile(editProfileName);manageProfileOpen=false">Save name</button></div>
        <small v-if="profiles.length <= 1">Keep at least one local profile. You can erase all local data from Methodology.</small>
      </section>
    </div>

    <div v-if="savedNotice" class="toast" role="status">✓ {{ savedNotice }}</div>
  </div>
</template>
