/** Cosmetic rewards: coins, streak multipliers, realm buildings, trophies.
 *  Coins never unlock lessons or skip mastery gates.
 */

export const XP_PER_CORRECT=20;
export const XP_DAY_CLEAR=50;
export const COINS_PER_CORRECT=10;
export const COINS_DAY_CLEAR=100;
export const COINS_BREAK_BONUS=25;

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
  {id:'signpost',name:'Signpost Camp',icon:'🏕️',cost:50,blurb:'Your quest base camp.'},
  {id:'banner',name:'Quest Banner',icon:'🚩',cost:60,blurb:'A flag for every cleared day.'},
  {id:'bridge',name:'Number Line Bridge',icon:'🌉',cost:80,blurb:'Cross from negative to positive.'},
  {id:'arena',name:'Tug-of-War Arena',icon:'🏟️',cost:100,blurb:'Where opposite signs settle scores.'},
  {id:'garden',name:'Fraction Garden',icon:'🌻',cost:120,blurb:'Equal plots for equal denominators.'},
  {id:'market',name:'Ratio Market',icon:'🏪',cost:150,blurb:'Unit rates for every stall.'},
  {id:'lab',name:'Algebra Lab',icon:'🧪',cost:180,blurb:'Distribute, combine, solve.'},
  {id:'tower',name:'Balance Tower',icon:'🗼',cost:200,blurb:'Keep both sides even.'},
  {id:'observatory',name:'Circle Observatory',icon:'🔭',cost:220,blurb:'π under the stars.'},
  {id:'fountain',name:'Probability Fountain',icon:'⛲',cost:250,blurb:'Favorable drops ÷ total drops.'},
  {id:'keep',name:'Data Keep',icon:'🏰',cost:280,blurb:'Means, samples, and stories.'},
  {id:'statue',name:'Hero Statue',icon:'🗿',cost:300,blurb:'A monument to steady practice.'}
];

export function buildingById(id){
  return REALM_BUILDINGS.find(b=>b.id===id)||null;
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

export function awardDayClearRewards(state){
  state.xp=(Number(state.xp)||0)+XP_DAY_CLEAR;
  state.coins=(Number(state.coins)||0)+COINS_DAY_CLEAR;
  return{xp:XP_DAY_CLEAR,coins:COINS_DAY_CLEAR};
}

export function awardBreakBonus(state){
  state.breaksCompleted=(Number(state.breaksCompleted)||0)+1;
  state.coins=(Number(state.coins)||0)+COINS_BREAK_BONUS;
  return{coins:COINS_BREAK_BONUS,breaksCompleted:state.breaksCompleted};
}
