// ══ DATA ══
let inv=[
  {id:1,name:"سترة كلاسيكية نيفي",type:"سترة",color:"#1C2C4A",cname:"كحلي",price:3200,sizes:"M·L·XL",stock:"ok",views:42,sold:18,img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80&auto=format&fit=crop"},
  {id:2,name:"قميص أوكسفورد أبيض",type:"قميص",color:"#E8E4DA",cname:"أبيض",price:2100,sizes:"S·M·L",stock:"ok",views:30,sold:12,img:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80&auto=format&fit=crop"},
  {id:3,name:"جينز أزرق سليم فيت",type:"جينز",color:"#2A4A7A",cname:"أزرق",price:2800,sizes:"30·32·34·36",stock:"ok",views:50,sold:22,img:"https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&q=80&auto=format&fit=crop"},
  {id:4,name:"جاكيت جلد بني",type:"جاكيت",color:"#5C3010",cname:"بني",price:5500,sizes:"M·L",stock:"ok",views:15,sold:3,img:"https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&q=80&auto=format&fit=crop"},
  {id:5,name:"بنطلون بيج كاجوال",type:"بنطلون",color:"#C8B89A",cname:"بيج",price:2200,sizes:"32·34·36",stock:"low",views:35,sold:5,img:"https://images.unsplash.com/photo-1568251188392-ae37fd0b5e29?w=400&q=80&auto=format&fit=crop"},
  {id:6,name:"تيشيرت أبيض أساسي",type:"تيشيرت",color:"#E8E8E4",cname:"أبيض",price:900,sizes:"S·M·L·XL",stock:"ok",views:60,sold:40,img:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80&auto=format&fit=crop"},
  {id:7,name:"حذاء جلد بني كلاسيك",type:"حذاء",color:"#7A4010",cname:"بني",price:4200,sizes:"40·41·42·43",stock:"ok",views:22,sold:8,img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format&fit=crop"},
  {id:8,name:"بنطلون أسود فورمال",type:"بنطلون",color:"#1A1A1A",cname:"أسود",price:3100,sizes:"30·32·34",stock:"ok",views:38,sold:16,img:"https://images.unsplash.com/photo-1594938374182-a57369b4ddf6?w=400&q=80&auto=format&fit=crop"},
  {id:9,name:"هودي رمادي فاتح",type:"سترة",color:"#C0C0BC",cname:"رمادي",price:2400,sizes:"M·L·XL",stock:"ok",views:20,sold:4,img:"https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&q=80&auto=format&fit=crop"},
  {id:10,name:"سنيكرز أبيض كلاسيك",type:"حذاء",color:"#E0E0D8",cname:"أبيض",price:3800,sizes:"40·41·42·43",stock:"ok",views:44,sold:20,img:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80&auto=format&fit=crop"},
  {id:11,name:"قميص كاروه فلانيل",type:"قميص",color:"#7A3030",cname:"أحمر داكن",price:1900,sizes:"S·M·L",stock:"ok",views:28,sold:14,img:"https://images.unsplash.com/photo-1603251579711-b1c39b1e0890?w=400&q=80&auto=format&fit=crop"},
  {id:12,name:"سترة رياضية سوداء",type:"سترة",color:"#2A2A2A",cname:"أسود",price:2600,sizes:"M·L·XL",stock:"low",views:18,sold:2,img:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&auto=format&fit=crop"},
];
let selClr="#1C2C4A",chatHistory=[],lastData=null,isTransitioning=false;

// ══ CURSOR GLOW ══
const glow=document.getElementById('cursorGlow');
document.addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});

// ══ NAVIGATE ══
function navigateTo(targetId,type='z-axis'){
  if(isTransitioning)return;
  isTransitioning=true;
  const cur=document.querySelector('.screen.active,.screen-center.active');
  const tgt=document.getElementById(targetId);
  if(!cur||!tgt){isTransitioning=false;return}
  tgt.style.display='flex';
  tgt.classList.add('active');
  cur.classList.remove('active');
  if(type==='z-axis'){cur.classList.add('z-out');tgt.classList.add('z-in')}
  else if(type==='slide'){cur.classList.add('slide-out-l');tgt.classList.add('slide-in-r')}
  else if(type==='mask'){tgt.classList.add('mask-in')}
  const dur=type==='mask'?1100:900;
  const staggerDelay=type==='mask'?350:type==='slide'?250:450;
  setTimeout(()=>triggerStagger(targetId),staggerDelay);
  setTimeout(()=>{
    cur.classList.remove('z-out','z-in','slide-out-l','slide-in-r','mask-in');
    cur.style.display='none';
    tgt.classList.remove('z-out','z-in','slide-out-l','slide-in-r','mask-in');
    isTransitioning=false;
    if(targetId==='s-splash'){document.getElementById('nav-bar').classList.remove('visible')}
    if(targetId==='s-seller'){renderSellerPage()}
  },dur);
}

function hideNav(){document.getElementById('nav-bar').classList.remove('visible')}

function goCustomer(){navigateTo('s-profile','z-axis')}

function goSeller(){navigateTo('s-seller','z-axis')}

// ══ FIX: showSeller ══
function showSeller(tab){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('on'));
  if(tab==='inventory'){
    const sel=document.getElementById('s-seller');
    const ins=document.getElementById('s-insight');
    if(sel.classList.contains('active')){
      document.getElementById('nav-inv').classList.add('on');
      return;
    }
    // switch from insight to seller
    sel.style.display='flex';sel.classList.add('active');
    ins.classList.remove('active');ins.style.display='none';
    document.getElementById('nav-inv').classList.add('on');
    renderSellerPage();
  } else {
    const sel=document.getElementById('s-seller');
    const ins=document.getElementById('s-insight');
    if(ins.classList.contains('active')){
      document.getElementById('nav-ai').classList.add('on');
      return;
    }
    ins.style.display='flex';ins.classList.add('active');
    sel.classList.remove('active');sel.style.display='none';
    document.getElementById('nav-ai').classList.add('on');
    renderInsightPanel();
    setTimeout(()=>triggerStagger('s-insight'),100);
  }
}

// ══ RENDER SELLER PAGE ══
function renderSellerPage(){
  const nb=document.getElementById('nav-bar');
  nb.classList.add('visible');
  document.getElementById('nav-inv').classList.add('on');
  document.getElementById('nav-ai').classList.remove('on');
  renderSellerInventory();
  renderStats();
  setTimeout(()=>triggerStagger('s-seller'),100);
}

// ══ STAGGER ══
function triggerStagger(id){
  const el=document.getElementById(id);if(!el)return;
  if(id==='s-splash')el.querySelectorAll('.role-card').forEach((c,i)=>{c.classList.remove('visible');setTimeout(()=>c.classList.add('visible'),200+i*150)});
  if(id==='s-profile')el.querySelectorAll('.form-section-title,.field-group,.cta-btn').forEach((e,i)=>{e.classList.remove('visible');setTimeout(()=>e.classList.add('visible'),150+i*80)});
  if(id==='s-seller')el.querySelectorAll('.seller-welcome,.stat-tile,.inv-tile,.add-form').forEach((e,i)=>{e.classList.remove('visible');setTimeout(()=>e.classList.add('visible'),100+i*60)});
  if(id==='s-insight')el.querySelectorAll('.insight-section').forEach((e,i)=>{e.classList.remove('visible');setTimeout(()=>e.classList.add('visible'),150+i*120)});
  if(id==='s-results'){
    const p=document.getElementById('persona-card');if(p)setTimeout(()=>p.classList.add('visible'),300);
    const l=document.getElementById('outfits-label');if(l)setTimeout(()=>l.classList.add('visible'),500);
    document.querySelectorAll('.outfit-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),650+i*120));
    const ch=document.getElementById('chat-section');if(ch)setTimeout(()=>ch.classList.add('visible'),900);
    const rd=document.getElementById('redo-btn');if(rd)setTimeout(()=>rd.classList.add('visible'),950);
  }
}

// ══ TAGS ══
['build-tags','style-tags','occasion-tags'].forEach(gid=>{
  document.querySelectorAll('#'+gid+' .tag').forEach(t=>t.onclick=()=>{
    document.querySelectorAll('#'+gid+' .tag').forEach(x=>x.classList.remove('on'));
    t.classList.add('on');
  });
});
document.querySelectorAll('#occasion-tags .tag').forEach(t=>t.onclick=()=>{
  const h=document.getElementById('budget-hint');
  if(t.dataset.v==='توفير المال'){h.textContent='⚡ سنقترح لك أقل تكلفة ممكنة';h.style.color='var(--gold)'}
  else{h.textContent='تبقى لك كامل الميزانية هذا الشهر ✓';h.style.color='var(--sageL)'}
});

// ══ LOGO ══
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    document.getElementById('s-logo').classList.add('fade-out');
    setTimeout(()=>document.getElementById('s-logo').style.display='none',1100);
  },3800);  // longer display for assembly animation
  setTimeout(()=>animateCounter(60,2600),700);
  setTimeout(()=>{const sc=document.getElementById('s-splash');if(sc)sc.querySelectorAll('.role-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),3200+i*150))},0);
  // init browse
  initBrowse();
});

function updateBudget(v){document.getElementById('bdisp').innerHTML=Number(v).toLocaleString('ar-DZ')+' <span class="budget-unit">دج</span>'}

// ══ PARTICLES ══
function spawnGP(tgt,count=8){
  const r=tgt.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<count;i++){const p=document.createElement('div');p.className='gold-p';const sz=2+Math.random()*4;
    p.style.cssText=`width:${sz}px;height:${sz}px;left:${cx}px;top:${cy}px;opacity:.7`;
    document.body.appendChild(p);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{p.style.left=cx+(Math.random()-.5)*200+'px';p.style.top=cy+(Math.random()-.5)*200+'px';p.style.opacity='0';p.style.transform='scale(.1)'}));
    setTimeout(()=>p.remove(),1300)}
}
function celebratePick(el){
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<16;i++){const p=document.createElement('div');p.className='gold-p';const a=(Math.PI*2*i)/16,d=50+Math.random()*80,sz=2+Math.random()*5;
    p.style.cssText=`width:${sz}px;height:${sz}px;left:${cx}px;top:${cy}px;opacity:.8`;
    document.body.appendChild(p);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{p.style.left=cx+Math.cos(a)*d+'px';p.style.top=cy+Math.sin(a)*d+'px';p.style.opacity='0';p.style.transform='scale(.2)'}));
    setTimeout(()=>p.remove(),1300)}
}

// ══ GENERATE ══
async function startGenerate(){
  navigateTo('s-loading','mask');
  animateSteps();
  const ht=document.getElementById('ht').value,ag=document.getElementById('ag').value,
    build=document.querySelector('#build-tags .tag.on').dataset.v,
    style=document.querySelector('#style-tags .tag.on').dataset.v,
    occasion=document.querySelector('#occasion-tags .tag.on')?.dataset.v||'يوم عادي',
    bg=document.getElementById('bg').value,
    invTxt=inv.map(i=>`- ${i.name} (${i.type}، ${i.cname}، ${i.price} دج، ${i.sizes})`).join('\n');
  const prompt=`أنت مستشار موضة ذكي لتطبيق Wardro في الجزائر.الزبون: طول ${ht}سم، عمر ${ag} سنة، بنية ${build}، ذوق ${style}، مناسبة: ${occasion}، ميزانية قصوى ${bg} دج.مخزون المتجر:\n${invTxt}\nاقترح 4 تنسيقات متنوعة من المخزون فقط. كل تنسيق 2-3 قطع. المجموع تحت الميزانية.أجب بـJSON فقط:{"persona":"وصف","analysis":"تحليل","tip":"نصيحة","outfits":[{"tag":"label","name":"اسم عربي","items":[{"name":"اسم","color":"#hex"}],"bg":"#hex","reason":"سبب","total":0,"match":90}]}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1100,messages:[{role:"user",content:prompt}]})});
    const d=await r.json(),raw=d.content[0].text.replace(/```json|```/g,'').trim(),p=JSON.parse(raw);
    lastData=p;
    chatHistory=[{role:"user",content:`سياق: ${invTxt} | ${ht}سم ${build} ${style} ${bg}دج`},{role:"assistant",content:raw}];
    renderResults(p);
    setTimeout(()=>navigateTo('s-results','mask'),500);
  }catch(e){navigateTo('s-profile','z-axis');toast('خطأ في الاتصال — حاول مجدداً')}
}

function animateSteps(){
  const s=['ls0','ls1','ls2','ls3'];
  s.forEach(x=>{const el=document.getElementById(x);if(el)el.classList.remove('active','done')});
  let i=0;const run=()=>{
    if(i>0){const p=document.getElementById(s[i-1]);if(p){p.classList.remove('active');p.classList.add('done')}}
    const c=document.getElementById(s[i]);if(c)c.classList.add('active');
    i++;if(i<s.length)setTimeout(run,700)
  };
  run();
}

// ══ RENDER RESULTS ══
function renderResults(p){
  const vc=['#1A1612','#121820','#1A1218','#181A12'];
  document.getElementById('results-body').innerHTML=`
    <div class="persona-card" id="persona-card">
      <div class="pc-eyebrow">WARDRO AI — تحليلك الشخصي</div>
      <div class="pc-title">${p.persona}</div>
      <div class="pc-body">${p.analysis}</div>
      <div class="pc-tip">💡 ${p.tip}</div>
    </div>
    <div class="outfits-label" id="outfits-label">التنسيقات المقترحة</div>
    ${p.outfits.map((o,i)=>{
      const pcs=o.items.map((it,j)=>`<div class="outfit-piece" style="background:${it.color};height:${50+j*20}px"></div>`).join('');
      const rows=o.items.map(it=>{
        const f=inv.find(x=>x.name===it.name||it.name.includes(x.name.split(' ')[0]));
        const imgEl=f&&f.img?`<img class="outfit-item-img" src="${f.img}" alt="${it.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="item-color-chip" style="background:${it.color};display:none"></div>`:`<div class="item-color-chip" style="background:${it.color};width:44px;height:44px;border-radius:7px;flex-shrink:0"></div>`;
        return`<div class="outfit-item-row" ${f?`onclick="openProductSheet(${f.id})" style="cursor:pointer"`:''}>
          ${imgEl}<span style="font-size:12px;color:var(--txtD);align-self:center">${it.name}</span>
          ${f?'<span style="color:var(--muted);font-size:12px;margin-right:auto">›</span>':''}
        </div>`}).join('');
      return`<div class="outfit-card" onclick="pickOutfit(this,'${o.name}',${i})">
        <div class="outfit-visual" style="background:${o.bg||vc[i%4]}">${pcs}</div>
        <div class="outfit-body">
          <div class="outfit-eyebrow">${o.tag}</div>
          <div class="outfit-name">${o.name}</div>
          <div class="outfit-items">${rows}</div>
          <div class="outfit-reason">${o.reason}</div>
          <div class="outfit-footer">
            <div class="outfit-price">${Number(o.total).toLocaleString('ar-DZ')} <span class="outfit-price-unit">دج</span></div>
            <span class="match-pill">${o.match}% توافق</span>
          </div>
        </div>
      </div>`}).join('')}
    <div class="chat-section" id="chat-section">
      <div class="chat-header"><span class="chat-dot"></span>اسأل مستشار الستايل</div>
      <div class="chat-messages" id="chat-msgs"></div>
      <div class="chat-input-row">
        <input class="chat-inp" id="cinp" placeholder="اسأل عن تنسيق، مناسبة، لون..." onkeydown="if(event.key==='Enter')sendChat()">
        <button class="chat-send" id="csbtn" onclick="sendChat()">أرسل</button>
      </div>
    </div>
    <button class="redo-btn" id="redo-btn" onclick="navigateTo('s-profile','slide')">↩ تعديل بياناتي</button>`;
}

function pickOutfit(el,name,idx){
  document.querySelectorAll('.outfit-card').forEach(c=>c.classList.remove('chosen'));
  el.classList.add('chosen');
  celebratePick(el);
  if(lastData&&lastData.outfits[idx])lastData.outfits[idx].items.forEach(it=>{const f=inv.find(i=>i.name===it.name);if(f)f.sold++});
  toast('✦ تم اختيار: '+name);
}

// ══ CHAT ══
async function sendChat(){
  const inp=document.getElementById('cinp'),txt=inp.value.trim();if(!txt)return;inp.value='';
  document.getElementById('csbtn').disabled=true;addChatMsg('usr',txt);chatHistory.push({role:"user",content:txt});
  const invTxt=inv.map(i=>`${i.name}(${i.price}دج)`).join('،');
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,system:`مستشار ستايل Wardro. المخزون: ${invTxt}. أجب باختصار بالعربية.`,messages:chatHistory.slice(-6)})});
    const d=await r.json(),rep=d.content[0].text;chatHistory.push({role:"assistant",content:rep});addChatMsg('ai',rep);
  }catch(e){addChatMsg('ai','خطأ في الاتصال.')}
  document.getElementById('csbtn').disabled=false;
}
function addChatMsg(role,txt){
  const el=document.getElementById('chat-msgs');if(!el)return;
  const d=document.createElement('div');d.className='chat-msg '+role;
  d.innerHTML=`<span class="chat-role">${role==='usr'?'أنت':'AI'}</span><span class="chat-text">${txt}</span>`;
  el.appendChild(d);el.scrollTop=el.scrollHeight;
}

// ══ SELLER INVENTORY — FIX ══
function renderStats(){
  const low=inv.filter(x=>x.stock!=='ok').length,dead=getDeadIds().length;
  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-tile"><div class="stat-tile-l">القطع المسجلة</div><div class="stat-tile-n" id="sn0">0</div><div class="stat-tile-s g">كامل المخزون</div></div>
    <div class="stat-tile"><div class="stat-tile-l">تحتاج انتباهاً</div><div class="stat-tile-n" id="sn1" style="color:var(--rustL)">0</div><div class="stat-tile-s r">${low} نفدت · ${dead} مكدسة</div></div>`;
  setTimeout(()=>{animNum(document.getElementById('sn0'),inv.length,800);animNum(document.getElementById('sn1'),low+dead,800)},400);
}
function animNum(el,target,dur){if(!el)return;let st=null;function step(ts){if(!st)st=ts;const p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(e*target);if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
function getDeadIds(){return inv.filter(i=>i.views>10&&(i.sold/i.views)<.15).map(i=>i.id)}

// ══ FIX: renderSellerInventory — swatch with img fallback ══
function renderSellerInventory(){
  const sl={ok:'متوفر',low:'آخر القطع'},dead=getDeadIds();
  document.getElementById('inv-list').innerHTML=inv.map(i=>{
    const isD=dead.includes(i.id);
    const swatchContent=i.img
      ? `<img class="inv-swatch-img" src="${i.img}" alt="${i.name}" 
           loading="lazy" 
           onload="this.style.opacity='1'"
           onerror="this.style.display='none';this.parentElement.style.background='${i.color}'"
           style="opacity:0;transition:opacity .3s">`
      : '';
    return`<div class="inv-tile ${isD?'dead':''}" onclick="openProductSheet(${i.id})" style="cursor:pointer">
      <div class="inv-swatch" style="background:${i.img?'var(--card2)':i.color}">${swatchContent}</div>
      <div class="inv-info">
        <div class="inv-name">${i.name}${isD?' <span style="font-size:10px;color:var(--rustL)">(مكدسة)</span>':''}</div>
        <div class="inv-meta">${i.type} · ${i.sizes}</div>
      </div>
      <div class="inv-right">
        <div class="inv-price">${i.price.toLocaleString('ar-DZ')} دج</div>
        <span class="inv-badge ${i.stock==='ok'?'ok':'dead-badge-s'}">${sl[i.stock]||'نفد'}</span>
      </div>
    </div>`}).join('');
}

function toggleAddForm(){
  const f=document.getElementById('add-form');
  if(f.style.display==='none'){f.style.display='flex';f.style.flexDirection='column';setTimeout(()=>f.classList.add('visible'),50)}
  else{f.classList.remove('visible');setTimeout(()=>f.style.display='none',500)}
}
function pickC(el){document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('on'));el.classList.add('on');selClr=el.dataset.c}
function addItem(){
  const n=document.getElementById('nn').value.trim(),pr=parseInt(document.getElementById('np').value);
  if(!n||!pr){toast('أدخل الاسم والسعر');return}
  inv.push({id:Date.now(),name:n,type:document.getElementById('nt').value,color:selClr,cname:'مخصص',price:pr,sizes:document.getElementById('ns').value||'M·L',stock:'ok',views:0,sold:0,img:null});
  renderSellerInventory();renderStats();
  document.getElementById('nn').value='';document.getElementById('np').value='';
  toast('✦ أضيفت للمخزون');
}

// ══ INSIGHT ══
function renderInsightPanel(){
  document.getElementById('insight-body').innerHTML=`
    <div class="insight-section"><div class="is-eyebrow">DEAD STOCK AI</div><div class="is-title">القطع المكدسة — استراتيجية الإنقاذ</div><div class="is-body">الذكاء يحدد القطع التي تُعرض كثيراً لكن لا تُشترى، ويعطيك خطة إنقاذ.</div><button class="insight-btn red" id="dead-btn" onclick="runDead()" style="margin-top:14px">⚠ حلل القطع المكدسة</button><div id="dead-result"></div></div>
    <div class="insight-section"><div class="is-eyebrow">MARKET AI</div><div class="is-title">ماذا تشتري القادم؟</div><div class="is-body">يحلل مخزونك ويكشف الفجوات — يخبرك بالقطع الأكثر ربحية.</div><button class="insight-btn blue" id="mkt-btn" onclick="runMarket()" style="margin-top:14px">⟡ توصيات الشراء القادم</button><div id="mkt-result"></div></div>`;
}
async function runDead(){
  const btn=document.getElementById('dead-btn');btn.disabled=true;btn.innerHTML='<span class="mini-spin"></span> يحلل...';
  const di=inv.filter(i=>i.views>10&&(i.sold/i.views)<.15);
  if(!di.length){document.getElementById('dead-result').innerHTML='<div style="margin-top:12px;font-size:13px;color:var(--sageL)">✓ لا توجد قطع مكدسة.</div>';btn.disabled=false;btn.innerHTML='⚠ حلل القطع المكدسة';return}
  const txt=di.map(i=>`${i.name}(${i.views}اقتراح،${i.sold}مبيع)`).join(' | '),itx=inv.map(i=>`${i.name}(${i.price}دج)`).join(' | ');
  const p=`متجر ملابس جزائري. المكدسة: ${txt}. الباقي: ${itx}. لكل قطعة 3 استراتيجيات. JSON فقط:{"summary":"جملة","rescues":[{"item":"اسم","problem":"سبب","strategies":["س1","س2","س3"]}]}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:p}]})});
    const d=await r.json(),ps=JSON.parse(d.content[0].text.replace(/```json|```/g,'').trim());
    document.getElementById('dead-result').innerHTML=`<div style="margin-top:14px"><div style="font-size:12px;color:var(--txtD);margin-bottom:10px">${ps.summary}</div>${ps.rescues.map(rc=>`<div class="rescue-item"><div class="ri-name">${rc.item}</div><div class="ri-why">⚠ ${rc.problem}</div><div class="ri-strats">${rc.strategies.map((s,j)=>`<div class="ri-s">${j+1}. ${s}</div>`).join('')}</div></div>`).join('')}</div>`;
    setTimeout(()=>document.querySelectorAll('.rescue-item').forEach((it,i)=>setTimeout(()=>it.classList.add('visible'),i*120)),50);
  }catch(e){document.getElementById('dead-result').innerHTML='<div style="color:var(--rustL);font-size:12px;margin-top:10px">خطأ في الاتصال</div>'}
  btn.disabled=false;btn.innerHTML='⚠ حلل القطع المكدسة';
}
async function runMarket(){
  const btn=document.getElementById('mkt-btn');btn.disabled=true;btn.innerHTML='<span class="mini-spin"></span> يحلل...';
  const itx=inv.map(i=>`${i.name}(${i.type}،${i.price}دج،${i.stock})`).join(' | ');
  const p=`محلل سوق ملابس رجالية جزائري. المخزون: ${itx}. JSON فقط:{"summary":"ملخص","gaps":["فجوة1","فجوة2","فجوة3"],"picks":[{"item":"اسم","price":"سعر","why":"سبب"}],"target":"الفئة الأربح"}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:p}]})});
    const d=await r.json(),ps=JSON.parse(d.content[0].text.replace(/```json|```/g,'').trim());
    document.getElementById('mkt-result').innerHTML=`<div style="margin-top:14px"><div style="font-size:12px;color:var(--txtD);margin-bottom:10px">${ps.summary}</div><div style="margin-bottom:12px">${ps.gaps.map(g=>`<span class="gap-tag">${g}</span>`).join('')}</div><div style="font-size:10px;color:#5090C0;margin-bottom:8px">اشترِ هذا القادم ↓</div>${ps.picks.map(pk=>`<div class="market-pick"><div class="mp-name">${pk.item}</div><div class="mp-price">${pk.price}</div><div class="mp-why">${pk.why}</div></div>`).join('')}<div style="background:rgba(74,120,72,.08);border:1px solid rgba(74,120,72,.15);border-radius:9px;padding:10px 12px;font-size:12px;color:var(--sageL)">${ps.target}</div></div>`;
    setTimeout(()=>document.querySelectorAll('.market-pick').forEach((it,i)=>setTimeout(()=>it.classList.add('visible'),i*100)),50);
  }catch(e){document.getElementById('mkt-result').innerHTML='<div style="color:var(--rustL);font-size:12px;margin-top:10px">خطأ في الاتصال</div>'}
  btn.disabled=false;btn.innerHTML='⟡ توصيات الشراء القادم';
}

// ══ TOAST ══
let toastT;
function toast(m){clearTimeout(toastT);const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');toastT=setTimeout(()=>t.classList.remove('show'),2200)}

// ══ ONBOARDING ══
let obSlide=0;
function animateCounter(target,dur){
  const el=document.getElementById('ob-counter'),ring=document.getElementById('ob-ring-fill'),c=515;
  let st=null;if(ring)ring.style.transition='none';
  function step(ts){if(!st)st=ts;const p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(e*target);if(ring)ring.style.strokeDashoffset=c-(e*(target/100))*c;
    if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
}
function nextSlide(){
  const cur=document.getElementById('ob'+obSlide);cur.classList.add('exit');
  setTimeout(()=>cur.classList.remove('active','exit'),500);
  obSlide++;
  if(obSlide>=3){skipOnboard();return}
  setTimeout(()=>document.getElementById('ob'+obSlide).classList.add('active'),80);
  document.querySelectorAll('.ob-dot').forEach((d,i)=>d.classList.toggle('on',i===obSlide));
  if(obSlide===2)document.getElementById('ob-next').innerHTML='ابدأ <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
}
function skipOnboard(){
  const ob=document.getElementById('s-onboard');
  ob.style.opacity='0';
  setTimeout(()=>ob.classList.add('gone'),500);
}

// ══ PRODUCT SHEET ══
let curItem=null;
function openProductSheet(id){
  const item=inv.find(i=>i.id===id);if(!item)return;curItem=item;
  document.getElementById('ps-type').textContent=item.type;
  document.getElementById('ps-name').textContent=item.name;
  document.getElementById('ps-price').textContent=item.price.toLocaleString('ar-DZ')+' دج';
  const img=document.getElementById('ps-img'),fb=document.getElementById('ps-img-fallback');
  if(item.img){
    img.style.display='none';fb.style.display='flex';fb.style.background=item.color;
    img.onload=()=>{img.style.display='block';fb.style.display='none'};
    img.onerror=()=>{img.style.display='none';fb.style.display='flex';fb.style.background=item.color};
    img.src=item.img;
  } else {
    img.style.display='none';fb.style.display='flex';fb.style.background=item.color;
  }
  document.getElementById('ps-sizes').innerHTML=item.sizes.split('·').map((s,i)=>
    `<div class="ps-size ${i===0?'on':''}" onclick="this.parentElement.querySelectorAll('.ps-size').forEach(x=>x.classList.remove('on'));this.classList.add('on')">${s.trim()}</div>`
  ).join('');
  document.getElementById('ps-result').innerHTML='';
  document.getElementById('ps-build-btn').disabled=false;
  document.getElementById('ps-build-btn').innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> نسّق تنسيقين حول هذه القطعة';
  document.getElementById('product-sheet').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeSheet(e){if(e.target===document.getElementById('product-sheet'))closeProductSheet()}
function closeProductSheet(){document.getElementById('product-sheet').classList.remove('open');document.body.style.overflow='';curItem=null}

async function buildAroundItem(){
  if(!curItem)return;
  const btn=document.getElementById('ps-build-btn');btn.disabled=true;btn.innerHTML='<span class="mini-spin" style="border-top-color:#fff"></span> يبني التنسيقات...';
  const itx=inv.filter(i=>i.id!==curItem.id).map(i=>`${i.name}(${i.type}،${i.cname}،${i.price}دج)`).join(' | ');
  const prompt=`مستشار موضة Wardro. القطعة: ${curItem.name} (${curItem.type}، ${curItem.cname}، ${curItem.price} دج). الباقي: ${itx}. تنسيقين: كاجوال وأنيق. JSON فقط:{"outfits":[{"label":"كاجوال","name":"اسم","items":[{"name":"اسم","color":"#hex"}],"total":0,"reason":"سبب"},{"label":"أنيق","name":"اسم","items":[{"name":"اسم","color":"#hex"}],"total":0,"reason":"سبب"}]}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:prompt}]})});
    const d=await r.json(),ps=JSON.parse(d.content[0].text.replace(/```json|```/g,'').trim());
    const lc={'كاجوال':'var(--sage)','أنيق':'var(--gold)'};
    document.getElementById('ps-result').innerHTML=ps.outfits.map((o,i)=>{
      const rows=[curItem,...o.items.map(it=>{const f=inv.find(x=>x.name===it.name||it.name.includes(x.name.split(' ')[0]));return f?{...f,_c:it.color}:{name:it.name,color:it.color,price:0}})];
      return`<div class="ps-outfit" style="animation-delay:${i*.15}s">
        <div class="ps-outfit-label" style="color:${lc[o.label]||'var(--muted)'}">${o.label} — ${o.name}</div>
        <div class="ps-outfit-items">${rows.map(it=>`<div class="ps-outfit-row"><div class="ps-outfit-chip" style="background:${it._c||it.color}"></div>${it.name}${it.id===curItem.id?' <span style="font-size:9px;color:var(--goldD)">✦ مختارة</span>':''}</div>`).join('')}</div>
        <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:8px">${o.reason}</div>
        <div class="ps-outfit-price">${Number(o.total+curItem.price).toLocaleString('ar-DZ')} دج</div>
      </div>`;
    }).join('');
    curItem.views++;
  }catch(e){document.getElementById('ps-result').innerHTML='<div style="color:var(--rustL);font-size:13px;padding:10px">خطأ في الاتصال — افتح من Claude</div>'}
  btn.disabled=false;btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> نسّق مجدداً';
}

// ══ SHARED ELEMENT MORPHING — openProductSheet from card position ══
const _origOpenPS = openProductSheet;
window.openProductSheet = function(id) {
  const tiles = document.querySelectorAll('.inv-tile');
  let tile = null;
  tiles.forEach(t => {
    const oc = t.getAttribute('onclick') || '';
    if (oc.includes('(' + id + ')')) tile = t;
  });
  if (!tile) {
    document.querySelectorAll('.outfit-item-row').forEach(t => {
      const oc = t.getAttribute('onclick') || '';
      if (oc.includes('(' + id + ')')) tile = t;
    });
  }

  const sheet = document.getElementById('product-sheet');
  if (tile) {
    const r = tile.getBoundingClientRect();
    const cx = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
    const cy = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
    sheet.style.setProperty('--origin-x', cx);
    sheet.style.setProperty('--origin-y', cy);
    tile.classList.add('morphing');
    setTimeout(() => tile.classList.remove('morphing'), 500);
  }
  setTimeout(() => _origOpenPS(id), 80);
};

// ══ PARALLAX on outfit cards ══
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.parallax-bg').forEach(bg => {
    const r = bg.parentElement.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    bg.style.transform = `translate(${cx * -12}px, ${cy * -12}px) scale(1.1)`;
  });
});

// ══ SCROLL PARALLAX on inventory images ══
function updateInvParallax() {
  document.querySelectorAll('.inv-tile').forEach(tile => {
    const r = tile.getBoundingClientRect();
    const center = r.top + r.height / 2;
    const viewCenter = window.innerHeight / 2;
    const offset = ((center - viewCenter) / window.innerHeight) * 20;
    const img = tile.querySelector('.inv-swatch-img');
    if (img) img.style.transform = `translateY(${offset}px) scale(1.1)`;
  });
}
document.querySelectorAll('#s-seller, #inv-list').forEach(el => {
  if (el) el.addEventListener('scroll', updateInvParallax, { passive: true });
});

// ══ OUTFIT VISUAL PARALLAX BG ══
const _origRenderResults = renderResults;
window.renderResults = function(p) {
  _origRenderResults(p);
  setTimeout(() => {
    document.querySelectorAll('.outfit-visual').forEach((vis, i) => {
      const item = p.outfits[i];
      if (!item) return;
      const imgItem = item.items.find(it => {
        const f = inv.find(x => x.name === it.name || it.name.includes(x.name.split(' ')[0]));
        return f && f.img;
      });
      if (!imgItem) return;
      const found = inv.find(x => x.name === imgItem.name || imgItem.name.includes(x.name.split(' ')[0]));
      if (!found || !found.img) return;
      const bg = document.createElement('div');
      bg.className = 'parallax-bg';
      bg.style.backgroundImage = `url(${found.img})`;
      vis.insertBefore(bg, vis.firstChild);
    });
  }, 800);
};

// ══ LOGO re-animate on revisit ══
document.getElementById('s-logo').addEventListener('animationend', () => {}, {once:true});

// ══ SLOW-MO PARALLAX ON ONBOARDING SLIDE 1 ══
(function(){
  let tY = 0, rafId;
  function driftBg() {
    tY += 0.18;
    document.querySelectorAll('.ob-bg-img').forEach((el, i) => {
      const speed = [0.6, 0.9, 0.4][i] || 0.6;
      const offset = Math.sin(tY * 0.008 + i * 1.2) * 18 * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
    rafId = requestAnimationFrame(driftBg);
  }
  const ob = document.getElementById('s-onboard');
  if (ob && !ob.classList.contains('gone')) driftBg();
  document.getElementById('ob-next') && document.getElementById('ob-next').addEventListener('click', () => {
    if (obSlide >= 1) cancelAnimationFrame(rafId);
  });
  document.querySelector('.ob-skip') && document.querySelector('.ob-skip').addEventListener('click', () => {
    cancelAnimationFrame(rafId);
  });
})();

// ══ DEVICE TILT PARALLAX (mobile) ══
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', e => {
    const x = (e.gamma || 0) / 30;
    const y = (e.beta  || 0) / 30;
    document.querySelectorAll('.ob-bg-img').forEach((el, i) => {
      const d = (i + 1) * 6;
      el.style.transform = `translate(${x * d}px, ${y * d}px)`;
    });
    document.querySelectorAll('.parallax-bg').forEach(bg => {
      bg.style.transform = `translate(${x * -10}px, ${y * -10}px) scale(1.1)`;
    });
  }, { passive: true });
}


// ══════════════════════════════════════
// B1: BROWSE — شاشة التصفح الإدماني
// ══════════════════════════════════════

const browseData = [
  {
    id:'b1', tag:'casual', store:'متجر النخبة',
    name:'يوم كاجوال مثالي',
    items:['سترة كلاسيكية نيفي','جينز أزرق سليم فيت','سنيكرز أبيض كلاسيك'],
    colors:['#1C2C4A','#2A4A7A','#E0E0D8'],
    bg:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=70&auto=format&fit=crop',
    total:9800, match:96, saved:false,
    bgColor:'#0D1520'
  },
  {
    id:'b2', tag:'smart', store:'متجر النخبة',
    name:'سمарт كاجوال للجامعة',
    items:['قميص أوكسفورد أبيض','بنطلون بيج كاجوال','حذاء جلد بني كلاسيك'],
    colors:['#E8E4DA','#C8B89A','#7A4010'],
    bg:'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=70&auto=format&fit=crop',
    total:8500, match:93, saved:false,
    bgColor:'#1A1410'
  },
  {
    id:'b3', tag:'street', store:'متجر النخبة',
    name:'ستريت وير حديث',
    items:['هودي رمادي فاتح','جينز أزرق سليم فيت','سنيكرز أبيض كلاسيك'],
    colors:['#C0C0BC','#2A4A7A','#E0E0D8'],
    bg:'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&q=70&auto=format&fit=crop',
    total:9000, match:91, saved:false,
    bgColor:'#141418'
  },
  {
    id:'b4', tag:'budget', store:'متجر النخبة',
    name:'أناقة بأقل ميزانية',
    items:['تيشيرت أبيض أساسي','بنطلون أسود فورمال','سنيكرز أبيض كلاسيك'],
    colors:['#E8E8E4','#1A1A1A','#E0E0D8'],
    bg:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=70&auto=format&fit=crop',
    total:7700, match:89, saved:false,
    bgColor:'#101010'
  },
  {
    id:'b5', tag:'premium', store:'متجر النخبة',
    name:'إطلالة فاخرة للمناسبات',
    items:['جاكيت جلد بني','بنطلون أسود فورمال','حذاء جلد بني كلاسيك'],
    colors:['#5C3010','#1A1A1A','#7A4010'],
    bg:'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=70&auto=format&fit=crop',
    total:12800, match:97, saved:false,
    bgColor:'#1A0E08'
  },
  {
    id:'b6', tag:'casual', store:'متجر النخبة',
    name:'كاجوال دافئ للخروج',
    items:['قميص كاروه فلانيل','جينز أزرق سليم فيت','حذاء جلد بني كلاسيك'],
    colors:['#7A3030','#2A4A7A','#7A4010'],
    bg:'https://images.unsplash.com/photo-1603251579711-b1c39b1e0890?w=600&q=70&auto=format&fit=crop',
    total:8900, match:94, saved:false,
    bgColor:'#180C0C'
  },
];

let browseFilter = 'all';
let browseVisible = [];

function initBrowse() {
  document.querySelectorAll('.bf-tag').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.bf-tag').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      browseFilter = t.dataset.f;
      renderBrowse();
    };
  });
  const feed = document.getElementById('browse-feed');
  if (feed) {
    feed.addEventListener('scroll', () => {
      const fab = document.getElementById('browse-fab');
      if (fab) fab.classList.toggle('show', feed.scrollTop > 300);
    }, {passive:true});
  }
  try { renderStoryBars(); } catch(e) {}
}

function renderStoryBars() {
  const c = document.getElementById('browse-stories');
  if (!c) return;
  c.innerHTML = Array(5).fill(0).map((_,i) =>
    `<div class="bs-bar"><div class="bs-fill" id="bs${i}" style="width:${i<2?'100':i===2?'60':'0'}%"></div></div>`
  ).join('');
}

function renderBrowse() {
  const feed = document.getElementById('browse-feed');
  if (!feed) return;
  const filtered = browseFilter === 'all'
    ? browseData
    : browseData.filter(d => d.tag === browseFilter);

  feed.innerHTML = filtered.map((d, i) => {
    const pieces = d.colors.map((c, j) =>
      `<div class="bc-piece" style="background:${c};height:${55+j*20}px"></div>`
    ).join('');
    return `
    <div class="browse-card" id="bc-${d.id}" onclick="openBrowseCard('${d.id}')">
      <div class="bc-visual" style="background:${d.bgColor}">
        <div class="bc-bg" style="background-image:url('${d.bg}')"></div>
        <div class="bc-pieces">${pieces}</div>
        <div class="bc-overlay"></div>
      </div>
      <div class="bc-body">
        <div class="bc-store">✦ ${d.store}</div>
        <div class="bc-name">${d.name}</div>
        <div class="bc-items">${d.items.join(' · ')}</div>
        <div class="bc-footer">
          <div class="bc-price">${d.total.toLocaleString('ar-DZ')} <span style="font-size:12px;color:var(--goldD)">دج</span></div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="bc-match">${d.match}% توافق</span>
            <div class="bc-save ${d.saved?'saved':''}" onclick="event.stopPropagation();toggleSave('${d.id}',this)">
              ${d.saved?'♥':'♡'}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  setTimeout(() => {
    document.querySelectorAll('.browse-card').forEach((c, i) => {
      setTimeout(() => c.classList.add('visible'), i * 90);
    });
  }, 50);
}

function toggleSave(id, el) {
  const d = browseData.find(x => x.id === id);
  if (!d) return;
  d.saved = !d.saved;
  el.classList.toggle('saved', d.saved);
  el.textContent = d.saved ? '♥' : '♡';
  if (d.saved) {
    spawnGP(el, 6);
    toast('✦ حُفظ في المفضلة');
  }
}

function openBrowseCard(id) {
  const d = browseData.find(x => x.id === id);
  if (!d) return;
  const match = inv.find(i => d.items.includes(i.name));
  if (match) {
    openProductSheet(match.id);
  } else {
    toast('اضغط "نسّق" لبناء تنسيق مخصص لك');
  }
}

function showCustomerTab(tab) {
  document.querySelectorAll('#nav-bar-customer .nav-item').forEach(n => n.classList.remove('on'));
  if (tab === 'browse') {
    const br = document.getElementById('s-browse');
    const cur = document.querySelector('.screen.active,.screen-center.active');
    if (cur && cur !== br) { cur.classList.remove('active'); cur.style.display='none'; }
    if (br) { br.style.display = 'flex'; br.classList.add('active'); }
    const nb = document.getElementById('nav-browse');
    if (nb) nb.classList.add('on');
    renderBrowse();
  } else if (tab === 'profile') {
    const cur = document.querySelector('.screen.active,.screen-center.active');
    const br = document.getElementById('s-browse');
    if (br) { br.classList.remove('active'); br.style.display='none'; }
    const pr = document.getElementById('s-profile');
    if (pr) { pr.style.display='flex'; pr.classList.add('active'); }
    const nh = document.getElementById('nav-home');
    if (nh) nh.classList.add('on');
    triggerStagger('s-profile');
  } else if (tab === 'generate') {
    showCustomerTab('profile');
    setTimeout(() => {
      const btn = document.getElementById('go-btn');
      if (btn) btn.scrollIntoView({behavior:'smooth'});
    }, 500);
  }
}