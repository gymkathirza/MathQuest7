import {TOPICS,WEEKS,PASS_MASTERY,MIN_MASTERY_ATTEMPTS,generateProblem,topicUnlocked,canTakeExit,updateMastery} from './curriculum.mjs';
import {generateDailyBenchmark,CORE_DAILY_COUNT} from './daily-session.mjs';
import {BREAK_EVERY_MIN,IDLE_PAUSE_MS,ensurePracticeDay,elapsedPracticeMin,shouldIdlePause,pauseSegment,canResumePractice} from './practice-timer.mjs';
import {generateMasteryBenchmark,generateOpenEndedBenchmark,openEndedRecapHtml,openEndedUnlocked,allTopicsCleared,OPEN_ENDED_ID,OPEN_ENDED_TITLE,OPEN_ENDED_ICON,MASTERY_LEVEL_COUNTS} from './mastery-session.mjs';
import {analyzeLearner,resolveFocusTopicIds,focusModeLabel,formatInsightChip,SYLLABUS_GAPS,FOCUS_MODES} from './learner-insights.mjs';
const $=id=>document.getElementById(id);const PHASES=['warmup','learn','guided','practice','review','exit'];
const LEVEL_META={standard:{tag:'Level 1 · Standard Practice',emoji:'🟢'},complex:{tag:'Level 2 · Multi-Step Challenge',emoji:'🟡'},word:{tag:'Level 3 · NC Real-World Word Problem',emoji:'🔴'}};
function defaultSettings(){return{practiceTarget:10,masteryReplayTarget:20,focusMode:'blend',focusTopicIds:[]}}
function defaultState(){return{xp:0,total:0,correct:0,streak:0,best:0,mastery:{},attempts:{},cleared:{},day:0,settings:defaultSettings(),errorLog:[],practiceMs:0,sessionDate:null,nextBreakMin:BREAK_EVERY_MIN}}
let S=loadState(),current=0,sessionMode='learn',q=null,exit={left:0,correct:0},bench=null,timer=null,onBreak=false,breakTimer=null,toastTimer=null,runningSince=null,lastActiveAt=Date.now(),sessionPracticeStart=0;
function loadState(){let parsed;try{parsed=JSON.parse(localStorage.mq7summer||'null')}catch{}const s=parsed||defaultState();s.mastery=s.mastery||{};s.attempts=s.attempts||{};s.cleared=s.cleared||{};s.settings={...defaultSettings(),...(s.settings||{})};if(s.settings.masteryReplayTarget==null)s.settings.masteryReplayTarget=20;if(!FOCUS_MODES.includes(s.settings.focusMode))s.settings.focusMode='blend';if(!Array.isArray(s.settings.focusTopicIds))s.settings.focusTopicIds=[];s.errorLog=s.errorLog||[];delete s.sessionStart;ensurePracticeDay(s);for(const t of TOPICS){if(s.mastery[t.id]==null)s.mastery[t.id]=0;if(!s.attempts[t.id])s.attempts[t.id]={n:0,c:0};if(s.cleared[t.id]==null)s.cleared[t.id]=false}if(s.mastery[OPEN_ENDED_ID]==null)s.mastery[OPEN_ENDED_ID]=0;if(!s.attempts[OPEN_ENDED_ID])s.attempts[OPEN_ENDED_ID]={n:0,c:0};return s}
function save(){syncPracticeDay();localStorage.mq7summer=JSON.stringify(S);renderTop();refreshInsightPanels()}
function renderTop(){$('xp').textContent=S.xp;$('streak').textContent=S.streak}
function onHome(){return!$('home').classList.contains('hidden')}
function onParentDashboard(){return!$('parent').classList.contains('hidden')&&!$('dashboard').classList.contains('hidden')}
function refreshInsightPanels(){if(onHome())renderStudentCoach();if(onParentDashboard())renderDashboard()}
function go(id){for(const x of ['home','learn','parent'])$(x).classList.toggle('hidden',x!==id);if(id==='home')renderMap();if(id==='parent')pausePractice();else{noteActivity();resumePractice()}}
function syncPracticeDay(){if(ensurePracticeDay(S)){runningSince=runningSince!=null?Date.now():null}}
async function loadVersion(){try{const r=await fetch(new URL('../version.json?ts='+Date.now(),import.meta.url),{cache:'no-store'}),d=await r.json();$('versionBadge').textContent='v'+d.version}catch{$('versionBadge').textContent='v0.15.1'}}
function currentInsights(){return analyzeLearner(S)}
function activeTopicId(){return sessionMode==='open'?OPEN_ENDED_ID:TOPICS[current].id}
function practiceGoal(){return sessionMode==='learn'?S.settings.practiceTarget:S.settings.masteryReplayTarget}
function goalLabel(n){return n===0?'∞':String(n)}
function renderStudentCoach(){
  const insights=currentInsights(),box=$('studentCoach');if(!box)return;
  if(!insights.practicedCount){
    box.innerHTML='<p class="small">No coaching data yet. Answer practice questions (including a few mistakes) and this panel will fill with live strengths, improvements, and a plan you can tap.</p><button class="btn" id="coachStart">▶ Start / Continue practice →</button>';
    const b=$('coachStart');if(b)b.onclick=()=>continueJourney();
    return;
  }
  const strengthChips=insights.strengths.map(formatInsightChip).map(c=>`<span class="chip">${c.icon} Day ${c.day}: ${esc(c.title)} · ${c.mastery}% · ${c.accuracy}</span>`).join('');
  const improveChips=insights.improvements.map(formatInsightChip).map(c=>`<span class="chip">${c.icon} Day ${c.day}: ${esc(c.title)} · ${c.mastery}% · ${c.misses} misses</span>`).join('');
  const plan=insights.plan.slice(0,4).map(p=>`<div class="coachItem"><b>${p.day?`Day ${p.day}: ${esc(p.title)}`:'Next step'}</b><span class="small">${esc(p.action)}</span>${p.day!=null&&topicUnlocked(S,p.day-1)?`<div style="margin-top:8px"><button class="btn" data-coach="${p.day-1}">Practice this day →</button></div>`:''}</div>`).join('');
  box.innerHTML=`<p class="small">Live from your attempts, mastery, and mistakes (${insights.practicedCount} day${insights.practicedCount===1?'':'s'} with practice evidence). Parent/Admin can pin fine-tuning days for Open-Ended Mastery.</p>
<p><b>Strengths</b></p><div class="chipRow">${strengthChips||'<span class="small">Keep practicing — strengths appear after solid accuracy on a day.</span>'}</div>
<p><b>Improvements</b></p><div class="chipRow">${improveChips||'<span class="small">No weak spots detected yet. Nice work!</span>'}</div>
${plan}
${openEndedUnlocked(S)?`<button class="btn" id="coachOpenEnded">${OPEN_ENDED_ICON} Open-Ended fine-tuning (uses this plan) →</button>`:''}`;
  box.querySelectorAll('[data-coach]').forEach(b=>b.onclick=()=>startLesson(Number(b.dataset.coach)));
  const oe=$('coachOpenEnded');if(oe)oe.onclick=()=>startOpenEnded();
}
function renderMap(){
  $('weeks').innerHTML=WEEKS.map(w=>`<div class="road"><b>Week ${w.week}: ${w.title}</b><small>${w.standard}</small><p>${w.desc}</p></div>`).join('');
  let html=TOPICS.map((t,i)=>{const u=topicUnlocked(S,i),done=S.cleared[t.id]&&S.mastery[t.id]>=PASS_MASTERY;const tip=!u?`🔒 Locked — reach ${PASS_MASTERY}% mastery and pass the Exit Ticket on Day ${i} to unlock this day`:done?`✓ Completed at ${S.mastery[t.id]}% mastery — click for advanced mastery replay`:i===S.day?`Today's lesson — click to continue`:`Click to start Day ${i+1}: ${t.title}`;return`<div class="day ${done?'done':''} ${i===S.day&&sessionMode!=='open'?'current':''} ${u?'clickable':'locked'}" data-i="${i}" data-tip="${esc(tip)}" ${u?'role="button" tabindex="0"':''}>${u?t.icon:'🔒'} Day ${i+1}<br><b>${t.title}</b><br>${S.mastery[t.id]}% ${done?'✓':''}</div>`}).join('');
  const openOn=openEndedUnlocked(S);
  html+=`<div class="day ${openOn?'done clickable':'locked'} ${sessionMode==='open'?'current':''}" data-open="1" data-tip="${openOn?'♾️ Open-ended mastery — fine-tune improvement areas with advanced mixed practice':'🔒 Clears after all 20 days are completed'}" ${openOn?'role="button" tabindex="0"':''}>${openOn?OPEN_ENDED_ICON:'🔒'} Beyond Day 20<br><b>${OPEN_ENDED_TITLE}</b><br>${openOn?`${S.attempts[OPEN_ENDED_ID].n} practiced`:'Complete 20 days'}</div>`;
  $('days').innerHTML=html;
  $('days').querySelectorAll('.day.clickable[data-i]').forEach(el=>{const i=Number(el.dataset.i);el.onclick=()=>startLesson(i);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();startLesson(i)}}});
  const openEl=$('days').querySelector('.day.clickable[data-open]');if(openEl){openEl.onclick=()=>startOpenEnded();openEl.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();startOpenEnded()}}}
  updateContinueLabel();
  renderStudentCoach();
}
function nextDayIndex(){const i=TOPICS.findIndex((t,j)=>topicUnlocked(S,j)&&!S.cleared[t.id]);return i<0?TOPICS.length-1:i}
function updateContinueLabel(){const allDone=allTopicsCleared(S);$('continueBtn').textContent=allDone?`▶ ${OPEN_ENDED_ICON} Open-Ended Mastery`:`▶ Start / Continue Today (Day ${nextDayIndex()+1})`}
function continueJourney(){if(allTopicsCleared(S))startOpenEnded();else startLesson(nextDayIndex())}
function beginLearnSurface(){save();go('learn');noteActivity();resumePractice();startClock()}
function startLesson(i){if(!topicUnlocked(S,i))return;current=i;S.day=i;const done=S.cleared[TOPICS[i].id]&&S.mastery[TOPICS[i].id]>=PASS_MASTERY;sessionMode=done?'replay':'learn';sessionPracticeStart=S.attempts[TOPICS[i].id].n;beginLearnSurface();if(done)showMasteryRecap();else showWarmup()}
function startOpenEnded(){if(!openEndedUnlocked(S))return;sessionMode='open';current=TOPICS.length-1;S.day=TOPICS.length-1;sessionPracticeStart=S.attempts[OPEN_ENDED_ID].n;beginLearnSurface();showOpenRecap()}
function elapsedMin(){syncPracticeDay();return Math.max(0,elapsedPracticeMin(S.practiceMs,runningSince))}
function onParentScreen(){return!$('parent').classList.contains('hidden')}
function pausePractice(){runningSince=pauseSegment(S,runningSince);save()}
function resumePractice(){syncPracticeDay();if(onParentScreen())return;const hidden=typeof document!=='undefined'&&document.visibilityState==='hidden';const idle=shouldIdlePause(lastActiveAt,Date.now(),IDLE_PAUSE_MS);if(!canResumePractice({onBreak,hidden,idle}))return;if(runningSince==null)runningSince=Date.now()}
function noteActivity(){lastActiveAt=Date.now();if(!onBreak&&!onParentScreen()&&typeof document!=='undefined'&&document.visibilityState!=='hidden')resumePractice()}
function startClock(){clearInterval(timer);const tick=()=>{syncPracticeDay();if(runningSince!=null&&shouldIdlePause(lastActiveAt,Date.now(),IDLE_PAUSE_MS))pausePractice();const m=elapsedMin();$('sessionClock').textContent=`⏱ ${m} min`;$('sessionClock').dataset.tip=`Cool, you have about ${m} minute${m===1?'':'s'} of active practice today..! The timer pauses on breaks, when the tab is hidden, or after 5 minutes away. Keep going — and take healthy screen breaks!`;if(!onBreak&&m>=S.nextBreakMin)triggerBreak(m)};tick();timer=setInterval(tick,1000)}
function showToast(msg,ms=9000){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.classList.add('hidden'),400)},ms)}
function triggerBreak(m){onBreak=true;pausePractice();showToast(`⏸️ Cool — you've practiced for about ${m} minutes! 👏 Time to stand up, stretch, hydrate, and rest your eyes (look ~20 ft away for 20 sec). Learning should be fun — let's take a healthy screen break!`,12000);openBreak(m)}
function openBreak(m){const ov=$('breakOverlay');ov.classList.remove('hidden');$('breakChoose').classList.remove('hidden');$('breakCountdown').classList.add('hidden');$('breakDone').classList.add('hidden');$('breakTitle').textContent='🧘 Time for a screen break!';$('breakMsg').textContent=`You've been practicing for about ${m} minutes — awesome focus! Screens are for learning, not for sitting too long. Pick a break length below. The screen will rest so you can move around, stretch, drink water, and look far away.`}
function startBreakCountdown(mins){const start=Date.now(),total=mins*60;$('breakChoose').classList.add('hidden');$('breakDone').classList.add('hidden');$('breakCountdown').classList.remove('hidden');$('breakTitle').textContent='🌟 Screen is resting — go be active!';const tips=['👀 20-20-20 rule: look about 20 feet away for 20 seconds.','🏃 Stand up and move around — stretch your arms and legs.','💧 Drink some water and blink a few times.','🌤️ Look out a window or step outside if you can.'];const render=()=>{const left=Math.max(0,total-Math.floor((Date.now()-start)/1000)),mm=Math.floor(left/60),ss=left%60;$('breakClock').textContent=`${mm}:${String(ss).padStart(2,'0')}`;$('breakTip').textContent=tips[Math.floor((Date.now()-start)/4000)%tips.length];if(left<=0){clearInterval(breakTimer);endBreak()}};render();breakTimer=setInterval(render,1000)}
function endBreak(){S.nextBreakMin+=BREAK_EVERY_MIN;onBreak=false;save();$('breakCountdown').classList.add('hidden');$('breakChoose').classList.add('hidden');$('breakDone').classList.remove('hidden');$('breakTitle').textContent='🎉 Welcome back!';$('breakMsg').textContent='Great job taking a healthy break. Your practice timer paused while you rested. Ready to keep learning?'}
function setPhase(p){
  for(const x of PHASES)$('p'+x[0].toUpperCase()+x.slice(1)).classList.toggle('on',x===p);
  if(sessionMode==='open'){$('topicName').textContent=`${OPEN_ENDED_ICON} ${OPEN_ENDED_TITLE}`;$('masteryPill').textContent=`${S.attempts[OPEN_ENDED_ID].n} mixed practices`}
  else{$('topicName').textContent=`${sessionMode==='replay'?'♻️ Mastery · ':''}Day ${current+1}: ${TOPICS[current].title}`;$('masteryPill').textContent=`${S.mastery[TOPICS[current].id]}% mastery`}
}
function button(label,fn,cls='btn'){const b=document.createElement('button');b.className=cls;b.textContent=label;b.onclick=fn;return b}
function showWarmup(){setPhase('warmup');$('feedback').innerHTML='';$('interaction').innerHTML='';if(current===0){$('lessonBody').innerHTML='<h2>🌞 Day 1 Warm-up</h2><p class="concept">No previous lesson yet. Today starts with the foundations.</p>';$('interaction').append(button('Begin today’s lesson →',showLearn));return}const prev=TOPICS[current-1],w=generateProblem(prev.id);$('lessonBody').innerHTML=`<h2>⚡ Quick Review</h2><p class="concept">Before today’s lesson, recall yesterday’s skill:</p><h3>${w.q}</h3>`;renderAnswers(w,a=>{$('feedback').innerHTML=a===w.a?`<div class="feedback good">✅ Nice recall. ${w.explain}</div>`:`<div class="feedback bad">💡 Review: ${w.explain}</div>`;$('feedback').append(button('Continue to today’s story →',showLearn))})}
function showLearn(){setPhase('learn');const t=TOPICS[current];$('feedback').innerHTML='';$('interaction').innerHTML='';$('lessonBody').innerHTML=`<p class="small">📖 STORY</p><h2>${t.story}</h2>${t.teach}`;$('interaction').append(button('I watched & understand — guided practice →',showGuided))}
function showGuided(){setPhase('guided');const g=TOPICS[current].guided;$('lessonBody').innerHTML=`<h2>🖐️ Guided Practice</h2><p class="concept">${g.prompt}</p><p class="small">Drag a tile into the target, or tap a tile on iPad.</p>`;$('feedback').innerHTML='';$('interaction').innerHTML=`<div class="tokens">${g.tokens.map(x=>`<div class="token" draggable="true" data-v="${esc(x)}">${x}</div>`).join('')}</div><div class="targets"><div id="dropTarget" class="target">DROP / TAP ANSWER</div></div>`;const check=v=>{if(v===g.answer){$('dropTarget').textContent=v;$('feedback').innerHTML=`<div class="feedback good">✨ Correct. ${g.explain}</div><div class="celebrate">⭐ ✅ 🎉</div>`;$('feedback').append(button('Start independent practice →',showPractice))}else{$('feedback').innerHTML=`<div class="feedback bad">🌱 Not yet. ${g.explain} Try again until you make it right.</div><div class="retry">🤔 ↩️ 💡</div>`}};document.querySelectorAll('.token').forEach(el=>{el.onclick=()=>check(el.dataset.v);el.ondragstart=e=>e.dataTransfer.setData('text',el.dataset.v)});$('dropTarget').ondragover=e=>e.preventDefault();$('dropTarget').ondrop=e=>{e.preventDefault();check(e.dataTransfer.getData('text'))}}
function showMasteryRecap(){setPhase('learn');const t=TOPICS[current],goal=practiceGoal();$('feedback').innerHTML='';$('interaction').innerHTML='';$('lessonBody').innerHTML=`<p class="small">♻️ MASTERY REPLAY · Union County / NC Grade 7 retention</p><h2>${t.icon} Day ${current+1} Recap: ${t.title}</h2><p class="concept">${t.story}</p>${t.teach}<p class="small">Parent/Admin mastery target for completed days: <b>${goalLabel(goal)}</b> questions this visit (advanced 2·4·4 mix). Keep skills sharp without redoing the unlock gate.</p>`;$('interaction').append(button('Start advanced mastery practice →',showPractice))}
function showOpenRecap(){
  setPhase('warmup');$('feedback').innerHTML='';$('interaction').innerHTML='';
  const insights=currentInsights(),focusIds=resolveFocusTopicIds(S,insights);
  const focusTitles=focusIds.slice(0,5).map(id=>{const i=TOPICS.findIndex(t=>t.id===id);return`Day ${i+1}: ${TOPICS[i].title}`});
  const planLines=insights.plan.slice(0,4).map(p=>p.action);
  $('lessonBody').innerHTML=openEndedRecapHtml({focusTitles,planLines,modeLabel:focusModeLabel(S.settings.focusMode)});
  $('interaction').append(button('Begin focused advanced practice →',showPractice));
}
function showPractice(){
  if(sessionMode==='open'){
    const insights=currentInsights(),focusIds=resolveFocusTopicIds(S,insights);
    bench={items:generateOpenEndedBenchmark(TOPICS.map(t=>t.id),{focusTopicIds:focusIds}),idx:0,correct:0,missed:[],kind:'open'};
  }else if(sessionMode==='replay')bench={items:generateMasteryBenchmark(TOPICS[current].id),idx:0,correct:0,missed:[],kind:'replay'};
  else bench={items:generateDailyBenchmark(TOPICS[current].id),idx:0,correct:0,missed:[],kind:'learn'};
  showBenchQuestion();
}
function benchTitle(){if(bench.kind==='open')return`${OPEN_ENDED_ICON} Open-Ended Mastery — Mixed 20-Day Challenge`;if(bench.kind==='replay')return`♻️ Advanced Mastery Replay — Day ${current+1}`;return`⚔️ Daily Benchmark — 10 Questions`}
function benchMixNote(){if(bench.kind==='learn')return`3 standard · 4 multi-step · 3 NC real-world • ✏️ No calculator`;return`${MASTERY_LEVEL_COUNTS.standard} standard · ${MASTERY_LEVEL_COUNTS.complex} multi-step · ${MASTERY_LEVEL_COUNTS.word} NC real-world (advanced retention mix) • ✏️ No calculator`}
function showBenchQuestion(){setPhase('practice');const id=activeTopicId();q=bench.items[bench.idx];const meta=LEVEL_META[q.level],target=goalLabel(practiceGoal());const topicHint=q.topicId?TOPICS.find(t=>t.id===q.topicId):null;$('lessonBody').innerHTML=`<h2>${benchTitle()}</h2><p class="small">${benchMixNote()}</p><p class="benchtag ${q.level}">${meta.emoji} ${meta.tag}</p><p class="small">Question ${bench.idx+1} of ${CORE_DAILY_COUNT} • Session practice ${S.attempts[id].n-sessionPracticeStart}/${target} • Lifetime ${S.attempts[id].n} • Mastery ${sessionMode==='open'?'mixed':S.mastery[id]+'%'}${topicHint?` • From Day ${TOPICS.indexOf(topicHint)+1}: ${esc(topicHint.title)}`:''}</p>${q.location?`<p class="small">📍 ${esc(q.location)}, NC scenario</p>`:''}<h3 class="qtext">${q.q}</h3>${q.strategy?`<p class="small">🧭 Strategy: ${esc(q.strategy)}</p>`:''}`;$('feedback').innerHTML='';renderAnswers(q,benchCheck)}
function renderAnswers(problem,onPick){$('interaction').innerHTML='<div class="answers"></div>';const box=$('interaction').firstChild;problem.choices.forEach(v=>box.append(button(v,()=>onPick(String(v)),'answer')))}
function creditAttempt(id,ok,problem){
  const a=S.attempts[id];a.n++;S.total++;
  if(ok){a.c++;S.correct++;S.streak++;S.best=Math.max(S.best,S.streak);S.xp+=20;bench.correct++;S.mastery[id]=updateMastery(S.mastery[id],true);if(problem.topicId&&problem.topicId!==id)S.mastery[problem.topicId]=updateMastery(S.mastery[problem.topicId],true);$('feedback').innerHTML=`<div class="feedback good">🎉 Correct! ${problem.explain} +20 XP</div><div class="celebrate">🌟 🎉 ✅</div>`}
  else{S.streak=0;S.mastery[id]=updateMastery(S.mastery[id],false);if(problem.topicId&&problem.topicId!==id)S.mastery[problem.topicId]=updateMastery(S.mastery[problem.topicId],false);const entry={topic:problem.topicId||id,when:new Date().toISOString(),question:problem.q,answer:problem.a,level:problem.level,explain:problem.explain};S.errorLog.push(entry);bench.missed.push({number:bench.idx+1,...entry});$('feedback').innerHTML=`<div class="feedback bad">💡 Not yet. Correct answer: ${esc(String(problem.a))}. ${problem.explain}</div><div class="retry">🧠 🔁</div><p><b>What tripped you up?</b></p><div class="errorOpts"><button data-e="Sign">Sign</button><button data-e="Operation">Operation</button><button data-e="Arithmetic">Arithmetic</button><button data-e="Not sure">Not sure</button></div>`;document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{S.errorLog[S.errorLog.length-1].reason=b.dataset.e;save();b.textContent='Saved ✓'})}
}
function benchCheck(v){const id=activeTopicId(),ok=String(v)===String(q.a);creditAttempt(id,ok,q);save();setPhase('practice');const last=bench.idx>=bench.items.length-1;$('feedback').append(button(last?'See error analysis →':'Next question →',()=>{if(last)benchSummary();else{bench.idx++;showBenchQuestion()}}))}
function sessionGoalMet(){const goal=practiceGoal(),gained=S.attempts[activeTopicId()].n-sessionPracticeStart;return goal===0||gained>=goal}
function insightSummaryHtml(insights){
  const weak=insights.improvements.slice(0,3).map(r=>`Day ${TOPICS.indexOf(r.topic)+1}: ${r.topic.title}`).join(' · ')||'none yet';
  const strong=insights.strengths.slice(0,3).map(r=>`Day ${TOPICS.indexOf(r.topic)+1}: ${r.topic.title}`).join(' · ')||'none yet';
  return`<div class="coachItem"><b>📈 Updated coaching snapshot</b><span class="small">Strengths: ${esc(strong)}<br>Improvements: ${esc(weak)}</span><div style="margin-top:8px"><button class="btn alt" id="seeCoachHome">View full coaching plan on home →</button></div></div>`;
}
function wireCoachHomeBtn(){const b=$('seeCoachHome');if(b)b.onclick=()=>go('home')}
function benchSummary(){
  setPhase('review');const id=activeTopicId();const insights=currentInsights();
  const analysis=bench.missed.length?`<h3>🔍 Error Analysis</h3>${bench.missed.map(m=>`<div class="miss"><b>Q${m.number} · ${LEVEL_META[m.level].tag}</b><br>${esc(m.question)}<br><span class="small">✅ Correct answer: ${esc(String(m.answer))} — ${esc(m.explain)}</span></div>`).join('')}`:`<div class="feedback good">🌟 Perfect set! All ${CORE_DAILY_COUNT} correct.</div>`;
  $('interaction').innerHTML='';$('feedback').innerHTML='';
  if(sessionMode==='learn'){
    const ready=canTakeExit(S,id,S.settings.practiceTarget);
    $('lessonBody').innerHTML=`<h2>🎯 Benchmark Complete</h2><p class="concept">You scored <b>${bench.correct}/${CORE_DAILY_COUNT}</b> on today's 3·4·3 benchmark. Mastery: ${S.mastery[id]}%.</p>${analysis}${insightSummaryHtml(insights)}`;
    wireCoachHomeBtn();
    if(ready){$('interaction').append(button('Go to Exit Ticket →',startExit));$('interaction').append(button('Another 10-question benchmark',showPractice,'btn alt'))}
    else{$('interaction').append(button('Start another 10-question benchmark →',showPractice));$('feedback').innerHTML=`<p class="small">Reach ${PASS_MASTERY}% mastery with at least ${MIN_MASTERY_ATTEMPTS} attempts to unlock the Exit Ticket. Review the strategy above and try a fresh benchmark set.</p>`}
    return;
  }
  const met=sessionGoalMet(),goal=goalLabel(practiceGoal());
  if(sessionMode==='replay'){
    $('lessonBody').innerHTML=`<h2>♻️ Mastery Replay Complete</h2><p class="concept">Score <b>${bench.correct}/${CORE_DAILY_COUNT}</b>. Lifetime practice on this day: ${S.attempts[id].n}. Parent mastery target this visit: ${goal}.</p>${analysis}${insightSummaryHtml(insights)}`;
    wireCoachHomeBtn();
    $('interaction').append(button(met?'Another advanced set (keep sharpening) →':'Continue toward mastery target →',showPractice));
    $('interaction').append(button('Return to roadmap / coaching plan →',()=>go('home'),'btn alt'));
    if(!met)$('feedback').innerHTML=`<p class="small">Parent/Admin set a mastery replay target of ${goal} questions this visit. Keep practicing to hit that retention goal.</p>`;
    return;
  }
  const focusIds=resolveFocusTopicIds(S,insights);
  const focusLabel=focusIds.slice(0,4).map(fid=>{const i=TOPICS.findIndex(t=>t.id===fid);return`Day ${i+1}`}).join(', ');
  $('lessonBody').innerHTML=`<h2>${OPEN_ENDED_ICON} Open-Ended Set Complete</h2><p class="concept">Score <b>${bench.correct}/${CORE_DAILY_COUNT}</b> across mixed NC.7 domains. Lifetime open-ended practices: ${S.attempts[OPEN_ENDED_ID].n}. Target this visit: ${goal}. Focus weighting: ${esc(focusLabel||'full spine')}.</p>${analysis}${insightSummaryHtml(insights)}`;
  wireCoachHomeBtn();
  $('interaction').append(button(met?'Another focused advanced set →':'Continue open-ended practice →',showPractice));
  $('interaction').append(button('Coaching plan / pick a day →',()=>go('home'),'btn alt'));
  if(!met)$('feedback').innerHTML=`<p class="small">Keep going to reach the Parent/Admin mastery target of ${goal} questions this visit — then practice as long as you like.</p>`;
}
function startExit(){setPhase('exit');exit={left:3,correct:0};nextExitQuestion()}
function nextExitQuestion(){if(exit.left<=0)return finishExit();q=generateProblem(TOPICS[current].id);$('lessonBody').innerHTML=`<div class="exit"><h2>🎫 Exit Ticket</h2><p>Question ${4-exit.left} of 3</p><p class="concept">${q.q}</p></div>`;$('feedback').innerHTML='';renderAnswers(q,v=>{const ok=String(v)===String(q.a);if(ok)exit.correct++;exit.left--;$('feedback').innerHTML=ok?`<div class="feedback good">✅ Correct. ${q.explain}</div>`:`<div class="feedback bad">💡 ${q.explain}</div>`;$('feedback').append(button(exit.left?'Next Exit Question →':'Finish Exit Ticket →',nextExitQuestion))})}
function finishExit(){const id=TOPICS[current].id,passed=exit.correct>=2&&S.mastery[id]>=PASS_MASTERY;if(passed){S.cleared[id]=true;S.xp+=50;save();setPhase('review');const allDone=allTopicsCleared(S);$('lessonBody').innerHTML=`<h2>🏆 Day ${current+1} Cleared!</h2><p class="concept">Exit Ticket: ${exit.correct}/3. Mastery: ${S.mastery[id]}%.</p><p>${allDone?`Amazing — all 20 days are complete! The ${OPEN_ENDED_TITLE} is now unlocked for mixed advanced practice forever.`:'You unlocked the next learning day. Older concepts will return in future warm-ups.'}</p><div class="celebrate">🏆 ⭐ 🎉</div>`;$('interaction').innerHTML='';$('feedback').innerHTML='';$('interaction').append(button(allDone?`Enter ${OPEN_ENDED_TITLE} →`:(current<TOPICS.length-1?'Return to roadmap →':'Enter Endless Mastery →'),()=>{if(allDone)startOpenEnded();else{noteActivity();resumePractice();save();go('home')}}));$('interaction').append(button('Extra practice on this skill',()=>{sessionMode='replay';sessionPracticeStart=S.attempts[id].n;showMasteryRecap()},'btn alt'))}else{$('lessonBody').innerHTML=`<h2>🔁 Review Loop</h2><p class="concept">Exit Ticket: ${exit.correct}/3. Mastery: ${S.mastery[id]}%.</p><p>You need at least 2 of 3 on the exit ticket and ${PASS_MASTERY}% mastery. We’ll loop back through practice instead of unlocking too soon.</p>`;$('interaction').innerHTML='';$('feedback').innerHTML='';$('interaction').append(button('Practice, then retry Exit Ticket →',showPractice))}}
function openParent(){go('parent');$('parentLock').classList.remove('hidden');$('dashboard').classList.add('hidden');$('pinMsg').textContent='';$('parentPin').value='';$('pinIntro').textContent=localStorage.mq7ParentPin?'Enter your 4-digit Parent / Admin PIN.':'Create a 4-digit Parent / Admin PIN for this device.';$('practiceTarget').value=String(S.settings.practiceTarget);$('masteryReplayTarget').value=String(S.settings.masteryReplayTarget);$('focusMode').value=S.settings.focusMode||'blend'}
function parentAuth(){const p=$('parentPin').value.trim();if(!/^\d{4}$/.test(p))return $('pinMsg').textContent='Use exactly 4 digits.';if(!localStorage.mq7ParentPin)localStorage.mq7ParentPin=p;if(p!==localStorage.mq7ParentPin)return $('pinMsg').textContent='Incorrect PIN.';$('parentLock').classList.add('hidden');$('dashboard').classList.remove('hidden');renderDashboard()}
function renderFocusPins(){
  const pins=new Set(S.settings.focusTopicIds||[]);
  $('focusPins').innerHTML=`<p class="small"><b>Pin days for fine-tuning</b> (used in blend/manual open-ended mode):</p>`+TOPICS.map((t,i)=>`<label><input type="checkbox" data-focus="${t.id}" ${pins.has(t.id)?'checked':''}> ${t.icon} Day ${i+1}: ${esc(t.title)}</label>`).join('');
  $('focusPins').querySelectorAll('[data-focus]').forEach(inp=>inp.onchange=()=>{const id=inp.dataset.focus;const set=new Set(S.settings.focusTopicIds||[]);if(inp.checked)set.add(id);else set.delete(id);S.settings.focusTopicIds=[...set];save();showToast(`Focus pins updated — Open-Ended Mastery will ${S.settings.focusMode==='auto'?'still use auto improvements (switch mode to blend/manual to prefer pins)':`prefer ${[...set].length} pinned day(s)`}.`,5000)});
}
function renderDashboard(){
  const acc=S.total?Math.round(S.correct/S.total*100):0,daysDone=TOPICS.filter(t=>S.cleared[t.id]&&S.mastery[t.id]>=PASS_MASTERY).length,pct=Math.round(daysDone/TOPICS.length*100),ni=nextDayIndex(),allDone=allTopicsCleared(S);
  const insights=currentInsights();
  $('dDays').textContent=`${daysDone} / ${TOPICS.length}`;$('dXp').textContent=S.xp;$('dSolved').textContent=S.total;$('dAcc').textContent=acc+'%';$('dBest').textContent=S.best;
  $('overallBar').style.width=pct+'%';
  $('overallCap').innerHTML=allDone?`<b>All ${TOPICS.length} days completed (${pct}%)</b> • Next: ${OPEN_ENDED_ICON} ${esc(OPEN_ENDED_TITLE)} (${S.attempts[OPEN_ENDED_ID].n} practices) · Focus: ${esc(focusModeLabel(S.settings.focusMode))}`:`<b>${daysDone} of ${TOPICS.length} days completed (${pct}%)</b> • Next up: Day ${ni+1} — ${esc(TOPICS[ni].title)}`;
  $('strengths').innerHTML=insights.strengths.length?insights.strengths.map(formatInsightChip).map(c=>`<div class="coachItem"><b>${c.icon} Day ${c.day}: ${esc(c.title)}</b><span class="small">${c.standard} · Mastery ${c.mastery}% · Accuracy ${c.accuracy} · ${c.attempts} attempts · ${c.misses} misses</span><button class="btn" data-goto="${c.day-1}">Review mastery →</button></div>`).join(''):'<p class="small">No strengths yet — need solid practice evidence (accuracy and mastery) on a day first.</p>';
  $('improvements').innerHTML=insights.improvements.length?insights.improvements.map(formatInsightChip).map(c=>`<div class="coachItem"><b>${c.icon} Day ${c.day}: ${esc(c.title)}</b><span class="small">${c.standard} · Mastery ${c.mastery}% · Accuracy ${c.accuracy} · ${c.attempts} attempts · ${c.misses} misses</span><button class="btn" data-goto="${c.day-1}">Practice improvement →</button></div>`).join(''):'<p class="small">No improvement targets yet. After the learner misses questions or stays below 80% mastery, targets appear here automatically.</p>';
  $('improvePlan').innerHTML=insights.plan.map(p=>`<div class="coachItem"><b>${p.day?`Day ${p.day}: ${esc(p.title)}`:'Plan'}</b><span class="small">${esc(p.action)}</span>${p.day!=null?`<button class="btn" data-goto="${p.day-1}">Open day →</button>`:openEndedUnlocked(S)?`<button class="btn" id="planOpenEnded">${OPEN_ENDED_ICON} Open-Ended fine-tuning →</button>`:''}</div>`).join('');
  const planOe=$('planOpenEnded');if(planOe)planOe.onclick=()=>startOpenEnded();
  $('masteryReview').innerHTML=TOPICS.map((t,i)=>{const u=topicUnlocked(S,i),done=S.cleared[t.id]&&S.mastery[t.id]>=PASS_MASTERY,a=S.attempts[t.id],accPct=a.n?Math.round(a.c/a.n*100):null;return`<div class="focusItem"><span class="skillName">${u?t.icon:'🔒'} Day ${i+1}: ${esc(t.title)}</span><span class="tag">${S.mastery[t.id]}%${done?' ✓':''}${accPct!=null?` · ${accPct}%`:''}</span>${u?`<button class="btn alt" data-goto="${i}">Review →</button>`:'<span class="small">Locked</span>'}</div>`}).join('');
  $('syllabusGaps').innerHTML=SYLLABUS_GAPS.map(g=>`<div class="gapItem"><b>${esc(g.domain)}</b><span class="small">${esc(g.missing)}</span></div>`).join('');
  const counts={},reasons={};for(const e of S.errorLog){counts[e.topic]=(counts[e.topic]||0)+1;if(e.reason)reasons[e.reason]=(reasons[e.reason]||0)+1}
  if(!S.errorLog.length){$('focus').innerHTML='<div class="feedback good">🌟 No mistakes logged yet — great start! Focus areas will appear here as the learner practices.</div>'}
  else{
    const top=Object.entries(counts).filter(([id])=>id!==OPEN_ENDED_ID).sort((a,b)=>b[1]-a[1]).slice(0,3),topReason=Object.entries(reasons).sort((a,b)=>b[1]-a[1])[0];
    const items=top.map(([id,n])=>{const idx=TOPICS.findIndex(x=>x.id===id),t=TOPICS[idx];if(!t)return'';return`<div class="focusItem"><span class="skillName">${t.icon} Day ${idx+1}: ${esc(t.title)}</span><span class="tag">${n} miss${n===1?'':'es'}</span><button class="btn alt" data-goto="${idx}">Review →</button></div>`}).join('');
    $('focus').innerHTML=`<p class="small">Topics with the most missed questions${topReason?` • most common slip-up: <b>${esc(topReason[0])}</b>`:''}. Tap Review to practice that day again.</p>${items}`;
  }
  $('skills').innerHTML=WEEKS.map(w=>{const rows=TOPICS.map((t,i)=>({t,i})).filter(o=>o.t.week===w.week).map(({t,i})=>{const m=S.mastery[t.id],u=topicUnlocked(S,i),done=S.cleared[t.id]&&m>=PASS_MASTERY;return`<div class="skillRow ${done?'done':''} ${u?'':'locked'}"><span class="skillName">${u?t.icon:'🔒'} Day ${i+1}: ${esc(t.title)}</span><span class="skillPct">${m}%${done?' ✓':''}</span><div class="bar"><i style="width:${m}%"></i></div></div>`}).join('');return`<div class="weekBlock"><h3>Week ${w.week}: ${esc(w.title)} <small>${esc(w.standard)}</small></h3>${rows}</div>`}).join('');
  renderFocusPins();
  document.querySelectorAll('#dashboard [data-goto]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.goto);if(topicUnlocked(S,i))startLesson(i);else $('pinMsg').textContent='That day is locked until earlier days are completed.'});
}
function exportProgress(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mathquest7-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function changePin(){const p=prompt('New 4-digit parent PIN');if(/^\d{4}$/.test(p)){localStorage.mq7ParentPin=p;alert('PIN updated.')}else if(p!==null)alert('PIN must be exactly 4 digits.')}
function resetLearning(){if(confirm('Reset learning progress but keep parent PIN and practice settings?')){const settings=S.settings;S=defaultState();S.settings=settings;save();location.reload()}}
async function clearAll(){if(!confirm('Clear ALL MathQuest data from this browser/device? This cannot be undone.'))return;Object.keys(localStorage).filter(k=>k.toLowerCase().startsWith('mq7')||k.toLowerCase().includes('mathquest')).forEach(k=>localStorage.removeItem(k));if('caches'in window)for(const k of await caches.keys())if(k.toLowerCase().includes('mathquest'))await caches.delete(k);alert('All MathQuest local data cleared.');location.reload()}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
$('continueBtn').onclick=continueJourney;$('parentBtn').onclick=openParent;$('mapBtn').onclick=()=>go('home');$('studentBtn').onclick=()=>go('home');$('pinOpen').onclick=parentAuth;$('practiceTarget').onchange=e=>{S.settings.practiceTarget=Number(e.target.value);save()};$('masteryReplayTarget').onchange=e=>{S.settings.masteryReplayTarget=Number(e.target.value);save()};$('focusMode').onchange=e=>{S.settings.focusMode=e.target.value;save();showToast(`Open-ended focus mode: ${focusModeLabel(S.settings.focusMode)}`,4000)};$('exportBtn').onclick=exportProgress;$('changePinBtn').onclick=changePin;$('resetBtn').onclick=resetLearning;$('clearBtn').onclick=clearAll;$('breakOverlay').querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>startBreakCountdown(Number(b.dataset.min)));$('breakBack').onclick=()=>{$('breakOverlay').classList.add('hidden');$('breakDone').classList.add('hidden');noteActivity();resumePractice()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')pausePractice();else{noteActivity();resumePractice()}});
window.addEventListener('pagehide',pausePractice);
['pointerdown','keydown','touchstart','mousemove','scroll'].forEach(ev=>document.addEventListener(ev,noteActivity,{passive:true}));
renderTop();renderMap();loadVersion();syncPracticeDay();noteActivity();resumePractice();startClock();
if('serviceWorker'in navigator)navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).catch(()=>{});
