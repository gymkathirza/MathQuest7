import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {TOPICS,PASS_MASTERY,MIN_MASTERY_ATTEMPTS,generateProblem,topicUnlocked,canTakeExit,updateMastery} from '../js/curriculum.mjs';
import {generateDailyBenchmark,CORE_DAILY_COUNT,LEVEL_COUNTS,NC_LOCATIONS} from '../js/daily-session.mjs';
import {IDLE_PAUSE_MS,todayKey,ensurePracticeDay,elapsedPracticeMin,shouldIdlePause,pauseSegment,canResumePractice,activeElapsedMs} from '../js/practice-timer.mjs';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const appSource=readFileSync(join(ROOT,'js','app.js'),'utf8');
assert.ok(/from ['"]\.\/daily-session\.mjs['"]/.test(appSource),'UI (app.js) must import the canonical daily-session benchmark module');
assert.ok(/from ['"]\.\/practice-timer\.mjs['"]/.test(appSource),'UI (app.js) must import the active practice timer module');
assert.ok(/generateDailyBenchmark\s*\(/.test(appSource),'UI (app.js) must call generateDailyBenchmark so practice uses the 3/4/3 benchmark');
assert.ok(/visibilitychange/.test(appSource),'UI must pause practice time when the tab is hidden');
assert.ok(/IDLE_PAUSE_MS/.test(appSource),'UI must use the idle-pause threshold for away time');
for(const label of ['Level 1','Level 2','Level 3'])assert.ok(appSource.includes(label),`UI must label practice tiers (${label})`);
assert.ok(/No calculator/i.test(appSource),'UI must show the no-calculator benchmark instruction');
const swSource=readFileSync(join(ROOT,'sw.js'),'utf8');
assert.ok(swSource.includes('practice-timer.mjs'),'Service worker must cache practice-timer.mjs');

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

console.log('PASS: 20 topics; 2,000 base questions; 1,000 daily benchmark sets; exact 3/4/3 tiers; NC contexts; KCC; 80%+exit gating; mastery bounds; UI wired to canonical benchmark; active practice timer day/idle/pause rules');
