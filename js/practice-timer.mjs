/** Active daily practice-time helpers (wall-clock gaps, idle, and breaks do not count). */
export const IDLE_PAUSE_MS=5*60*1000;
export const BREAK_EVERY_MIN=20;

export function todayKey(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return`${y}-${m}-${day}`;
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
