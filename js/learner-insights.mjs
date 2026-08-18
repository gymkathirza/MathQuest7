import {TOPICS,PASS_MASTERY,WEEKS} from './curriculum.mjs';

/** Known NC.7 / UCPS coverage gaps relative to the 20-day Summer Quest spine (intro depth). */
export const SYLLABUS_GAPS=Object.freeze([
  {domain:'NC.7.NS',missing:'Fraction multiplication/division; unlike-denominator ops; terminating vs repeating decimals; formal absolute-value distance'},
  {domain:'NC.7.RP',missing:'Unit rates with fractional quantities; tables/graphs of y=kx; tax/tip/interest and percent increase/decrease (beyond discount amount)'},
  {domain:'NC.7.EE',missing:'Factoring linear expressions; multi-step problems with rational coefficients; graphing inequality solution sets; heavier p(x+q)=r modeling'},
  {domain:'NC.7.G',missing:'Constructing triangles from conditions; 3D cross-sections; surface area & volume of prisms/composites; deeper triangle angle relationships'},
  {domain:'NC.7.SP',missing:'MAD/IQR/range variability; comparing two populations; compound probability (lists/trees); theoretical vs experimental probability'}
]);

export const FOCUS_MODES=Object.freeze(['auto','blend','manual']);
const MIN_PRACTICE_FOR_INSIGHT=2;

function accuracy(attempts){
  const n=Number(attempts?.n||0),c=Number(attempts?.c||0);
  return n?c/n:null;
}

function missCount(errorLog,topicId){
  return (errorLog||[]).filter(e=>e.topic===topicId).length;
}

function topicScore(state,topic){
  const m=Number(state.mastery?.[topic.id]||0);
  const a=state.attempts?.[topic.id]||{n:0,c:0};
  const acc=accuracy(a);
  const misses=missCount(state.errorLog,topic.id);
  const cleared=state.cleared?.[topic.id]===true&&m>=PASS_MASTERY;
  const practiced=a.n>0||misses>0||m>0;
  const accPenalty=acc==null?0:(1-acc)*50;
  const missPenalty=Math.min(40,misses*4);
  const clearBonus=cleared?10:0;
  const strengthScore=m+(acc==null?0:acc*30)+clearBonus-missPenalty*0.25;
  const weakness=Math.max(0,100-m)+accPenalty+missPenalty+(cleared?0:12);
  return{topic,mastery:m,attempts:a.n,correct:a.c,accuracy:acc,misses,cleared,practiced,strengthScore,weakness};
}

function isStrongRow(row){
  if(!row.practiced||row.attempts<MIN_PRACTICE_FOR_INSIGHT)return false;
  if(row.cleared&&row.mastery>=PASS_MASTERY&&(row.accuracy==null||row.accuracy>=0.7))return true;
  return row.mastery>=72&&(row.accuracy==null||row.accuracy>=0.7)&&row.misses<=2;
}

function isWeakRow(row){
  if(!row.practiced||row.attempts<1)return false;
  if(row.misses>=2)return true;
  if(row.accuracy!=null&&row.accuracy<0.7)return true;
  if(row.mastery>0&&row.mastery<PASS_MASTERY)return true;
  return row.attempts>=MIN_PRACTICE_FOR_INSIGHT&&row.mastery<60;
}

/** Build strengths, improvements, and a coaching plan from local progress. */
export function analyzeLearner(state,{strengthCount=3,improveCount=4}={}){
  const rows=TOPICS.map(t=>topicScore(state,t));
  const practiced=rows.filter(r=>r.practiced);
  const strengthCandidates=practiced.filter(isStrongRow).sort((a,b)=>b.strengthScore-a.strengthScore||b.mastery-a.mastery);
  const strengths=strengthCandidates.slice(0,strengthCount);
  const strengthIds=new Set(strengths.map(r=>r.topic.id));
  const improvementCandidates=practiced.filter(r=>isWeakRow(r)&&!strengthIds.has(r.topic.id)).sort((a,b)=>b.weakness-a.weakness||a.mastery-b.mastery);
  // If nothing qualifies as weak but practice exists, surface lowest strengthScore practiced rows not already strengths.
  const improvements=(improvementCandidates.length?improvementCandidates:practiced.filter(r=>!strengthIds.has(r.topic.id)).sort((a,b)=>b.weakness-a.weakness)).slice(0,improveCount);

  const plan=[];
  for(const row of improvements){
    const day=TOPICS.indexOf(row.topic)+1;
    const accPct=row.accuracy==null?'no accuracy yet':`${Math.round(row.accuracy*100)}% accuracy`;
    plan.push({
      topicId:row.topic.id,
      day,
      title:row.topic.title,
      action:row.cleared
        ?`Run mastery replay on Day ${day} (${row.topic.title}) — emphasize multi-step + NC word items (${accPct}, ${row.misses} logged misses).`
        :`Practice Day ${day} (${row.topic.title}) to ≥${PASS_MASTERY}% mastery and pass the Exit Ticket. Now ${row.mastery}% · ${accPct} · ${row.misses} misses.`
    });
  }
  if(!practiced.length){
    plan.push({topicId:null,day:null,title:'Get started',action:'Start today’s lesson. Strengths, improvements, and fine-tuning focus appear after real practice and mistakes.'});
  }else if(!improvements.length){
    plan.push({topicId:null,day:null,title:'Keep sharpening',action:'Nice work — no major weak spots yet. Use mastery replay or Open-Ended Mastery to keep skills sharp.'});
  }

  const autoFocusIds=improvements.map(r=>r.topic.id);
  return{strengths,improvements,plan,autoFocusIds,rows,practicedCount:practiced.length};
}

/** Resolve which topics open-ended / focused practice should emphasize. */
export function resolveFocusTopicIds(state,insights=analyzeLearner(state)){
  const mode=FOCUS_MODES.includes(state.settings?.focusMode)?state.settings.focusMode:'blend';
  const manual=(state.settings?.focusTopicIds||[]).filter(id=>TOPICS.some(t=>t.id===id));
  const auto=insights.autoFocusIds||[];
  if(mode==='manual')return manual.length? [...new Set(manual)] : (auto.length?auto:TOPICS.map(t=>t.id));
  if(mode==='auto')return auto.length?auto:TOPICS.map(t=>t.id);
  const blended=[...manual,...auto,...TOPICS.map(t=>t.id)];
  return[...new Set(blended)].filter(id=>TOPICS.some(t=>t.id===id));
}

export function focusModeLabel(mode){
  if(mode==='manual')return'Parent-selected topics only';
  if(mode==='auto')return'Automated from learner strengths/improvements';
  return'Blend parent pins + automated improvement focus';
}

export function weekStandardForTopic(topic){
  const w=WEEKS.find(x=>x.week===topic.week);
  return w?w.standard:'NC.7';
}

export function formatInsightChip(row){
  const day=TOPICS.indexOf(row.topic)+1;
  const acc=row.accuracy==null?'—':`${Math.round(row.accuracy*100)}%`;
  return{day,id:row.topic.id,icon:row.topic.icon,title:row.topic.title,mastery:row.mastery,accuracy:acc,misses:row.misses,standard:weekStandardForTopic(row.topic),attempts:row.attempts};
}
