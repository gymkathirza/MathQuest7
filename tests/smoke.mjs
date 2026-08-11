import assert from 'node:assert/strict';
import {TOPICS,PASS_MASTERY,MIN_MASTERY_ATTEMPTS,generateProblem,topicUnlocked,canTakeExit,updateMastery} from '../curriculum.mjs';
assert.equal(TOPICS.length,20,'Expected 20 daily topics');
assert.equal(PASS_MASTERY,80);
assert.ok(TOPICS.some(t=>t.id==='ns_sub'&&t.teach.includes('KCC')),'KCC lesson missing');
for(const t of TOPICS){for(let i=0;i<100;i++){const p=generateProblem(t.id);assert.ok(p.q&&String(p.q).length>3,`Bad question ${t.id}`);assert.ok(p.a!==undefined&&p.a!==null&&String(p.a).length>0,`Bad answer ${t.id}`);assert.equal(p.choices.length,4,`Need four choices ${t.id}`);assert.ok(p.choices.includes(String(p.a)),`Correct answer absent from choices ${t.id}`)}}
let state={mastery:{},cleared:{},attempts:{}};for(const t of TOPICS){state.mastery[t.id]=0;state.cleared[t.id]=false;state.attempts[t.id]={n:0,c:0}}
assert.equal(topicUnlocked(state,0),true);assert.equal(topicUnlocked(state,1),false);state.mastery[TOPICS[0].id]=80;assert.equal(topicUnlocked(state,1),false,'Exit clearance must be required');state.cleared[TOPICS[0].id]=true;assert.equal(topicUnlocked(state,1),true);
const id=TOPICS[0].id;state.mastery[id]=84;state.attempts[id]={n:4,c:4};assert.equal(canTakeExit(state,id,0),false,'Minimum evidence threshold should apply');state.attempts[id].n=5;assert.equal(canTakeExit(state,id,0),true);assert.equal(canTakeExit(state,id,10),false);state.attempts[id].n=10;assert.equal(canTakeExit(state,id,10),true);
let m=0;for(let i=0;i<7;i++)m=updateMastery(m,true);assert.ok(m>=80);m=updateMastery(m,false);assert.ok(m<100&&m>=0);
console.log('PASS: 20 topics, 2,000 generated questions, KCC, 80%+exit gating, parent practice threshold, mastery bounds');
