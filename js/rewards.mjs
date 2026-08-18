/** Cosmetic rewards: coins, streak multipliers, realm buildings, pets/skins, trophies.
 *  Coins never unlock lessons or skip mastery gates.
 */

export const XP_PER_CORRECT=20;
export const XP_DAY_CLEAR=50;
export const COINS_PER_CORRECT=10;
export const COINS_DAY_CLEAR=100;
export const COINS_BREAK_BONUS=25;
export const REALM_PREVIEW_MS=3500;
export const COMPANION_BUILDING_LIMIT=4;

/** Streak after a correct answer → coin multiplier (XP stays flat). */
export function streakCoinMultiplier(streakAfterCorrect){
  const s=Math.max(0,Number(streakAfterCorrect)||0);
  if(s>=10)return 2;
  if(s>=5)return 1.5;
  return 1;
}

export function coinsForCorrect(streakAfterCorrect){
  return Math.round(COINS_PER_CORRECT*streakCoinMultiplier(streakAfterCorrect));
}

export const REALM_BUILDINGS=[
  {id:'signpost',name:'Signpost Camp',icon:'🏕️',cost:50,blurb:'Your quest base camp.',art:'buildings/signpost.svg'},
  {id:'banner',name:'Quest Banner',icon:'🚩',cost:60,blurb:'A flag for every cleared day.',art:'buildings/banner.svg'},
  {id:'bridge',name:'Number Line Bridge',icon:'🌉',cost:80,blurb:'Cross from negative to positive.',art:'buildings/bridge.svg'},
  {id:'arena',name:'Tug-of-War Arena',icon:'🏟️',cost:100,blurb:'Where opposite signs settle scores.',art:'buildings/arena.svg'},
  {id:'garden',name:'Fraction Garden',icon:'🌻',cost:120,blurb:'Equal plots for equal denominators.',art:'buildings/garden.svg'},
  {id:'market',name:'Ratio Market',icon:'🏪',cost:150,blurb:'Unit rates for every stall.',art:'buildings/market.svg'},
  {id:'lab',name:'Algebra Lab',icon:'🧪',cost:180,blurb:'Distribute, combine, solve.',art:'buildings/lab.svg'},
  {id:'tower',name:'Balance Tower',icon:'🗼',cost:200,blurb:'Keep both sides even.',art:'buildings/tower.svg'},
  {id:'observatory',name:'Circle Observatory',icon:'🔭',cost:220,blurb:'π under the stars.',art:'buildings/observatory.svg'},
  {id:'fountain',name:'Probability Fountain',icon:'⛲',cost:250,blurb:'Favorable drops ÷ total drops.',art:'buildings/fountain.svg'},
  {id:'keep',name:'Data Keep',icon:'🏰',cost:280,blurb:'Means, samples, and stories.',art:'buildings/keep.svg'},
  {id:'statue',name:'Hero Statue',icon:'🗿',cost:300,blurb:'A monument to steady practice.',art:'buildings/statue.svg'}
];

export const REALM_PETS=[
  {id:'fox',name:'Integer Fox',icon:'🦊',cost:120,blurb:'Loves number lines and clever sign flips.',art:'pets/fox.svg'},
  {id:'racer',name:'Ratio Rabbit',icon:'🐇',cost:140,blurb:'Hops at a perfect unit rate.',art:'pets/racer.svg'},
  {id:'owl',name:'Algebra Owl',icon:'🦉',cost:160,blurb:'Hoot-hoots equations until both sides balance.',art:'pets/owl.svg'},
  {id:'turtle',name:'Geometry Turtle',icon:'🐢',cost:180,blurb:'Steady circles and scale drawings.',art:'pets/turtle.svg'},
  {id:'otter',name:'Probability Otter',icon:'🦦',cost:200,blurb:'Counts favorable splashes in every pond.',art:'pets/otter.svg'}
];

export const REALM_PET_SKINS=[
  {id:'fox_ember',petId:'fox',name:'Ember Coat',icon:'🧡',cost:40,blurb:'Warm ember fur for Integer Fox.',art:'pets/fox_ember.svg'},
  {id:'fox_frost',petId:'fox',name:'Frost Coat',icon:'❄️',cost:45,blurb:'Icy frost tips for Integer Fox.',art:'pets/fox_frost.svg'},
  {id:'racer_stripe',petId:'racer',name:'Racing Stripes',icon:'🏁',cost:40,blurb:'Speed stripes for Ratio Rabbit.',art:'pets/racer_stripe.svg'},
  {id:'racer_night',petId:'racer',name:'Night Runner',icon:'🌙',cost:45,blurb:'Moonlit coat for Ratio Rabbit.',art:'pets/racer_night.svg'},
  {id:'owl_scholar',petId:'owl',name:'Scholar Cap',icon:'🎓',cost:40,blurb:'Tiny graduation look for Algebra Owl.',art:'pets/owl_scholar.svg'},
  {id:'owl_star',petId:'owl',name:'Star Speckles',icon:'✨',cost:45,blurb:'Constellation feathers for Algebra Owl.',art:'pets/owl_star.svg'},
  {id:'turtle_shell',petId:'turtle',name:'Pattern Shell',icon:'🔷',cost:40,blurb:'Geometry patterns on Geometry Turtle.',art:'pets/turtle_shell.svg'},
  {id:'turtle_garden',petId:'turtle',name:'Garden Shell',icon:'🌿',cost:45,blurb:'Leafy shell for Geometry Turtle.',art:'pets/turtle_garden.svg'},
  {id:'otter_splash',petId:'otter',name:'Splash Bandana',icon:'💙',cost:40,blurb:'Splashy scarf for Probability Otter.',art:'pets/otter_splash.svg'},
  {id:'otter_lucky',petId:'otter',name:'Lucky Beads',icon:'🍀',cost:45,blurb:'Lucky bead collar for Probability Otter.',art:'pets/otter_lucky.svg'}
];

export function buildingById(id){return REALM_BUILDINGS.find(b=>b.id===id)||null}
export function petById(id){return REALM_PETS.find(p=>p.id===id)||null}
export function skinById(id){return REALM_PET_SKINS.find(s=>s.id===id)||null}

/** Absolute URL for a catalog `art` path under assets/realm/. */
export function entryArtUrl(entry){
  if(!entry?.art)return null;
  return new URL('../assets/realm/'+entry.art,import.meta.url).href;
}

/** Corner companion strip: owned pet + last N buildings. Optional Free Preview overlays ghosts (Home). */
export function companionStripView(state,preview=null){
  const realm=[...(state.realm||[])];
  const overflow=Math.max(0,realm.length-COMPANION_BUILDING_LIMIT);
  const buildings=realm.slice(-COMPANION_BUILDING_LIMIT).map(id=>buildingById(id)).filter(Boolean);
  let pet=null;
  const petId=state.activePet||(state.pets||[])[0]||null;
  if(petId){
    const base=petById(petId);
    if(base){
      const skin=(state.activePet===petId&&state.activePetSkin)?skinById(state.activePetSkin):null;
      pet={
        id:base.id,
        name:skin?`${base.name} · ${skin.name}`:base.name,
        icon:skin?`${base.icon}${skin.icon}`:base.icon,
        art:skin?.art||base.art
      };
    }
  }
  let ghostBuilding=null;
  let petGhost=false;
  let previewLabel=null;
  if(preview?.type==='building'){
    const b=buildingById(preview.id);
    if(b&&!realm.includes(preview.id)){
      ghostBuilding=b;
      previewLabel=`Preview: ${b.name}`;
    }
  }else if(preview?.type==='pet'){
    const p=petById(preview.id);
    if(p){
      pet={id:p.id,name:p.name,icon:p.icon,art:p.art};
      petGhost=true;
      previewLabel=`Preview: ${p.name}`;
    }
  }else if(preview?.type==='skin'){
    const skin=skinById(preview.id);
    const base=skin?petById(skin.petId):null;
    if(skin&&base){
      pet={id:base.id,name:`${base.name} · ${skin.name}`,icon:`${base.icon}${skin.icon}`,art:skin.art||base.art};
      petGhost=true;
      previewLabel=`Preview: ${skin.name}`;
    }
  }
  return{
    visible:buildings.length>0||!!pet||!!ghostBuilding,
    buildings,
    overflow,
    pet,
    ghostBuilding,
    petGhost,
    previewLabel,
    isPreview:!!(ghostBuilding||petGhost)
  };
}

/** Parent/Admin local coin grant (cosmetic only — never unlocks lessons). */
export function awardParentCoins(state,amount){
  const n=Math.floor(Number(amount));
  if(!Number.isFinite(n)||n<=0)return{ok:false,reason:'Enter a positive coin amount',coins:0,total:Number(state.coins)||0};
  if(n>10000)return{ok:false,reason:'Award at most 10,000 coins at once',coins:0,total:Number(state.coins)||0};
  state.coins=(Number(state.coins)||0)+n;
  return{ok:true,coins:n,total:state.coins};
}

export function canBuyBuilding(state,buildingId){
  const b=buildingById(buildingId);
  if(!b)return{ok:false,reason:'Unknown building'};
  const owned=new Set(state.realm||[]);
  if(owned.has(buildingId))return{ok:false,reason:'Already built'};
  if((Number(state.coins)||0)<b.cost)return{ok:false,reason:'Not enough coins'};
  return{ok:true,building:b};
}

export function buyBuilding(state,buildingId){
  const check=canBuyBuilding(state,buildingId);
  if(!check.ok)return check;
  state.coins=(Number(state.coins)||0)-check.building.cost;
  state.realm=[...(state.realm||[]),buildingId];
  return{ok:true,building:check.building};
}

export function canBuyPet(state,petId){
  const p=petById(petId);
  if(!p)return{ok:false,reason:'Unknown pet'};
  const owned=new Set(state.pets||[]);
  if(owned.has(petId))return{ok:false,reason:'Already adopted'};
  if((Number(state.coins)||0)<p.cost)return{ok:false,reason:'Not enough coins'};
  return{ok:true,pet:p};
}

export function buyPet(state,petId){
  const check=canBuyPet(state,petId);
  if(!check.ok)return check;
  state.coins=(Number(state.coins)||0)-check.pet.cost;
  state.pets=[...(state.pets||[]),petId];
  if(!state.activePet)state.activePet=petId;
  return{ok:true,pet:check.pet};
}

export function canBuyPetSkin(state,skinId){
  const skin=skinById(skinId);
  if(!skin)return{ok:false,reason:'Unknown skin'};
  const pets=new Set(state.pets||[]);
  if(!pets.has(skin.petId))return{ok:false,reason:'Adopt that pet first'};
  const owned=new Set(state.petSkins||[]);
  if(owned.has(skinId))return{ok:false,reason:'Already owned'};
  if((Number(state.coins)||0)<skin.cost)return{ok:false,reason:'Not enough coins'};
  return{ok:true,skin};
}

export function buyPetSkin(state,skinId){
  const check=canBuyPetSkin(state,skinId);
  if(!check.ok)return check;
  state.coins=(Number(state.coins)||0)-check.skin.cost;
  state.petSkins=[...(state.petSkins||[]),skinId];
  if(state.activePet===check.skin.petId)state.activePetSkin=skinId;
  return{ok:true,skin:check.skin};
}

export function setActivePet(state,petId){
  if(!(state.pets||[]).includes(petId))return{ok:false,reason:'Pet not owned'};
  state.activePet=petId;
  const skins=(state.petSkins||[]).filter(id=>{const s=skinById(id);return s&&s.petId===petId});
  if(state.activePetSkin){
    const cur=skinById(state.activePetSkin);
    if(!cur||cur.petId!==petId)state.activePetSkin=skins[0]||null;
  }
  return{ok:true};
}

export function setActivePetSkin(state,skinId){
  if(skinId==null||skinId==='default'){
    state.activePetSkin=null;
    return{ok:true};
  }
  const skin=skinById(skinId);
  if(!skin)return{ok:false,reason:'Unknown skin'};
  if(!(state.petSkins||[]).includes(skinId))return{ok:false,reason:'Skin not owned'};
  if(state.activePet!==skin.petId)return{ok:false,reason:'Equip that pet first'};
  state.activePetSkin=skinId;
  return{ok:true};
}

/** Resolve what the realm stage should show (owned + optional temporary preview). */
export function realmStageView(state,preview=null){
  const buildings=[...(state.realm||[])];
  let ghostBuilding=null;
  if(preview?.type==='building'&&buildingById(preview.id)&&!buildings.includes(preview.id)){
    ghostBuilding=buildingById(preview.id);
  }
  let petId=state.activePet||null;
  let skinId=state.activePetSkin||null;
  let ghostPet=null;
  let previewLabel=null;
  if(preview?.type==='pet'){
    const p=petById(preview.id);
    if(p){
      ghostPet=p;
      petId=p.id;
      skinId=null;
      previewLabel=`Preview: ${p.name}`;
    }
  }else if(preview?.type==='skin'){
    const skin=skinById(preview.id);
    if(skin){
      petId=skin.petId;
      skinId=skin.id;
      ghostPet=petById(skin.petId);
      previewLabel=`Preview: ${skin.name}`;
    }
  }else if(preview?.type==='building'&&ghostBuilding){
    previewLabel=`Preview: ${ghostBuilding.name}`;
  }
  const pet=petId?petById(petId):null;
  const skin=skinId?skinById(skinId):null;
  const petIcon=skin?`${pet?.icon||''}${skin.icon}`:(pet?.icon||null);
  const petArtEntry=skin||pet;
  return{
    buildings:buildings.map(id=>buildingById(id)).filter(Boolean),
    ghostBuilding,
    pet,
    skin,
    petIcon,
    petArtEntry,
    previewLabel,
    isPreview:!!preview
  };
}

export function heroTitle(xp){
  const n=Math.max(0,Number(xp)||0);
  if(n>=5000)return 'Realm Champion';
  if(n>=3000)return 'Master Pathfinder';
  if(n>=1500)return 'Quest Captain';
  if(n>=800)return 'Skill Scout';
  if(n>=300)return 'Practice Apprentice';
  return 'New Adventurer';
}

/** Parent/Admin trophy chips derived from local progress (no cloud). */
export function computeTrophies(state){
  const daysDone=Object.values(state.cleared||{}).filter(Boolean).length;
  const buildings=(state.realm||[]).length;
  const pets=(state.pets||[]).length;
  const skins=(state.petSkins||[]).length;
  const best=Number(state.best)||0;
  const breaks=Number(state.breaksCompleted)||0;
  const coins=Number(state.coins)||0;
  const xp=Number(state.xp)||0;
  const list=[];
  if(daysDone>=1)list.push({id:'first_clear',icon:'🎫',title:'First Day Cleared',detail:`${daysDone} day${daysDone===1?'':'s'} cleared`});
  if(daysDone>=5)list.push({id:'week_warrior',icon:'🗓️',title:'Week Warrior',detail:'5+ days cleared'});
  if(daysDone>=20)list.push({id:'spine_complete',icon:'🏁',title:'20-Day Finisher',detail:'Full intro spine cleared'});
  if(best>=5)list.push({id:'streak5',icon:'🔥',title:'Hot Streak',detail:`Best streak ${best}`});
  if(best>=10)list.push({id:'streak10',icon:'⚡',title:'Focus Flame',detail:`Best streak ${best}`});
  if(breaks>=1)list.push({id:'break1',icon:'🧘',title:'Healthy Breaker',detail:`${breaks} break${breaks===1?'':'s'} completed`});
  if(breaks>=5)list.push({id:'break5',icon:'💧',title:'20–20–20 Champion',detail:`${breaks} healthy breaks`});
  if(buildings>=1)list.push({id:'builder1',icon:'🏕️',title:'Realm Starter',detail:`${buildings} building${buildings===1?'':'s'}`});
  if(buildings>=6)list.push({id:'builder6',icon:'🏰',title:'Realm Architect',detail:`${buildings} buildings`});
  if(pets>=1)list.push({id:'pet1',icon:'🐾',title:'Pet Friend',detail:`${pets} pet${pets===1?'':'s'} adopted`});
  if(skins>=1)list.push({id:'skin1',icon:'✨',title:'Style Stylist',detail:`${skins} pet skin${skins===1?'':'s'}`});
  if(coins>=200||xp>=500)list.push({id:'saver',icon:'🪙',title:'Treasure Scout',detail:`${coins} coins · ${xp} XP`});
  if(list.length===0)list.push({id:'begin',icon:'🌱',title:'Journey Begun',detail:'Trophies appear as the learner practices'});
  return list;
}

export function awardCorrectRewards(state){
  state.streak=(Number(state.streak)||0)+1;
  state.best=Math.max(Number(state.best)||0,state.streak);
  state.xp=(Number(state.xp)||0)+XP_PER_CORRECT;
  const coins=coinsForCorrect(state.streak);
  state.coins=(Number(state.coins)||0)+coins;
  return{xp:XP_PER_CORRECT,coins,mult:streakCoinMultiplier(state.streak),streak:state.streak};
}

/** Mark a day as already paid the day-clear coin award (live clear or backfill). */
export function markDayClearCoinsClaimed(state,topicId){
  if(!topicId)return;
  if(!state.dayClearCoinClaimed||typeof state.dayClearCoinClaimed!=='object')state.dayClearCoinClaimed={};
  state.dayClearCoinClaimed[topicId]=true;
}

/** Cleared days that have not yet been credited day-clear coins (migration + anti-double-pay). */
export function eligibleDayClearCoinIds(state){
  const claimed=state.dayClearCoinClaimed&&typeof state.dayClearCoinClaimed==='object'?state.dayClearCoinClaimed:{};
  const cleared=state.cleared||{};
  return Object.keys(cleared).filter(id=>cleared[id]&&!claimed[id]);
}

export function dayClearCoinBackfillPreview(state){
  const ids=eligibleDayClearCoinIds(state);
  return{days:ids.length,coins:ids.length*COINS_DAY_CLEAR,ids};
}

/** One-time coins-only grant for already-cleared days missing day-clear coin credit. Idempotent. */
export function claimDayClearCoinBackfill(state){
  const preview=dayClearCoinBackfillPreview(state);
  if(preview.days<=0)return{ok:false,days:0,coins:0,reason:'Nothing to claim'};
  state.coins=(Number(state.coins)||0)+preview.coins;
  if(!state.dayClearCoinClaimed||typeof state.dayClearCoinClaimed!=='object')state.dayClearCoinClaimed={};
  for(const id of preview.ids)state.dayClearCoinClaimed[id]=true;
  return{ok:true,days:preview.days,coins:preview.coins};
}

/** Live day clear: XP + coins. Pass topicId so the day is marked coin-credited (not reclaimable via backfill). */
export function awardDayClearRewards(state,topicId){
  state.xp=(Number(state.xp)||0)+XP_DAY_CLEAR;
  state.coins=(Number(state.coins)||0)+COINS_DAY_CLEAR;
  markDayClearCoinsClaimed(state,topicId);
  return{xp:XP_DAY_CLEAR,coins:COINS_DAY_CLEAR};
}

export function awardBreakBonus(state){
  state.breaksCompleted=(Number(state.breaksCompleted)||0)+1;
  state.coins=(Number(state.coins)||0)+COINS_BREAK_BONUS;
  return{coins:COINS_BREAK_BONUS,breaksCompleted:state.breaksCompleted};
}
