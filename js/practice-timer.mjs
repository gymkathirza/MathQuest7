/** Active daily practice-time helpers (wall-clock gaps, idle, and breaks do not count). */
export const IDLE_PAUSE_MS=5*60*1000;
export const BREAK_EVERY_MIN=20;
export const MASTERY_DAY_BASE=21;

export function todayKey(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return`${y}-${m}-${day}`;
}

export function yesterdayKey(d=new Date()){
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1);
  return todayKey(x);
}

/**
 * Reset practice counters when the calendar day changes.
 * Returns true when the day rolled over (caller should restart any open active segment).
 */
export function ensurePracticeDay(state,now=Date.now()){
  const key=todayKey(new Date(now));
  let rolled=false;
  if(state.sessionDate!==key){
    state.sessionDate=key;
    state.practiceMs=0;
    state.nextBreakMin=BREAK_EVERY_MIN;
    rolled=true;
  }
  if(state.practiceMs==null||!Number.isFinite(state.practiceMs)||state.practiceMs<0)state.practiceMs=0;
  if(state.nextBreakMin==null||!Number.isFinite(state.nextBreakMin))state.nextBreakMin=BREAK_EVERY_MIN;
  if(!state.masteryPracticeByDay||typeof state.masteryPracticeByDay!=='object')state.masteryPracticeByDay={};
  if(state.masterySessionMs==null||!Number.isFinite(state.masterySessionMs)||state.masterySessionMs<0)state.masterySessionMs=0;
  return rolled;
}

export function activeElapsedMs(practiceMs,runningSince,now=Date.now()){
  const base=Math.max(0,Number(practiceMs)||0);
  if(runningSince==null)return base;
  return base+Math.max(0,now-runningSince);
}

export function elapsedPracticeMin(practiceMs,runningSince,now=Date.now()){
  return Math.floor(activeElapsedMs(practiceMs,runningSince,now)/60000);
}

export function shouldIdlePause(lastActiveAt,now=Date.now(),idleMs=IDLE_PAUSE_MS){
  if(lastActiveAt==null)return false;
  return now-lastActiveAt>=idleMs;
}

/** Flush an open active segment into practiceMs. Returns the new runningSince (null when paused). */
export function pauseSegment(state,runningSince,now=Date.now()){
  if(runningSince!=null){
    state.practiceMs=activeElapsedMs(state.practiceMs,runningSince,now);
    return null;
  }
  return runningSince;
}

export function canResumePractice({onBreak=false,hidden=false,idle=false}={}){
  return!onBreak&&!hidden&&!idle;
}

/** Reset the open-ended mastery visit stopwatch (daily totals in masteryPracticeByDay are kept). */
export function resetMasterySession(state){
  state.masterySessionMs=0;
}

/**
 * Flush an open mastery segment into today's daily log and the visit stopwatch.
 * Returns null (paused). Does not count breaks / away time.
 */
export function flushMasterySegment(state,masteryRunningSince,now=Date.now()){
  if(masteryRunningSince==null)return null;
  const delta=Math.max(0,now-masteryRunningSince);
  const key=todayKey(new Date(now));
  if(!state.masteryPracticeByDay||typeof state.masteryPracticeByDay!=='object')state.masteryPracticeByDay={};
  state.masteryPracticeByDay[key]=(Number(state.masteryPracticeByDay[key])||0)+delta;
  state.masterySessionMs=(Number(state.masterySessionMs)||0)+delta;
  return null;
}

export function masterySessionElapsedMs(state,masteryRunningSince,now=Date.now()){
  return activeElapsedMs(state.masterySessionMs||0,masteryRunningSince,now);
}

export function masteryDayTotalMs(state,dateKey,masteryRunningSince=null,now=Date.now()){
  const base=Number(state.masteryPracticeByDay?.[dateKey])||0;
  const today=todayKey(new Date(now));
  if(dateKey===today&&masteryRunningSince!=null)return base+Math.max(0,now-masteryRunningSince);
  return base;
}

export function formatPracticeDuration(ms){
  const totalMin=Math.floor(Math.max(0,Number(ms)||0)/60000);
  const h=Math.floor(totalMin/60);
  const m=totalMin%60;
  if(h<=0)return`${m} min`;
  if(m===0)return`${h} hr`;
  return`${h} hr ${m} min`;
}

/** Chronological open-ended mastery days with practice, labeled Day 21+ */
export function masteryLogRows(state,masteryRunningSince=null,now=Date.now()){
  const log={...(state.masteryPracticeByDay||{})};
  const today=todayKey(new Date(now));
  const todayMs=masteryDayTotalMs(state,today,masteryRunningSince,now);
  if(todayMs>0)log[today]=todayMs;
  return Object.keys(log).filter(k=>(Number(log[k])||0)>0).sort().map((date,i)=>{
    const ms=date===today?todayMs:(Number(log[date])||0);
    return{date,dayLabel:`Day ${MASTERY_DAY_BASE+i}`,ms,label:formatPracticeDuration(ms)};
  });
}
