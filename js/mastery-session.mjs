import {TOPICS,PASS_MASTERY} from './curriculum.mjs';
import {generateTieredProblem,CORE_DAILY_COUNT,NC_LOCATIONS} from './daily-session.mjs';

/** Advanced mastery mix: fewer basics, more multi-step + NC context (still 10). */
export const MASTERY_LEVEL_COUNTS=Object.freeze({standard:2,complex:4,word:4});
export const OPEN_ENDED_ID='open_mastery';
export const OPEN_ENDED_TITLE='Open-Ended Mastery Quest';
export const OPEN_ENDED_ICON='♾️';

export function allTopicsCleared(state){
  return TOPICS.every(t=>state.cleared?.[t.id]===true&&Number(state.mastery?.[t.id]||0)>=PASS_MASTERY);
}

export function openEndedUnlocked(state){return allTopicsCleared(state)}

function topicPool(topicIds){
  const ids=(topicIds&&topicIds.length)?topicIds:TOPICS.map(t=>t.id);
  return ids.filter(id=>TOPICS.some(t=>t.id===id));
}

/** 10-question advanced set for one cleared day (UCPS/NC Grade 7 domain retained). */
export function generateMasteryBenchmark(topicId){
  const questions=[];
  for(let i=0;i<MASTERY_LEVEL_COUNTS.standard;i++)questions.push(generateTieredProblem(topicId,'standard'));
  for(let i=0;i<MASTERY_LEVEL_COUNTS.complex;i++)questions.push(generateTieredProblem(topicId,'complex'));
  for(let i=0;i<MASTERY_LEVEL_COUNTS.word;i++)questions.push(generateTieredProblem(topicId,'word'));
  return questions.map((q,i)=>({...q,number:i+1,topicId}));
}

/**
 * Mixed open-ended set spanning all (or provided) days.
 * Rotates topics so practice composes the full 20-day spine without feeling repetitive.
 */
export function generateOpenEndedBenchmark(topicIds=TOPICS.map(t=>t.id)){
  const pool=topicPool(topicIds);
  if(!pool.length)throw new Error('No topics available for open-ended practice');
  const order=[];
  const levels=[
    ...Array(MASTERY_LEVEL_COUNTS.standard).fill('standard'),
    ...Array(MASTERY_LEVEL_COUNTS.complex).fill('complex'),
    ...Array(MASTERY_LEVEL_COUNTS.word).fill('word')
  ];
  let cursor=Math.floor(Math.random()*pool.length);
  for(let i=0;i<CORE_DAILY_COUNT;i++){
    const topicId=pool[(cursor+i)%pool.length];
    const level=levels[i];
    order.push({...generateTieredProblem(topicId,level),number:i+1,topicId});
  }
  return order.sort(()=>Math.random()-.5).map((q,i)=>({...q,number:i+1}));
}

export function openEndedRecapHtml(){
  const byWeek={};
  for(const t of TOPICS){(byWeek[t.week]=byWeek[t.week]||[]).push(t)}
  const weeks=Object.keys(byWeek).sort((a,b)=>a-b).map(w=>{
    const items=byWeek[w].map(t=>`<li>${t.icon} <b>Day ${TOPICS.indexOf(t)+1}:</b> ${t.title}</li>`).join('');
    const std=w==='1'?'NC.7.NS':w==='2'?'NC.7.RP':w==='3'?'NC.7.EE':'NC.7.G / NC.7.SP';
    return `<div class="weekBlock"><h3>Week ${w} · ${std}</h3><ul class="recapList">${items}</ul></div>`;
  }).join('');
  return `<h2>${OPEN_ENDED_ICON} ${OPEN_ENDED_TITLE}</h2>
<p class="concept">You finished the 20-day Summer Quest spine. This open-ended quest keeps Union County / NC Grade 7 skills sharp with mixed, more advanced practice across every day you learned.</p>
<p class="small">Expect more multi-step and NC real-world items (Monroe, Waxhaw, Indian Trail, Charlotte, and more). There is no final “unlock” gate — keep practicing as long as you like.</p>
${weeks}`;
}

export {NC_LOCATIONS,CORE_DAILY_COUNT};
