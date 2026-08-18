import {TOPICS} from './curriculum.mjs';

const PRAISE=[
  'You are building real math muscle — keep that momentum!',
  'That accuracy streak shows careful thinking. Awesome focus!',
  'You explained your way through tough ideas. That is true mastery energy!',
  'Your persistence is paying off. Champions practice on purpose!',
  'Look at that growth — you are leveling up like a quest hero!'
];

export function praiseForStrength(row,index=0){
  const day=TOPICS.indexOf(row.topic)+1;
  const acc=row.accuracy==null?'solid work':`${Math.round(row.accuracy*100)}% accuracy`;
  return{
    day,
    title:row.topic.title,
    icon:row.topic.icon,
    message:`${PRAISE[index%PRAISE.length]} Day ${day} (${row.topic.title}) is a strength at ${row.mastery}% mastery · ${acc}.`,
    anim:'praiseBounce'
  };
}

function step(caption,visual){return{caption,visual}}

const VIS={
  numberline:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Watch the move</div><div class="nlAnim"><span class="nlDot pos"></span></div></div>`,
  numberlineNeg:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Below zero</div><div class="nlAnim"><span class="nlDot negm"></span></div></div>`,
  tug:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Tug-of-War</div><div class="tug"><span class="side">−7</span><span class="rope"><span class="knot"></span></span><span class="side big">+10</span></div></div>`,
  kcc:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Keep · Change · Change</div><div class="kcc"><span>8</span><span class="flip">−</span><span class="flip delay">(−3)</span><span>→</span><strong>8 + 3</strong></div></div>`,
  signs:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Sign rule cycle</div><div class="signCycle"><span>(−)×(−)=+</span><span>(+)×(−)=−</span><span>(+)×(+)=+</span></div></div>`,
  fraction:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Same denominator → add tops</div><div class="fracBar"><i style="width:40%"></i><i class="b" style="width:30%"></i></div><div class="gifNote">2/5 + 1/5 = 3/5</div></div>`,
  unit:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Find “for 1”</div><div class="unitAnim"><span class="bag">12</span><span class="div">÷</span><span class="bag">3</span><span class="eq">=</span><span class="bag hot">4</span></div></div>`,
  prop:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">y = kx stays proportional</div><div class="propAnim"><span>x</span><span class="arrow">→</span><span>kx</span></div></div>`,
  percent:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Percent → decimal → multiply</div><div class="pctAnim"><span>25%</span><span class="arrow">→</span><span>0.25</span><span class="arrow">→</span><span>× price</span></div></div>`,
  dist:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Distribute to every term</div><div class="distAnim"><span>3(x+4)</span><span class="arrow">→</span><span>3x+12</span></div></div>`,
  like:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Combine matching tiles</div><div class="likeAnim"><span class="tile">3x</span><span class="tile">5x</span><span class="arrow">→</span><span class="tile hot">8x</span></div></div>`,
  balance:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Undo both sides</div><div class="balAnim"><span class="pan">3x+4</span><span class="eq">=</span><span class="pan">19</span><div class="gifNote">−4 both sides, then ÷3</div></div></div>`,
  ineq:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Negative flip rule</div><div class="ineqAnim"><span>÷(−)</span><span class="arrow">→</span><span class="flipSign">&lt; becomes &gt;</span></div></div>`,
  scale:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Scale factor</div><div class="scaleAnim"><span class="map">3 cm</span><span class="arrow">×4</span><span class="real">12 m</span></div></div>`,
  circle:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">C=2πr · A=πr²</div><div class="circleAnim"><span class="orb"></span></div></div>`,
  angles:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Straight line = 180°</div><div class="angAnim"><span class="wedge a"></span><span class="wedge b"></span></div></div>`,
  prob:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Favorable ÷ total</div><div class="probAnim"><span class="gem r"></span><span class="gem r"></span><span class="gem b"></span><span class="gem b"></span><span class="gem b"></span><div class="gifNote">P(red)=2/5</div></div></div>`,
  data:`<div class="gifFrame" aria-hidden="true"><div class="gifCap">Mean = sum ÷ count</div><div class="dataAnim"><span>4</span><span>6</span><span>8</span><span class="arrow">→</span><span class="hot">6</span></div></div>`
};

const BY_ID={
  ns_signs:[step('Positive = up/right/gain. Negative = down/left/loss.',VIS.numberline),step('Zero is the starting point — drops below zero land on negatives.',VIS.numberlineNeg),step('Try a tiny story: “4 floors below lobby” → −4.',VIS.numberlineNeg)],
  ns_add:[step('Add positive → slide right. Add negative → slide left.',VIS.numberline),step('Different signs? Tug-of-War: bigger absolute value wins its sign.',VIS.tug),step('Example: −7 + 10 = +3 because |10| > |−7|.',VIS.tug)],
  ns_sub:[step('KCC rewrites subtraction as addition.',VIS.kcc),step('Keep the first number. Change − to +. Change the second number to its opposite.',VIS.kcc),step('Example: 8 − (−3) → 8 + 3 = 11.',VIS.kcc)],
  ns_mult:[step('Same signs → positive. Different signs → negative.',VIS.signs),step('Then multiply or divide the absolute values.',VIS.signs),step('Check the sign first, then compute the size.',VIS.signs)],
  ns_rational:[step('Same denominator? Add or subtract the numerators only.',VIS.fraction),step('Fraction → decimal: divide top by bottom (3÷4=0.75).',VIS.fraction),step('Keep denominators matching before you combine.',VIS.fraction)],
  rp_unit:[step('Unit rate asks “how much for 1?”',VIS.unit),step('Divide total by the number of units.',VIS.unit),step('Example: 12 ÷ 3 = 4 per lap.',VIS.unit)],
  rp_prop:[step('In y = kx, k stays constant.',VIS.prop),step('Find k with k = y ÷ x.',VIS.prop),step('Scale with the same k to any new x.',VIS.prop)],
  rp_percent:[step('Percent means per 100. Convert to a decimal.',VIS.percent),step('Multiply the decimal by the amount.',VIS.percent),step('Discount subtracts; markup adds.',VIS.percent)],
  rp_mixed:[step('Find the rate for 1, then multiply to scale.',VIS.unit),step('Keep the same rate across the story.',VIS.prop),step('Check: does your answer grow sensibly with more items?',VIS.unit)],
  rp_boss:[step('Choose the tool: unit rate, k, or percent.',VIS.prop),step('“For 1?” → unit rate. “y=kx?” → find k. “% off?” → decimal × amount.',VIS.percent),step('Mix tools carefully — one clear plan per problem.',VIS.unit)],
  ee_dist:[step('Multiply the outside factor by every term inside.',VIS.dist),step('a(b+c) = ab + ac.',VIS.dist),step('Example: 3(x+4) = 3x+12.',VIS.dist)],
  ee_like:[step('Only like terms combine (same variable part).',VIS.like),step('Add or subtract coefficients; keep the variable.',VIS.like),step('Constants stay on their own unless combining constants.',VIS.like)],
  ee_eq:[step('Undo addition/subtraction first, then multiply/divide.',VIS.balance),step('Do the same operation to both sides.',VIS.balance),step('Check by substituting your x back in.',VIS.balance)],
  ee_ineq:[step('Solve like an equation — until a negative multiply/divide.',VIS.ineq),step('Multiplying or dividing by a negative flips the inequality sign.',VIS.ineq),step('Read the solution as a set of values, not one number.',VIS.ineq)],
  ee_boss:[step('Simplify first (distribute / like terms) when needed.',VIS.dist),step('Then use inverse operations to solve.',VIS.balance),step('Name the strategy before you compute.',VIS.like)],
  g_scale:[step('Scale multiplies drawing length by the real factor.',VIS.scale),step('Add connected drawing lengths before scaling when needed.',VIS.scale),step('Units matter: cm on map → m in real life.',VIS.scale)],
  g_circle:[step('Radius is half the diameter.',VIS.circle),step('C = 2πr and A = πr² (π≈3.14 here).',VIS.circle),step('Pick circumference vs area from the question words.',VIS.circle)],
  g_angles:[step('Complementary → 90°. Supplementary → 180°. Vertical → equal.',VIS.angles),step('Straight line pairs are supplementary.',VIS.angles),step('Find the partner by subtracting from 90 or 180.',VIS.angles)],
  sp_prob:[step('Probability = favorable ÷ total.',VIS.prob),step('Count carefully — every outcome in the bag matters.',VIS.prob),step('A probability is between 0 and 1 (or 0%–100%).',VIS.prob)],
  sp_data:[step('Mean = sum of values ÷ how many values.',VIS.data),step('Sample proportion × population ≈ prediction.',VIS.data),step('Random representative samples make better predictions.',VIS.data)]
};

export function boostStepsForTopic(topicId){
  return BY_ID[topicId]||[step('Read the rule in plain language.',VIS.numberline),step('Watch the animated model.',VIS.numberline),step('Try one guided example before the benchmark.',VIS.numberline)];
}

function escText(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

export function boostPathHtml(topic,{positiveLead=''}={}){
  const day=TOPICS.indexOf(topic)+1;
  const steps=boostStepsForTopic(topic.id).map((s,i)=>`<div class="boostStep"><div class="boostNum">Step ${i+1}</div><p class="concept">${escText(s.caption)}</p>${s.visual}</div>`).join('');
  return`<p class="small">🎬 GIF-style boost path · Day ${day}</p>
<h2>${topic.icon} Let’s fine-tune: ${escText(topic.title)}</h2>
${positiveLead?`<div class="praiseBanner"><div class="gifFrame praise praiseBounce"><div class="celebrate">🌟 🎉 ⭐</div></div><p class="concept">${escText(positiveLead)}</p></div>`:''}
<p class="concept">Here is a slower, clearer walkthrough before you practice. Watch each animated step, then try it yourself.</p>
<div class="boostPath">${steps}</div>`;
}

export function improvementPreviewHtml(topic,planAction,{forParent=false}={}){
  const day=TOPICS.indexOf(topic)+1;
  const steps=boostStepsForTopic(topic.id).slice(0,2).map((s,i)=>`<div class="boostStep mini"><div class="boostNum">${i+1}</div><p class="small">${escText(s.caption)}</p>${s.visual}</div>`).join('');
  const note=forParent?`<p class="small parentNote">Read-only Parent/Admin view — Practice lives on the student coaching plan and does not run from here, so opening this panel cannot change student progress.</p>`:'';
  return`<div class="coachItem boostPreview"><b>${topic.icon} Day ${day}: ${escText(topic.title)}</b><span class="small">${escText(planAction)}</span><div class="boostPath">${steps}</div>${note}</div>`;
}

export function strengthsPraiseHtml(strengths){
  if(!strengths.length)return'<p class="small">Keep practicing — your first strength badges will pop up with celebration animations!</p>';
  return strengths.map((row,i)=>{
    const p=praiseForStrength(row,i);
    return`<div class="coachItem praiseCard"><div class="gifFrame praise praiseBounce"><div class="celebrate">🌟 🎉 ⭐</div></div><b>${p.icon} Day ${p.day}: ${escText(p.title)}</b><p class="concept">${escText(p.message)}</p></div>`;
  }).join('');
}
