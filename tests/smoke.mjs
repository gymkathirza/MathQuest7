import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {TOPICS,PASS_MASTERY,MIN_MASTERY_ATTEMPTS,generateProblem,topicUnlocked,canTakeExit,updateMastery} from '../js/curriculum.mjs';
import {generateDailyBenchmark,CORE_DAILY_COUNT,LEVEL_COUNTS,NC_LOCATIONS} from '../js/daily-session.mjs';
import {IDLE_PAUSE_MS,todayKey,yesterdayKey,ensurePracticeDay,elapsedPracticeMin,shouldIdlePause,pauseSegment,canResumePractice,activeElapsedMs,resetMasterySession,flushMasterySegment,masteryDayTotalMs,formatPracticeDuration,masteryLogRows,MASTERY_DAY_BASE} from '../js/practice-timer.mjs';
import {generateMasteryBenchmark,generateOpenEndedBenchmark,allTopicsCleared,openEndedUnlocked,MASTERY_LEVEL_COUNTS,OPEN_ENDED_ID} from '../js/mastery-session.mjs';
import {analyzeLearner,resolveFocusTopicIds,SYLLABUS_GAPS} from '../js/learner-insights.mjs';
import {boostStepsForTopic,boostPathHtml,improvementPreviewHtml,strengthsPraiseHtml} from '../js/coach-visuals.mjs';
import {streakCoinMultiplier,coinsForCorrect,awardCorrectRewards,awardDayClearRewards,awardBreakBonus,buyBuilding,buyPet,buyPetSkin,realmStageView,REALM_BUILDINGS,REALM_PETS,REALM_PET_SKINS,computeTrophies,heroTitle,XP_PER_CORRECT,COINS_DAY_CLEAR,COINS_BREAK_BONUS,REALM_PREVIEW_MS} from '../js/rewards.mjs';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const appSource=readFileSync(join(ROOT,'js','app.js'),'utf8');
assert.ok(/from ['"]\.\/daily-session\.mjs['"]/.test(appSource),'UI (app.js) must import the canonical daily-session benchmark module');
assert.ok(/from ['"]\.\/practice-timer\.mjs['"]/.test(appSource),'UI (app.js) must import the active practice timer module');
assert.ok(/from ['"]\.\/mastery-session\.mjs['"]/.test(appSource),'UI (app.js) must import mastery / open-ended session helpers');
assert.ok(/from ['"]\.\/learner-insights\.mjs['"]/.test(appSource),'UI must import learner insights helpers');
assert.ok(/masteryReplayTarget/.test(appSource),'UI must honor Parent/Admin mastery replay volume');
assert.ok(/from ['"]\.\/coach-visuals\.mjs['"]/.test(appSource),'UI must import GIF-style coaching visuals');
assert.ok(/startImprovementPractice/.test(appSource),'Student coaching plan must launch improvement-day practice with boost path');
assert.ok(/refreshInsightPanels/.test(appSource),'UI must refresh coaching panels after practice saves');
assert.ok(/Scores updated|recalibrated|Updated coaching snapshot/.test(appSource),'Benchmark summary must show live coaching snapshot after practice');
assert.ok(/forParent:\s*true/.test(appSource),'Parent improvement previews must be read-only (forParent)');
assert.ok(!/data-goto/.test(appSource),'Parent dashboard must not launch practice via data-goto');
assert.ok(/generateDailyBenchmark\s*\(/.test(appSource),'UI (app.js) must call generateDailyBenchmark so practice uses the 3/4/3 benchmark');
assert.ok(/visibilitychange/.test(appSource),'UI must pause practice time when the tab is hidden');
assert.ok(/IDLE_PAUSE_MS/.test(appSource),'UI must use the idle-pause threshold for away time');
for(const label of ['Level 1','Level 2','Level 3'])assert.ok(appSource.includes(label),`UI must label practice tiers (${label})`);
assert.ok(/No calculator/i.test(appSource),'UI must show the no-calculator benchmark instruction');
const swSource=readFileSync(join(ROOT,'sw.js'),'utf8');
assert.ok(swSource.includes('practice-timer.mjs'),'Service worker must cache practice-timer.mjs');
assert.ok(swSource.includes('mastery-session.mjs'),'Service worker must cache mastery-session.mjs');
assert.ok(swSource.includes('learner-insights.mjs'),'Service worker must cache learner-insights.mjs');
assert.ok(swSource.includes('coach-visuals.mjs'),'Service worker must cache coach-visuals.mjs');
const indexSource=readFileSync(join(ROOT,'index.html'),'utf8');
assert.ok(indexSource.includes('masteryReplayTarget'),'Parent panel must expose mastery replay target control');
assert.ok(indexSource.includes('strengths')&&indexSource.includes('improvements')&&indexSource.includes('improvePlan'),'Parent panel must show strengths, improvements, and plan');
assert.ok(indexSource.includes('masteryReview'),'Parent panel must include mastery review');
assert.ok(indexSource.includes('focusMode'),'Parent panel must expose open-ended focus mode');
assert.ok(indexSource.includes('masteryTimeLog'),'Parent panel must show mastery practice time table');
assert.ok(indexSource.includes('masteryTimePill'),'Student header must show mastery yesterday/today time');
assert.ok(/resetMasterySession|flushMasterySegment|masteryPracticeByDay/.test(appSource),'Open-ended mastery must track per-day active practice time');
assert.ok(/from ['"]\.\/rewards\.mjs['"]/.test(appSource),'UI must import rewards helpers');
assert.ok(/previewRealmItem|buyPet|realmTab|Pet Store|Free Preview/.test(appSource),'UI must expose Pet Store tab and free previews');
assert.ok(indexSource.includes('realmStage'),'Home must include My Realm main stage for previews');
assert.ok(indexSource.includes('Pet Store'),'My Realm copy must mention Pet Store');
assert.ok(indexSource.includes('trophies'),'Parent panel must show trophies');
assert.ok(indexSource.includes('id="coins"'),'Header must show coins');
assert.equal(REALM_PREVIEW_MS,3500);
assert.equal(streakCoinMultiplier(1),1);
assert.equal(streakCoinMultiplier(5),1.5);
assert.equal(streakCoinMultiplier(10),2);
assert.equal(coinsForCorrect(3),10);
assert.equal(coinsForCorrect(5),15);
assert.equal(coinsForCorrect(10),20);
const rewardState={xp:0,coins:0,streak:0,best:0};
const r1=awardCorrectRewards(rewardState);
assert.equal(r1.xp,XP_PER_CORRECT);
assert.equal(r1.coins,10);
assert.equal(rewardState.streak,1);
rewardState.streak=4;
const r5=awardCorrectRewards(rewardState);
assert.equal(r5.coins,15);
assert.equal(rewardState.xp,XP_PER_CORRECT*2);
const clear=awardDayClearRewards(rewardState);
assert.equal(clear.coins,COINS_DAY_CLEAR);
const br=awardBreakBonus(rewardState);
assert.equal(br.coins,COINS_BREAK_BONUS);
assert.equal(REALM_BUILDINGS.length,12);
assert.equal(REALM_PETS.length,5);
assert.ok(REALM_PET_SKINS.length>=8);
const shop={coins:50,realm:[]};
assert.equal(buyBuilding(shop,'signpost').ok,true);
assert.deepEqual(shop.realm,['signpost']);
assert.equal(buyBuilding(shop,'signpost').ok,false);
const preview=realmStageView(shop,{type:'building',id:'bridge'});
assert.equal(preview.ghostBuilding.id,'bridge');
assert.ok(preview.previewLabel.includes('Number Line Bridge'));
assert.equal(preview.buildings.length,1);
shop.coins=500;shop.pets=[];shop.petSkins=[];shop.activePet=null;shop.activePetSkin=null;
assert.equal(buyPet(shop,'fox').ok,true);
assert.equal(shop.activePet,'fox');
assert.equal(buyPetSkin(shop,'fox_ember').ok,true);
assert.equal(shop.activePetSkin,'fox_ember');
const petPreview=realmStageView(shop,{type:'skin',id:'fox_frost'});
assert.ok(petPreview.petIcon.includes('🦊'));
assert.ok(petPreview.isPreview);
assert.ok(computeTrophies({cleared:{ns_signs:true},best:5,breaksCompleted:1,realm:['signpost'],pets:['fox'],petSkins:['fox_ember'],coins:50,xp:100}).some(t=>t.id==='pet1'));
assert.ok(computeTrophies({cleared:{ns_signs:true},best:5,breaksCompleted:1,realm:['signpost'],coins:50,xp:100}).length>=3);
assert.equal(heroTitle(0),'New Adventurer');
assert.ok(SYLLABUS_GAPS.length>=5,'Syllabus gap notes should cover major NC.7 domains');
assert.ok(TOPICS.every(t=>boostStepsForTopic(t.id).length>=3),`Every topic needs granular GIF boost steps`);
assert.ok(boostPathHtml(TOPICS[3]).includes('GIF-style boost path'),'Boost path HTML must label the GIF walkthrough');
assert.ok(improvementPreviewHtml(TOPICS[3],'Focus Day 4',{forParent:true}).includes('Read-only'),'Parent preview must note read-only');
assert.ok(!improvementPreviewHtml(TOPICS[3],'Focus Day 4').includes('Read-only'),'Student preview must not show parent read-only note');
assert.ok(strengthsPraiseHtml([{topic:TOPICS[1],mastery:92,accuracy:0.9}]).includes('strength'),'Strength praise cards must celebrate strengths');

assert.equal(IDLE_PAUSE_MS,5*60*1000,'Idle pause must be 5 minutes');
assert.match(todayKey(new Date('2026-08-12T15:00:00')),/^\d{4}-\d{2}-\d{2}$/);
const dayState={sessionDate:'2026-08-11',practiceMs:900000,nextBreakMin:40};
assert.equal(ensurePracticeDay(dayState,Date.parse('2026-08-12T09:00:00')),true,'New calendar day must roll practice counters');
assert.equal(dayState.practiceMs,0);
assert.equal(dayState.nextBreakMin,20);
assert.equal(dayState.sessionDate,todayKey(new Date(Date.parse('2026-08-12T09:00:00'))));
assert.equal(ensurePracticeDay(dayState,Date.parse('2026-08-12T10:00:00')),false);
dayState.practiceMs=120000;
assert.equal(elapsedPracticeMin(dayState.practiceMs,Date.parse('2026-08-12T10:00:00'),Date.parse('2026-08-12T10:03:00')),5);
assert.equal(shouldIdlePause(Date.parse('2026-08-12T10:00:00'),Date.parse('2026-08-12T10:04:59')),false);
assert.equal(shouldIdlePause(Date.parse('2026-08-12T10:00:00'),Date.parse('2026-08-12T10:05:00')),true);
let seg={practiceMs:60000},since=Date.parse('2026-08-12T10:00:00');
since=pauseSegment(seg,since,Date.parse('2026-08-12T10:02:00'));
assert.equal(since,null);
assert.equal(seg.practiceMs,180000);
assert.equal(activeElapsedMs(seg.practiceMs,null,Date.parse('2026-08-12T10:10:00')),180000,'Paused time must not keep accruing');
assert.equal(canResumePractice({onBreak:true,hidden:false,idle:false}),false);
assert.equal(canResumePractice({onBreak:false,hidden:true,idle:false}),false);
assert.equal(canResumePractice({onBreak:false,hidden:false,idle:true}),false);
assert.equal(canResumePractice({onBreak:false,hidden:false,idle:false}),true);

// Open-ended mastery day log: visit stopwatch resets; daily totals accumulate; away time excluded.
const masteryState={masteryPracticeByDay:{},masterySessionMs:0};
resetMasterySession(masteryState);
assert.equal(masteryState.masterySessionMs,0);
let mSince=Date.parse('2026-08-18T10:00:00');
mSince=flushMasterySegment(masteryState,mSince,Date.parse('2026-08-18T10:10:00'));
assert.equal(mSince,null);
assert.equal(masteryState.masteryPracticeByDay['2026-08-18'],10*60*1000);
assert.equal(masteryState.masterySessionMs,10*60*1000);
// break / away — no open segment, totals unchanged
assert.equal(masteryDayTotalMs(masteryState,'2026-08-18',null,Date.parse('2026-08-18T10:40:00')),10*60*1000);
resetMasterySession(masteryState);
assert.equal(masteryState.masterySessionMs,0,'Visit timer resets; daily total kept');
assert.equal(masteryState.masteryPracticeByDay['2026-08-18'],10*60*1000);
mSince=Date.parse('2026-08-18T11:00:00');
mSince=flushMasterySegment(masteryState,mSince,Date.parse('2026-08-18T11:20:00'));
assert.equal(masteryState.masteryPracticeByDay['2026-08-18'],30*60*1000,'10+20 active minutes');
assert.equal(formatPracticeDuration(30*60*1000),'30 min');
assert.equal(formatPracticeDuration(2*60*60*1000),'2 hr');
assert.equal(formatPracticeDuration(2*60*60*1000+15*60*1000),'2 hr 15 min');
masteryState.masteryPracticeByDay['2026-08-19']=60*60*1000;
const rows=masteryLogRows(masteryState,null,Date.parse('2026-08-19T12:00:00'));
assert.equal(rows[0].dayLabel,`Day ${MASTERY_DAY_BASE}`);
assert.equal(rows[1].dayLabel,`Day ${MASTERY_DAY_BASE+1}`);
assert.equal(rows[1].label,'1 hr');
assert.match(yesterdayKey(new Date('2026-08-19T12:00:00')),/2026-08-18/);

assert.equal(TOPICS.length,20,'Expected 20 daily topics');
assert.equal(PASS_MASTERY,80,'Mastery unlock must remain 80%');
assert.equal(CORE_DAILY_COUNT,10,'Core daily benchmark must contain 10 problems');
assert.deepEqual(LEVEL_COUNTS,{standard:3,complex:4,word:3},'Daily tier mix must remain 3/4/3');
assert.ok(TOPICS.some(t=>t.id==='ns_sub'&&t.teach.includes('KCC')),'KCC lesson missing');
assert.ok(TOPICS.some(t=>t.id==='ns_add'&&/greater absolute value|signs differ/i.test(t.teach)),'Integer different-sign strategy missing');

function validateProblem(p,context){
  assert.ok(p.q&&String(p.q).length>3,`Bad question ${context}`);
  assert.ok(p.a!==undefined&&p.a!==null&&String(p.a).length>0,`Bad answer ${context}`);
  assert.equal(p.choices.length,4,`Need four choices ${context}`);
  assert.equal(new Set(p.choices.map(String)).size,4,`Choices must be unique ${context}`);
  assert.ok(p.choices.map(String).includes(String(p.a)),`Correct answer absent from choices ${context}`);
}

assert.deepEqual(MASTERY_LEVEL_COUNTS,{standard:2,complex:4,word:4},'Mastery/open-ended mix must be advanced 2/4/4');
for(const t of TOPICS){
  for(let i=0;i<20;i++){
    const set=generateMasteryBenchmark(t.id);
    assert.equal(set.length,10,`Mastery benchmark length ${t.id}`);
    assert.equal(set.filter(x=>x.level==='standard').length,2,`Mastery standard count ${t.id}`);
    assert.equal(set.filter(x=>x.level==='complex').length,4,`Mastery complex count ${t.id}`);
    assert.equal(set.filter(x=>x.level==='word').length,4,`Mastery word count ${t.id}`);
    set.forEach((p,j)=>validateProblem(p,`${t.id}/mastery/${j+1}`));
    for(const p of set.filter(x=>x.level==='word')){
      assert.ok(p.location&&NC_LOCATIONS.includes(p.location),`Mastery word needs NC location ${t.id}`);
    }
  }
}
for(let i=0;i<40;i++){
  const set=generateOpenEndedBenchmark();
  assert.equal(set.length,10,'Open-ended set length');
  assert.equal(set.filter(x=>x.level==='standard').length,2);
  assert.equal(set.filter(x=>x.level==='complex').length,4);
  assert.equal(set.filter(x=>x.level==='word').length,4);
  const topics=new Set(set.map(x=>x.topicId));
  assert.ok(topics.size>=5,`Open-ended set should span multiple days (got ${topics.size})`);
  set.forEach((p,j)=>validateProblem(p,`open/${i}/${j+1}`));
}
const locked={mastery:{},cleared:{},attempts:{}};
for(const t of TOPICS){locked.mastery[t.id]=0;locked.cleared[t.id]=false;locked.attempts[t.id]={n:0,c:0}}
assert.equal(openEndedUnlocked(locked),false);
assert.equal(allTopicsCleared(locked),false);
for(const t of TOPICS){locked.mastery[t.id]=80;locked.cleared[t.id]=true}
assert.equal(allTopicsCleared(locked),true);
assert.equal(openEndedUnlocked(locked),true);
assert.equal(OPEN_ENDED_ID,'open_mastery');

// Live coaching insights must react to real practice — not invent static Day 1–N rows.
const blank={mastery:{},cleared:{},attempts:{},errorLog:[],settings:{focusMode:'auto',focusTopicIds:[]}};
for(const t of TOPICS){blank.mastery[t.id]=0;blank.cleared[t.id]=false;blank.attempts[t.id]={n:0,c:0}}
const blankInsights=analyzeLearner(blank);
assert.equal(blankInsights.strengths.length,0,'No strengths before any practice');
assert.equal(blankInsights.improvements.length,0,'No improvements before any practice');
assert.ok(blankInsights.plan[0]?.action.includes('Start'),'Empty plan should nudge starting a lesson');

const live={mastery:{},cleared:{},attempts:{},errorLog:[],settings:{focusMode:'auto',focusTopicIds:[]}};
for(const t of TOPICS){live.mastery[t.id]=0;live.cleared[t.id]=false;live.attempts[t.id]={n:0,c:0}}
// Day 1 weak after mistakes
live.attempts.ns_signs={n:8,c:2};live.mastery.ns_signs=24;live.errorLog=[{topic:'ns_signs'},{topic:'ns_signs'},{topic:'ns_signs'},{topic:'ns_signs'},{topic:'ns_signs'}];
// Day 2 strong
live.attempts.ns_add={n:12,c:11};live.mastery.ns_add=92;live.cleared.ns_add=true;
// Day 3 mild
live.attempts.ns_sub={n:6,c:4};live.mastery.ns_sub=60;
const liveInsights=analyzeLearner(live);
assert.ok(liveInsights.improvements.some(r=>r.topic.id==='ns_signs'),'Mistakes must surface Day 1 in improvements');
assert.ok(liveInsights.strengths.some(r=>r.topic.id==='ns_add'),'Strong Day 2 must appear in strengths');
assert.ok(!liveInsights.strengths.some(r=>r.topic.id==='ns_signs'),'Weak Day 1 must not also count as a strength');
assert.ok(!liveInsights.improvements.some(r=>r.topic.id==='ns_add'),'Strong Day 2 must not also count as an improvement');
assert.ok(liveInsights.plan.some(p=>p.topicId==='ns_signs'),'Plan must target the weak day');
assert.deepEqual(resolveFocusTopicIds(live,liveInsights).slice(0,1),['ns_signs'],'Auto open-ended focus must lead with the weakest practiced day');

const insightState={mastery:{},cleared:{},attempts:{},errorLog:[],settings:{focusMode:'blend',focusTopicIds:['g_circle']}};
for(const t of TOPICS){insightState.mastery[t.id]=t.id==='ns_sub'?40:t.id==='ns_add'?92:70;insightState.cleared[t.id]=t.id!=='ns_sub';insightState.attempts[t.id]={n:10,c:t.id==='ns_sub'?3:9}}
insightState.errorLog=[{topic:'ns_sub'},{topic:'ns_sub'},{topic:'ns_sub'}];
const insights=analyzeLearner(insightState);
assert.ok(insights.improvements.some(r=>r.topic.id==='ns_sub'),'Low-accuracy topic should appear in improvements');
assert.ok(insights.strengths.some(r=>r.topic.id==='ns_add'),'High-mastery topic should appear in strengths');
assert.ok(!insights.improvements.some(r=>insights.strengths.some(s=>s.topic.id===r.topic.id)),'Strength and improvement lists must not overlap');
assert.ok(insights.plan.length>=1,'Improvement plan should be non-empty');
const focused=resolveFocusTopicIds(insightState,insights);
assert.ok(focused[0]==='g_circle'||focused.includes('g_circle'),'Blend focus should include parent pin');
assert.ok(focused.includes('ns_sub'),'Blend focus should include auto weak topic');
const focusedSet=generateOpenEndedBenchmark(TOPICS.map(t=>t.id),{focusTopicIds:resolveFocusTopicIds(live,liveInsights),focusShare:0.8});
assert.ok(focusedSet.filter(q=>q.topicId==='ns_signs'||q.topicId==='ns_sub').length>=6,'Open-ended mastery sets must overweight improvement days');

for(const t of TOPICS){
  for(let i=0;i<100;i++)validateProblem(generateProblem(t.id),`${t.id}/base`);
  for(let i=0;i<50;i++){
    const set=generateDailyBenchmark(t.id);
    assert.equal(set.length,10,`Daily benchmark length ${t.id}`);
    assert.deepEqual(set.map(x=>x.level),['standard','standard','standard','complex','complex','complex','complex','word','word','word'],`3/4/3 ordering ${t.id}`);
    set.forEach((p,j)=>validateProblem(p,`${t.id}/daily/${j+1}`));
    for(const p of set.filter(x=>x.level==='word')){
      assert.ok(p.location&&NC_LOCATIONS.includes(p.location),`Word problem needs approved NC location ${t.id}`);
      assert.ok(p.q.includes(p.location),`Location should appear in word problem ${t.id}`);
    }
  }
}

let state={mastery:{},cleared:{},attempts:{}};
for(const t of TOPICS){state.mastery[t.id]=0;state.cleared[t.id]=false;state.attempts[t.id]={n:0,c:0}}
assert.equal(topicUnlocked(state,0),true);
assert.equal(topicUnlocked(state,1),false);
state.mastery[TOPICS[0].id]=80;
assert.equal(topicUnlocked(state,1),false,'Exit clearance must be required');
state.cleared[TOPICS[0].id]=true;
assert.equal(topicUnlocked(state,1),true);

const id=TOPICS[0].id;
state.mastery[id]=84;
state.attempts[id]={n:4,c:4};
assert.equal(canTakeExit(state,id,0),false,'Minimum evidence threshold should apply');
state.attempts[id].n=5;
assert.equal(canTakeExit(state,id,0),true);
assert.equal(canTakeExit(state,id,10),false);
state.attempts[id].n=10;
assert.equal(canTakeExit(state,id,10),true);

let m=0;
for(let i=0;i<7;i++)m=updateMastery(m,true);
assert.ok(m>=80);
m=updateMastery(m,false);
assert.ok(m<100&&m>=0);

console.log('PASS: 20 topics; benchmarks; mastery replay; open-ended focus; learner insights; GIF boost; mastery day log; coins/realm/pets/preview; active practice timer');
