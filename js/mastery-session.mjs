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
 * Mixed open-ended set. Prefer focusTopicIds (improvements / parent pins); fill from full spine.
 * About 70% of items come from the focus pool when it is non-empty.
 * Always spans at least min(5, pool size) distinct days when the available pool allows
 * (avoids unlucky with-replacement draws collapsing to too few topics).
 */
export function generateOpenEndedBenchmark(topicIds=TOPICS.map(t=>t.id),{focusTopicIds=null,focusShare=0.7}={}){
  const all=topicPool(topicIds);
  const focus=topicPool(focusTopicIds&&focusTopicIds.length?focusTopicIds:all);
  if(!all.length)throw new Error('No topics available for open-ended practice');
  const levels=[
    ...Array(MASTERY_LEVEL_COUNTS.standard).fill('standard'),
    ...Array(MASTERY_LEVEL_COUNTS.complex).fill('complex'),
    ...Array(MASTERY_LEVEL_COUNTS.word).fill('word')
  ];
  const focusSlots=Math.max(1,Math.round(CORE_DAILY_COUNT*focusShare));
  const order=[];
  for(let i=0;i<CORE_DAILY_COUNT;i++){
    const pool=i<focusSlots?focus:(all.length?all:focus);
    const topicId=pool[Math.floor(Math.random()*pool.length)];
    order.push({...generateTieredProblem(topicId,levels[i]),number:i+1,topicId,focused:focus.includes(topicId)});
  }
  return diversifyOpenEndedTopics(order,all,focus).sort(()=>Math.random()-.5).map((q,i)=>({...q,number:i+1}));
}

/** Ensure open-ended sets cover enough distinct days when the topic pool is wide. */
function diversifyOpenEndedTopics(order,all,focus){
  const minSpan=Math.min(5,all.length,order.length);
  const counts=new Map();
  for(const q of order)counts.set(q.topicId,(counts.get(q.topicId)||0)+1);
  if(counts.size>=minSpan)return order;
  const unused=all.filter(id=>!counts.has(id));
  const out=order.slice();
  for(let i=0;i<out.length&&counts.size<minSpan&&unused.length;i++){
    const cur=out[i].topicId;
    if((counts.get(cur)||0)<=1)continue;
    const neu=unused.pop();
    counts.set(cur,counts.get(cur)-1);
    counts.set(neu,1);
    out[i]={...generateTieredProblem(neu,out[i].level||'standard'),number:out[i].number,topicId:neu,focused:focus.includes(neu)};
  }
  return out;
}

export function openEndedRecapHtml({focusTitles=[],planLines=[],modeLabel=''}={}){
  const byWeek={};
  for(const t of TOPICS){(byWeek[t.week]=byWeek[t.week]||[]).push(t)}
  const weeks=Object.keys(byWeek).sort((a,b)=>a-b).map(w=>{
    const items=byWeek[w].map(t=>`<li>${t.icon} <b>Day ${TOPICS.indexOf(t)+1}:</b> ${t.title}</li>`).join('');
    const std=w==='1'?'NC.7.NS':w==='2'?'NC.7.RP':w==='3'?'NC.7.EE':'NC.7.G / NC.7.SP';
    return `<div class="weekBlock"><h3>Week ${w} · ${std}</h3><ul class="recapList">${items}</ul></div>`;
  }).join('');
  const focusBlock=focusTitles.length
    ?`<p class="concept"><b>Today’s fine-tuning focus:</b> ${focusTitles.map(escText).join(' · ')}</p><p class="small">${escText(modeLabel||'Focused from your improvement plan.')}</p>`
    :`<p class="small">Practice will mix all 20 days until there is enough history for a personalized focus.</p>`;
  const planBlock=planLines.length
    ?`<h3>Improvement plan</h3><ul class="recapList">${planLines.map(l=>`<li>${escText(l)}</li>`).join('')}</ul>`
    :'';
  return `<h2>${OPEN_ENDED_ICON} ${OPEN_ENDED_TITLE}</h2>
<p class="concept">You finished the 20-day Summer Quest spine. This open-ended quest keeps Union County / NC Grade 7 skills sharp with mixed, more advanced practice — weighted toward areas that need fine-tuning.</p>
${focusBlock}${planBlock}
<p class="small">Expect more multi-step and NC real-world items. There is no final unlock gate — keep practicing as long as you like.</p>
${weeks}`;
}

function escText(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}


export {NC_LOCATIONS,CORE_DAILY_COUNT};
