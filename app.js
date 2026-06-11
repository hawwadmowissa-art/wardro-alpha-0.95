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

function goCustomer(){toast('Customer — قريباً')}

function goSeller(){navigateTo('s-seller-reg','slide')}

// ══ STAGGER ══
function triggerStagger(id){
  const el=document.getElementById(id);if(!el)return;
  if(id==='s-splash')el.querySelectorAll('.rs-card').forEach((c,i)=>{c.classList.remove('visible');setTimeout(()=>c.classList.add('visible'),200+i*150)});
  if(id==='s-welcome')el.querySelectorAll('.wel-card').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(20px)';setTimeout(()=>{c.style.transition='all .5s var(--spring)';c.style.opacity='1';c.style.transform='translateY(0)'},200+i*150)});
  if(id==='s-seller-reg'||id==='s-seller-signin')el.querySelectorAll('.form-group,.cta-btn,.form-link,.form-security,.reg-features').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(14px)';setTimeout(()=>{c.style.transition='all .5s var(--expo)';c.style.opacity='1';c.style.transform='translateY(0)'},80+i*60)});
  if(id==='s-editor'){const nm=document.getElementById('ed-store-name');if(nm)nm.textContent=localStorage.getItem('wardro_store_name')||'—';loadEditorProducts();}
}

// ══ LOGO ══
window.addEventListener('DOMContentLoaded',()=>{
  const onboarded=localStorage.getItem('wardro_onboarded')==='true';
  if(onboarded){const ob=document.getElementById('s-onboard');if(ob)ob.classList.add('gone')}

  const storeName=localStorage.getItem('wardro_store_name');
  if(storeName){const wn=document.getElementById('wel-name');if(wn)wn.textContent=storeName}
  const showName=localStorage.getItem('wardro_store_name')||'—';
  const sn=document.getElementById('show-store-name');if(sn)sn.textContent=showName;

  setTimeout(()=>{
    const logo=document.getElementById('s-logo');
    logo.classList.add('fade-out');
    setTimeout(()=>{logo.style.display='none'},1000);
    if(!onboarded)animateCounter(60,1500);
    document.querySelectorAll('.rs-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),200+i*150));
  },3800);
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

// ══ SUPABASE HELPER ══
function getSb(){
  if(window.db)return window.db;
  toast('قاعدة البيانات غير متصلة');
  return null;
}

// ══ SELLER AUTH ══
function setRegErr(id,msg){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=msg;el.classList.add('show');
  const inp=el.previousElementSibling;
  if(inp&&(inp.tagName==='INPUT'||inp.tagName==='TEXTAREA')){
    inp.classList.add('input-err');
    inp.addEventListener('input',()=>{inp.classList.remove('input-err');el.classList.remove('show')},{once:true});
  }
}
function clearRegErrors(){
  document.querySelectorAll('#s-seller-reg .field-err').forEach(el=>{el.classList.remove('show');el.textContent=''});
  document.querySelectorAll('#s-seller-reg .input-err').forEach(el=>el.classList.remove('input-err'));
}

async function doSellerReg(){
  clearRegErrors();
  const btn=document.getElementById('reg-submit');
  const storeName=document.getElementById('reg-store').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const pass2=document.getElementById('reg-pass2').value;

  let ok=true;
  if(!storeName){setRegErr('err-store','أدخل اسم المتجر');ok=false}
  if(!email||!email.includes('@')){setRegErr('err-email','أدخل بريداً إلكترونياً صحيحاً');ok=false}
  if(pass.length<8){setRegErr('err-pass','كلمة المرور: 8 أحرف على الأقل');ok=false}
  else if(pass!==pass2){setRegErr('err-pass2','كلمتا المرور غير متطابقتين');ok=false}
  if(!ok)return;

  const sb=getSb();if(!sb)return;
  btn.disabled=true;
  btn.innerHTML='<span class="btn-spinner"></span> جاري الإنشاء...';

  try{
    const{data,error}=await sb.auth.signUp({email,password:pass,options:{data:{store_name:storeName,role:'seller'}}});
    if(error)throw error;
    await sb.from('sellers').upsert({id:data.user.id,store_name:storeName},{onConflict:'id'});
    localStorage.setItem('wardro_store_name',storeName);
    localStorage.setItem('wardro_role','seller');
    document.getElementById('wel-name').textContent=storeName;
    document.getElementById('show-store-name').textContent=storeName;
    btn.innerHTML='✓ تم إنشاء المتجر';
    btn.style.background='var(--goldD)';
    setTimeout(()=>{btn.style.background='';navigateTo('s-welcome','mask')},700);
  }catch(e){
    btn.disabled=false;btn.innerHTML='Create Store →';
    const msg=(e.message||'').toLowerCase();
    if(msg.includes('already registered')||msg.includes('already been registered')){
      setRegErr('err-email','هذا البريد الإلكتروني مستخدم بالفعل');
    }else if(msg.includes('password')&&(msg.includes('weak')||msg.includes('strong'))){
      setRegErr('err-pass','كلمة المرور ضعيفة — اختر كلمة أقوى');
    }else if(msg.includes('email')&&(msg.includes('invalid')||msg.includes('format'))){
      setRegErr('err-email','صيغة البريد الإلكتروني غير صحيحة');
    }else{
      setRegErr('err-general',e.message||'حدث خطأ — حاول مجدداً');
    }
  }
}

async function doSellerSignIn(){
  const btn=document.getElementById('si-submit');
  const email=document.getElementById('si-email').value.trim();
  const pass=document.getElementById('si-pass').value;
  if(!email||!pass)return toast('يرجى ملء جميع الحقول');
  const sb=getSb();if(!sb)return;
  btn.textContent='جاري التحقق...';btn.disabled=true;
  try{
    const{data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error)throw error;
    const{data:seller}=await sb.from('sellers').select('store_name').eq('id',data.user.id).single();
    const name=seller?.store_name||email.split('@')[0];
    localStorage.setItem('wardro_store_name',name);
    localStorage.setItem('wardro_role','seller');
    document.getElementById('wel-name').textContent=name;
    document.getElementById('show-store-name').textContent=name;
    navigateTo('s-welcome','mask');
    await loadEditorProducts();
    toast('✓ أهلاً بعودتك!');
  }catch(e){toast(e.message||'بيانات غير صحيحة');btn.textContent='Sign In →';btn.disabled=false}
}

// ══ PRODUCTS ══
let _apSizes=[],_apCat=null,_apImgFile=null;

window.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('size-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    b.classList.toggle('active');
    const v=b.dataset.val;
    if(b.classList.contains('active'))_apSizes.push(v);
    else _apSizes=_apSizes.filter(s=>s!==v);
  });
  document.getElementById('cat-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    document.querySelectorAll('#cat-btns .sel-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');_apCat=b.dataset.val;
  });
});

function previewProductImg(input){
  if(!input.files[0])return;
  _apImgFile=input.files[0];
  const r=new FileReader();
  r.onload=ev=>{
    const zone=document.getElementById('ap-img-zone');
    const ph=document.getElementById('ap-img-preview');
    zone.style.backgroundImage=`url(${ev.target.result})`;
    zone.style.backgroundSize='cover';zone.style.backgroundPosition='center';
    zone.style.borderStyle='solid';
    if(ph)ph.style.display='none';
  };
  r.readAsDataURL(_apImgFile);
}

async function saveProduct(){
  const btn=document.getElementById('ap-submit');
  const name=document.getElementById('ap-name').value.trim();
  const price=document.getElementById('ap-price').value;
  const color=document.getElementById('ap-color').value.trim();
  const desc=document.getElementById('ap-desc').value.trim();
  if(!name)return toast('أدخل اسم القطعة');
  if(!price||isNaN(price))return toast('أدخل سعراً صحيحاً');
  if(!_apSizes.length)return toast('اختر حجماً على الأقل');
  if(!_apCat)return toast('اختر الفئة');
  const sb=getSb();if(!sb)return;
  btn.textContent='جاري الحفظ...';btn.disabled=true;
  try{
    let img_url=null;
    if(_apImgFile){
      const{data:{user:u0}}=await sb.auth.getUser();
      const ext=_apImgFile.name.split('.').pop();
      const path=`products/${u0.id}/${Date.now()}.${ext}`;
      const{error:upErr}=await sb.storage.from('product-images').upload(path,_apImgFile,{upsert:true});
      if(!upErr){const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);img_url=pu.publicUrl}
    }
    const{data:{user}}=await sb.auth.getUser();
    const{error:insErr}=await sb.from('products').insert({seller_id:user.id,name,price:parseFloat(price),sizes:_apSizes,type:_apCat,color,description:desc,image:img_url});
    if(insErr)throw insErr;
    toast('✓ تمت إضافة القطعة');
    document.getElementById('ap-name').value='';
    document.getElementById('ap-price').value='';
    document.getElementById('ap-color').value='';
    document.getElementById('ap-desc').value='';
    document.querySelectorAll('.sel-btn').forEach(b=>b.classList.remove('active'));
    const zone=document.getElementById('ap-img-zone');
    if(zone){zone.style.backgroundImage='';zone.style.backgroundSize='';zone.style.backgroundPosition='';zone.style.borderStyle='';}
    const ph=document.getElementById('ap-img-preview');if(ph)ph.style.display='';
    _apSizes=[];_apCat=null;_apImgFile=null;
    closeAddProduct();
    await loadEditorProducts();
  }catch(e){toast(e.message||'حدث خطأ');btn.textContent='Done ✓';btn.disabled=false}
}

async function loadEditorProducts(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();
    if(!user)return;
    const{data:seller}=await sb.from('sellers').select('profile_image').eq('id',user.id).single();
    if(seller?.profile_image){
      const circle=document.getElementById('sp-img-circle');
      if(circle){circle.style.backgroundImage=`url(${seller.profile_image})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';circle.innerHTML='';}
      localStorage.setItem('wardro_profile_image',seller.profile_image);
    }
    const{data:prods}=await sb.from('products').select('*').eq('seller_id',user.id).order('created_at',{ascending:false});
    renderEditorProducts(prods||[]);
    renderShowProducts(prods||[]);
  }catch(e){}
}

function renderEditorProducts(prods){
  const grid=document.getElementById('prod-grid');
  const empty=document.getElementById('prod-empty');
  if(!grid||!empty)return;
  if(!prods.length){grid.style.display='none';empty.style.display='flex';return}
  empty.style.display='none';grid.style.display='grid';
  grid.innerHTML=prods.map(p=>`
    <div class="ed-prod-card">
      ${p.image?`<img class="ed-prod-img" src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="ed-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.3">👔</div>`}
      <div class="ed-prod-info"><div class="ed-prod-name">${p.name}</div><div class="ed-prod-price">${Number(p.price).toLocaleString()} DZD</div></div>
    </div>`).join('');
}

function renderShowProducts(prods){
  const grid=document.getElementById('show-prod-grid');
  const empty=document.getElementById('show-empty');
  if(!grid||!empty)return;
  if(!prods.length){grid.style.display='none';empty.style.display='block';return}
  empty.style.display='none';grid.style.display='grid';
  grid.innerHTML=prods.map(p=>`
    <div class="show-prod-card">
      ${p.image?`<img class="show-prod-img" src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="show-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;opacity:.3">👔</div>`}
      <div class="show-prod-info"><div class="show-prod-name">${p.name}</div><div class="show-prod-price">${Number(p.price).toLocaleString()} DZD</div><div class="show-prod-cat">${p.type||''}</div></div>
    </div>`).join('');
}

function openAddProduct(){
  const m=document.getElementById('ap-modal');if(!m)return;
  m.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('ap-modal--open')));
}

function closeAddProduct(){
  const m=document.getElementById('ap-modal');if(!m)return;
  m.classList.remove('ap-modal--open');
  setTimeout(()=>{m.style.display='none'},380);
}

function apModalBackdropClose(e){
  if(e.target===e.currentTarget)closeAddProduct();
}

function previewStoreProfile(input){
  if(!input.files[0])return;
  const file=input.files[0];
  const r=new FileReader();
  r.onload=async ev=>{
    const circle=document.getElementById('sp-img-circle');
    if(circle){circle.style.backgroundImage=`url(${ev.target.result})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';circle.innerHTML='';}
    const sb=getSb();if(!sb)return;
    const{data:{user}}=await sb.auth.getUser();if(!user)return;
    const ext=file.name.split('.').pop();
    const path=`store-profiles/${user.id}.${ext}`;
    const{error:upErr}=await sb.storage.from('product-images').upload(path,file,{upsert:true});
    if(!upErr){
      const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);
      await sb.from('sellers').update({profile_image:pu.publicUrl}).eq('id',user.id);
      localStorage.setItem('wardro_profile_image',pu.publicUrl);
      toast('✓ تم تحديث صورة المتجر');
    }
  };
  r.readAsDataURL(file);
}

// ══ ONBOARDING ══
let obSlide=0;
function animateCounter(target,dur){
  const el=document.getElementById('ob-counter');if(!el)return;
  let st=null;
  function step(ts){if(!st)st=ts;const p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(e*target);
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
  const btn=document.getElementById('ob-next');
  if(btn){
    if(obSlide===1)btn.textContent='Continue →';
    if(obSlide===2)btn.textContent='START EXPERIENCE →';
  }
}
function skipOnboard(){
  localStorage.setItem('wardro_onboarded','true');
  const ob=document.getElementById('s-onboard');
  ob.style.opacity='0';
  setTimeout(()=>{
    ob.classList.add('gone');
    document.querySelectorAll('.rs-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),100+i*150));
  },500);
}


