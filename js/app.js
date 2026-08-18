import {TOPICS,WEEKS,PASS_MASTERY,MIN_MASTERY_ATTEMPTS,generateProblem,topicUnlocked,canTakeExit,updateMastery} from './curriculum.mjs';
import {generateDailyBenchmark,CORE_DAILY_COUNT} from './daily-session.mjs';
import {BREAK_EVERY_MIN,IDLE_PAUSE_MS,ensurePracticeDay,elapsedPracticeMin,shouldIdlePause,pauseSegment,canResumePractice,resetMasterySession,flushMasterySegment,masterySessionElapsedMs,masteryDayTotalMs,formatPracticeDuration,yesterdayKey,todayKey,masteryLogRows} from './practice-timer.mjs';
import {generateMasteryBenchmark,generateOpenEndedBenchmark,openEndedRecapHtml,openEndedUnlocked,allTopicsCleared,OPEN_ENDED_ID,OPEN_ENDED_TITLE,OPEN_ENDED_ICON,MASTERY_LEVEL_COUNTS} from './mastery-session.mjs';
import {analyzeLearner,resolveFocusTopicIds,focusModeLabel,formatInsightChip,SYLLABUS_GAPS,FOCUS_MODES} from './learner-insights.mjs';
import {boostPathHtml,improvementPreviewHtml,strengthsPraiseHtml} from './coach-visuals.mjs';
import {REALM_BUILDINGS,REALM_PETS,REALM_PET_SKINS,awardCorrectRewards,awardDayClearRewards,awardBreakBonus,awardParentCoins,buyBuilding,canBuyBuilding,buyPet,canBuyPet,buyPetSkin,canBuyPetSkin,setActivePet,setActivePetSkin,realmStageView,companionStripView,entryArtUrl,computeTrophies,heroTitle,COINS_BREAK_BONUS,REALM_PREVIEW_MS,petById,dayClearCoinBackfillPreview,claimDayClearCoinBackfill} from './rewards.mjs';const $=id=>document.getElementById(id);const PHASES=['warmup','learn','guided','practice','review','exit'];
const LEVEL_META={standard:{tag:'Level 1 · Standard Practice',emoji:'🟢'},complex:{tag:'Level 2 · Multi-Step Challenge',emoji:'🟡'},word:{tag:'Level 3 · NC Real-World Word Problem',emoji:'🔴'}};
function defaultSettings(){return{practiceTarget:10,masteryReplayTarget:20,focusMode:'blend',focusTopicIds:[]}}
function defaultState(){return{xp:0,coins:0,total:0,correct:0,streak:0,best:0,mastery:{},attempts:{},cleared:{},dayClearCoinClaimed:{},day:0,settings:defaultSettings(),errorLog:[],practiceMs:0,sessionDate:null,nextBreakMin:BREAK_EVERY_MIN,masteryPracticeByDay:{},masterySessionMs:0,realm:[],pets:[],petSkins:[],activePet:null,activePetSkin:null,breaksCompleted:0}}
let S=loadState(),current=0,sessionMode='learn',boostMode=false,q=null,exit={left:0,correct:0},bench=null,timer=null,onBreak=false,breakTimer=null,toastTimer=null,previewTimer=null,realmPreview=null,realmTab='pets',runningSince=null,masteryRunningSince=null,lastActiveAt=Date.now(),sessionPracticeStart=0;
function loadState(){let parsed;try{parsed=JSON.parse(localStorage.mq7summer||'null')}catch{}const s=parsed||defaultState();s.mastery=s.mastery||{};s.attempts=s.attempts||{};s.cleared=s.cleared||{};s.settings={...defaultSettings(),...(s.settings||{})};if(s.settings.masteryReplayTarget==null)s.settings.masteryReplayTarget=20;if(!FOCUS_MODES.includes(s.settings.focusMode))s.settings.focusMode='blend';if(!Array.isArray(s.settings.focusTopicIds))s.settings.focusTopicIds=[];s.errorLog=s.errorLog||[];s.masteryPracticeByDay=s.masteryPracticeByDay&&typeof s.masteryPracticeByDay==='object'?s.masteryPracticeByDay:{};s.masterySessionMs=Number(s.masterySessionMs)||0;s.coins=Number(s.coins)||0;s.breaksCompleted=Number(s.breaksCompleted)||0;s.dayClearCoinClaimed=s.dayClearCoinClaimed&&typeof s.dayClearCoinClaimed==='object'?s.dayClearCoinClaimed:{};s.realm=Array.isArray(s.realm)?s.realm:[];s.pets=Array.isArray(s.pets)?s.pets:[];s.petSkins=Array.isArray(s.petSkins)?s.petSkins:[];if(s.activePet&&!s.pets.includes(s.activePet))s.activePet=s.pets[0]||null;if(s.activePetSkin&&!s.petSkins.includes(s.activePetSkin))s.activePetSkin=null;delete s.sessionStart;ensurePracticeDay(s);for(const t of TOPICS){if(s.mastery[t.id]==null)s.mastery[t.id]=0;if(!s.attempts[t.id])s.attempts[t.id]={n:0,c:0};if(s.cleared[t.id]==null)s.cleared[t.id]=false}if(s.mastery[OPEN_ENDED_ID]==null)s.mastery[OPEN_ENDED_ID]=0;if(!s.attempts[OPEN_ENDED_ID])s.attempts[OPEN_ENDED_ID]={n:0,c:0};return s}
function save(){syncPracticeDay();localStorage.mq7summer=JSON.stringify(S);renderTop();refreshInsightPanels();if(onHome())renderRealm();renderCompanionStrip()}
function artMarkup(entry){
  const src=entryArtUrl(entry);
  if(!src)return`<span class="realmEmoji">${entry?.icon||''}</span>`;
  return`<img class="realmArt" src="${src}" alt="" data-fallback="${esc(entry?.icon||'')}">`;
}
function bindArtFallbacks(root){
  if(!root)return;
  root.querySelectorAll('img.realmArt').forEach(img=>{
    img.onerror=()=>{const s=document.createElement('span');s.className='realmEmoji';s.textContent=img.dataset.fallback||'';img.replaceWith(s)};
  });
}
function renderCompanionStrip(){
  const el=$('realmCompanion');if(!el)return;
  const onLearn=!$('learn').classList.contains('hidden');
  const home=onHome();
  // Practice: owned only. Home: owned + optional Free Preview ghosts.
  if(!onLearn&&!home){el.classList.add('hidden');el.innerHTML='';el.setAttribute('aria-hidden','true');return}
  const view=companionStripView(S,home?realmPreview:null);
  if(!view.visible){el.classList.add('hidden');el.innerHTML='';el.setAttribute('aria-hidden','true');return}
  el.classList.remove('hidden');el.setAttribute('aria-hidden','false');
  if(view.isPreview)el.classList.add('previewing');else el.classList.remove('previewing');
  const pet=view.pet?`<div class="companionPet${view.petGhost?' ghost pulse':''}" title="${esc(view.pet.name)}">${artMarkup(view.pet)}</div>`:'';
  const builds=view.buildings.map(b=>`<div class="companionPlot" title="${esc(b.name)}">${artMarkup(b)}</div>`).join('');
  const ghost=view.ghostBuilding?`<div class="companionPlot ghost pulse" title="Free preview">${artMarkup(view.ghostBuilding)}</div>`:'';
  const more=view.overflow?`<div class="companionMore">+${view.overflow}</div>`:'';
  const banner=view.previewLabel?`<div class="companionPreviewLabel">${esc(view.previewLabel)} · free</div>`:'';
  el.innerHTML=`<div class="companionInner">${banner}${pet}${builds}${ghost}${more}</div>`;
  bindArtFallbacks(el);
}function renderTop(){
  $('xp').textContent=S.xp;$('streak').textContent=S.streak;
  const coinsEl=$('coins');if(coinsEl)coinsEl.textContent=S.coins;
  const titleEl=$('heroTitle');if(titleEl)titleEl.textContent=heroTitle(S.xp);
  const pill=$('masteryTimePill');if(!pill)return;
  if(!openEndedUnlocked(S)){pill.classList.add('hidden');return}
  pill.classList.remove('hidden');
  const yKey=yesterdayKey(),tKey=todayKey();
  const yMs=masteryDayTotalMs(S,yKey),tMs=masteryDayTotalMs(S,tKey,sessionMode==='open'?masteryRunningSince:null);
  const yTxt=yMs>0?formatPracticeDuration(yMs):'none';
  const tTxt=formatPracticeDuration(tMs);
  pill.textContent=`♾️ Mastery · Yesterday ${yTxt} · Today ${tTxt}`;
  pill.dataset.tip=`Open-ended mastery active practice only (pauses on breaks, hidden tab, or 5+ min away). Visit stopwatch resets each time you start mastery practice; daily totals keep adding. 20–20–20 breaks still apply.`;
}
function onHome(){return!$('home').classList.contains('hidden')}
function onParentDashboard(){return!$('parent').classList.contains('hidden')&&!$('dashboard').classList.contains('hidden')}
function refreshInsightPanels(){if(onHome()){renderStudentCoach();renderRealm();renderDayClearCoinClaim()}if(onParentDashboard())renderDashboard()}
function syncPracticeDay(){if(ensurePracticeDay(S)){runningSince=runningSince!=null?Date.now():null;if(sessionMode==='open'&&masteryRunningSince!=null)masteryRunningSince=Date.now()}}
function go(id){
  if(id!=='home'&&realmPreview){clearTimeout(previewTimer);realmPreview=null;}
  for(const x of ['home','learn','parent'])$(x).classList.toggle('hidden',x!==id);
  if(id==='parent'||(id==='home'&&sessionMode==='open'))pausePractice();
  if(id==='home'){renderMap();renderDayClearCoinClaim()}
  if(id!=='parent'){noteActivity();resumePractice()}
  renderCompanionStrip();
}
async function loadVersion(){try{const r=await fetch(new URL('../version.json?ts='+Date.now(),import.meta.url),{cache:'no-store'}),d=await r.json();$('versionBadge').textContent='v'+d.version}catch{$('versionBadge').textContent='v0.21.0'}}function currentInsights(){return analyzeLearner(S)}
function activeTopicId(){return sessionMode==='open'?OPEN_ENDED_ID:TOPICS[current].id}
function practiceGoal(){return sessionMode==='learn'?S.settings.practiceTarget:S.settings.masteryReplayTarget}
function goalLabel(n){return n===0?'∞':String(n)}
function renderDayClearCoinClaim(){
  const box=$('dayClearCoinClaim');if(!box)return;
  const preview=dayClearCoinBackfillPreview(S);
  if(preview.days<=0){box.classList.add('hidden');box.innerHTML='';box.setAttribute('hidden','');return}
  box.classList.remove('hidden');box.removeAttribute('hidden');
  const dayWord=preview.days===1?'day':'days';
  box.innerHTML=`<h2>🪙 Claim missed day-clear coins</h2><p>You already cleared <b>${preview.days}</b> ${dayWord} before day-clear coins were tracked. Claim <b>${preview.coins}</b> 🪙 once (${preview.days} × 100) — spend them in My Realm. This does not change mastery or unlock days.</p><button type="button" class="btn" id="claimDayClearCoinsBtn">Claim ${preview.coins} coins for ${preview.days} cleared ${dayWord}</button>`;
  const btn=$('claimDayClearCoinsBtn');
  if(btn)btn.onclick=()=>{
    const r=claimDayClearCoinBackfill(S);
    if(!r.ok)return showToast(r.reason||'Nothing to claim',3500);
    save();
    showToast(`Claimed ${r.coins} 🪙 for ${r.days} cleared ${r.days===1?'day':'days'}!`,5000);
  };
}
function renderStudentCoach(){
  const insights=currentInsights(),box=$('studentCoach');if(!box)return;
  if(!insights.practicedCount){
    box.innerHTML='<p class="small">No coaching data yet. Answer practice questions (including a few mistakes) and this panel will fill with live strengths, improvements, and a plan you can tap.</p><button class="btn" id="coachStart">▶ Start / Continue practice →</button>';
    const b=$('coachStart');if(b)b.onclick=()=>continueJourney();
    return;
  }
  const praise=strengthsPraiseHtml(insights.strengths);
  const plan=insights.plan.filter(p=>p.day!=null).slice(0,4).map(p=>{
    const t=TOPICS[p.day-1];
    return`${improvementPreviewHtml(t,p.action)}<div style="margin-top:8px"><button class="btn" data-coach="${p.day-1}">🎬 Practice Day ${p.day} with GIF steps →</button></div>`;
  }).join('')||insights.plan.map(p=>`<div class="coachItem"><b>${esc(p.title||'Next step')}</b><span class="small">${esc(p.action)}</span></div>`).join('');
  box.innerHTML=`<p class="small">Live from your attempts, mastery, and mistakes (${insights.practicedCount} day${insights.practicedCount===1?'':'s'} with evidence). After each boost practice, scores update and this plan recalibrates.</p>
<p><b>You’re already doing great</b></p>${praise}
<p><b>Improvement plan (GIF-style steps + practice)</b></p>${plan}
${openEndedUnlocked(S)?`<button class="btn" id="coachOpenEnded">${OPEN_ENDED_ICON} Open-Ended fine-tuning (uses this plan) →</button>`:''}`;
  box.querySelectorAll('[data-coach]').forEach(b=>b.onclick=()=>startImprovementPractice(Number(b.dataset.coach)));
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
  renderRealm();
}
function renderRealm(){
  const box=$('realmShop');if(!box)return;
  renderRealmStage();
  const ownedB=new Set(S.realm||[]),ownedP=new Set(S.pets||[]),ownedS=new Set(S.petSkins||[]);
  const coins=Number(S.coins)||0;
  const tabs=`<div class="realmTabs" role="tablist" aria-label="My Realm store">
<button type="button" class="realmTab ${realmTab==='buildings'?'on':''}" data-realm-tab="buildings" role="tab" aria-selected="${realmTab==='buildings'}">🏰 Buildings</button>
<button type="button" class="realmTab ${realmTab==='pets'?'on':''}" data-realm-tab="pets" role="tab" aria-selected="${realmTab==='pets'}">🐾 Pet Store</button>
<button type="button" class="realmTab ${realmTab==='skins'?'on':''}" data-realm-tab="skins" role="tab" aria-selected="${realmTab==='skins'}">✨ Pet Skins</button>
</div>`;
  const tip=`<p class="small realmStoreTip"><b>You have ${coins} 🪙.</b> <span class="previewFree">👁 Preview is always free</span> — works even if you do not have enough coins. Buying spends coins; Preview never does.</p>`;
  let panel='';
  if(realmTab==='buildings'){
    panel=`<h3 class="realmPanelTitle">🏰 Building shop</h3><p class="small">Preview any building in the bottom-right companion strip (and realm window), then Build when you can afford it.</p><div class="realmGrid">`+REALM_BUILDINGS.map(b=>{
      const have=ownedB.has(b.id),check=canBuyBuilding(S,b.id),need=Math.max(0,b.cost-coins);
      const buy=have?`<span class="tag">Built ✓</span>`:`<button type="button" class="btn ${check.ok?'':'alt'}" data-buy-building="${b.id}" ${check.ok?'':'disabled'}>${check.ok?`Build · ${b.cost} 🪙`:`Need ${need} more 🪙`}</button>`;
      return`<div class="realmCard ${have?'owned':''}"><div class="realmIcon">${artMarkup(b)}</div><b>${esc(b.name)}</b><span class="small">${esc(b.blurb)}</span><span class="small realmPrice">Price: ${b.cost} 🪙</span><div class="realmActions"><button type="button" class="btn previewBtn" data-preview-building="${b.id}">👁 Free Preview</button>${buy}</div></div>`;
    }).join('')+`</div>`;
  }else if(realmTab==='pets'){
    panel=`<h3 class="realmPanelTitle">🐾 Pet Store</h3><p class="small">Adopt a companion with coins. Use <b>Free Preview</b> first (no coins needed) — it appears in the bottom-right strip like practice. After adopting, tap <b>Make active</b> so they stay in your realm and practice corner.</p><div class="realmGrid">`+REALM_PETS.map(p=>{
      const have=ownedP.has(p.id),check=canBuyPet(S,p.id),active=S.activePet===p.id,need=Math.max(0,p.cost-coins);
      const buy=have?`<button type="button" class="btn alt" data-equip-pet="${p.id}">${active?'Active in window ✓':'Make active in window'}</button>`:`<button type="button" class="btn ${check.ok?'':'alt'}" data-buy-pet="${p.id}" ${check.ok?'':'disabled'}>${check.ok?`Adopt with ${p.cost} 🪙`:`Need ${need} more 🪙 to adopt`}</button>`;
      return`<div class="realmCard ${have?'owned':''} ${active?'activePet':''}"><div class="realmIcon">${artMarkup(p)}</div><b>${esc(p.name)}</b><span class="small">${esc(p.blurb)}</span><span class="small realmPrice">Adopt price: ${p.cost} 🪙</span><div class="realmActions"><button type="button" class="btn previewBtn" data-preview-pet="${p.id}">👁 Free Preview</button>${buy}</div></div>`;
    }).join('')+`</div>`;
  }else{
    panel=`<h3 class="realmPanelTitle">✨ Pet skins shop</h3><p class="small">Skins dress up a pet you already own. <b>Free Preview</b> works anytime (even before you own the pet or have enough coins). Buy unlocks the skin; Wear puts it on your active pet.</p><div class="realmGrid">`+REALM_PET_SKINS.map(sk=>{
      const have=ownedS.has(sk.id),check=canBuyPetSkin(S,sk.id),pet=petById(sk.petId),equipped=S.activePetSkin===sk.id,need=Math.max(0,sk.cost-coins);
      let buyLabel=`Buy skin · ${sk.cost} 🪙`;
      if(!check.ok){
        if(check.reason==='Adopt that pet first')buyLabel=`Adopt ${pet?.name||'pet'} first`;
        else if(check.reason==='Already owned')buyLabel='Owned';
        else buyLabel=`Need ${need} more 🪙`;
      }
      const buy=have?`<button type="button" class="btn alt" data-equip-skin="${sk.id}" ${S.activePet===sk.petId?'':'disabled'}>${equipped?'Wearing ✓':(S.activePet===sk.petId?'Wear on active pet':'Activate pet first')}</button>`:`<button type="button" class="btn ${check.ok?'':'alt'}" data-buy-skin="${sk.id}" ${check.ok?'':'disabled'}>${buyLabel}</button>`;
      return`<div class="realmCard ${have?'owned':''}"><div class="realmIcon">${artMarkup(sk)}</div><b>${esc(sk.name)}</b><span class="small">${esc(sk.blurb)} · for <b>${esc(pet?.name||sk.petId)}</b></span><span class="small realmPrice">Skin price: ${sk.cost} 🪙</span><div class="realmActions"><button type="button" class="btn previewBtn" data-preview-skin="${sk.id}">👁 Free Preview</button>${buy}</div></div>`;
    }).join('')+`</div>`;
  }
  box.innerHTML=`${tip}${tabs}<div class="realmPanel">${panel}</div>`;
  bindArtFallbacks(box);
  box.querySelectorAll('[data-realm-tab]').forEach(b=>b.onclick=()=>{realmTab=b.dataset.realmTab;renderRealm()});
  box.querySelectorAll('[data-preview-building]').forEach(b=>b.onclick=()=>previewRealmItem({type:'building',id:b.dataset.previewBuilding}));
  box.querySelectorAll('[data-preview-pet]').forEach(b=>b.onclick=()=>previewRealmItem({type:'pet',id:b.dataset.previewPet}));
  box.querySelectorAll('[data-preview-skin]').forEach(b=>b.onclick=()=>previewRealmItem({type:'skin',id:b.dataset.previewSkin}));
  box.querySelectorAll('[data-buy-building]').forEach(b=>b.onclick=()=>{const res=buyBuilding(S,b.dataset.buyBuilding);if(!res.ok)return showToast(res.reason,4000);save();showToast(`${res.building.icon} ${res.building.name} built!`,4000)});
  box.querySelectorAll('[data-buy-pet]').forEach(b=>b.onclick=()=>{const res=buyPet(S,b.dataset.buyPet);if(!res.ok)return showToast(res.reason,4000);save();showToast(`${res.pet.icon} ${res.pet.name} joined your realm!`,4000)});
  box.querySelectorAll('[data-buy-skin]').forEach(b=>b.onclick=()=>{const res=buyPetSkin(S,b.dataset.buySkin);if(!res.ok)return showToast(res.reason,4000);save();showToast(`${res.skin.icon} ${res.skin.name} unlocked!`,4000)});
  box.querySelectorAll('[data-equip-pet]').forEach(b=>b.onclick=()=>{const res=setActivePet(S,b.dataset.equipPet);if(!res.ok)return showToast(res.reason,4000);save();showToast('Pet is now active in your realm window',3500)});
  box.querySelectorAll('[data-equip-skin]').forEach(b=>b.onclick=()=>{const res=setActivePetSkin(S,b.dataset.equipSkin);if(!res.ok)return showToast(res.reason,4000);save();showToast('Skin equipped on your active pet',3500)});
}
function renderRealmStage(){
  const stage=$('realmStage');if(!stage)return;
  const view=realmStageView(S,realmPreview);
  const plots=view.buildings.map(b=>`<div class="realmPlot" title="${esc(b.name)}">${artMarkup(b)}<small>${esc(b.name)}</small></div>`).join('');
  const ghost=view.ghostBuilding?`<div class="realmPlot ghost pulse" title="Preview">${artMarkup(view.ghostBuilding)}<small>Free preview</small></div>`:'';
  const pet=view.petArtEntry?`<div class="realmPet ${view.isPreview&&(realmPreview?.type==='pet'||realmPreview?.type==='skin')?'ghost pulse':''}" title="${esc(view.pet?.name||'Pet')}">${artMarkup(view.petArtEntry)}<small>${esc(view.skin?view.skin.name:view.pet?.name||'')}</small></div>`:`<div class="realmPet empty"><small>No pet yet — open Pet Store</small></div>`;
  const banner=view.previewLabel?`<div class="realmPreviewBanner">${esc(view.previewLabel)} · free (no coins) · ${Math.round(REALM_PREVIEW_MS/1000)}s</div>`:'';
  stage.innerHTML=`${banner}<div class="realmSky"><div class="realmGround">${plots}${ghost}${pet}</div></div>`;
  bindArtFallbacks(stage);
  if(view.isPreview)stage.classList.add('previewing');else stage.classList.remove('previewing');
}
function previewRealmItem(item){
  clearTimeout(previewTimer);
  realmPreview=item;
  renderRealmStage();
  renderCompanionStrip();
  const strip=$('realmCompanion');
  if(strip&&!strip.classList.contains('hidden'))strip.scrollIntoView({behavior:'smooth',block:'nearest'});
  const label=item.type==='pet'?'pet':item.type==='skin'?'pet skin':'building';
  showToast(`Free preview of this ${label} — no coins spent`,2800);
  previewTimer=setTimeout(()=>{realmPreview=null;renderRealmStage();renderCompanionStrip()},REALM_PREVIEW_MS);
}
function nextDayIndex(){const i=TOPICS.findIndex((t,j)=>topicUnlocked(S,j)&&!S.cleared[t.id]);return i<0?TOPICS.length-1:i}
function updateContinueLabel(){const allDone=allTopicsCleared(S);$('continueBtn').textContent=allDone?`▶ ${OPEN_ENDED_ICON} Open-Ended Mastery`:`▶ Start / Continue Today (Day ${nextDayIndex()+1})`}
function continueJourney(){if(allTopicsCleared(S))startOpenEnded();else startLesson(nextDayIndex())}
function beginLearnSurface(){save();go('learn');noteActivity();resumePractice();startClock()}
function startLesson(i){if(!topicUnlocked(S,i))return;if(sessionMode==='open'){masteryRunningSince=flushMasterySegment(S,masteryRunningSince);save()}current=i;S.day=i;boostMode=false;const done=S.cleared[TOPICS[i].id]&&S.mastery[TOPICS[i].id]>=PASS_MASTERY;sessionMode=done?'replay':'learn';sessionPracticeStart=S.attempts[TOPICS[i].id].n;beginLearnSurface();if(done)showMasteryRecap();else showWarmup()}
function startImprovementPractice(i){
  if(!topicUnlocked(S,i))return;
  if(sessionMode==='open'){masteryRunningSince=flushMasterySegment(S,masteryRunningSince);save()}
  current=i;S.day=i;boostMode=true;
  const done=S.cleared[TOPICS[i].id]&&S.mastery[TOPICS[i].id]>=PASS_MASTERY;
  sessionMode=done?'replay':'learn';
  sessionPracticeStart=S.attempts[TOPICS[i].id].n;
  beginLearnSurface();
  showBoostPath();
}
function startOpenEnded(){
  if(!openEndedUnlocked(S))return;
  masteryRunningSince=flushMasterySegment(S,masteryRunningSince);
  resetMasterySession(S);
  sessionMode='open';boostMode=false;current=TOPICS.length-1;S.day=TOPICS.length-1;sessionPracticeStart=S.attempts[OPEN_ENDED_ID].n;
  beginLearnSurface();
  showOpenRecap();
}
function showBoostPath(){
  setPhase('learn');$('feedback').innerHTML='';$('interaction').innerHTML='';
  const t=TOPICS[current],insights=currentInsights();
  const lead=insights.strengths[0]?`Before we boost Day ${current+1}, remember: ${insights.strengths[0].topic.title} is already a strength for you — you’ve got this!`:`You’re brave for practicing a growth day. Let’s slow it down with clear GIF-style steps.`;
  $('lessonBody').innerHTML=boostPathHtml(t,{positiveLead:lead});
  $('interaction').append(button('I watched the steps — guided practice →',sessionMode==='replay'?()=>{boostMode=false;showPractice()}:()=>{boostMode=false;showGuided()}));
  $('interaction').append(button('Show me the steps once more',showBoostPath,'btn alt'));
}
function elapsedMin(){syncPracticeDay();return Math.max(0,elapsedPracticeMin(S.practiceMs,runningSince))}
function onParentScreen(){return!$('parent').classList.contains('hidden')}
function pausePractice(){runningSince=pauseSegment(S,runningSince);if(sessionMode==='open')masteryRunningSince=flushMasterySegment(S,masteryRunningSince);save()}
function resumePractice(){syncPracticeDay();if(onParentScreen())return;const hidden=typeof document!=='undefined'&&document.visibilityState==='hidden';const idle=shouldIdlePause(lastActiveAt,Date.now(),IDLE_PAUSE_MS);if(!canResumePractice({onBreak,hidden,idle}))return;if(runningSince==null)runningSince=Date.now();if(sessionMode==='open'&&masteryRunningSince==null&&!onHome())masteryRunningSince=Date.now()}
function noteActivity(){lastActiveAt=Date.now();if(!onBreak&&!onParentScreen()&&typeof document!=='undefined'&&document.visibilityState!=='hidden')resumePractice()}
function startClock(){clearInterval(timer);const tick=()=>{syncPracticeDay();if(runningSince!=null&&shouldIdlePause(lastActiveAt,Date.now(),IDLE_PAUSE_MS))pausePractice();const m=elapsedMin();$('sessionClock').textContent=`⏱ ${m} min`;$('sessionClock').dataset.tip=`Cool, you have about ${m} minute${m===1?'':'s'} of active practice today..! The timer pauses on breaks, when the tab is hidden, or after 5 minutes away. Keep going — and take healthy screen breaks!`;if(sessionMode==='open'){const sess=formatPracticeDuration(masterySessionElapsedMs(S,masteryRunningSince));const today=formatPracticeDuration(masteryDayTotalMs(S,todayKey(),masteryRunningSince));$('masteryPill').textContent=`Visit ${sess} · Today ${today}`}renderTop();if(!onBreak&&m>=S.nextBreakMin)triggerBreak(m)};tick();timer=setInterval(tick,1000)}
function showToast(msg,ms=9000){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.classList.add('hidden'),400)},ms)}
function triggerBreak(m){onBreak=true;pausePractice();showToast(`⏸️ Cool — you've practiced for about ${m} minutes! 👏 Time to stand up, stretch, hydrate, and rest your eyes (look ~20 ft away for 20 sec). Learning should be fun — let's take a healthy screen break!`,12000);openBreak(m)}
function openBreak(m){const ov=$('breakOverlay');ov.classList.remove('hidden');$('breakChoose').classList.remove('hidden');$('breakCountdown').classList.add('hidden');$('breakDone').classList.add('hidden');$('breakTitle').textContent='🧘 Time for a screen break!';$('breakMsg').textContent=`You've been practicing for about ${m} minutes — awesome focus! Screens are for learning, not for sitting too long. Pick a break length below. The screen will rest so you can move around, stretch, drink water, and look far away.`}
function startBreakCountdown(mins){const start=Date.now(),total=mins*60;$('breakChoose').classList.add('hidden');$('breakDone').classList.add('hidden');$('breakCountdown').classList.remove('hidden');$('breakTitle').textContent='🌟 Screen is resting — go be active!';const tips=['👀 20-20-20 rule: look about 20 feet away for 20 seconds.','🏃 Stand up and move around — stretch your arms and legs.','💧 Drink some water and blink a few times.','🌤️ Look out a window or step outside if you can.'];const render=()=>{const left=Math.max(0,total-Math.floor((Date.now()-start)/1000)),mm=Math.floor(left/60),ss=left%60;$('breakClock').textContent=`${mm}:${String(ss).padStart(2,'0')}`;$('breakTip').textContent=tips[Math.floor((Date.now()-start)/4000)%tips.length];if(left<=0){clearInterval(breakTimer);endBreak()}};render();breakTimer=setInterval(render,1000)}
function endBreak(){
  S.nextBreakMin+=BREAK_EVERY_MIN;onBreak=false;
  const bonus=awardBreakBonus(S);
  save();
  $('breakCountdown').classList.add('hidden');$('breakChoose').classList.add('hidden');$('breakDone').classList.remove('hidden');
  $('breakTitle').textContent='🎉 Welcome back!';
  $('breakMsg').textContent=`Great job taking a healthy break. Your practice timer paused while you rested. Bonus: +${bonus.coins} 🪙 for following the 20–20–20 rule! Ready to keep learning?`;
  showToast(`🧘 Break complete — +${COINS_BREAK_BONUS} coins!`,5000);
}
function setPhase(p){
  for(const x of PHASES)$('p'+x[0].toUpperCase()+x.slice(1)).classList.toggle('on',x===p);
  if(sessionMode==='open'){$('topicName').textContent=`${OPEN_ENDED_ICON} ${OPEN_ENDED_TITLE}`;const sess=formatPracticeDuration(masterySessionElapsedMs(S,masteryRunningSince));const today=formatPracticeDuration(masteryDayTotalMs(S,todayKey(),masteryRunningSince));$('masteryPill').textContent=`Visit ${sess} · Today ${today}`}
  else{$('topicName').textContent=`${sessionMode==='replay'?'♻️ Mastery · ':''}Day ${current+1}: ${TOPICS[current].title}`;$('masteryPill').textContent=`${S.mastery[TOPICS[current].id]}% mastery`}
  renderCompanionStrip();
}
function button(label,fn,cls='btn'){const b=document.createElement('button');b.className=cls;b.textContent=label;b.onclick=fn;return b}
function showWarmup(){setPhase('warmup');$('feedback').innerHTML='';$('interaction').innerHTML='';if(current===0){$('lessonBody').innerHTML='<h2>🌞 Day 1 Warm-up</h2><p class="concept">No previous lesson yet. Today starts with the foundations.</p>';$('interaction').append(button('Begin today’s lesson →',showLearn));return}const prev=TOPICS[current-1],w=generateProblem(prev.id);$('lessonBody').innerHTML=`<h2>⚡ Quick Review</h2><p class="concept">Before today’s lesson, recall yesterday’s skill:</p><h3>${w.q}</h3>`;renderAnswers(w,a=>{$('feedback').innerHTML=a===w.a?`<div class="feedback good">✅ Nice recall. ${w.explain}</div>`:`<div class="feedback bad">💡 Review: ${w.explain}</div>`;$('feedback').append(button('Continue to today’s story →',showLearn))})}
function showLearn(){setPhase('learn');const t=TOPICS[current];$('feedback').innerHTML='';$('interaction').innerHTML='';$('lessonBody').innerHTML=`<p class="small">📖 STORY</p><h2>${t.story}</h2>${t.teach}`;$('interaction').append(button('🎬 Need a slower GIF walkthrough →',showBoostPath,'btn alt'));$('interaction').append(button('I watched & understand — guided practice →',showGuided))}
function showGuided(){setPhase('guided');const g=TOPICS[current].guided;$('lessonBody').innerHTML=`<h2>🖐️ Guided Practice</h2><p class="concept">${g.prompt}</p><p class="small">Drag a tile into the target, or tap a tile on iPad.</p>`;$('feedback').innerHTML='';$('interaction').innerHTML=`<div class="tokens">${g.tokens.map(x=>`<div class="token" draggable="true" data-v="${esc(x)}">${x}</div>`).join('')}</div><div class="targets"><div id="dropTarget" class="target">DROP / TAP ANSWER</div></div>`;const check=v=>{if(v===g.answer){$('dropTarget').textContent=v;$('feedback').innerHTML=`<div class="feedback good">✨ Correct. ${g.explain}</div><div class="celebrate">⭐ ✅ 🎉</div>`;$('feedback').append(button('Start independent practice →',showPractice))}else{$('feedback').innerHTML=`<div class="feedback bad">🌱 Not yet. ${g.explain} Try again until you make it right.</div><div class="retry">🤔 ↩️ 💡</div>`}};document.querySelectorAll('.token').forEach(el=>{el.onclick=()=>check(el.dataset.v);el.ondragstart=e=>e.dataTransfer.setData('text',el.dataset.v)});$('dropTarget').ondragover=e=>e.preventDefault();$('dropTarget').ondrop=e=>{e.preventDefault();check(e.dataTransfer.getData('text'))}}
function showMasteryRecap(){setPhase('learn');const t=TOPICS[current],goal=practiceGoal();$('feedback').innerHTML='';$('interaction').innerHTML='';$('lessonBody').innerHTML=`<p class="small">♻️ MASTERY REPLAY · Union County / NC Grade 7 retention</p><h2>${t.icon} Day ${current+1} Recap: ${t.title}</h2><p class="concept">${t.story}</p>${t.teach}<p class="small">Parent/Admin mastery target for completed days: <b>${goalLabel(goal)}</b> questions this visit (advanced 2·4·4 mix). Keep skills sharp without redoing the unlock gate.</p>`;$('interaction').append(button('🎬 GIF boost steps first →',showBoostPath,'btn alt'));$('interaction').append(button('Start advanced mastery practice →',showPractice))}
function showOpenRecap(){
  setPhase('warmup');$('feedback').innerHTML='';$('interaction').innerHTML='';
  const insights=currentInsights(),focusIds=resolveFocusTopicIds(S,insights);
  const focusTitles=focusIds.slice(0,5).map(id=>{const i=TOPICS.findIndex(t=>t.id===id);return`Day ${i+1}: ${TOPICS[i].title}`});
  const planLines=insights.plan.slice(0,4).map(p=>p.action);
  const yMs=masteryDayTotalMs(S,yesterdayKey()),tMs=masteryDayTotalMs(S,todayKey(),masteryRunningSince);
  const timeNote=`<p class="small">⏱️ Mastery active time · Yesterday: <b>${formatPracticeDuration(yMs)}</b> · Today so far: <b>${formatPracticeDuration(tMs)}</b> · This visit starts at 0 and pauses when you leave or take a break (20–20–20 still applies).</p>`;
  $('lessonBody').innerHTML=openEndedRecapHtml({focusTitles,planLines,modeLabel:focusModeLabel(S.settings.focusMode)})+timeNote;
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
  if(ok){
    a.c++;S.correct++;bench.correct++;
    const reward=awardCorrectRewards(S);
    S.mastery[id]=updateMastery(S.mastery[id],true);if(problem.topicId&&problem.topicId!==id)S.mastery[problem.topicId]=updateMastery(S.mastery[problem.topicId],true);
    const multNote=reward.mult>1?` · streak ×${reward.mult}`:'';
    $('feedback').innerHTML=`<div class="feedback good">🎉 Correct! ${problem.explain} +${reward.xp} XP · +${reward.coins} 🪙${multNote}</div><div class="celebrate">🌟 🎉 ✅</div>`;
  }else{S.streak=0;S.mastery[id]=updateMastery(S.mastery[id],false);if(problem.topicId&&problem.topicId!==id)S.mastery[problem.topicId]=updateMastery(S.mastery[problem.topicId],false);const entry={topic:problem.topicId||id,when:new Date().toISOString(),question:problem.q,answer:problem.a,level:problem.level,explain:problem.explain};S.errorLog.push(entry);bench.missed.push({number:bench.idx+1,...entry});$('feedback').innerHTML=`<div class="feedback bad">💡 Not yet. Correct answer: ${esc(String(problem.a))}. ${problem.explain}</div><div class="retry">🧠 🔁</div><p><b>What tripped you up?</b></p><div class="errorOpts"><button data-e="Sign">Sign</button><button data-e="Operation">Operation</button><button data-e="Arithmetic">Arithmetic</button><button data-e="Not sure">Not sure</button></div>`;document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{S.errorLog[S.errorLog.length-1].reason=b.dataset.e;save();b.textContent='Saved ✓'})}
}
function benchCheck(v){const id=activeTopicId(),ok=String(v)===String(q.a);creditAttempt(id,ok,q);save();setPhase('practice');const last=bench.idx>=bench.items.length-1;$('feedback').append(button(last?'See error analysis →':'Next question →',()=>{if(last)benchSummary();else{bench.idx++;showBenchQuestion()}}))}
function sessionGoalMet(){const goal=practiceGoal(),gained=S.attempts[activeTopicId()].n-sessionPracticeStart;return goal===0||gained>=goal}
function insightSummaryHtml(insights){
  const weak=insights.improvements.slice(0,3).map(r=>`Day ${TOPICS.indexOf(r.topic)+1}: ${r.topic.title}`).join(' · ')||'none yet';
  const strong=insights.strengths.slice(0,3).map(r=>`Day ${TOPICS.indexOf(r.topic)+1}: ${r.topic.title}`).join(' · ')||'none yet';
  return`<div class="coachItem"><b>📈 Scores updated · strengths &amp; improvements recalibrated</b><span class="small">Strengths: ${esc(strong)}<br>Improvements: ${esc(weak)}<br>Open your coaching plan to see praise GIFs and the next GIF-step boost day.</span><div style="margin-top:8px"><button class="btn alt" id="seeCoachHome">View full coaching plan on home →</button></div></div>`;
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
function finishExit(){const id=TOPICS[current].id,passed=exit.correct>=2&&S.mastery[id]>=PASS_MASTERY;if(passed){S.cleared[id]=true;const clearReward=awardDayClearRewards(S,id);save();setPhase('review');const allDone=allTopicsCleared(S);$('lessonBody').innerHTML=`<h2>🏆 Day ${current+1} Cleared!</h2><p class="concept">Exit Ticket: ${exit.correct}/3. Mastery: ${S.mastery[id]}%.</p><p class="small">Rewards: +${clearReward.xp} XP · +${clearReward.coins} 🪙 — spend coins in My Realm!</p><p>${allDone?`Amazing — all 20 days are complete! The ${OPEN_ENDED_TITLE} is now unlocked for mixed advanced practice forever.`:'You unlocked the next learning day. Older concepts will return in future warm-ups.'}</p><div class="celebrate">🏆 ⭐ 🎉</div>`;$('interaction').innerHTML='';$('feedback').innerHTML='';$('interaction').append(button(allDone?`Enter ${OPEN_ENDED_TITLE} →`:(current<TOPICS.length-1?'Return to roadmap →':'Enter Endless Mastery →'),()=>{if(allDone)startOpenEnded();else{noteActivity();resumePractice();save();go('home')}}));$('interaction').append(button('Extra practice on this skill',()=>{sessionMode='replay';sessionPracticeStart=S.attempts[id].n;showMasteryRecap()},'btn alt'))}else{$('lessonBody').innerHTML=`<h2>🔁 Review Loop</h2><p class="concept">Exit Ticket: ${exit.correct}/3. Mastery: ${S.mastery[id]}%.</p><p>You need at least 2 of 3 on the exit ticket and ${PASS_MASTERY}% mastery. We’ll loop back through practice instead of unlocking too soon.</p>`;$('interaction').innerHTML='';$('feedback').innerHTML='';$('interaction').append(button('Practice, then retry Exit Ticket →',showPractice))}}
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
  const dCoins=$('dCoins');if(dCoins)dCoins.textContent=S.coins;
  $('overallBar').style.width=pct+'%';
  $('overallCap').innerHTML=allDone?`<b>All ${TOPICS.length} days completed (${pct}%)</b> • Next: ${OPEN_ENDED_ICON} ${esc(OPEN_ENDED_TITLE)} (${S.attempts[OPEN_ENDED_ID].n} practices) · Focus: ${esc(focusModeLabel(S.settings.focusMode))}`:`<b>${daysDone} of ${TOPICS.length} days completed (${pct}%)</b> • Next up: Day ${ni+1} — ${esc(TOPICS[ni].title)}`;
  const trophies=computeTrophies(S);
  const trophiesEl=$('trophies');if(trophiesEl)trophiesEl.innerHTML=trophies.map(t=>`<div class="coachItem"><b>${t.icon} ${esc(t.title)}</b><span class="small">${esc(t.detail)}</span></div>`).join('');
  $('strengths').innerHTML=insights.strengths.length?insights.strengths.map(formatInsightChip).map(c=>`<div class="coachItem"><b>${c.icon} Day ${c.day}: ${esc(c.title)}</b><span class="small">${c.standard} · Mastery ${c.mastery}% · Accuracy ${c.accuracy} · ${c.attempts} attempts · ${c.misses} misses</span></div>`).join(''):'<p class="small">No strengths yet — need solid practice evidence (accuracy and mastery) on a day first.</p>';
  $('improvements').innerHTML=insights.improvements.length?insights.improvements.map(row=>{const plan=insights.plan.find(p=>p.topicId===row.topic.id);return improvementPreviewHtml(row.topic,plan?.action||`Focus Day ${TOPICS.indexOf(row.topic)+1}: ${row.topic.title}`,{forParent:true})}).join(''):'<p class="small">No improvement targets yet. After the learner misses questions or stays below 80% mastery, targets appear here automatically.</p>';
  $('improvePlan').innerHTML=`<div class="parentNote">👁 Parent/Admin view is read-only. Practice / GIF boost buttons are student-only on the home coaching plan so adults reviewing here do not start practice or change progress.</div>`+(insights.plan.filter(p=>p.day!=null).length?insights.plan.filter(p=>p.day!=null).map(p=>improvementPreviewHtml(TOPICS[p.day-1],p.action,{forParent:true})).join(''):insights.plan.map(p=>`<div class="coachItem"><b>${esc(p.title||'Plan')}</b><span class="small">${esc(p.action)}</span></div>`).join(''));
  const masteryRows=masteryLogRows(S,sessionMode==='open'?masteryRunningSince:null);
  $('masteryTimeLog').innerHTML=masteryRows.length?`<p class="small">Active open-ended mastery practice only (breaks, hidden tab, and 5+ min away do not count). Visit stopwatch resets each time the student starts mastery practice; daily totals keep adding. 20-minute healthy-break rule still applies.</p><table class="masteryTimeTable"><thead><tr><th>Mastery day</th><th>Date</th><th>Active practice</th></tr></thead><tbody>${masteryRows.map(r=>`<tr><td>${esc(r.dayLabel)}</td><td>${esc(r.date)}</td><td><b>${esc(r.label)}</b></td></tr>`).join('')}</tbody></table>`:'<p class="small">No open-ended mastery practice time logged yet. After Day 20 unlocks, active practice minutes appear here by calendar day (Day 21, Day 22, …).</p>';
  $('masteryReview').innerHTML=TOPICS.map((t,i)=>{const u=topicUnlocked(S,i),done=S.cleared[t.id]&&S.mastery[t.id]>=PASS_MASTERY,a=S.attempts[t.id],accPct=a.n?Math.round(a.c/a.n*100):null;return`<div class="focusItem"><span class="skillName">${u?t.icon:'🔒'} Day ${i+1}: ${esc(t.title)}</span><span class="tag">${S.mastery[t.id]}%${done?' ✓':''}${accPct!=null?` · ${accPct}%`:''}</span></div>`}).join('');
  $('syllabusGaps').innerHTML=SYLLABUS_GAPS.map(g=>`<div class="gapItem"><b>${esc(g.domain)}</b><span class="small">${esc(g.missing)}</span></div>`).join('');
  const counts={},reasons={};for(const e of S.errorLog){counts[e.topic]=(counts[e.topic]||0)+1;if(e.reason)reasons[e.reason]=(reasons[e.reason]||0)+1}
  if(!S.errorLog.length){$('focus').innerHTML='<div class="feedback good">🌟 No mistakes logged yet — great start! Focus areas will appear here as the learner practices.</div>'}
  else{
    const top=Object.entries(counts).filter(([id])=>id!==OPEN_ENDED_ID).sort((a,b)=>b[1]-a[1]).slice(0,3),topReason=Object.entries(reasons).sort((a,b)=>b[1]-a[1])[0];
    const items=top.map(([id,n])=>{const idx=TOPICS.findIndex(x=>x.id===id),t=TOPICS[idx];if(!t)return'';return`<div class="focusItem"><span class="skillName">${t.icon} Day ${idx+1}: ${esc(t.title)}</span><span class="tag">${n} miss${n===1?'':'es'}</span></div>`}).join('');
    $('focus').innerHTML=`<p class="small">Topics with the most missed questions${topReason?` • most common slip-up: <b>${esc(topReason[0])}</b>`:''}. Ask the student to use their coaching plan Practice button (parent view stays read-only).</p>${items}`;
  }
  $('skills').innerHTML=WEEKS.map(w=>{const rows=TOPICS.map((t,i)=>({t,i})).filter(o=>o.t.week===w.week).map(({t,i})=>{const m=S.mastery[t.id],u=topicUnlocked(S,i),done=S.cleared[t.id]&&m>=PASS_MASTERY;return`<div class="skillRow ${done?'done':''} ${u?'':'locked'}"><span class="skillName">${u?t.icon:'🔒'} Day ${i+1}: ${esc(t.title)}</span><span class="skillPct">${m}%${done?' ✓':''}</span><div class="bar"><i style="width:${m}%"></i></div></div>`}).join('');return`<div class="weekBlock"><h3>Week ${w.week}: ${esc(w.title)} <small>${esc(w.standard)}</small></h3>${rows}</div>`}).join('');
  renderFocusPins();
}
function applyParentCoinAward(amount){
  const res=awardParentCoins(S,amount);
  if(!res.ok){showToast(res.reason||'Could not award coins',4000);return}
  save();
  renderDashboard();
  showToast(`Awarded ${res.coins} 🪙 · student now has ${res.total} coins (cosmetic only)`,4500);
}
function exportProgress(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mathquest7-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function changePin(){const p=prompt('New 4-digit parent PIN');if(/^\d{4}$/.test(p)){localStorage.mq7ParentPin=p;alert('PIN updated.')}else if(p!==null)alert('PIN must be exactly 4 digits.')}
function resetLearning(){if(confirm('Reset learning progress but keep parent PIN and practice settings?')){const settings=S.settings;S=defaultState();S.settings=settings;save();location.reload()}}
async function clearAll(){if(!confirm('Clear ALL MathQuest data from this browser/device? This cannot be undone.'))return;Object.keys(localStorage).filter(k=>k.toLowerCase().startsWith('mq7')||k.toLowerCase().includes('mathquest')).forEach(k=>localStorage.removeItem(k));if('caches'in window)for(const k of await caches.keys())if(k.toLowerCase().includes('mathquest'))await caches.delete(k);alert('All MathQuest local data cleared.');location.reload()}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
$('continueBtn').onclick=continueJourney;$('parentBtn').onclick=openParent;$('mapBtn').onclick=()=>go('home');$('studentBtn').onclick=()=>go('home');$('pinOpen').onclick=parentAuth;$('practiceTarget').onchange=e=>{S.settings.practiceTarget=Number(e.target.value);save()};$('masteryReplayTarget').onchange=e=>{S.settings.masteryReplayTarget=Number(e.target.value);save()};$('focusMode').onchange=e=>{S.settings.focusMode=e.target.value;save();showToast(`Open-ended focus mode: ${focusModeLabel(S.settings.focusMode)}`,4000)};$('exportBtn').onclick=exportProgress;$('changePinBtn').onclick=changePin;$('resetBtn').onclick=resetLearning;$('clearBtn').onclick=clearAll;document.querySelectorAll('[data-award-coins]').forEach(b=>b.onclick=()=>applyParentCoinAward(b.dataset.awardCoins));const awardBtn=$('awardCoinsBtn');if(awardBtn)awardBtn.onclick=()=>applyParentCoinAward($('awardCoinsAmt')?.value);$('breakOverlay').querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>startBreakCountdown(Number(b.dataset.min)));$('breakBack').onclick=()=>{$('breakOverlay').classList.add('hidden');$('breakDone').classList.add('hidden');noteActivity();resumePractice()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')pausePractice();else{noteActivity();resumePractice()}});
window.addEventListener('pagehide',pausePractice);
['pointerdown','keydown','touchstart','mousemove','scroll'].forEach(ev=>document.addEventListener(ev,noteActivity,{passive:true}));
renderTop();renderMap();renderRealm();renderCompanionStrip();renderDayClearCoinClaim();loadVersion();syncPracticeDay();noteActivity();resumePractice();startClock();
if('serviceWorker'in navigator)navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).catch(()=>{});
