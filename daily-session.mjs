import { generateProblem } from './curriculum.mjs';

export const CORE_DAILY_COUNT = 10;
export const LEVEL_COUNTS = Object.freeze({ standard: 3, complex: 4, word: 3 });
export const NC_LOCATIONS = Object.freeze(['Monroe','Waxhaw','Indian Trail','Charlotte','Marshville','Weddington','Union County']);

const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[R(0,a.length-1)];
const signed=n=>n<0?`(${n})`:`${n}`;
function choices(answer,spread=8){const set=new Set([String(answer)]);let guard=0;while(set.size<4&&guard++<100){if(!Number.isNaN(Number(answer))){const d=R(-spread,spread)||1;set.add(String(Number(answer)+d))}else set.add(String(R(-12,24)))}return [...set].slice(0,4).sort(()=>Math.random()-.5)}
function problem(q,a,explain,level,extra={}){return{q,a:String(a),choices:choices(a),explain,level,...extra}}

function complexInteger(topicId){
 if(topicId==='ns_signs'||topicId==='ns_add'){const a=R(-15,15),b=R(-12,12),c=R(-10,10),ans=a+b-c;return problem(`${a} + ${signed(b)} − ${signed(c)} = ?`,ans,`Work left to right with signed moves. ${a}+${b}−${c}=${ans}.`,'complex',{strategy:'Number Line / Tug-of-War'})}
 if(topicId==='ns_sub'){const a=R(-15,15),b=R(-12,12),c=R(-10,10),ans=a-b+c;return problem(`${a} − ${signed(b)} + ${signed(c)} = ?`,ans,`Use KCC first: ${a}+${signed(-b)}+${signed(c)}=${ans}.`,'complex',{strategy:'KCC'})}
 if(topicId==='ns_mult'){const a=R(-9,9)||-4,b=R(-8,8)||3,c=R(-5,5)||2,ans=a*b+c;return problem(`${signed(a)} × ${signed(b)} + ${signed(c)} = ?`,ans,`Multiply first using sign rules, then add ${c}. Result: ${ans}.`,'complex',{strategy:'PEMDAS + sign rules'})}
 const den=pick([4,5,8,10]),a=R(1,den-1),b=R(1,den-1),ans=(a+b)/den;return problem(`${a}/${den} + ${b}/${den} = ? Give the decimal.`,Number(ans.toFixed(2)),`Add the numerators because the denominators match, then divide by ${den}.`,'complex',{strategy:'Common denominator'})
}

function complexRatio(topicId){
 if(topicId==='rp_percent'){const price=pick([40,60,80,100,120,200]),pct=pick([10,20,25,30,40]),discount=price*pct/100,ans=price-discount;return problem(`A ${price}-coin item is ${pct}% off. What is the sale price?`,ans,`Find ${pct}% of ${price} (${discount}), then subtract it: ${price}-${discount}=${ans}.`,'complex',{strategy:'Percent → decimal → multiply → subtract'})}
 const rate=R(2,9),first=R(2,6),second=R(7,15),ans=rate*second;return problem(`${first} supplies cost ${rate*first} coins. At the same rate, what do ${second} supplies cost?`,ans,`Find the unit rate: ${rate*first}÷${first}=${rate}, then multiply ${rate}×${second}=${ans}.`,'complex',{strategy:'Find unit rate, then scale'})
}

function complexAlgebra(topicId){
 if(topicId==='ee_dist'||topicId==='ee_like'||topicId==='ee_boss'){const a=R(2,6),b=R(2,8),c=R(2,7),ans=a*b+c;return problem(`Evaluate ${a}(${b}) + ${c}.`,ans,`Use multiplication before addition: ${a}×${b}=${a*b}; then +${c}=${ans}.`,'complex',{strategy:'PEMDAS / distribute when variables appear'})}
 const x=R(-6,10)||4,a=R(2,6),b=R(-8,8),rhs=a*x+b;return problem(`Solve ${a}x ${b>=0?'+':'−'} ${Math.abs(b)} = ${rhs}.`,x,`Undo ${b>=0?'addition':'subtraction'} first, then divide by ${a}. x=${x}.`,'complex',{strategy:'Inverse operations'})
}

function complexGeometryStats(topicId){
 if(topicId==='g_scale'){const scale=R(2,6),d=R(3,12),extra=R(1,4),ans=scale*(d+extra);return problem(`A scale is 1 cm : ${scale} m. Two connected segments measure ${d} cm and ${extra} cm. What is the total real length?`,ans,`Add drawing lengths first (${d+extra} cm), then multiply by ${scale}.`,'complex',{strategy:'Scale factor'})}
 if(topicId==='g_circle'){const r=R(2,9),ans=Number((2*3.14*r+2*r).toFixed(2));return problem(`A semicircular path uses half a circle of radius ${r} m plus its diameter. Using π≈3.14, what is its perimeter?`,ans,`Half circumference is πr=${(3.14*r).toFixed(2)} and diameter is ${2*r}. Add them.`,'complex',{strategy:'Circle formulas'})}
 if(topicId==='g_angles'){const a=R(25,140),ans=180-a;return problem(`Two adjacent angles form a straight line. One is ${a}°. Find the other.`,ans,`Straight-line angles total 180°: 180−${a}=${ans}.`,'complex',{strategy:'Supplementary angles'})}
 if(topicId==='sp_prob'){const red=R(2,7),blue=R(2,7),green=R(1,5),total=red+blue+green,ans=`${red+blue}/${total}`;return{q:`A bag has ${red} red, ${blue} blue, and ${green} green gems. What is P(red or blue)?`,a:ans,choices:[ans,`${red}/${total}`,`${blue}/${total}`,`${green}/${total}`].sort(()=>Math.random()-.5),explain:`Favorable outcomes=${red+blue}; total=${total}; probability=${ans}.`,level:'complex',strategy:'Favorable ÷ total'}}
 const vals=[R(3,12),R(3,12),R(3,12),R(3,12),R(3,12)],sum=vals.reduce((x,y)=>x+y,0),ans=sum/5;return problem(`Find the mean of ${vals.join(', ')}.`,Number(ans.toFixed(1)),`Add the five values (${sum}) and divide by 5.`,'complex',{strategy:'Mean = sum ÷ count'})
}

export function generateComplexProblem(topicId){
 if(topicId.startsWith('ns_'))return complexInteger(topicId);
 if(topicId.startsWith('rp_'))return complexRatio(topicId);
 if(topicId.startsWith('ee_'))return complexAlgebra(topicId);
 return complexGeometryStats(topicId);
}

export function generateNCWordProblem(topicId){
 const loc=pick(NC_LOCATIONS);
 if(topicId==='ns_signs'||topicId==='ns_add'||topicId==='ns_sub'){
   const type=pick(['temperature','bank','elevation']);
   if(type==='temperature'){const start=R(-8,18),change=R(-18,18)||-7,ans=start+change;return problem(`In ${loc}, the temperature was ${start}°F. It then changed by ${change}°. What was the new temperature?`,ans,`Start at ${start} and apply the signed change ${change}. Result: ${ans}°F.`,'word',{location:loc,strategy:change<0?'Number Line / KCC':'Number Line / Tug-of-War'})}
   if(type==='bank'){const start=-R(5,40),deposit=R(20,70),ans=start+deposit;return problem(`A game-style practice account starts at −$${Math.abs(start)}. A ${loc} fundraiser adds $${deposit}. What is the new balance?`,ans,`${start}+${deposit}=${ans}. Different signs use the Tug-of-War idea.`,'word',{location:loc,strategy:'Tug-of-War'})}
   const start=-R(5,40),end=R(5,35),ans=end-start;return problem(`On a fictional trail near ${loc}, a hiker starts ${Math.abs(start)} ft below sea level and finishes ${end} ft above sea level. What vertical distance did the hiker climb?`,ans,`Distance = final − starting = ${end}−(${start})=${ans}. KCC changes this to ${end}+${Math.abs(start)}.`,'word',{location:loc,strategy:'KCC'})
 }
 if(topicId==='ns_mult'||topicId==='ns_rational'){const groups=R(3,8),each=R(2,12),ans=groups*each;return problem(`At a fictional ${loc} summer event, ${groups} teams each collect ${each} tokens. How many tokens are collected altogether?`,ans,`${groups}×${each}=${ans}.`,'word',{location:loc,strategy:'Multiply equal groups'})}
 if(topicId.startsWith('rp_')){const rate=R(2,8),qty=R(6,14),ans=rate*qty;return problem(`At a fictional ${loc} community event, each table needs ${rate} water bottles. How many bottles are needed for ${qty} tables?`,ans,`Unit rate ${rate} bottles/table × ${qty} tables = ${ans}.`,'word',{location:loc,strategy:'Unit rate'})}
 if(topicId.startsWith('ee_')){const x=R(3,12),fee=R(2,8),total=2*x+fee;return problem(`A fictional ${loc} club charges $${fee} once plus $2 per activity. The total is $${total}. How many activities were purchased?`,x,`Model 2x+${fee}=${total}. Subtract ${fee}, then divide by 2.`,'word',{location:loc,strategy:'Inverse operations'})}
 if(topicId==='g_scale'||topicId==='g_circle'||topicId==='g_angles'){const l=R(5,14),w=R(3,10),ans=l*w;return problem(`A fictional learning garden in ${loc} is ${l} m by ${w} m. What is its area?`,ans,`Area = length × width = ${l}×${w}=${ans} m².`,'word',{location:loc,strategy:'Area model'})}
 if(topicId==='sp_prob'){const red=R(2,8),blue=R(2,8),total=red+blue,ans=`${red}/${total}`;return{q:`At a fictional ${loc} math fair, a prize bag has ${red} red and ${blue} blue tokens. What is P(red)?`,a:ans,choices:[ans,`${blue}/${total}`,`${red}/${blue}`,`1/${total}`].sort(()=>Math.random()-.5),explain:`There are ${red} favorable outcomes out of ${total} total.`,level:'word',location:loc,strategy:'Favorable ÷ total'}}
 const n=pick([20,25,40,50]),yes=R(Math.ceil(n*.4),Math.floor(n*.8)),pop=pick([200,300,400,500]),ans=Math.round(yes/n*pop);return problem(`A random sample of ${n} people at a fictional ${loc} survey has ${yes} supporting a plan. About how many of ${pop} similar people would you predict support it?`,ans,`Use the sample proportion ${yes}/${n} × ${pop} ≈ ${ans}.`,'word',{location:loc,strategy:'Sample proportion'})
}

export function generateTieredProblem(topicId,level){
 if(level==='standard')return {...generateProblem(topicId),level:'standard'};
 if(level==='complex')return generateComplexProblem(topicId);
 if(level==='word')return generateNCWordProblem(topicId);
 throw new Error(`Unknown practice level: ${level}`);
}

export function generateDailyBenchmark(topicId){
 const questions=[];
 for(let i=0;i<LEVEL_COUNTS.standard;i++)questions.push(generateTieredProblem(topicId,'standard'));
 for(let i=0;i<LEVEL_COUNTS.complex;i++)questions.push(generateTieredProblem(topicId,'complex'));
 for(let i=0;i<LEVEL_COUNTS.word;i++)questions.push(generateTieredProblem(topicId,'word'));
 return questions.map((q,i)=>({...q,number:i+1}));
}
