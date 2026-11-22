const SUPABASE_URL='https://qmyylvwrdostziwsafmn.supabase.co',SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXlsdndyZG9zdHppd3NhZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDU5NzUsImV4cCI6MjExMDgyMTk3NX0.u-cx6z2C-8jQzozEqvKFUNK0oiGQBmjkccb9YO0KtGo';
// Optional free TURN relay so video works on every network: sign up at metered.ca, then fill these in.
const METERED={app:'',key:''};
const show=t=>{document.getElementById('app').innerHTML='<div class=card><h2>Setup needed</h2><p>'+t+'</p></div>'};
window.onerror=m=>show('Error: '+m);window.onunhandledrejection=e=>show('Error: '+(e.reason&&e.reason.message||e.reason));
let db;
if(typeof supabase==='undefined')show('Could not load the Supabase library. Check your internet or ad blocker.');
else if(!/^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL)||SUPABASE_KEY.startsWith('YOUR_'))show('Paste your Supabase Project URL and anon key at the top of app.js.');
else db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:window.sessionStorage}});

// 15 topics. Part 1 asks about YOU, part 2 asks what you want in a PARTNER. Same options, so answers can be compared.
const OPT=[
"Social and outgoing|extrovert;A mix of both|ambivert;Quiet and homely|introvert;Active and outdoorsy|active",
"Talks it out right away|direct;Takes space first|needs-space;Defuses with humour|humour-first;Stays quiet and calm|reserved",
"Career-driven|career-driven;Building a business|entrepreneur;Work-life balance|balance-seeker;Still exploring|explorer",
"Words and texts|words;Gifts and surprises|gifts;Quality time|quality-time;Helping out|acts-of-service",
"Early bird, before 11|early-bird;Around midnight|midnight;Night owl, after 1|night-owl",
"Never|teetotaler;Socially|social-drinker;Regularly|drinks",
"Never|non-smoker;Occasionally|occasional-smoker;Regularly|smoker",
"Vegetarian|vegetarian;Eggetarian|eggetarian;Non-veg|non-veg;Vegan|vegan",
"Gym or sport 4+ days|fitness-freak;1 to 3 times a week|moves-weekly;Walks count|casual-active;Not really|couch-loving",
"Saves and invests|saver;Balanced|balanced;Enjoys spending|spender;Supports family first|family-provider",
"Loves them|loves-tattoos;Has or wants one|inked;Not for them|no-tattoos",
"Deeply religious|religious;Spiritual, not religious|spiritual;Not religious|non-religious;Respects all, practises little|open-faith",
"Very close, daily calls|family-first;Close but independent|independent;Prefers own space|own-space",
"Wants kids|wants-kids;Maybe later|kids-maybe;No kids|child-free",
"Marriage within 2 years|marriage;Long-term, no timeline|long-term;Dating, seeing where it goes|open-dating;Friends first|friends-first"];
const ME=["How do you recharge after a long week?","When you disagree with someone close, you…","Where do you see your career in five years?","How do you show love?","What is your usual bedtime?","Your relationship with alcohol?","Your relationship with smoking?","What is on your plate, mostly?","How active are you?","What do you do on salary day?","How do you feel about tattoos and piercings?","What role does faith play in your life?","How involved is your family in your life?","Do you want kids someday?","What are you looking for here?"];
const PA=["What social energy fits you best in a partner?","In a disagreement, you want a partner who…","What career mindset do you want in a partner?","How would you like to be loved?","What bedtime would suit you in a partner?","How much drinking are you okay with in a partner?","How do you feel about a partner who smokes?","What food habits do you want in a partner?","How active should your partner be?","How should your partner handle money?","Tattoos and piercings on your partner?","How religious should your partner be?","How close should your partner be to their family?","What should your partner want about kids?","What should your partner be looking for?"];
const QS=OPT.map(o=>o.split(';').map(x=>x.split('|'))),N=QS.length;
const CO=['India','United States','United Kingdom','UAE','Singapore','Canada','Australia','Germany','Other'];
// States / regions for each country. The State dropdown refills when the Country changes.
const STS={
'India':'Andhra Pradesh,Arunachal Pradesh,Assam,Bihar,Chhattisgarh,Goa,Gujarat,Haryana,Himachal Pradesh,Jharkhand,Karnataka,Kerala,Madhya Pradesh,Maharashtra,Manipur,Meghalaya,Mizoram,Nagaland,Odisha,Punjab,Rajasthan,Sikkim,Tamil Nadu,Telangana,Tripura,Uttar Pradesh,Uttarakhand,West Bengal,Andaman and Nicobar Islands,Chandigarh,Dadra and Nagar Haveli and Daman and Diu,Delhi,Jammu and Kashmir,Ladakh,Lakshadweep,Puducherry',
'United States':'Alabama,Alaska,Arizona,Arkansas,California,Colorado,Connecticut,Delaware,Florida,Georgia,Hawaii,Idaho,Illinois,Indiana,Iowa,Kansas,Kentucky,Louisiana,Maine,Maryland,Massachusetts,Michigan,Minnesota,Mississippi,Missouri,Montana,Nebraska,Nevada,New Hampshire,New Jersey,New Mexico,New York,North Carolina,North Dakota,Ohio,Oklahoma,Oregon,Pennsylvania,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Vermont,Virginia,Washington,West Virginia,Wisconsin,Wyoming,District of Columbia',
'United Kingdom':'England,Scotland,Wales,Northern Ireland',
'UAE':'Abu Dhabi,Dubai,Sharjah,Ajman,Umm Al Quwain,Ras Al Khaimah,Fujairah',
'Singapore':'Singapore',
'Canada':'Alberta,British Columbia,Manitoba,New Brunswick,Newfoundland and Labrador,Nova Scotia,Ontario,Prince Edward Island,Quebec,Saskatchewan,Northwest Territories,Nunavut,Yukon',
'Australia':'New South Wales,Victoria,Queensland,Western Australia,South Australia,Tasmania,Australian Capital Territory,Northern Territory',
'Germany':'Baden-Württemberg,Bavaria,Berlin,Brandenburg,Bremen,Hamburg,Hesse,Lower Saxony,Mecklenburg-Vorpommern,North Rhine-Westphalia,Rhineland-Palatinate,Saarland,Saxony,Saxony-Anhalt,Schleswig-Holstein,Thuringia',
'Other':'Other'};
const fillSt=v=>{const a=(STS[$('#co').value]||'Other').split(',');$('#st').innerHTML=a.map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('')};
const SC='<optgroup label="By distance">'+[5,10,25,50,100,250].map(k=>`<option value=km:${k}>Within ${k} km</option>`).join('')+'</optgroup><optgroup label="By area"><option value=district>Same district</option><option value=state>Same state</option><option value=country>Same country</option><option value=world>Anywhere in the world</option></optgroup>';
const lab=s=>s.startsWith('km')?'Within '+s.split(':')[1]+' km':{district:'Same district',state:'Same state',country:'Same country',world:'Anywhere in the world'}[s];

const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const age=d=>Math.floor((Date.now()-new Date(d))/31557600000),msg=t=>{const m=$('#m');if(m)m.textContent=t};
let ch,unread={},names={},me,uid,view,qi=0,S={},W={},NT={a:{},p:{}},pics=[],ok,geo,peer,timer,liked=[],likes=[];
const PH={};
const GRIEVANCE='grievance@your-domain.com';
const FOOT=`<footer class=foot><a href=legal.html#terms target=_blank>Terms</a> · <a href=legal.html#privacy target=_blank>Privacy</a> · <a href=legal.html#grievance target=_blank>Grievance Officer</a> · <a href="mailto:${GRIEVANCE}">${GRIEVANCE}</a></footer>`;
const app=h=>{$('#app').innerHTML=h+FOOT};
const pill=(k,v,c,t)=>`<label class=pill><input type=checkbox class=${k} value="${v}" ${c?'checked':''}><span>${t}</span></label>`;
const tot=()=>Object.values(unread).reduce((a,b)=>a+b,0),dot=()=>tot()?` <b class=dot>${tot()}</b>`:'';
const hdr=()=>`<header><div class=logo><i>♥</i>SoulSync</div>${me?`<div class=tabs>${[['feed','Matches'],['likes','Liked you'],['test','pH Quiz'],['chat','Chat'],['profile','Profile'],['plus','⭐ Plus']].map(([v,t])=>`<a class="${view==v?'on':''}" onclick="go('${v}')">${t}${v=='chat'?dot():''}</a>`).join('')}<a onclick=out()>Log out</a></div>`:uid?'<div class=tabs><a onclick=out()>Log out</a></div>':''}</header>`;

// floating hearts + click burst
for(let i=0;i<18;i++){const h=document.createElement('span');h.className='hrt';h.textContent='♥';h.style.cssText=`left:${Math.random()*100}%;font-size:${14+Math.random()*44}px;animation-duration:${9+Math.random()*12}s;animation-delay:-${Math.random()*18}s`;$('#hearts').appendChild(h)}
function burst(x,y){for(let i=0;i<10;i++){const h=document.createElement('span');h.className='burst';h.textContent='♥';h.style.cssText=`left:${x}px;top:${y}px;--dx:${(Math.random()-.5)*180}px;--dy:${-60-Math.random()*130}px;font-size:${14+Math.random()*18}px`;document.body.appendChild(h);setTimeout(()=>h.remove(),1000)}}

function go(v){clearInterval(timer);if(!me&&['feed','chat','test','likes','plus'].includes(v))v='profile';view=v;if(v=='test'){qi=-1;S=structuredClone(me?.answers||{});W=structuredClone(me?.wants||{});NT={a:{...me?.notes?.a},p:{...me?.notes?.p}}}({auth,profile,test,feed,chat,likes:likesPage,plus:plusPage})[v]()}
async function boot(){const{data:{session}}=await db.auth.getSession();if(!session)return go('auth');uid=session.user.id;listen();initCalls();
 me=(await db.from('profiles').select('*').eq('id',uid).maybeSingle()).data;go(me?'feed':'profile')}

function auth(){app(`<div class=hero><div class=big>♥</div><h1>SoulSync</h1><p>Where habits meet hearts</p></div><div class="card auth"><h2>Welcome</h2><p class=hint>Log in, or create an account to find people who fit your life.</p><div class=f><input id=e type=email placeholder="Email"></div><div class=f style="margin-top:12px"><input id=p type=password placeholder="Password (6+ characters)"></div><label class=chk><input type=checkbox id=ag>I am 18 or older and agree to the <a href=legal.html#terms target=_blank>Terms</a> and <a href=legal.html#privacy target=_blank>Privacy Policy</a> (needed to create an account)</label><p id=m></p><button class="btn pri" onclick="sign('in')">Log in ♥</button><button class=btn onclick="sign('up')">Create account</button></div>`)}
async function sign(k){if(k=='up'&&!$('#ag').checked)return msg('Please confirm you are 18+ and accept the Terms and Privacy Policy.');const c={email:$('#e').value,password:$('#p').value};const r=k=='up'?await db.auth.signUp(c):await db.auth.signInWithPassword(c);r.error?msg(r.error.message):boot()}
async function out(){closeCalls();if(ch){db.removeChannel(ch);ch=null}unread={};pics=[];await db.auth.signOut();me=null;uid=null;go('auth')}

function profile(){if(me)pics=[...(me.photos||(me.photo?[me.photo]:[]))];const p=me||{},G=['man','woman','nonbinary'],opt=(id,a,v)=>`<select id=${id}>${a.map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('')}</select>`;
 const dp=(p.dob||'').split('-'),Y=new Date().getFullYear(),MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
 so=(id,ph,it,v)=>`<select id=${id}><option value="">${ph}</option>${it.map(([a,t])=>`<option value=${a} ${+a==+v?'selected':''}>${t}</option>`).join('')}</select>`;
 app(hdr()+`<div class=card><div class=mypic id=mypic>${pics[0]?`<img src="${pics[0]}">`:esc((p.name||'♥')[0])}</div><h2 style="text-align:center">${me?'Your profile':'Create your profile ♥'}</h2><p class=hint>Tell us who you are and where to look. Next, we show people near you.</p><div class=grid>
 <div class=f><label>Name</label><input id=n value="${esc(p.name)}"></div>
 <div class=f><label>Date of birth</label><div class=dob>${so('dd','Day',Array.from({length:31},(_,i)=>[i+1,i+1]),dp[2])}${so('dm','Month',MN.map((m,i)=>[i+1,m]),dp[1])}${so('dy','Year',Array.from({length:53},(_,i)=>[Y-18-i,Y-18-i]),dp[0])}</div></div>
 <div class=f><label>You are</label>${opt('g',G,p.gender)}</div>
 <div class=f><label>Interested in</label><div class=pills>${G.map(x=>pill('ig',x,(p.interested_in||[]).includes(x),x)).join('')}</div></div>
 <div class=f><label>Country</label><select id=co onchange="fillSt()">${CO.map(x=>`<option ${x==(p.country||'India')?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class=f><label>State / Region</label><select id=st></select></div>
 <div class=f><label>District</label><input id=di placeholder="e.g. Bengaluru Urban" value="${esc(p.district)}"></div>
 <div class=f><label>Show me people</label><select id=sc>${SC}</select></div>
 <div class="f full"><label>Your photos <small class=hint>First photo is your profile picture. Up to 5.</small></label><div class=gal id=gal>${galHTML()}</div></div>
 <div class=f><label>Aadhaar number (demo check)</label><input id=ad inputmode=numeric placeholder="12 digits, never stored"></div>
 <div class="f full"><div class=two><button class=btn onclick=loc()>Use my location (for km distance)</button><button class=btn onclick=verify()>${p.verified?'ID verified. Verify again':'Verify Aadhaar (demo)'}</button></div></div></div>
 <p id=m></p><button class="btn pri" onclick=saveProfile()>Save and find matches ♥</button>${me?'<button class=btn onclick="go(\'test\')">Take the pH quiz</button><button class=btn onclick=delAcct() style="color:#b42318">Delete my account and data</button>':''}</div>`);$('#sc').value=p.scope||'country';fillSt(p.state)}
function loc(){navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{geo={lat:+p.coords.latitude.toFixed(2),lng:+p.coords.longitude.toFixed(2)};msg('Location saved, rounded to about 1 km.')},()=>msg('Location blocked. Use district, state or country instead.')):msg('Location is not supported here.')}
const galHTML=()=>pics.map((src,i)=>`<div class=th><img src="${src}">${i==0?'<span class=badge>Profile pic</span>':`<button class=mini onclick=mk(${i})>Make profile pic</button>`}<button class="mini x" onclick=rm(${i})>✕</button></div>`).join('')+(pics.length<5?`<label class="th add">＋<span>Add photo</span><input type=file accept="image/*" hidden onchange=addPic(this)></label>`:'');
function paint(){const g=$('#gal');if(g)g.innerHTML=galHTML();const a=$('#mypic');if(a)a.innerHTML=pics[0]?`<img src="${pics[0]}">`:esc((me?.name||$('#n')?.value||'♥')[0])}
const resize=f=>new Promise(r=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,500/Math.max(im.width,im.height));c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.75))};im.src=URL.createObjectURL(f)});
async function addPic(el){const f=el.files[0];if(f&&pics.length<5){pics.push(await resize(f));await savePics()}}
async function rm(i){pics.splice(i,1);await savePics()}
async function mk(i){pics.unshift(pics.splice(i,1)[0]);await savePics()}
async function savePics(){if(me){const{error}=await db.from('profiles').update({photos:pics,photo:pics[0]||null}).eq('id',uid);if(error)return msg(error.message);me.photos=[...pics];me.photo=pics[0]||null;msg('Photos saved ♥')}else msg('Photo added. Save your profile to keep it.');paint()}
function cyc(el,id){const a=PH[id];if(!a||a.length<2)return;const i=((+el.dataset.i||0)+1)%a.length;el.dataset.i=i;el.src=a[i];const n=el.nextElementSibling;if(n&&n.className=='pn')n.textContent=(i+1)+'/'+a.length}
function verify(){const v=$('#ad').value.replace(/\s/g,'');if(!/^\d{12}$/.test(v))return msg('Enter a 12-digit number');$('#ad').value='';ok=true;msg('Verified (demo). The number was not stored.')}
async function saveProfile(){const f=i=>$('#'+i).value,g=[...document.querySelectorAll('.ig:checked')].map(x=>x.value);
 const dd=f('dd'),dm=f('dm'),dy=f('dy');if(!f('n')||!dd||!dm||!dy||!f('di').trim()||!g.length)return msg('Fill every field');
 const D=`${dy}-${dm.padStart(2,'0')}-${dd.padStart(2,'0')}`;if(new Date(D).getUTCDate()!=+dd)return msg('That date does not exist');if(age(D)<18)return msg('You must be 18 or older');
 if(!ok&&!me?.verified)return msg('Verify your ID first');
 const lat=geo?geo.lat:me?.lat??null,lng=geo?geo.lng:me?.lng??null;if(f('sc').startsWith('km')&&lat==null)return msg('Tap "Use my location" to use km distance.');
 const{error}=await db.from('profiles').upsert({id:uid,name:f('n'),dob:D,gender:f('g'),interested_in:g,country:f('co'),state:f('st'),district:f('di').trim(),scope:f('sc'),lat,lng,photo:pics[0]||null,photos:pics,verified:true,consent_at:me?.consent_at||new Date().toISOString()});
 error?msg(error.message):(await boot(),burst(innerWidth/2,innerHeight/2))}

// pH quiz: part 1 = about you (15), part 2 = your partner (15). Pick options and/or write your own (optional).
function test(){if(qi<0)return app(hdr()+`<div class=hero style="padding:30px 0 0"><div class=big style="font-size:clamp(56px,12vw,96px)">♥</div></div><div class="card auth" style="text-align:center"><span class=sect>pH Quiz</span><h2>Welcome to the Personality &amp; Habits Quiz</h2><p class=hint>30 quick questions: 15 about you and 15 about the partner you want. Pick what fits and skip what doesn't.</p><button class="btn pri" onclick="qi=0;test()">Continue ♥</button></div>`);const pt=qi<N,d=qi%N,s=pt?(S[d]||[]):(W[d]?.ok||[]),t=NT[pt?'a':'p'][d]||'';
 app(hdr()+`<div class=card><span class=sect>${pt?'Part 1 · About you':'Part 2 · Your ideal partner'}</span><span class=cnt>${d+1} / ${N}</span><div class=bar><i style="width:${qi/(2*N)*100}%"></i></div>
 <h2>${(pt?ME:PA)[d]}</h2><p class=hint>${pt?'Pick all that apply.':'Pick all you would be happy with, or skip.'}</p>
 <div class=opts>${QS[d].map((x,j)=>pill('sel',j,s.includes(j),x[0])).join('')}</div>
 <div class=f><input id=nt maxlength=140 placeholder="Or write your own answer (optional)" value="${esc(t)}"></div>
 ${pt?'':`<label class="pill must"><input type=checkbox id=mu ${W[d]?.must?'checked':''}><span>Dealbreaker: my partner must match</span></label>`}
 <p id=m></p><div class=two><button class=btn onclick=step(-1)>Back</button><button class="btn pri" onclick=step(1)>${qi==2*N-1?'Finish ♥':'Next'}</button></div></div>`)}
async function step(k){const g=[...document.querySelectorAll('.sel:checked')].map(x=>+x.value),pt=qi<N,d=qi%N;
 NT[pt?'a':'p'][d]=$('#nt').value.trim();if(pt)S[d]=g;else W[d]={ok:g,must:!!$('#mu')?.checked};
 if(k>0&&pt&&!g.length&&!NT.a[d])return msg('Pick an answer or write your own');
 if(k>0&&!pt&&W[d].must&&!g.length)return msg('Choose what you need, or untick dealbreaker');
 qi=Math.max(-1,qi+k);if(qi<2*N)return test();
 const wants={};for(const i in W)if(W[i].ok.length)wants[i]=W[i];
 const{error}=await db.from('profiles').update({answers:S,wants,notes:NT}).eq('id',uid);error?show(error.message):(await boot(),burst(innerWidth/2,innerHeight/3))}

// matching
const km=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b.lat-a.lat)/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(r(b.lng-a.lng)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const same=(x,y)=>(x||'').toLowerCase()==(y||'').toLowerCase();
function inScope(a,b){const[t,n]=(a.scope||'country').split(':');if(t=='km')return a.lat!=null&&b.lat!=null&&km(a,b)<=+n;
 if(t=='district')return same(a.country,b.country)&&same(a.state,b.state)&&same(a.district,b.district);
 if(t=='state')return same(a.country,b.country)&&same(a.state,b.state);if(t=='country')return same(a.country,b.country);return true}
function dir(a,b){let s=0,w=0;for(const q in a.wants||{}){const x=a.wants[q],hit=(b.answers[q]||[]).some(v=>x.ok.includes(v));if(x.must&&!hit)return -1;const t=x.must?3:1;w+=t;s+=hit*t}return w?s/w:1}
// -1 = not eligible, null = eligible but test not taken yet, else match %
function fit(a,b){if(!(a.interested_in.includes(b.gender)&&b.interested_in.includes(a.gender))||!inScope(a,b)||!inScope(b,a))return -1;
 if(!a.answers||!b.answers)return null;const x=dir(a,b),y=dir(b,a);if(x<0||y<0)return -1;let j=0;
 QS.forEach((_,i)=>{const u=a.answers[i]||[],v=b.answers[i]||[];j+=u.filter(k=>v.includes(k)).length/(new Set([...u,...v]).size||1)});
 return Math.round(100*(.7*Math.sqrt(x*y)+.3*j/N))}

async function setScope(v){if(v.startsWith('km')&&me.lat==null){msg('Set your location in Profile to use km distance.');return $('#rg').value=me.scope}
 await db.from('profiles').update({scope:v}).eq('id',uid);me.scope=v;feed()}
function card({p,s}){PH[p.id]=p.photos;const my=me.answers||{},wn=me.wants||{},tg=[];
 if(p.answers)QS.forEach((o,d)=>(p.answers[d]||[]).forEach(v=>{if((wn[d]?.ok||[]).includes(v)||(my[d]||[]).includes(v))tg.push(o[v][1])}));
 const L=liked.includes(p.id),where=me.lat!=null&&p.lat!=null?Math.round(km(me,p))+' km away':esc(p.district||p.state||''),q=Object.values(p.notes?.a||{}).find(Boolean);
 return `<div class="card mc"><div class=ph>${bst(p)?'<span class=bst>⚡ Boosted</span>':''}${(p.photos&&p.photos[0])||p.photo?`<img src="${(p.photos&&p.photos[0])||p.photo}" onclick="cyc(this,'${p.id}')">${p.photos&&p.photos.length>1?`<span class=pn>1/${p.photos.length}</span>`:''}`:`<div class=av>${esc(p.name[0])}</div>`}<div class=ring style="--s:${s||0};--c:hsl(${(s||0)*1.1},70%,35%)"><b>${s==null?'♥':s+'%'}</b></div></div>
 <div class=bd><h3>${esc(p.name)}, ${age(p.dob)}</h3><p class=sub>${where}${p.verified?' · ID verified':''}</p>${q?`<p class=quote>“${esc(q)}”</p>`:''}<div>${[...new Set(tg)].slice(0,6).map(t=>`<span class=tag>${t}</span>`).join('')}</div>
 ${L&&likes.includes(p.id)?`<button class="btn pri" onclick="peer='${p.id}';go('chat')">It's a match ♥ Chat</button>`:L?'<p class=sub>Liked ♥ Waiting for them.</p>':`<div class=two><button class="btn pri" onclick="like('${p.id}',event)">♥ Like</button><button class=btn onclick="like('${p.id}',event,1)">⭐ Priority</button></div>`}<p class=lnk><a onclick="reportU('${p.id}')">Report</a> · <a onclick="blockU('${p.id}')">Block</a></p></div></div>`}

async function chat(){clearInterval(timer);const{data:ls}=await db.from('likes').select('*'),mine=ls.filter(l=>l.from_id==uid).map(l=>l.to_id),bl=(await db.from('blocks').select('*')).data||[],bk=new Set(bl.map(b=>b.from_id==uid?b.to_id:b.from_id)),mu=[...new Set(ls.filter(l=>l.to_id==uid&&mine.includes(l.from_id)&&!bk.has(l.from_id)).map(l=>l.from_id))];
 const ps=mu.length?(await db.from('profiles').select('id,name,dob,district').in('id',mu)).data:[],on=peer&&mu.includes(peer);if(on)delete unread[peer];
 app(hdr()+`<div class="card chatbox"><div class=pills>${ps.map(p=>`<label class=pill onclick="peer='${p.id}';chat()"><input type=radio ${p.id==peer?'checked':''}><span>${esc(p.name)}, ${age(p.dob)} · ${esc(p.district||'')}${unread[p.id]?' ('+unread[p.id]+')':''}</span></label>`).join('')||'<p class=hint>Chat opens when you both like each other.</p>'}</div>
 <div>${on?`<div class=chead><b>${esc(ps.find(p=>p.id==peer)?.name)}</b><span><button class=mini2 onclick=callPeer()>📹 Video${isPlus()?'':' 🔒'}</button><button class=mini2 onclick="reportU(peer)">Report</button><button class=mini2 onclick="blockU(peer)">Block</button></span></div><p class=sub id=quota></p><div id=log class=log></div><div class=send><input id=t placeholder="Say hi ♥"><button class="btn pri" onclick=send()>Send</button></div>`:'<p class=hint>Pick a match to start chatting.</p>'}</div></div>`);
 if(on){load();quota();timer=setInterval(load,3000)}}
async function load(){const{data}=await db.from('messages').select('*').or(`and(from_id.eq.${uid},to_id.eq.${peer}),and(from_id.eq.${peer},to_id.eq.${uid})`).order('created_at'),l=$('#log');if(!l)return;
 l.innerHTML=data.map(m=>`<div class="b ${m.from_id==uid?'me':''}">${esc(m.body)}</div>`).join('');l.scrollTop=l.scrollHeight}
// live messages and notifications (Supabase Realtime)
async function nm(id){if(!names[id])names[id]=(await db.from('profiles').select('name').eq('id',id).maybeSingle()).data?.name||'Someone';return names[id]}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),4500)}
function beep(){try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(.15,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.3);o.start();o.stop(c.currentTime+.3)}catch(e){}}
function badge(){const a=[...document.querySelectorAll('.tabs a')].find(x=>x.textContent.startsWith('Chat'));if(a)a.innerHTML='Chat'+dot()}
function listen(){if(ch)return;
 ch=db.channel('rt-'+uid)
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'to_id=eq.'+uid},async p=>{const m=p.new,n=await nm(m.from_id),open=view=='chat'&&peer==m.from_id;
  if(open)load();if(open&&!document.hidden)return;
  if(!open){unread[m.from_id]=(unread[m.from_id]||0)+1;badge()}
  toast('♥ '+n+': '+m.body.slice(0,60));beep();if(document.hidden&&window.Notification&&Notification.permission=='granted')new Notification('SoulSync · '+n,{body:m.body})})
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'likes',filter:'to_id=eq.'+uid},async p=>{toast((p.new.priority?'⭐ ':'♥ ')+await nm(p.new.from_id)+(p.new.priority?' sent you a priority like!':' liked you'));beep();if(view=='feed'||view=='likes')go(view)})
 .subscribe()}
document.addEventListener('click',()=>{if(window.Notification&&Notification.permission=='default')Notification.requestPermission()},{once:true});
// ===== Plus plan, boosts, chat limit, video calls, safety =====
const isPlus=()=>!!(me&&me.plus_until&&new Date(me.plus_until)>new Date()),bst=p=>!!(p.boost_until&&new Date(p.boost_until)>new Date());

async function feed(){app(hdr()+'<p class=c>Finding your people ♥</p>');
 const[{data:ps},{data:ls},{data:bl}]=await Promise.all([db.from('profiles').select('*').neq('id',uid),db.from('likes').select('*'),db.from('blocks').select('*')]);
 const bk=new Set(bl.map(b=>b.from_id==uid?b.to_id:b.from_id)),F=window.flt||(window.flt={age:'',min:''}),pl=isPlus(),t=!!me.answers;
 liked=ls.filter(l=>l.from_id==uid).map(l=>l.to_id);likes=ls.filter(l=>l.to_id==uid).map(l=>l.from_id);
 let list=ps.filter(p=>!bk.has(p.id)).map(p=>({p,s:fit(me,p)})).filter(x=>x.s!==-1);
 if(pl){const[lo,hi]=(F.age||'0-99').split('-').map(Number);list=list.filter(x=>{const a=age(x.p.dob);return a>=lo&&a<=hi&&(x.s??100)>=(+F.min||0)})}
 list.sort((a,b)=>(bst(b.p)-bst(a.p))||((b.s??-1)-(a.s??-1)));
 app(hdr()+`<div class="card banner"><div><h2>Matches near you ♥</h2><p>${esc(me.district)}, ${esc(me.state)} · ${t?'ranked by compatibility':'take the pH quiz to rank by compatibility'}</p>
 <div class=flt><select id=rg onchange="setScope(this.value)">${SC}</select><select id=fa ${pl?'':'disabled'} onchange=setF()><option value="">${pl?'Any age':'🔒 Age (Plus)'}</option><option value=18-24>18–24</option><option value=25-29>25–29</option><option value=30-99>30+</option></select><select id=fm ${pl?'':'disabled'} onchange=setF()><option value="">${pl?'Any match %':'🔒 Match % (Plus)'}</option><option value=50>50%+</option><option value=70>70%+</option><option value=85>85%+</option></select></div></div>
 <button class="btn light" onclick="go('test')">${t?'Retake the pH quiz':'Take the pH quiz ♥'}</button></div><p id=m style="color:#fff"></p>
 <div class=cards>${list.map(x=>card(x)).join('')||'<div class="card c">No one here yet. Try a wider region or clear filters.</div>'}</div>`);
 $('#rg').value=me.scope||'country';$('#fa').value=F.age;$('#fm').value=F.min}
function setF(){window.flt={age:$('#fa').value,min:$('#fm').value};feed()}

async function like(id,e,pri){burst(e.clientX,e.clientY);
 if(pri){const{data:r,error}=await db.rpc('send_priority_like',{to_user:id});if(error)return toast('Could not send: '+error.message);
  if(r=='nocredit'){toast('No priority likes left. Opening Plus…');return go('plus')}if(r=='ok')me.credits=Math.max(0,(me.credits||0)-1)}
 else{const{error}=await db.from('likes').insert({from_id:uid,to_id:id});if(error)return toast('Could not send: '+error.message)}
 setTimeout(()=>go(view),500)}

async function likesPage(){app(hdr()+'<p class=c>Loading…</p>');
 const[{data:ls},{data:bl}]=await Promise.all([db.from('likes').select('*'),db.from('blocks').select('*')]);
 const bk=new Set(bl.map(b=>b.from_id==uid?b.to_id:b.from_id)),mine=new Set(ls.filter(l=>l.from_id==uid).map(l=>l.to_id));
 const inc=ls.filter(l=>l.to_id==uid&&!mine.has(l.from_id)&&!bk.has(l.from_id)).sort((a,b)=>(b.priority?1:0)-(a.priority?1:0));
 const ps=inc.length?(await db.from('profiles').select('*').in('id',inc.map(l=>l.from_id))).data:[],pm=Object.fromEntries(ps.map(p=>[p.id,p])),pl=isPlus();
 liked=[...mine];likes=ls.filter(l=>l.to_id==uid).map(l=>l.from_id);
 app(hdr()+`<div class="card banner"><div><h2>Liked you ♥</h2><p>${inc.length} waiting${pl?'':'. Get Plus to see who.'}</p></div>${pl?'':'<button class="btn light" onclick="go(\'plus\')">⭐ Get Plus</button>'}</div>
 <div class=cards>${inc.map(l=>{const p=pm[l.from_id];if(!p)return'';return pl?card({p,s:fit(me,p)}):`<div class="card mc locked"><div class=ph>${p.photo?`<img src="${p.photo}">`:'<div class=av>?</div>'}</div><div class=bd><h3>${l.priority?'⭐ Priority like':'♥ Someone liked you'}</h3><p class=sub>Upgrade to Plus to see who.</p></div></div>`}).join('')||'<div class="card c">No pending likes yet.</div>'}</div>`)}

// Real checkout: Razorpay. The server creates the order and verifies the payment (supabase/functions/razorpay).
const PROD={w:'plus_week',m:'plus_month',b:'boost',p:'likes5'},PNAME={w:'Plus · 1 week',m:'Plus · 1 month',b:'Boost · 1 hour',p:'5 priority likes'};
function plusPage(){const pl=isPlus();
 app(hdr()+`<div class=card><h2>⭐ SoulSync Plus</h2><p class=hint>${pl?'Plus is active until '+new Date(me.plus_until).toLocaleDateString():'Unlock more chats, see who liked you, extra filters and video calls.'}</p>
 <ul class=perks><li>Unlimited chats (free: 3 you start, replies always free)</li><li>See everyone who liked you</li><li>Age and match % filters</li><li>Start video calls</li></ul>
 <div class=grid><div class=plan><h3>1 week</h3><b>₹49</b><button class="btn pri" onclick="pay('w')">Get Plus</button></div><div class=plan><h3>1 month</h3><b>₹149</b><button class="btn pri" onclick="pay('m')">Get Plus</button></div>
 <div class=plan><h3>⚡ Boost</h3><b>₹29</b><small>Top of feeds for 1 hour${bst(me)?' (active now)':''}</small><button class=btn onclick="pay('b')">Boost me</button></div>
 <div class=plan><h3>⭐ Priority likes</h3><b>₹49</b><small>5 likes that stand out. You have ${me.credits||0}.</small><button class=btn onclick="pay('p')">Buy 5</button></div></div>
 <p id=m></p><p class=hint>Payments are processed securely by Razorpay (UPI, cards, netbanking). Plans are prepaid passes with no auto-renewal. Prices include GST. <b>Test mode:</b> use UPI ID <code>success@razorpay</code>; no real money moves.</p></div>`)}
async function pay(k){msg('Starting secure checkout…');
 const{data:o,error}=await db.functions.invoke('razorpay',{body:{action:'order',product:PROD[k]}});
 if(error||!o||o.error)return msg('Could not start payment: '+(o?.error||error?.message||'server error'));
 const email=(await db.auth.getUser()).data.user?.email;
 new Razorpay({key:o.key,order_id:o.order_id,amount:o.amount,currency:'INR',name:'SoulSync',description:PNAME[k],prefill:{email},theme:{color:'#7a0f26'},
  modal:{ondismiss:()=>msg('Payment cancelled.')},
  handler:async r=>{msg('Confirming your payment…');
   const{data:v,error:e2}=await db.functions.invoke('razorpay',{body:{action:'verify',order_id:r.razorpay_order_id,payment_id:r.razorpay_payment_id,signature:r.razorpay_signature}});
   if(e2||!v||v.error)return msg('Payment received but not confirmed ('+(v?.error||e2?.message)+'). Keep this payment ID: '+r.razorpay_payment_id);
   Object.assign(me,v.profile||{});burst(innerWidth/2,innerHeight/2);toast('Payment successful ♥');plusPage()}}).open()}

// free plan: 3 chats you start. Replies are always free. The database enforces this too (can_send in upgrade.sql).
async function quota(){const q=$('#quota');if(!q)return;if(isPlus()){q.textContent='⭐ Plus: unlimited chats';return}
 const[{data:s},{data:r}]=await Promise.all([db.from('messages').select('to_id').eq('from_id',uid),db.from('messages').select('from_id').eq('to_id',uid)]);
 const got=new Set(r.map(m=>m.from_id));q.textContent=`Free plan: ${new Set(s.map(m=>m.to_id).filter(x=>!got.has(x))).size} of 3 chats you started. Replies are always free.`}
async function send(){const t=$('#t').value.trim();if(!t)return;$('#t').value='';
 const{error}=await db.from('messages').insert({from_id:uid,to_id:peer,body:t});
 if(error){toast(isPlus()?'Message could not be sent.':'You have started 3 chats on the free plan. Upgrade to Plus for unlimited chats.');if(!isPlus())go('plus');return}
 load();quota()}

// safety: report, block, delete my data
async function reportU(id,v){const r=prompt('What is wrong? (fake profile, harassment, nudity, scam, other)');if(!r)return;
 await db.from('reports').insert({from_id:uid,about_id:id,reason:r.slice(0,300)});await db.from('blocks').insert({from_id:uid,to_id:id});
 if(v)endCall();if(id==peer)peer=null;toast('Reported and blocked. Thank you for keeping SoulSync safe.');go(view)}
async function blockU(id){if(!confirm('Block this person? You will no longer see each other.'))return;await db.from('blocks').insert({from_id:uid,to_id:id});if(id==peer)peer=null;go(view)}
async function delAcct(){if(!confirm('Delete your profile, photos, likes and messages? This cannot be undone.'))return;
 await db.from('messages').delete().or(`from_id.eq.${uid},to_id.eq.${uid}`);await db.from('likes').delete().or(`from_id.eq.${uid},to_id.eq.${uid}`);await db.from('profiles').delete().eq('id',uid);
 toast('Your data was deleted.');out()}

// video calls: WebRTC, signalling over Supabase Realtime. Plus users start calls; both must accept; never recorded.
const RTC={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};async function iceServers(){const stun=[{urls:'stun:stun.l.google.com:19302'}];if(!METERED.app||!METERED.key)return stun;
 try{const a=await(await fetch(`https://${METERED.app}.metered.live/api/v1/turn/credentials?apiKey=${METERED.key}`)).json();return Array.isArray(a)&&a.length?[...stun,...a]:stun}catch(e){return stun}}
let CH={},pc,ls_,pend=[],callWith,incoming,inbox;
const getCh=to=>CH[to]||(CH[to]=new Promise(r=>{const c=db.channel('call-'+to);c.subscribe(s=>s=='SUBSCRIBED'&&r(c))}));
async function sig(to,m){(await getCh(to)).send({type:'broadcast',event:'sig',payload:{...m,from:uid}})}
function initCalls(){if(!inbox)inbox=db.channel('call-'+uid).on('broadcast',{event:'sig'},({payload:m})=>onSig(m)).subscribe()}
function closeCalls(){endCall(true);if(inbox){db.removeChannel(inbox);inbox=null}for(const k in CH)CH[k].then(c=>db.removeChannel(c));CH={}}
async function mutual(id){const{data}=await db.from('likes').select('*').or(`and(from_id.eq.${uid},to_id.eq.${id}),and(from_id.eq.${id},to_id.eq.${uid})`);return data.length==2}
function mkpc(){pc=new RTCPeerConnection(RTC);pc.onicecandidate=e=>e.candidate&&sig(callWith,{t:'ice',c:e.candidate});
 pc.ontrack=e=>{const v=$('#rv');if(v)v.srcObject=e.streams[0];const s=$('#cs');if(s)s.textContent='Connected. Use Report if anything feels wrong.'};
 pc.onconnectionstatechange=()=>{if(pc&&pc.connectionState=='failed')toast('Could not connect the call. Check both networks and try again.');if(pc&&['failed','closed'].includes(pc.connectionState))endCall(true)}}
const flush=async()=>{while(pend.length)await pc.addIceCandidate(pend.shift())};
function showCall(t,ring){let o=$('#call');if(!o){o=document.createElement('div');o.id='call';document.body.appendChild(o)}
 o.innerHTML=`<video id=rv autoplay playsinline></video><video id=lv autoplay playsinline muted></video><div class=cbar><p id=cs>${esc(t)}</p>${ring?'<button class="btn pri" onclick=acceptCall()>Accept</button><button class=btn onclick=declineCall()>Decline</button>':'<button class="btn pri" onclick=endCall()>End call</button><button class=btn onclick="reportU(callWith,1)">Report</button>'}</div>`;if(ls_)$('#lv').srcObject=ls_}
async function callPeer(){if(!isPlus()){toast('Video calls are a Plus feature');return go('plus')}if(pc||incoming)return;
 if(!navigator.mediaDevices)return toast('Video needs https or localhost');
 try{ls_=await navigator.mediaDevices.getUserMedia({video:true,audio:true})}catch(e){return toast('Camera or microphone is blocked')}
 callWith=peer;showCall('Calling…',false);RTC.iceServers=await iceServers();mkpc();ls_.getTracks().forEach(t=>pc.addTrack(t,ls_));
 const o=await pc.createOffer();await pc.setLocalDescription(o);sig(peer,{t:'offer',sdp:o,name:me.name});const who=peer;setTimeout(()=>{if(pc&&callWith==who&&pc.connectionState!='connected'){toast('No answer');endCall()}},45000)}
async function acceptCall(){const m=incoming;
 try{ls_=await navigator.mediaDevices.getUserMedia({video:true,audio:true})}catch(e){sig(m.from,{t:'decline'});incoming=null;hideCall();return toast('Camera or microphone is blocked')}
 callWith=m.from;incoming=null;showCall('Connecting…',false);RTC.iceServers=await iceServers();mkpc();ls_.getTracks().forEach(t=>pc.addTrack(t,ls_));
 await pc.setRemoteDescription(m.sdp);await flush();const a=await pc.createAnswer();await pc.setLocalDescription(a);sig(callWith,{t:'answer',sdp:a})}
function declineCall(){sig(incoming.from,{t:'decline'});incoming=null;hideCall()}
function hideCall(){const o=$('#call');if(o)o.remove()}
function endCall(quiet){if(callWith&&!quiet&&pc)sig(callWith,{t:'end'});if(pc){pc.onconnectionstatechange=null;pc.close()}pc=null;if(ls_)ls_.getTracks().forEach(t=>t.stop());ls_=null;callWith=null;incoming=null;pend=[];hideCall()}
async function onSig(m){
 if(m.t=='offer'){if(pc||incoming)return sig(m.from,{t:'busy'});if(!(await mutual(m.from)))return;incoming=m;showCall(m.name+' is calling…',true);beep();return}
 if(m.from!=callWith&&!(incoming&&incoming.from==m.from))return;
 if(m.t=='answer'){await pc.setRemoteDescription(m.sdp);await flush()}
 else if(m.t=='ice'){pc&&pc.remoteDescription?pc.addIceCandidate(m.c):pend.push(m.c)}
 else if(m.t=='decline'||m.t=='busy'){toast(m.t=='busy'?'They are on another call':'Call declined');endCall(true)}
 else if(m.t=='end'){toast('Call ended');endCall(true)}}
if(db)boot();
