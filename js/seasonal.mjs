/** Seasonal Home banners — local-only, dismissible, no remote assets. */

export const SEASONAL_DISMISS_PREFIX='mq7SeasonDismiss:';

/** Active seasons by calendar month (1–12). Overlaps pick the first match. */
export const SEASONS=[
  {
    id:'back_to_school',
    label:'Back to school!',
    months:[8,9],
    headline:'Back to school — you’ve got this!',
    blurb:'New year energy: warm up, practice, and grow your realm. Stars are for effort, not perfection.',
    cheers:[
      '📚 Pack confidence for every problem.',
      '⭐ Small daily practice beats one long cram.',
      '🚀 Mistakes are quest markers — keep going!',
      '🌟 You are building math strength week by week.'
    ]
  }
];

export function activeSeason(now=new Date()){
  const month=now.getMonth()+1;
  return SEASONS.find(s=>s.months.includes(month))||null;
}

export function seasonDismissKey(seasonId){
  return`${SEASONAL_DISMISS_PREFIX}${seasonId}`;
}

export function isSeasonDismissed(seasonId,storage=typeof localStorage!=='undefined'?localStorage:null){
  if(!seasonId||!storage)return false;
  try{return storage.getItem(seasonDismissKey(seasonId))==='1'}catch{return false}
}

export function dismissSeason(seasonId,storage=typeof localStorage!=='undefined'?localStorage:null){
  if(!seasonId||!storage)return false;
  try{storage.setItem(seasonDismissKey(seasonId),'1');return true}catch{return false}
}

export function shouldShowSeasonalBanner(now=new Date(),storage=typeof localStorage!=='undefined'?localStorage:null){
  const season=activeSeason(now);
  if(!season)return null;
  if(isSeasonDismissed(season.id,storage))return null;
  return season;
}

export function prefersReducedMotion(win=typeof window!=='undefined'?window:null){
  try{return!!win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches}catch{return false}
}
