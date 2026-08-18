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
  // Lower is weaker: weigh mastery, accuracy, and recent miss volume.
  const accPenalty=acc==null?25:(1-acc)*40;
  const missPenalty=Math.min(30,misses*3);
  const clearBonus=cleared?8:0;
  return{topic,mastery:m,attempts:a.n,correct:a.c,accuracy:acc,misses,cleared,weakness:Math.max(0,100-m)+accPenalty+missPenalty-clearBonus};
}

/** Build strengths, improvements, and a coaching plan from local progress. */
export function analyzeLearner(state,{strengthCount=3,improveCount=4}={}){
  const rows=TOPICS.map(t=>topicScore(state,t));
  const practiced=rows.filter(r=>r.attempts>0||r.mastery>0||r.misses>0);
  const pool=practiced.length?practiced:rows;
  const strengths=[...pool].sort((a,b)=>b.mastery-a.mastery||(b.accuracy??0)-(a.accuracy??0)||a.weakness-b.weakness).slice(0,strengthCount);
  const improvements=[...pool].sort((a,b)=>b.weakness-a.weakness||a.mastery-b.mastery).slice(0,improveCount);
  const plan=[];
  for(const row of improvements){
    const day=TOPICS.indexOf(row.topic)+1;
    const accPct=row.accuracy==null?'no accuracy yet':`${Math.round(row.accuracy*100)}% accuracy`;
    plan.push({
      topicId:row.topic.id,
      day,
      title:row.topic.title,
      action:row.cleared
        ?`Run a mastery replay on Day ${day} (${row.topic.title}) — focus on the multi-step and NC word items until accuracy rises (${accPct}, ${row.misses} logged misses).`
        :`Return to Day ${day} (${row.topic.title}): finish guided/practice to ≥${PASS_MASTERY}% mastery, then pass the Exit Ticket. Current mastery ${row.mastery}% · ${accPct}.`
    });
  }
  if(!improvements.length){
    plan.push({topicId:null,day:null,title:'Keep exploring',action:'Start today’s lesson and build enough attempts for personalized coaching.'});
  }
  const autoFocusIds=improvements.map(r=>r.topic.id);
  return{strengths,improvements,plan,autoFocusIds,rows};
}

/** Resolve which topics open-ended / focused practice should emphasize. */
export function resolveFocusTopicIds(state,insights=analyzeLearner(state)){
  const mode=FOCUS_MODES.includes(state.settings?.focusMode)?state.settings.focusMode:'blend';
  const manual=(state.settings?.focusTopicIds||[]).filter(id=>TOPICS.some(t=>t.id===id));
  const auto=insights.autoFocusIds||[];
  if(mode==='manual'&&manual.length)return[...new Set(manual)];
  if(mode==='auto')return auto.length?auto:TOPICS.map(t=>t.id);
  // blend: parent pins first, then auto improvements, then remaining spine
  const blended=[...manual,...auto, ...TOPICS.map(t=>t.id)];
  return[...new Set(blended)].filter(id=>TOPICS.some(t=>t.id===id));
}

export function focusModeLabel(mode){
  if(mode==='manual')return'Parent-selected topics only';
  if(mode==='auto')return'Automated from strengths/improvements';
  return'Blend parent pins + automated improvement focus';
}

export function weekStandardForTopic(topic){
  const w=WEEKS.find(x=>x.week===topic.week);
  return w?w.standard:'NC.7';
}

export function formatInsightChip(row){
  const day=TOPICS.indexOf(row.topic)+1;
  const acc=row.accuracy==null?'—':`${Math.round(row.accuracy*100)}%`;
  return{day,id:row.topic.id,icon:row.topic.icon,title:row.topic.title,mastery:row.mastery,accuracy:acc,misses:row.misses,standard:weekStandardForTopic(row.topic)};
}
