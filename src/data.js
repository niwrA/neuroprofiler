export const groups = [
  { id: 'thinking', label: 'Thinking', color: '#ef6a4c' },
  { id: 'doing', label: 'Doing', color: '#e5a52e' },
  { id: 'connecting', label: 'Connecting', color: '#38a188' },
  { id: 'regulation', label: 'Sensing & energy', color: '#687cc7' },
  { id: 'fit', label: 'What suits you', color: '#9b6aad' },
]

export const stats = [
  { id: 'focus', label: 'Focus', group: 'thinking', technical: 'Sustained attention', description: 'Staying absorbed in one thing for an extended period.', low: 'Breadth', high: 'Depth' },
  { id: 'switching', label: 'Switching', group: 'thinking', technical: 'Attentional set shifting', description: 'Moving between tasks, rules or trains of thought.', low: 'Continuity', high: 'Agility' },
  { id: 'memory', label: 'Memory', group: 'thinking', technical: 'Working memory', description: 'Keeping several pieces of information available while using them.', low: 'Externalise', high: 'Hold in mind' },
  { id: 'detail', label: 'Detail', group: 'thinking', technical: 'Local processing orientation', description: 'Noticing fine differences, irregularities and exact qualities.', low: 'Essentials', high: 'Fine grain' },
  { id: 'bigPicture', label: 'Big picture', group: 'thinking', technical: 'Global integration', description: 'Connecting information into larger structures and meaning.', low: 'Components', high: 'Systems' },
  { id: 'curiosity', label: 'Curiosity', group: 'thinking', technical: 'Epistemic curiosity', description: 'Wanting to discover, explore and understand.', low: 'Familiarity', high: 'Discovery' },
  { id: 'starting', label: 'Starting', group: 'doing', technical: 'Task initiation', description: 'Turning an intention into the first concrete action.', low: 'Warm-up', high: 'Quick launch' },
  { id: 'planning', label: 'Planning', group: 'doing', technical: 'Prospective planning', description: 'Creating a route from the present to a desired result.', low: 'Emergent', high: 'Mapped' },
  { id: 'persistence', label: 'Persistence', group: 'doing', technical: 'Effortful persistence', description: 'Continuing when work is difficult, repetitive or slow.', low: 'Responsive', high: 'Steadfast' },
  { id: 'finishing', label: 'Finishing', group: 'doing', technical: 'Goal completion', description: 'Closing open loops and delivering a completed result.', low: 'Open-ended', high: 'Closure' },
  { id: 'sociability', label: 'Sociability', group: 'connecting', technical: 'Affiliative extraversion', description: 'Seeking and enjoying time with other people.', low: 'Solitude', high: 'Company' },
  { id: 'expressing', label: 'Expressing', group: 'connecting', technical: 'Expressive communication', description: 'Putting thoughts, feelings and needs into words or signals.', low: 'Private', high: 'Outward' },
  { id: 'perspective', label: 'Perspective', group: 'connecting', technical: 'Cognitive empathy', description: 'Constructing a model of another person’s viewpoint.', low: 'Own lens', high: 'Many lenses' },
  { id: 'directness', label: 'Directness', group: 'connecting', technical: 'Explicit communication preference', description: 'Communicating meaning plainly instead of through implication.', low: 'Nuanced', high: 'Explicit' },
  { id: 'sensitivity', label: 'Sensitivity', group: 'regulation', technical: 'Sensory responsivity', description: 'Registering subtle sensory and emotional input.', low: 'Buffered', high: 'Fine-tuned' },
  { id: 'filtering', label: 'Filtering', group: 'regulation', technical: 'Selective attention / sensory gating', description: 'Letting background input recede while attending elsewhere.', low: 'Wide intake', high: 'Selective' },
  { id: 'change', label: 'Change', group: 'regulation', technical: 'Change tolerance', description: 'Remaining comfortable when expectations or plans shift.', low: 'Prepare', high: 'Adapt' },
  { id: 'recovery', label: 'Recovery', group: 'regulation', technical: 'Post-demand recovery', description: 'Regaining usable energy after effort or stimulation.', low: 'More time', high: 'Quick reset' },
  { id: 'independence', label: 'Independence', group: 'fit', technical: 'Autonomy preference', description: 'Preferring control over method, sequence and timing.', low: 'Guidance', high: 'Autonomy' },
  { id: 'structure', label: 'Structure', group: 'fit', technical: 'Structure preference', description: 'Preferring clear rules, expectations and boundaries.', low: 'Open field', high: 'Clear frame' },
  { id: 'variety', label: 'Variety', group: 'fit', technical: 'Variety seeking', description: 'Preferring changes in subject, method or environment.', low: 'Continuity', high: 'Mix it up' },
  { id: 'purpose', label: 'Purpose', group: 'fit', technical: 'Meaning orientation', description: 'Needing activity to connect with personally meaningful values.', low: 'Pragmatic', high: 'Meaning-led' },
]

export const contexts = [
  { id: 'self', label: 'Just me', icon: '◌', description: 'Your general self-perception' },
  { id: 'work', label: 'At work', icon: '□', description: 'Tasks, colleagues and expectations' },
  { id: 'learning', label: 'While learning', icon: '△', description: 'Study, training and self-directed learning' },
  { id: 'home', label: 'At home', icon: '⌂', description: 'Your living situation and daily routines' },
  { id: 'friends', label: 'Close friends', icon: '◇', description: 'People who know you well' },
  { id: 'partner', label: 'With a partner', icon: '∞', description: 'A close intimate relationship' },
  { id: 'holiday', label: 'On holiday', icon: '☼', description: 'Low obligation and unfamiliar settings' },
]

export const defaults = {
  focus: 82, switching: 39, memory: 68, detail: 86, bigPicture: 78, curiosity: 91,
  starting: 47, planning: 76, persistence: 84, finishing: 63,
  sociability: 46, expressing: 69, perspective: 81, directness: 72,
  sensitivity: 79, filtering: 43, change: 51, recovery: 38,
  independence: 88, structure: 71, variety: 58, purpose: 92,
}

export const contextOffsets = {
  work: { focus: 7, switching: 12, planning: 10, sociability: 14, directness: -21, recovery: -12, structure: 8 },
  friends: { focus: -19, switching: 18, sociability: 39, expressing: 19, directness: 20, sensitivity: -8, recovery: 21 },
  partner: { focus: -8, sociability: 28, expressing: 13, perspective: 8, directness: 5, sensitivity: 5, recovery: 16 },
  holiday: { focus: -11, switching: 16, planning: -31, sociability: 17, change: 24, recovery: 27, variety: 17 },
  learning: { focus: 5, curiosity: 8, sociability: -5, planning: 3 },
  home: { focus: -3, sociability: -8, recovery: 12, structure: -4 },
}

export const contextIntakeFields = [
  { id: 'workType', label: 'Work', options: [['none','Not currently working'],['knowledge','Knowledge or creative work'],['people','People-facing or care work'],['practical','Practical or physical work'],['mixed','A varied or mixed role']] },
  { id: 'workSetting', label: 'Work setting', options: [['remote','Mostly remote or alone'],['shared','Shared workplace'],['mobile','Changing locations'],['na','Not applicable']] },
  { id: 'learningType', label: 'Learning', options: [['formal','School, university or formal training'],['professional','Learning for work'],['self','Self-directed interests'],['none','No regular learning context']] },
  { id: 'living', label: 'Living situation', options: [['alone','Living alone'],['partner','Sharing a home with a partner'],['lat','Living apart together'],['family','With family or children'],['shared','Shared household or housemates'],['variable','Variable or temporary']] },
  { id: 'relationship', label: 'Close relationship', options: [['cohabiting','Partner, sharing a home'],['lat','Partner, living apart together'],['dating','Dating or a developing relationship'],['multiple','More than one close romantic relationship'],['none','No current partner context'],['private','Prefer not to describe']] },
  { id: 'friendsPattern', label: 'Social circles', options: [['one','Mostly one-to-one friendships'],['small','A small familiar circle'],['topic','Topic-based circles: hobbies, sports or interests'],['community','Community, voluntary or faith groups'],['large','Several circles or a larger network'],['online','Mostly online circles'],['mixed','A mix of different circles'],['limited','Limited contact at present']] },
]

export const contextQuestionStats = ['focus','switching','detail','bigPicture','starting','planning','sociability','expressing','directness','sensitivity','change','recovery']

export const contextQuestionEnds = {
  focus: 'Over the next 30–60 minutes, what usually happens to your attention?',
  switching: 'When you return to the original thread, how available is it?',
  detail: 'What level of detail enters your awareness without deliberate searching?',
  bigPicture: 'How readily does a coherent overall model form?',
  starting: 'What usually happens between intending to begin and taking the first concrete action?',
  planning: 'How much of the route do you naturally work out before taking action?',
  sociability: 'What effect has this kind of contact usually had on your available social energy?',
  expressing: 'How available are accurate words while the conversation is happening?',
  directness: 'How do you most naturally communicate the issue?',
  sensitivity: 'How much of the surrounding input remains present while you try to do what matters?',
  change: 'How quickly does the revised situation become mentally and practically usable?',
  recovery: 'Once the demands pause, how quickly does usable capacity return?',
}

export const contextScenes = {
  work: {
    focus: 'You have an important piece of work and ordinary messages, questions or requests continue around you.', switching: 'You are interrupted midway through work that requires holding several details in mind.', detail: 'You review a nearly finished piece of work created by a competent colleague.', bigPicture: 'You join a project with unfamiliar people, goals, constraints and terminology.', starting: 'A necessary work task is clear, useful and slightly dull, with no immediate deadline.', planning: 'A multi-step assignment has a real deadline, several dependencies and some uncertainty.', sociability: 'After a normal day of contact with colleagues, customers or collaborators, you consider optional social contact.', expressing: 'You need to explain a concern or unfinished idea to someone involved in your work.', directness: 'A colleague or client is unhappy but communicates the concern indirectly.', sensitivity: 'You are working in your usual physical and digital environment during a busy period.', change: 'Priorities change after you have already organised your workday.', recovery: 'A demanding workday ends, but your evening still contains ordinary decisions and interaction.',
  },
  learning: {
    focus: 'You are learning material you genuinely want to understand, but notifications and unrelated ideas remain available.', switching: 'A lesson or study session is interrupted and you return to the difficult part later.', detail: 'New material contains examples, exceptions, terminology and small distinctions.', bigPicture: 'You enter a new subject containing many facts whose relationships are not yet explained.', starting: 'A useful learning session is planned, but nobody will notice if you postpone it.', planning: 'You need to learn a substantial subject or complete a course over several weeks.', sociability: 'You have just spent a learning session discussing material with other people.', expressing: 'You partly understand a difficult idea and have an opportunity to explain or question it.', directness: 'Feedback on your learning is vague and you are unsure what needs to change.', sensitivity: 'You are trying to learn in the setting you most often use for study or training.', change: 'The learning route or expectations change after you have prepared for a different format.', recovery: 'After several hours of concentrated learning, another mentally demanding activity becomes available.',
  },
  home: {
    focus: 'You want to finish something at home while household sounds, devices or other people remain present.', switching: 'A household need interrupts something you were absorbed in.', detail: 'You notice that a room, routine or shared practical arrangement is not working smoothly.', bigPicture: 'Several small household patterns—timing, clutter, responsibilities and interruptions—have begun to interact.', starting: 'A routine household task needs doing, but its timing is entirely up to you.', planning: 'Several household responsibilities, appointments and practical tasks need coordinating.', sociability: 'After an ordinary day at home, you can spend the evening alone or with people in your household.', expressing: 'Something about the living arrangement is bothering you and needs to be discussed.', directness: 'Someone at home repeatedly hints at a preference instead of stating it.', sensitivity: 'Your home contains its usual mixture of sounds, lighting, smells, objects and other people’s activity.', change: 'An expected quiet evening at home becomes a busier or more social one at short notice.', recovery: 'You return home depleted and ordinary household demands are still waiting.',
  },
  friends: {
    focus: 'During time with your usual social circle, one conversation or shared activity becomes especially engaging.', switching: 'Several conversations, people or activities compete for your attention in the same gathering.', detail: 'A friend tells a story containing names, subtle reactions, inconsistencies and side details.', bigPicture: 'Several friends describe different parts of the same group situation or disagreement.', starting: 'You would like contact with friends, but arranging it requires the first message or concrete proposal.', planning: 'A group activity needs a date, location and agreement between people with different preferences.', sociability: 'You have spent a few hours with the kind of social circle you selected.', expressing: 'A friend asks what is really going on when something important is difficult to explain.', directness: 'A friend has crossed a boundary, but the relationship matters and you expect to meet again.', sensitivity: 'You are with your usual circle in the kind of place where you normally meet.', change: 'A carefully expected one-to-one or group plan changes in size, place or timing.', recovery: 'After enjoyable time with friends, you return to a quiet environment.',
  },
  partner: {
    focus: 'You and your partner set aside time for an ordinary but meaningful conversation. It lasts long enough to develop several threads, and nothing urgent is interrupting you.', switching: 'You move between your own activity and several small shared decisions or requests.', detail: 'Your partner describes a complicated day including events, wording, tone and small changes in mood.', bigPicture: 'Several recurring practical and emotional issues appear to be connected in the relationship.', starting: 'A shared practical task needs one person to initiate it, but there is no urgent deadline.', planning: 'You and your partner are coordinating a future plan involving time, money and different preferences.', sociability: 'You have had substantial one-to-one time together and both more shared time and solitude are available.', expressing: 'You notice a complicated feeling about the relationship and your partner asks what is happening.', directness: 'You disagree about something important and neither person wants unnecessary conflict.', sensitivity: 'You share space while each person has different needs for sound, touch, light, order or conversation.', change: 'A shared plan changes because your partner’s needs or availability have shifted.', recovery: 'After an emotionally or socially intense period together, the immediate demands pause and normal closeness remains available.',
  },
  holiday: {
    focus: 'You are away from routine with several appealing places, activities and practical details competing for attention.', switching: 'A travel day involves repeated transitions between packing, navigation, waiting, conversation and unexpected details.', detail: 'You inspect transport, accommodation and activity information before committing to a booking.', bigPicture: 'You are deciding what kind of holiday would work when time, budget, energy, companions and possible destinations all interact.', starting: 'Departure is approaching and packing or final preparation can now be started.', planning: 'You are arranging a holiday with transport, accommodation, activities and room for spontaneity.', sociability: 'Several days of shared travel or frequent contact have passed and free time appears.', expressing: 'Travel companions want different things from the day and your own preference matters too.', directness: 'A companion’s plan is making the holiday less enjoyable, but changing it may disappoint them.', sensitivity: 'You move through unfamiliar transport, accommodation, food, weather and crowded or novel places.', change: 'A booking, route or planned activity becomes unavailable at short notice.', recovery: 'In the days before leaving and during the first day away, preparation, anticipation and travel demands accumulate.',
  },
}

const contextAnchors = (...items) => items.map(([value, label, detail]) => ({ value, label, detail }))
export const contextResponseOptions = {
  focus: contextAnchors([18,'My attention repeatedly leaves it','Other inputs enter and I follow the main activity only in short fragments.'],[42,'I can hold the thread with support','A clear purpose, deliberate boundary or quieter setting helps me stay with the main activity.'],[68,'The main activity usually holds','Other inputs register, but my attention returns without losing the developing thread.'],[88,'I become deeply absorbed in it','The activity dominates awareness and competing inputs can become difficult to notice.']),
  switching: contextAnchors([18,'The first thread is largely lost','I need to reconstruct it and may not regain the same momentum.'],[41,'I need a deliberate reload','Notes, quiet or retracing several steps usually brings it back.'],[67,'The transition costs a little','I briefly reorient and then continue with most of the thread intact.'],[88,'I move between threads easily','The earlier goal and details remain available with little recovery time.']),
  detail: contextAnchors([18,'I register mainly what affects the outcome','Fine distinctions tend to recede unless I intentionally inspect them.'],[42,'The more relevant details stand out','I notice important irregularities while many minor ones remain background.'],[68,'Small differences appear naturally','Wording, sequence, exceptions or subtle changes enter awareness without much effort.'],[89,'The fine grain is immediately present','Many precise details remain available and I may need to choose which to ignore.']),
  bigPicture: contextAnchors([18,'I secure individual pieces first','A reliable overview forms only after I understand enough components.'],[42,'The overview grows alongside the details','I move between pieces and pattern while the model develops.'],[68,'I form an early working map','Relationships appear quickly and new information finds a provisional place.'],[89,'The organising system appears first','I readily see interacting causes, structures or themes before many details are settled.']),
  starting: contextAnchors([18,'Intention does not become action easily','I can care about it and still circle around the first step for a long time.'],[41,'A launch cue makes the difference','A deadline, companion, routine or tiny first action usually gets me moving.'],[67,'I start after brief preparation','Once materials and the next action are clear, I generally begin.'],[88,'Choosing it is almost enough','The decision naturally turns into concrete action.']),
  planning: contextAnchors([18,'I prefer to discover the route','Advance planning feels restrictive or speculative; I respond as reality unfolds.'],[42,'I secure the essentials','I decide the main constraints and leave substantial room to adapt.'],[68,'I build a practical map','Stages, responsibilities and likely complications become visible before action.'],[89,'I model details and contingencies','I naturally plan sequences, alternatives, timing and failure points.']),
  sociability: contextAnchors([18,'I strongly need solitude afterward','Even pleasant contact leaves my usable social capacity substantially reduced.'],[41,'The format and people decide','Familiarity, group size and activity make the difference between cost and energy.'],[67,'Contact usually adds energy','I am generally available for more when the interaction has felt comfortable.'],[88,'Connection is actively restorative','Being with these people tends to increase momentum and aliveness.']),
  expressing: contextAnchors([18,'The experience is present but words lag','I need considerable time, distance or writing before I can represent it.'],[42,'I can communicate the rough shape','The main message is available while important nuances remain unclear.'],[67,'I can usually translate it','A little thinking lets me describe the experience fairly accurately.'],[88,'Expression develops the thought','I can find and refine precise words while communicating.']),
  directness: contextAnchors([18,'I preserve the relationship through nuance','Hints, timing and implication feel safer or more appropriate than explicit wording.'],[42,'I approach it gently and partly directly','I signal the issue and become more explicit if needed.'],[68,'I prefer a clear respectful statement','Naming the issue reduces uncertainty and makes a response possible.'],[88,'Explicitness feels essential','Leaving the meaning unstated creates more strain than direct disagreement.']),
  sensitivity: contextAnchors([18,'Most of the setting recedes','Sensory and social background rarely enters awareness unless it becomes relevant.'],[42,'The strongest inputs register','A few features stand out, but they usually remain manageable.'],[68,'Several layers stay present','Sound, light, movement, texture or atmosphere compete with what I am doing.'],[89,'The whole environment is vivid','Fine sensory and interpersonal signals remain foregrounded and accumulate.']),
  change: contextAnchors([18,'My system remains with the first plan','Even when I understand the change, the disruption continues internally.'],[41,'I need to rebuild the picture','Clear new expectations and some transition time let me adapt.'],[67,'I reset after a brief adjustment','I register the loss, identify what matters now and move into the alternative.'],[88,'The new route becomes usable quickly','Unexpected alternatives can feel interesting rather than destabilising.']),
  recovery: contextAnchors([18,'Activation remains but capacity is spent','My mind may stay busy while patience, decisions or social availability remain low.'],[41,'I need protected low-demand time','Several quiet hours or sleep are usually necessary before capacity returns.'],[67,'A meaningful break restores me','Food, movement, quiet or roughly an hour of lower demand often helps.'],[88,'A short transition is enough','I can usually take on another meaningful demand fairly soon.']),
}

const anchors = (...items) => items.map(([value, label, detail]) => ({ value, label, detail }))

export const questions = [
  {
    stat: 'focus', text: 'You have a free afternoon for a project you genuinely care about. What usually happens?',
    options: anchors(
      [20, 'I move around naturally', 'I make progress in short stretches and regularly turn to something else.'],
      [42, 'I work in chapters', 'I stay with it for a while, then welcome a break or a change of subject.'],
      [68, 'I settle into it', 'Once started, I can stay engaged for a long block with occasional awareness of time.'],
      [88, 'The rest of the world fades', 'Hours can pass before hunger, messages or other plans return to awareness.'],
    ),
  },
  {
    stat: 'switching', text: 'An important message arrives while you are absorbed in another task. After answering it…',
    options: anchors(
      [18, 'The original task feels far away', 'I need to reconstruct what I was doing and may not regain the same momentum.'],
      [40, 'I need a deliberate reload', 'Notes or a few quiet minutes usually help me recover the thread.'],
      [65, 'I carry the thread with me', 'There is a short adjustment, but I generally continue where I left off.'],
      [86, 'I move back almost immediately', 'The interruption rarely disrupts my understanding of the original task.'],
    ),
  },
  {
    stat: 'memory', text: 'Someone explains a new task with several steps, exceptions and names. Before you begin…',
    options: anchors(
      [20, 'I need it outside my head', 'Without notes or a written version, important parts are likely to disappear.'],
      [43, 'I keep the outline', 'I remember the main sequence but check details as I go.'],
      [67, 'Most pieces remain available', 'I can usually begin and mentally refer back to the explanation.'],
      [87, 'I can rearrange it mentally', 'I hold the details while comparing options or planning a different sequence.'],
    ),
  },
  {
    stat: 'detail', text: 'You review a nearly finished document, design or plan made by someone competent.',
    options: anchors(
      [18, 'I first judge whether it works', 'Small inconsistencies matter mainly when they affect the overall result.'],
      [42, 'I notice the important irregularities', 'The more relevant differences stand out; minor ones often recede.'],
      [68, 'Small mismatches catch my eye', 'Spacing, wording, exceptions or inconsistencies become visible without deliberate searching.'],
      [89, 'The fine grain is immediately present', 'I see clusters of tiny differences and may need to choose which ones to ignore.'],
    ),
  },
  {
    stat: 'bigPicture', text: 'You enter an unfamiliar subject with many facts and moving parts. Your understanding tends to form by…',
    options: anchors(
      [20, 'Securing the pieces first', 'I understand individual elements before a larger pattern becomes trustworthy.'],
      [43, 'Alternating between pieces and overview', 'The model grows gradually as details support it.'],
      [68, 'Building an early map', 'I quickly form a provisional structure and place new facts inside it.'],
      [88, 'Seeing the system behind the pieces', 'Relationships and organising principles appear before many details are known.'],
    ),
  },
  {
    stat: 'curiosity', text: 'While solving a practical problem, you encounter an interesting question that is not necessary for the task.',
    options: anchors(
      [18, 'I leave it alone easily', 'Interesting is not enough reason to spend time on it right now.'],
      [42, 'I save it for later', 'I may note it, but the original task usually keeps priority.'],
      [67, 'I investigate a little', 'I follow the thread far enough to understand why it is interesting.'],
      [90, 'It opens a new tunnel', 'I can find myself several layers deep before remembering the original task.'],
    ),
  },
  {
    stat: 'starting', text: 'You have decided to do a useful task that is clear but not especially interesting.',
    options: anchors(
      [18, 'The start has real gravity', 'I may think about it repeatedly while doing smaller or more immediate things.'],
      [40, 'I need a launch condition', 'A deadline, routine, companion or very small first step usually gets me moving.'],
      [66, 'I begin after brief preparation', 'I organise what I need and start without much internal negotiation.'],
      [87, 'Decision becomes action', 'Once I choose to do it, beginning is usually the uncomplicated part.'],
    ),
  },
  {
    stat: 'planning', text: 'You are responsible for a complex project with a flexible deadline.',
    options: anchors(
      [18, 'I discover the route by moving', 'Planning too much feels premature; the work itself reveals what comes next.'],
      [42, 'I set a direction and adapt', 'I sketch the major steps but expect the route to change.'],
      [68, 'I make a working map', 'I define stages, dependencies and checkpoints before doing most of the work.'],
      [88, 'I model the route and its failures', 'I naturally consider sequence, contingencies, resources and likely bottlenecks.'],
    ),
  },
  {
    stat: 'persistence', text: 'A meaningful task becomes repetitive and progress is hard to see.',
    options: anchors(
      [19, 'I look for a different route', 'Continuing unchanged drains me; I need novelty, feedback or a new method.'],
      [42, 'I continue in measured doses', 'I can return repeatedly, especially with milestones or external structure.'],
      [68, 'The goal keeps me engaged', 'Slow progress is frustrating, but I usually stay with the work.'],
      [89, 'I can outlast the difficult middle', 'Once committed, I continue long after the initial reward has disappeared.'],
    ),
  },
  {
    stat: 'finishing', text: 'A project is useful and mostly complete, but the last 10% is administrative or repetitive.',
    options: anchors(
      [18, 'My attention has already moved on', 'The interesting problem feels solved, so closure needs external pressure.'],
      [41, 'I finish with a final push', 'A deadline, checklist or another person helps me close the remaining loops.'],
      [67, 'Open loops pull me back', 'The unfinished state is noticeable enough that I usually complete it.'],
      [88, 'Completion is part of the reward', 'Packaging, checking and closing the work feels naturally satisfying.'],
    ),
  },
  {
    stat: 'sociability', text: 'You have had an ordinary week and an optional evening with pleasant people is available.',
    options: anchors(
      [18, 'Solitude is the stronger draw', 'Even good company often costs more energy than a quiet evening restores.'],
      [41, 'It depends on format and people', 'One-to-one or familiar company appeals more than general social activity.'],
      [67, 'I am usually glad to join', 'Interaction tends to add energy when the atmosphere is comfortable.'],
      [88, 'Company actively recharges me', 'Being with people is one of the main ways I regain momentum and aliveness.'],
    ),
  },
  {
    stat: 'expressing', text: 'Something important is happening internally and a trusted person asks what is going on.',
    options: anchors(
      [18, 'I know there is something, but words lag', 'I may need considerable time, writing or distance before I can explain it.'],
      [42, 'I can offer the rough shape', 'I communicate the main feeling or thought while parts remain unclear.'],
      [67, 'I can usually translate it', 'With a moment to think, I find words that represent the experience fairly well.'],
      [87, 'Expression helps me understand it', 'I can articulate nuances while speaking and refine them through conversation.'],
    ),
  },
  {
    stat: 'perspective', text: 'Someone reacts in a way that initially seems unreasonable to you.',
    options: anchors(
      [18, 'I begin with what makes sense to me', 'I need more information before another interpretation becomes available.'],
      [42, 'I can imagine a few explanations', 'I recognise that their assumptions may differ, even if I do not yet see how.'],
      [68, 'I reconstruct their viewpoint', 'I consider their information, priorities and emotional position before judging.'],
      [88, 'Several inner worlds appear at once', 'I spontaneously model multiple plausible perspectives, including ones I disagree with.'],
    ),
  },
  {
    stat: 'directness', text: 'A colleague dislikes part of your work but communicates only through hints.',
    options: anchors(
      [18, 'Hints preserve useful room', 'I am comfortable reading tone and implication without forcing the point.'],
      [42, 'I can work with either style', 'I notice the hints but may ask for clarification if action is needed.'],
      [68, 'I prefer the concern stated', 'Clear wording reduces uncertainty and lets me respond constructively.'],
      [88, 'Unspoken meaning is costly', 'I strongly prefer an explicit statement, even when it is uncomfortable.'],
    ),
  },
  {
    stat: 'sensitivity', text: 'You enter a busy café while already engaged in conversation.',
    options: anchors(
      [18, 'The setting stays in the background', 'Noise, light, texture and movement rarely enter awareness unless relevant.'],
      [42, 'I notice the stronger signals', 'A loud table or harsh light registers, but most input remains peripheral.'],
      [68, 'Several layers arrive together', 'Conversation competes with sounds, movement, temperature or the room’s atmosphere.'],
      [89, 'The environment is vividly present', 'Fine sensory and social signals remain available even when I try to focus elsewhere.'],
    ),
  },
  {
    stat: 'filtering', text: 'You need to read something difficult while nearby conversations continue.',
    options: anchors(
      [18, 'Their words keep entering my thought', 'I follow fragments involuntarily and may need to move, mask the sound or stop.'],
      [41, 'I can filter with support', 'Headphones, familiar noise or strong interest helps the background recede.'],
      [67, 'I usually foreground the text', 'The conversations remain audible but stop carrying much meaning.'],
      [88, 'Attention gates the background', 'Once engaged, nearby speech can become almost irrelevant to what I am doing.'],
    ),
  },
  {
    stat: 'change', text: 'A plan you had prepared for is replaced at short notice by an equally reasonable alternative.',
    options: anchors(
      [18, 'My system still expects the first plan', 'Even if I agree, I need time and may feel the disruption for the rest of the event.'],
      [41, 'I need to rebuild my mental picture', 'Once I understand the new sequence and expectations, I can adjust.'],
      [67, 'There is a brief reset', 'I register the change, ask what matters, and generally move into the alternative.'],
      [88, 'The new route is immediately usable', 'Unexpected alternatives often feel interesting rather than disruptive.'],
    ),
  },
  {
    stat: 'recovery', text: 'After several hours of intense thinking, interaction or stimulation, what best describes your usable capacity—not simply how active your mind feels?',
    options: anchors(
      [18, 'My mind may race, but capacity is spent', 'Ideas can remain fast while decisions, patience or social availability stay reduced until substantial rest or sleep.'],
      [40, 'I need a protected recovery period', 'A few quiet hours without new demands usually restores useful capacity.'],
      [66, 'A real break brings me back', 'Food, movement, solitude or roughly an hour of lower demand often makes me functional again.'],
      [87, 'Capacity returns quickly', 'A short transition is usually enough for me to take on another meaningful demand.'],
    ),
  },
  {
    stat: 'independence', text: 'You receive a clear objective from someone you respect. How do you prefer the method to be handled?',
    options: anchors(
      [18, 'A proven route is welcome', 'Detailed guidance saves effort and lets me concentrate on execution.'],
      [42, 'Give me a framework with room inside it', 'I like defined checkpoints and freedom in the smaller decisions.'],
      [68, 'Agree on the result, then let me design the route', 'I value consultation but want ownership of sequence and method.'],
      [89, 'Autonomy is part of doing good work', 'Close direction quickly adds friction, even when the suggested method is sensible.'],
    ),
  },
  {
    stat: 'structure', text: 'You join a promising project whose goals and roles are still evolving.',
    options: anchors(
      [18, 'The open field feels energising', 'Ambiguity creates room to discover the project while working.'],
      [42, 'A little structure is enough', 'A shared direction and next step lets the rest emerge naturally.'],
      [68, 'Clear roles and milestones help', 'I work more freely once the boundaries and decision process are visible.'],
      [88, 'Unclear structure consumes attention', 'I need explicit expectations, ownership and definitions before my best work becomes available.'],
    ),
  },
  {
    stat: 'variety', text: 'Imagine a month with a sustainable workload. Which pattern sounds most naturally satisfying?',
    options: anchors(
      [18, 'One substantial thread', 'Continuity lets me deepen knowledge, rhythm and craftsmanship.'],
      [42, 'A primary thread with occasional change', 'I prefer a stable centre and some lighter variation around it.'],
      [68, 'Several different kinds of work', 'Changing subject or mode helps renew my attention.'],
      [88, 'A changing landscape', 'Frequent novelty and multiple active threads create energy rather than fragmentation.'],
    ),
  },
  {
    stat: 'purpose', text: 'You are offered a well-defined task with fair rewards, but its wider value is unclear.',
    options: anchors(
      [18, 'Practical value is enough', 'If the exchange is fair and the task is reasonable, a larger meaning is optional.'],
      [42, 'Meaning improves it but is not required', 'I can engage through craft, responsibility or the immediate result.'],
      [68, 'I need a credible reason', 'Understanding who benefits or what the work contributes strongly affects my motivation.'],
      [90, 'Meaning unlocks sustained effort', 'Without connection to important values, even attractive work becomes difficult to inhabit.'],
    ),
  },
]
