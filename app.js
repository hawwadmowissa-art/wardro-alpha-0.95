let isTransitioning=false;

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
  },dur);
}

function goCustomer(){toast('Customer — coming soon')}

function goSeller(){toast('Seller — coming soon')}

// ══ STAGGER ══
function triggerStagger(id){
  const el=document.getElementById(id);if(!el)return;
  if(id==='s-splash')el.querySelectorAll('.role-card').forEach((c,i)=>{c.classList.remove('visible');setTimeout(()=>c.classList.add('visible'),200+i*150)});
}

// ══ LOGO ══
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    document.getElementById('s-logo').classList.add('fade-out');
    setTimeout(()=>document.getElementById('s-logo').style.display='none',1100);
  },3800);  // longer display for assembly animation
  setTimeout(()=>animateCounter(60,2600),700);
  setTimeout(()=>{const sc=document.getElementById('s-splash');if(sc)sc.querySelectorAll('.role-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),3200+i*150))},0);
});

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

// ══ API KEY GUARD ══
function getApiKey(){
  const k=localStorage.getItem('wardro_claude_key');
  if(k&&k.trim())return k.trim();
  showApiKeyModal();
  return null;
}
function showApiKeyModal(){
  let m=document.getElementById('api-key-modal');
  if(m){m.style.display='flex';return}
  m=document.createElement('div');
  m.id='api-key-modal';
  m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(11,10,8,.92);display:flex;align-items:center;justify-content:center;padding:24px';
  m.innerHTML=`<div style="background:var(--card);border:1px solid var(--brd2);border-radius:18px;padding:28px 24px;width:100%;max-width:360px;text-align:center">
    <div style="font-size:28px;margin-bottom:12px">🔑</div>
    <div style="font-family:'Fraunces',serif;font-size:20px;color:var(--cream);margin-bottom:8px">مفتاح Claude API</div>
    <div style="font-size:13px;color:var(--txtD);margin-bottom:20px;line-height:1.6">أدخل مفتاح Anthropic API الخاص بك.<br>يُحفظ محلياً على جهازك فقط.</div>
    <input id="api-key-inp" type="password" placeholder="sk-ant-..." style="width:100%;background:var(--bg);border:1px solid var(--brd2);border-radius:10px;padding:12px 14px;color:var(--cream);font-size:14px;outline:none;margin-bottom:14px;text-align:left;direction:ltr">
    <button onclick="saveApiKey()" style="width:100%;background:var(--rust);color:#fff;border:none;border-radius:10px;padding:13px;font-size:14px;font-family:'Tajawal',sans-serif;cursor:pointer">حفظ والمتابعة</button>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('api-key-inp')?.focus(),100);
}
function saveApiKey(){
  const inp=document.getElementById('api-key-inp');
  const k=(inp?.value||'').trim();
  if(!k.startsWith('sk-')){toast('المفتاح غير صحيح — يجب أن يبدأ بـ sk-');return}
  localStorage.setItem('wardro_claude_key',k);
  const m=document.getElementById('api-key-modal');
  if(m)m.style.display='none';
  toast('✓ تم حفظ المفتاح');
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

