let isTransitioning=false;

// ══ NAVIGATE ══
// Back-button history: every real transition pushes a state entry so Android's
// system back navigates within the app instead of exiting it.
history.pushState({screen:'s-splash'},'','');

function navigateTo(targetId,type='z-axis',fromHistory){
  if(isTransitioning)return;
  isTransitioning=true;
  const cur=document.querySelector('.screen.active,.screen-center.active');
  const tgt=document.getElementById(targetId);
  if(!cur||!tgt){isTransitioning=false;return}
  if(!fromHistory)history.pushState({screen:targetId},'','');
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

window.addEventListener('popstate',e=>{
  const screen=e.state&&e.state.screen;
  if(screen)navigateTo(screen,'z-axis',true);
  else history.pushState({screen:'s-splash'},'','');
});

function goCustomer(){navigateTo('s-browse','slide')}

function goSeller(){navigateTo('s-seller-signin','slide')}

// Role Selection — move gold glow to tapped card, then navigate
function rsSelectCard(cardId,cb){
  document.querySelectorAll('.rs-card').forEach(function(c){c.classList.remove('rs-card--active');});
  document.getElementById(cardId).classList.add('rs-card--active');
  setTimeout(cb,360);
}

// ══ STAGGER ══
function triggerStagger(id){
  const el=document.getElementById(id);if(!el)return;
  if(id==='s-splash')el.querySelectorAll('.rs-card').forEach((c,i)=>{c.classList.remove('visible');setTimeout(()=>c.classList.add('visible'),200+i*150)});
  if(id==='s-welcome')el.querySelectorAll('.wel-card').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(20px)';setTimeout(()=>{c.style.transition='all .5s var(--spring)';c.style.opacity='1';c.style.transform='translateY(0)'},200+i*150)});
  if(id==='s-seller-reg'||id==='s-seller-signin')el.querySelectorAll('.form-group,.cta-btn,.form-link,.form-security,.reg-features').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(14px)';setTimeout(()=>{c.style.transition='all .5s var(--expo)';c.style.opacity='1';c.style.transform='translateY(0)'},80+i*60)});
  if(id==='s-editor'){const nm=document.getElementById('ed-store-name');if(nm)nm.textContent=localStorage.getItem('wardro_store_name')||'—';loadEditorProducts();}
  if(id==='s-show'){loadShowMode();}
  if(id==='s-browse'){_guestSellerId=null;buildBrowseHero();loadBrowse();}
  if(id==='s-saved'){loadSaved();}
  if(id==='s-discover'){dcInitSlider();}
}

// ══ LOGO ══
window.addEventListener('DOMContentLoaded',async()=>{
  localStorage.removeItem('wardro_claude_key');
  const onboarded=localStorage.getItem('wardro_onboarded')==='true';
  if(onboarded){const ob=document.getElementById('s-onboard');if(ob)ob.classList.add('gone')}

  const storeName=localStorage.getItem('wardro_store_name');
  if(storeName){const wn=document.getElementById('wel-name');if(wn)wn.textContent=storeName}
  const showName=localStorage.getItem('wardro_store_name')||'—';
  const sn=document.getElementById('show-store-name');if(sn)sn.textContent=showName;

  setTimeout(async()=>{
    const logo=document.getElementById('s-logo');
    logo.classList.add('fade-out');
    setTimeout(()=>{logo.style.display='none'},1000);
    if(!onboarded)animateCounter(60,1500);
    // Session persistence
    if(window.db&&localStorage.getItem('wardro_role')==='seller'){
      try{
        const{data:{session}}=await window.db.auth.getSession();
        if(session){
          const{data:seller}=await window.db.from('sellers').select('store_name,approval_status').eq('id',session.user.id).single();
          if(seller?.approval_status==='approved'){
            navigateTo('s-show','z-axis');
          }else{
            const name=seller?.store_name||localStorage.getItem('wardro_store_name')||'—';
            document.getElementById('pen-store-name').textContent=name;
            document.getElementById('pen-email').textContent=session.user.email||'';
            navigateTo('s-pending','z-axis');
          }
          _handleStoreDeepLink();
          _handleProductDeepLink();
          return;
        }
      }catch(_){}
    }
    if(window.db&&localStorage.getItem('wardro_role')==='customer'){
      try{
        const{data:{session}}=await window.db.auth.getSession();
        if(session){navigateTo('s-browse','z-axis');_handleStoreDeepLink();_handleProductDeepLink();return;}
      }catch(_){}
    }
    document.querySelectorAll('.rs-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),200+i*150));
    _handleStoreDeepLink();
    _handleProductDeepLink();
  },3800);
});

// ══ DEEP LINK: ?store=<seller UUID> ══
function _waitIdle(cb){
  if(isTransitioning){setTimeout(()=>_waitIdle(cb),100);return;}
  cb();
}
async function _openDeepLinkStore(storeId){
  if(!window.db)return;
  try{
    const{data:seller,error}=await window.db.from('sellers').select('store_name,profile_image').eq('id',storeId).single();
    if(error||!seller)return;
    openStoreView(storeId,seller.store_name||'',seller.profile_image||null);
  }catch(_){}
}
function _handleStoreDeepLink(){
  const storeId=new URLSearchParams(location.search).get('store');
  if(!storeId||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId))return;
  _waitIdle(()=>{
    if(document.getElementById('s-browse')?.classList.contains('active')){
      _openDeepLinkStore(storeId);
    }else{
      navigateTo('s-browse','z-axis');
      _waitIdle(()=>_openDeepLinkStore(storeId));
    }
  });
}

// ══ DEEP LINK: ?product=<product UUID> ══
async function _openDeepLinkProduct(prodId){
  if(!window.db)return;
  try{
    const{data:p,error}=await window.db.from('products').select('*,seller:sellers(store_name,profile_image,phone,cart_enabled,whatsapp_enabled)').eq('id',prodId).eq('is_hidden',false).single();
    if(error||!p)return;
    if(p.slider_type==='main_hero'&&p.hero_status!=='approved')return;
    if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);
    openProdDetail(p.id);
  }catch(_){}
}
function _handleProductDeepLink(){
  const params=new URLSearchParams(location.search);
  if(params.get('store'))return;
  const prodId=params.get('product');
  if(!prodId||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prodId))return;
  _waitIdle(()=>{
    if(document.getElementById('s-browse')?.classList.contains('active')){
      _openDeepLinkProduct(prodId);
    }else{
      navigateTo('s-browse','z-axis');
      _waitIdle(()=>_openDeepLinkProduct(prodId));
    }
  });
}

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

// ══ AI via Edge Functions (no frontend key) ══

// ══ TOAST ══
let toastT;
function toast(m){clearTimeout(toastT);const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');toastT=setTimeout(()=>t.classList.remove('show'),2200)}

// ══ SUPABASE HELPER ══
function getSb(){
  if(window.db)return window.db;
  toast('قاعدة البيانات غير متصلة');
  return null;
}

// ══ XSS HELPERS ══
function esc(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function safeUrl(u){if(!u)return'';const s=String(u).trim();return/^javascript:/i.test(s)?'':s;}

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
  const phone=document.getElementById('reg-phone').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const pass2=document.getElementById('reg-pass2').value;

  let ok=true;
  if(!storeName){setRegErr('err-store','أدخل اسم المتجر');ok=false}
  if(!/^\+\d{8,15}$/.test(phone)){setRegErr('err-phone','الرقم غير صحيح، استعمل الصيغة الدولية');ok=false}
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
    await sb.from('sellers').upsert({id:data.user.id,store_name:storeName,phone},{onConflict:'id'});
    localStorage.setItem('wardro_store_name',storeName);
    localStorage.setItem('wardro_role','seller');
    document.getElementById('wel-name').textContent=storeName;
    document.getElementById('show-store-name').textContent=storeName;
    document.getElementById('pen-store-name').textContent=storeName;
    document.getElementById('pen-email').textContent=email;
    btn.innerHTML='✓ تم إنشاء المتجر';
    btn.style.background='var(--goldD)';
    setTimeout(()=>{btn.style.background='';navigateTo('s-pending','mask')},700);
  }catch(e){
    btn.disabled=false;btn.innerHTML='Create Store →';
    const msg=(e.message||'').toLowerCase();
    if(msg.includes('already registered')||msg.includes('already been registered')){
      try{
        const{data:siData,error:siErr}=await sb.auth.signInWithPassword({email,password:pass});
        if(!siErr&&siData?.user){
          const{data:seller}=await sb.from('sellers').select('store_name,approval_status').eq('id',siData.user.id).single();
          const name=seller?.store_name||email.split('@')[0];
          localStorage.setItem('wardro_store_name',name);
          localStorage.setItem('wardro_role','seller');
          document.getElementById('wel-name').textContent=name;
          document.getElementById('show-store-name').textContent=name;
          if(seller?.approval_status==='approved'){
            navigateTo('s-welcome','mask');
            await loadEditorProducts();
            toast('✓ أهلاً بعودتك!');
          }else{
            document.getElementById('pen-store-name').textContent=name;
            document.getElementById('pen-email').textContent=email;
            navigateTo('s-pending','mask');
          }
          return;
        }
      }catch(_){}
      setRegErr('err-email','هذا الحساب موجود — سجّل الدخول من فضلك');
      setTimeout(()=>navigateTo('s-seller-signin','slide'),1600);
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
    const{data:seller}=await sb.from('sellers').select('store_name,approval_status').eq('id',data.user.id).single();
    const name=seller?.store_name||email.split('@')[0];
    localStorage.setItem('wardro_store_name',name);
    localStorage.setItem('wardro_role','seller');
    document.getElementById('wel-name').textContent=name;
    document.getElementById('show-store-name').textContent=name;
    if(seller?.approval_status==='approved'){
      navigateTo('s-welcome','mask');
      await loadEditorProducts();
      toast('✓ أهلاً بعودتك!');
    }else{
      document.getElementById('pen-store-name').textContent=name;
      document.getElementById('pen-email').textContent=email;
      navigateTo('s-pending','mask');
    }
  }catch(e){toast(e.message||'بيانات غير صحيحة');btn.textContent='Sign In →';btn.disabled=false}
}

// ══ PRODUCTS ══
let _apSizes=[],_apCat=null,_apSliderType='none',_apImgFiles=[],_apExistingUrls=[],_apEditId=null,_editorProds={},_apProductType=null,_apColorTags=[],_apAvailable=true,_apExclusive=false;
let _apDetailImgFiles=[],_apDetailExistingUrls=[];

function _priceLabel(p){return p.is_exclusive?'Exclusive':Number(p.price||0).toLocaleString()+' DZD';}

window.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('size-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    if(_apProductType==='accessory')return;
    b.classList.toggle('active');
    const v=b.dataset.val;
    if(b.classList.contains('active'))_apSizes.push(v);
    else _apSizes=_apSizes.filter(s=>s!==v);
  });
  document.getElementById('product-type-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    const prev=_apProductType;
    _apProductType=b.dataset.val;
    document.querySelectorAll('#product-type-btns .sel-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    if(prev&&prev!==_apProductType&&_apSizes.length)toast('تم مسح الأحجام — اختر من جديد');
    _renderSizeBtns(_apProductType);
    _apUpdateSubmitBtn();
  });
  document.getElementById('cat-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    document.querySelectorAll('#cat-btns .sel-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');_apCat=b.dataset.val;
    _apUpdateSubmitBtn();
  });
  const _ctb=document.getElementById('color-tag-btns');
  if(_ctb){
    _ctb.innerHTML=_AP_COLORS.map(c=>`<button class="sel-btn" data-val="${c.key}" style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.hex};flex-shrink:0${c.border?';border:1px solid rgba(138,138,138,.4)':''}" aria-hidden="true"></span>${esc(c.ar)}</button>`).join('');
    _ctb.addEventListener('click',e=>{
      const b=e.target.closest('.sel-btn');if(!b)return;
      b.classList.toggle('active');
      const v=b.dataset.val;
      if(b.classList.contains('active')){if(!_apColorTags.includes(v))_apColorTags.push(v);}
      else _apColorTags=_apColorTags.filter(c=>c!==v);
    });
  }
  document.getElementById('slidertype-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    document.querySelectorAll('#slidertype-btns .sel-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');_apSliderType=b.dataset.val;
  });
  document.getElementById('ap-name')?.addEventListener('input',_apUpdateSubmitBtn);
  document.getElementById('ap-price')?.addEventListener('input',_apUpdateSubmitBtn);
  _initDiscoverColorSwatches();
  // Legal modal wiring
  const _lmOverlay=document.getElementById('legal-modal');
  document.getElementById('legal-modal-close')?.addEventListener('click',closeLegalModal);
  document.getElementById('legal-modal-accept')?.addEventListener('click',_legalAccept);
  if(_lmOverlay)_lmOverlay.addEventListener('click',e=>{if(e.target===_lmOverlay)closeLegalModal();});
  document.querySelectorAll('#s-seller-reg .legal-link').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation();e.preventDefault();
    window.openLegalModal(btn.dataset.doc,()=>{const cb=document.getElementById('seller-legal-check');if(cb){cb.checked=true;updateCreateStoreButtonState();}});
  }));
  document.getElementById('seller-legal-check')?.addEventListener('change',updateCreateStoreButtonState);
  document.querySelectorAll('#ob-legal-line .legal-link').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation();e.preventDefault();window.openLegalModal(btn.dataset.doc,null);
  }));
  updateCreateStoreButtonState();
});

const _AP_COLORS=[
  {key:'black',ar:'أسود',hex:'#0A0A0A'},
  {key:'white',ar:'أبيض',hex:'#FAFAFA',border:true},
  {key:'off-white',ar:'أبيض مكسور',hex:'#EDE3CC',border:true},
  {key:'grey',ar:'رمادي',hex:'#8A8A8A'},
  {key:'navy',ar:'كحلي',hex:'#1F2A44'},
  {key:'brown',ar:'بني',hex:'#5C3A1E'},
  {key:'camel',ar:'جملي',hex:'#C19A6B'},
  {key:'beige',ar:'بيج',hex:'#D9C6A5',border:true},
  {key:'olive',ar:'زيتوني',hex:'#6B7A5E'},
  {key:'dark-green',ar:'أخضر غامق',hex:'#2E4A33'},
  {key:'burgundy',ar:'نبيذي',hex:'#7A3B3B'},
  {key:'rust',ar:'طوباقي',hex:'#B4513A'},
  {key:'blue',ar:'أزرق',hex:'#1F4E8C'},
  {key:'sky-blue',ar:'أزرق سماوي',hex:'#5BAFD6'},
  {key:'mustard',ar:'خردلي',hex:'#C8A832'},
  {key:'pink',ar:'وردي',hex:'#E8A0B0'},
];

const _AP_TYPE_SIZES={shirt:['S','M','L','XL','XXL'],jacket:['S','M','L','XL','XXL'],pants:['S','M','L','XL','XXL'],jeans:['28','29','30','31','32','33','34','36','38','40'],shoes:['39','40','41','42','43','44','45','46'],accessory:['one-size'],ensemble:['S','M','L','XL','XXL'],sandals:['39','40','41','42','43','44','45','46']};

function _renderSizeBtns(type){
  const container=document.getElementById('size-btns');if(!container)return;
  if(type==='accessory'){
    container.innerHTML='<button class="sel-btn active" data-val="one-size" style="pointer-events:none">One Size</button>';
    _apSizes=['one-size'];
  }else{
    const sizes=_AP_TYPE_SIZES[type]||['S','M','L','XL','XXL'];
    container.innerHTML=sizes.map(s=>`<button class="sel-btn" data-val="${esc(s)}">${esc(s)}</button>`).join('');
    _apSizes=[];
  }
}

function setAvailability(avail){
  _apAvailable=avail;
  document.getElementById('ap-avail-yes')?.classList.toggle('active',avail);
  document.getElementById('ap-avail-no')?.classList.toggle('active',!avail);
}

function toggleExclusive(){
  _apExclusive=!_apExclusive;
  document.getElementById('ap-excl-btn')?.classList.toggle('active',_apExclusive);
  const pf=document.getElementById('ap-price');
  if(pf){pf.disabled=_apExclusive;if(_apExclusive)pf.value='';}
  _apUpdateSubmitBtn();
}

function _apUpdateSubmitBtn(){
  const btn=document.getElementById('ap-submit');if(!btn)return;
  const name=(document.getElementById('ap-name')?.value||'').trim();
  const price=(document.getElementById('ap-price')?.value||'').trim();
  const priceOk=_apExclusive||(!!price&&!isNaN(price)&&parseFloat(price)>0);
  const ok=!!(_apProductType&&_apCat&&name&&priceOk);
  btn.disabled=!ok;btn.style.opacity=ok?'1':'0.45';
}

function _renderImgStrip(){
  const strip=document.getElementById('ap-imgs-strip');if(!strip)return;
  const total=_apExistingUrls.length+_apImgFiles.length;
  let html='';
  _apExistingUrls.forEach((url,i)=>{
    html+=`<div class="ap-img-thumb${i===0?' ap-img-thumb--cover':''}">
      <img src="${safeUrl(url)}" alt="">
      ${i===0?'<div class="ap-img-thumb-cover-label">غلاف</div>':''}
      <button type="button" class="ap-img-thumb-rm" onclick="removeProductImg('existing',${i})">✕</button>
    </div>`;
  });
  _apImgFiles.forEach(({dataUrl},i)=>{
    const isFirst=_apExistingUrls.length===0&&i===0;
    html+=`<div class="ap-img-thumb${isFirst?' ap-img-thumb--cover':''}">
      <img src="${dataUrl}" alt="">
      ${isFirst?'<div class="ap-img-thumb-cover-label">غلاف</div>':''}
      <button type="button" class="ap-img-thumb-rm" onclick="removeProductImg('new',${i})">✕</button>
    </div>`;
  });
  if(total<10){
    html+=`<button type="button" class="ap-img-add" onclick="document.getElementById('ap-img-input').click()">+<span>إضافة صورة</span></button>`;
  }
  strip.innerHTML=html;
  const hint=document.getElementById('ap-imgs-hint');
  if(hint)hint.textContent=total>=10?'الحد الأقصى 10 صور':'اضغط على + لإضافة صورة (1-12)';
}

function addProductImages(input){
  const files=Array.from(input.files||[]);
  let pending=0;
  for(const file of files){
    const total=_apExistingUrls.length+_apImgFiles.length+pending;
    if(total>=10){toast('الحد الأقصى 10 صور للقطعة الواحدة');break;}
    if(!file.type.startsWith('image/')){toast('الرجاء اختيار صور فقط');continue;}
    if(file.size>10*1024*1024){toast('حجم الصورة يجب ألا يتجاوز 10 ميغابايت');continue;}
    pending++;
    const reader=new FileReader();
    reader.onload=ev=>{_apImgFiles.push({file,dataUrl:ev.target.result});_renderImgStrip();};
    reader.readAsDataURL(file);
  }
  input.value='';
}

function removeProductImg(source,idx){
  if(source==='existing')_apExistingUrls.splice(idx,1);
  else _apImgFiles.splice(idx,1);
  _renderImgStrip();
}

function _renderDetailImgStrip(){
  const strip=document.getElementById('ap-detail-imgs-strip');if(!strip)return;
  const total=_apDetailExistingUrls.length+_apDetailImgFiles.length;
  let html='';
  _apDetailExistingUrls.forEach((url,i)=>{
    html+=`<div class="ap-img-thumb">
      <img src="${safeUrl(url)}" alt="">
      <button type="button" class="ap-img-thumb-rm" onclick="removeProductDetailImg('existing',${i})">✕</button>
    </div>`;
  });
  _apDetailImgFiles.forEach(({dataUrl},i)=>{
    html+=`<div class="ap-img-thumb">
      <img src="${dataUrl}" alt="">
      <button type="button" class="ap-img-thumb-rm" onclick="removeProductDetailImg('new',${i})">✕</button>
    </div>`;
  });
  if(total<5){
    html+=`<button type="button" class="ap-img-add" onclick="document.getElementById('ap-detail-img-input').click()">+<span>إضافة صورة</span></button>`;
  }
  strip.innerHTML=html;
  const hint=document.getElementById('ap-detail-imgs-hint');
  if(hint)hint.textContent=total>=5?'الحد الأقصى 5 صور':'اضغط على + لإضافة صورة (1-12)';
}

function addProductDetailImages(input){
  const files=Array.from(input.files||[]);
  let pending=0;
  for(const file of files){
    const total=_apDetailExistingUrls.length+_apDetailImgFiles.length+pending;
    if(total>=5){toast('الحد الأقصى 5 صور تفاصيل للقطعة الواحدة');break;}
    if(!file.type.startsWith('image/')){toast('الرجاء اختيار صور فقط');continue;}
    if(file.size>10*1024*1024){toast('حجم الصورة يجب ألا يتجاوز 10 ميغابايت');continue;}
    pending++;
    const reader=new FileReader();
    reader.onload=ev=>{_apDetailImgFiles.push({file,dataUrl:ev.target.result});_renderDetailImgStrip();};
    reader.readAsDataURL(file);
  }
  input.value='';
}

function removeProductDetailImg(source,idx){
  if(source==='existing')_apDetailExistingUrls.splice(idx,1);
  else _apDetailImgFiles.splice(idx,1);
  _renderDetailImgStrip();
}

async function saveProduct(){
  const btn=document.getElementById('ap-submit');
  const name=document.getElementById('ap-name').value.trim();
  const price=document.getElementById('ap-price').value;
  const desc=document.getElementById('ap-desc').value.trim();
  if(!_apProductType)return toast('اختر نوع القطعة أولاً');
  if(!name)return toast('أدخل اسم القطعة');
  if(!_apExclusive&&(!price||isNaN(price)))return toast('أدخل سعراً صحيحاً');
  if(!_apCat)return toast('اختر الفئة');
  const sb=getSb();if(!sb)return;
  btn.textContent='جاري الحفظ...';btn.disabled=true;
  try{
    const{data:{user}}=await sb.auth.getUser();
    const newUrls=[];
    for(const {file} of _apImgFiles){
      const ext=file.name.split('.').pop();
      const path=`products/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2,6)}.${ext}`;
      const compressed=await _compressImage(file);
      const{error:upErr}=await sb.storage.from('product-images').upload(path,compressed,{upsert:true});
      if(upErr){toast('فشل رفع الصورة — حاول مجدداً');continue;}
      const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);newUrls.push(pu.publicUrl);
    }
    const allImages=[..._apExistingUrls,...newUrls].slice(0,10);
    const img_url=allImages[0]||null;
    const newDetailUrls=[];
    for(const {file} of _apDetailImgFiles){
      const ext=file.name.split('.').pop();
      const path=`products/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2,6)}.${ext}`;
      const compressed=await _compressImage(file);
      const{error:upErr}=await sb.storage.from('product-images').upload(path,compressed,{upsert:true});
      if(upErr){toast('فشل رفع الصورة — حاول مجدداً');continue;}
      const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);newDetailUrls.push(pu.publicUrl);
    }
    const allDetailImages=[..._apDetailExistingUrls,...newDetailUrls].slice(0,5);
    const hero_status=_apSliderType==='main_hero'?'pending':'none';
    const payload={name,price:_apExclusive?null:parseFloat(price),sizes:_apSizes,type:_apCat,color_tags:_apColorTags,description:desc,image:img_url,images:allImages,detail_images:allDetailImages,slider_type:_apSliderType,hero_status,product_type:_apProductType,ensemble_state:_apProductType==='ensemble'?'close':null,is_available:_apAvailable,is_exclusive:_apExclusive};
    if(_apEditId){
      const{error}=await sb.from('products').update(payload).eq('id',_apEditId);
      if(error)throw error;
      toast(hero_status==='pending'?'✓ تم الإرسال للمراجعة':'✓ تم تحديث القطعة');
    }else{
      const{error}=await sb.from('products').insert({seller_id:user.id,...payload});
      if(error)throw error;
      toast(hero_status==='pending'?'✓ تم الإرسال للمراجعة':'✓ تمت إضافة القطعة');
    }
    btn.textContent='Done ✓';btn.disabled=false;btn.style.opacity='1';
    closeAddProduct();
    await loadEditorProducts();
  }catch(e){toast(e.message||'حدث خطأ');btn.textContent='Done ✓';btn.disabled=false;btn.style.opacity='1';}
}

async function loadEditorProducts(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();
    if(!user)return;
    const{data:seller}=await sb.from('sellers').select('profile_image,bio,city').eq('id',user.id).single();
    const circle=document.getElementById('sp-img-circle');
    const spLetter=document.getElementById('sp-img-letter');
    if(seller?.profile_image){
      if(circle){circle.style.backgroundImage=`url(${safeUrl(seller.profile_image)})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';}
      if(spLetter)spLetter.style.display='none';
      localStorage.setItem('wardro_profile_image',seller.profile_image);
    }else if(circle){
      circle.style.backgroundImage='';
      const sname=localStorage.getItem('wardro_store_name')||'—';
      if(spLetter){spLetter.textContent=(sname[0]||'?').toUpperCase();spLetter.style.display='';}
    }
    if(seller?.bio!=null){
      const bioEl=document.getElementById('ed-bio');if(bioEl&&!bioEl.dataset.dirty)bioEl.value=seller.bio;
      const desc=document.getElementById('show-about-desc');if(desc)desc.textContent=seller.bio||'';
    }
    _setStoreCity(seller?.city);
    _storeShare={id:user.id,name:localStorage.getItem('wardro_store_name')||'',city:seller?.city||'',phone:null};
    _computeSellerNumber(user.id).then(_setSellerNumber);
    const{data:prods}=await sb.from('products').select('*').eq('seller_id',user.id).order('created_at',{ascending:false});
    renderEditorProducts(prods||[]);
    renderShowProducts(prods||[]);
  }catch(e){}
}

function _edProdCardHtml(p){
  const apprBadge=p.hero_status==='pending'
    ?`<div class="ed-appr-badge ed-appr-badge--pending">قيد المراجعة</div>`
    :'';
  const ensBadge=p.product_type==='ensemble'
    ?`<span style="font-size:9px;color:var(--gold);opacity:.75;letter-spacing:.5px">ENSEMBLE ${p.ensemble_state==='close'?'🔒':'🔓'}</span>`
    :'';
  return `
    <div class="ed-prod-card" onclick="openEditProduct('${p.id}')">
      <button class="ed-prod-dots" onclick="event.stopPropagation();openEditProduct('${p.id}')">···</button>
      ${apprBadge}
      ${p.image?`<img class="ed-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="ed-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.3">👔</div>`}
      <div class="ed-prod-info">
        <div class="ed-prod-name">${esc(p.name)}</div>
        <div class="ed-prod-price">${_priceLabel(p)}</div>
        <div class="ed-prod-info-row">
          <div class="ed-prod-badge">In Stock</div>
          ${ensBadge}
        </div>
      </div>
    </div>`;
}

function _edAddTileHtml(sliderType){
  return `<button class="ed-prod-add-tile" onclick="openAddProduct('${sliderType}')"><span>+</span></button>`;
}

function _renderSliderGrid(gridId,prods,sliderType){
  const grid=document.getElementById(gridId);if(!grid)return;
  if(!prods.length){
    grid.classList.add('ed-prod-grid--empty');
    grid.innerHTML=`<button class="ed-prod-add-tile ed-prod-add-tile--lg" onclick="openAddProduct('${sliderType}')"><span>+</span></button>`;
  }else{
    grid.classList.remove('ed-prod-grid--empty');
    grid.innerHTML=prods.map(_edProdCardHtml).join('')+_edAddTileHtml(sliderType);
  }
}

function renderEditorProducts(prods){
  _editorProds={};prods.forEach(p=>_editorProds[p.id]=p);
  const mainHero=prods.filter(p=>p.slider_type==='main_hero');
  const hero=prods.filter(p=>p.slider_type==='hero');
  const none=prods.filter(p=>p.slider_type!=='main_hero'&&p.slider_type!=='hero');
  _renderSliderGrid('mainhero-grid',mainHero,'main_hero');
  _renderSliderGrid('hero-grid',hero,'hero');
  const grid=document.getElementById('prod-grid');
  const empty=document.getElementById('prod-empty');
  const badge=document.getElementById('ed-prod-count-badge');
  if(badge)badge.textContent=none.length;
  if(!grid||!empty)return;
  if(!none.length){grid.style.display='none';empty.style.display='flex';return}
  empty.style.display='none';grid.style.display='grid';
  grid.innerHTML=none.map(_edProdCardHtml).join('');
}

const _showProdCardHtml=p=>`
    <div class="show-prod-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="show-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="show-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;opacity:.3">👔</div>`}
      <div class="show-prod-info"><div class="show-prod-name">${esc(p.name)}</div><div class="show-prod-price">${_priceLabel(p)}</div><div class="show-prod-cat">${esc(p.type||'')}</div></div>
    </div>`;

function renderShowProducts(prods){
  buildHeroSlider(prods);
  prods.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
  const cardHtml=_showProdCardHtml;
  // Featured grid (Home tab — seller-elevated pieces: main_hero first, then hero; temporary fallback to recents when none are tagged)
  const grid=document.getElementById('show-prod-grid');
  const empty=document.getElementById('show-empty');
  if(grid&&empty){
    const featured=[...prods.filter(p=>p.slider_type==='main_hero'),...prods.filter(p=>p.slider_type==='hero')];
    const list=featured.length?featured:prods.slice(0,4);
    if(!prods.length){grid.style.display='none';empty.style.display='block';}
    else{empty.style.display='none';grid.style.display='grid';grid.innerHTML=list.map(cardHtml).join('');}
  }
  // All-products grid (Products tab)
  const allGrid=document.getElementById('show-all-prod-grid');
  const allEmpty=document.getElementById('show-empty-all');
  if(allGrid&&allEmpty){
    if(!prods.length){allGrid.style.display='none';allEmpty.style.display='block';}
    else{allEmpty.style.display='none';allGrid.style.display='grid';allGrid.innerHTML=prods.map(cardHtml).join('');}
  }
  _showProds=prods;
  _updateAllProdToggle();
  // About tab stats
  const cnt=document.getElementById('show-prod-count');
  if(cnt)cnt.textContent=prods.length;
}

// ── All Products tab: All / Filter modes ──
let _showProds=[];
function _updateAllProdToggle(){
  const wrap=document.getElementById('show-ap-toggle');
  if(!wrap)return;
  const counts={};
  _showProds.forEach(p=>{const t=p.type||'other';counts[t]=(counts[t]||0)+1;});
  const canFilter=Object.values(counts).some(n=>n>=3);
  wrap.style.display=canFilter?'flex':'none';
  setAllProdMode('all');
}
function setAllProdMode(mode){
  const bAll=document.getElementById('ap-mode-all');
  const bFilter=document.getElementById('ap-mode-filter');
  if(bAll)bAll.classList.toggle('show-ap-mode--active',mode==='all');
  if(bFilter)bFilter.classList.toggle('show-ap-mode--active',mode==='filter');
  const grid=document.getElementById('show-all-prod-grid');
  const cats=document.getElementById('show-all-prod-cats');
  if(mode==='filter'){
    if(grid)grid.style.display='none';
    if(cats){cats.innerHTML=_buildAllProdCats();cats.style.display='block';}
  }else{
    if(cats){cats.style.display='none';cats.innerHTML='';}
    if(grid)grid.style.display=_showProds.length?'grid':'none';
  }
}
const _showCatSvg=(inner)=>`<svg class="show-ap-cat-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const _showCatIcons={
  casual:_showCatSvg('<path d="M16 4l4.5 3-2.5 3.5L16.5 9V20h-9V9l-1.5 1.5L3.5 7 8 4c0 2.2 8 2.2 8 0z"/>'),
  sport:_showCatSvg('<path d="M3 17.5h18V16c-2.5-1-5.5-1.2-7.5-3.2l-2-2c-1.2 2.4-3.5 4.7-8.5 4.7z"/><path d="M13 12.5l1.5-1.5M15.5 14.5l1.5-1.5"/>'),
  streetwear:_showCatSvg('<path d="M6 13a6 6 0 0 1 12 0v1.5H6z"/><path d="M18 14.5h2.5a1.5 1.5 0 0 1-1.5 2H6"/><path d="M12 7v-1"/>'),
  classic:_showCatSvg('<path d="M3.5 7.5l6.5 4-6.5 4z"/><path d="M20.5 7.5l-6.5 4 6.5 4z"/><rect x="10" y="9.5" width="4" height="4.5" rx="1"/>'),
  old_money:_showCatSvg('<path d="M12 5l6.5 9.5h-13z"/><path d="M12 5v9.5"/><path d="M5 17.5h14"/>')
};
const _showCatIconOther=_showCatSvg('<path d="M4 4.5h6.5l9 9-6.5 6.5-9-9z"/><circle cx="8.2" cy="8.7" r="1.3"/>');

function _buildAllProdCats(){
  const groups={};
  _showProds.forEach(p=>{const t=p.type||'other';(groups[t]=groups[t]||[]).push(p);});
  const order=Object.keys(groups).sort((a,b)=>groups[b].length-groups[a].length);
  return order.map(t=>{
    const label=_dcTypeLabels[t]||(t.charAt(0).toUpperCase()+t.slice(1));
    const icon=_showCatIcons[t]||_showCatIconOther;
    return `<div class="show-ap-cat">
      <div class="show-section-hd"><span class="show-section-title">${icon} ${esc(label)}</span></div>
      <div class="show-ap-strip">${groups[t].map(_showProdCardHtml).join('')}</div>
    </div>`;
  }).join('');
}

function _resetModalForm(){
  document.getElementById('ap-name').value='';
  document.getElementById('ap-price').value='';
  document.getElementById('ap-desc').value='';
  _apSizes=[];_apCat=null;_apImgFiles=[];_apExistingUrls=[];_apProductType=null;_apColorTags=[];
  _apDetailImgFiles=[];_apDetailExistingUrls=[];
  document.querySelectorAll('.sel-btn').forEach(b=>b.classList.remove('active'));
  const sizeBtns=document.getElementById('size-btns');
  if(sizeBtns)sizeBtns.innerHTML='<span style="color:var(--muted);font-size:12px;padding:4px 0">اختر نوع القطعة أولاً</span>';
  _renderImgStrip();
  _renderDetailImgStrip();
  const legacyNotice=document.getElementById('ap-color-legacy-notice');if(legacyNotice)legacyNotice.style.display='none';
  const btn=document.getElementById('ap-submit');if(btn){btn.disabled=true;btn.style.opacity='0.45';}
  _apAvailable=true;
  document.getElementById('ap-avail-yes')?.classList.add('active');
  document.getElementById('ap-avail-no')?.classList.remove('active');
  _apExclusive=false;
  document.getElementById('ap-excl-btn')?.classList.remove('active');
  const _rpf=document.getElementById('ap-price');if(_rpf)_rpf.disabled=false;
}

function _showModal(){
  const m=document.getElementById('ap-modal');if(!m)return;
  m.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('ap-modal--open')));
}

function openAddProduct(sliderType){
  _apEditId=null;_apSliderType=sliderType||'none';
  _resetModalForm();
  const stGroup=document.getElementById('slidertype-group');if(stGroup)stGroup.style.display='none';
  const del=document.getElementById('ap-delete');if(del)del.style.display='none';
  const title=document.querySelector('.ap-modal-title');if(title)title.textContent='Add Product';
  _showModal();
}

function openEditProduct(id){
  const p=_editorProds[id];if(!p)return;
  _apEditId=p.id;
  _resetModalForm();
  document.getElementById('ap-name').value=p.name||'';
  document.getElementById('ap-price').value=p.price||'';
  document.getElementById('ap-desc').value=p.description||'';
  _apProductType=p.product_type||'shirt';
  document.querySelectorAll('#product-type-btns .sel-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===_apProductType));
  _renderSizeBtns(_apProductType);
  if(_apProductType!=='accessory'){
    const validSizes=_AP_TYPE_SIZES[_apProductType]||[];
    _apSizes=(p.sizes||[]).filter(s=>validSizes.includes(s));
    document.querySelectorAll('#size-btns .sel-btn').forEach(b=>b.classList.toggle('active',_apSizes.includes(b.dataset.val)));
  }
  _apCat=p.type||null;
  document.querySelectorAll('#cat-btns .sel-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===_apCat));
  _apSliderType=p.slider_type||'none';
  document.querySelectorAll('#slidertype-btns .sel-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===_apSliderType));
  const stGroup=document.getElementById('slidertype-group');if(stGroup)stGroup.style.display='';
  _apColorTags=[...(p.color_tags||[])];
  document.querySelectorAll('#color-tag-btns .sel-btn').forEach(b=>b.classList.toggle('active',_apColorTags.includes(b.dataset.val)));
  const legacyNotice=document.getElementById('ap-color-legacy-notice');
  if(legacyNotice)legacyNotice.style.display=(p.color||p.color_name)?'block':'none';
  _apExistingUrls=(p.images&&p.images.length)?[...p.images]:(p.image?[p.image]:[]);
  _renderImgStrip();
  _apDetailExistingUrls=(p.detail_images&&p.detail_images.length)?[...p.detail_images]:[];
  _renderDetailImgStrip();
  const del=document.getElementById('ap-delete');if(del)del.style.display='';
  const title=document.querySelector('.ap-modal-title');if(title)title.textContent='Edit Product';
  _apAvailable=p.is_available!==false;
  document.getElementById('ap-avail-yes')?.classList.toggle('active',_apAvailable);
  document.getElementById('ap-avail-no')?.classList.toggle('active',!_apAvailable);
  _apExclusive=p.is_exclusive===true;
  document.getElementById('ap-excl-btn')?.classList.toggle('active',_apExclusive);
  const _epf=document.getElementById('ap-price');
  if(_epf){_epf.disabled=_apExclusive;if(_apExclusive)_epf.value='';}
  _apUpdateSubmitBtn();
  _showModal();
}

function closeAddProduct(){
  const m=document.getElementById('ap-modal');if(!m)return;
  m.classList.remove('ap-modal--open');
  setTimeout(()=>{m.style.display='none'},380);
}

function apModalBackdropClose(e){
  if(e.target===e.currentTarget)closeAddProduct();
}

async function deleteProduct(){
  if(!_apEditId)return;
  if(!confirm('حذف هذه القطعة نهائياً؟'))return;
  const sb=getSb();if(!sb)return;
  try{
    const prod=_editorProds[_apEditId]||{};
    const allImgUrls=[...(prod.images||[]),...(prod.image?[prod.image]:[])];
    for(const url of [...new Set(allImgUrls)]){
      const m=url.match(/\/product-images\/(.+)$/);
      if(m&&m[1])await sb.storage.from('product-images').remove([decodeURIComponent(m[1])]);
    }
    const{error}=await sb.from('products').delete().eq('id',_apEditId);
    if(error)throw error;
    toast('✓ تم حذف القطعة');
    closeAddProduct();
    await loadEditorProducts();
  }catch(e){toast(e.message||'خطأ في الحذف')}
}

async function saveBio(){
  const bioEl=document.getElementById('ed-bio');
  const bio=(bioEl?.value||'').trim();
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();if(!user)return;
    await sb.from('sellers').update({bio}).eq('id',user.id);
    toast('✓ تم حفظ وصف المتجر');
    const desc=document.getElementById('show-about-desc');if(desc)desc.textContent=bio||'';
  }catch(e){toast(e.message||'خطأ في الحفظ')}
}

let _esWhatsappEnabled=true;
let _esCartEnabled=false;

async function openEdSettings(){
  document.getElementById('ed-settings-backdrop')?.classList.add('ed-settings-backdrop--open');
  document.getElementById('ed-settings-panel')?.classList.add('ed-settings-panel--open');
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();if(!user)return;
    const{data:seller}=await sb.from('sellers').select('whatsapp_enabled,cart_enabled,sheet_url').eq('id',user.id).single();
    esSetWhatsapp(seller?.whatsapp_enabled!==false);
    esSetCart(!!seller?.cart_enabled);
    const urlEl=document.getElementById('es-sheet-url');if(urlEl)urlEl.value=seller?.sheet_url||'';
    esValidateSave();
  }catch(e){}
}

function esValidateSave(){
  const btn=document.getElementById('es-save-btn');if(!btn)return;
  if(_esCartEnabled){
    const val=(document.getElementById('es-sheet-url')?.value||'').trim();
    btn.disabled=!val;
  }else{
    btn.disabled=false;
  }
}

function closeEdSettings(){
  document.getElementById('ed-settings-backdrop')?.classList.remove('ed-settings-backdrop--open');
  document.getElementById('ed-settings-panel')?.classList.remove('ed-settings-panel--open');
}

function esSetWhatsapp(on){
  _esWhatsappEnabled=on;
  const sw=document.getElementById('es-switch-whatsapp');
  sw?.classList.toggle('es-switch--on',on);
  sw?.setAttribute('aria-checked',on);
}

function esToggleWhatsapp(){
  esSetWhatsapp(!_esWhatsappEnabled);
}

function esSetCart(on){
  _esCartEnabled=on;
  const sw=document.getElementById('es-switch-form');
  sw?.classList.toggle('es-switch--on',on);
  sw?.setAttribute('aria-checked',on);
  const grp=document.getElementById('es-sheet-url-group');if(grp)grp.style.display=on?'':'none';
  esValidateSave();
}

function esToggleCart(){
  esSetCart(!_esCartEnabled);
}

async function saveEdSettings(){
  const sb=getSb();if(!sb)return;
  const btn=document.getElementById('es-save-btn');
  const sheetUrl=(document.getElementById('es-sheet-url')?.value||'').trim();
  try{
    const{data:{user}}=await sb.auth.getUser();if(!user)return;
    if(btn){btn.disabled=true;btn.textContent='...';}
    await sb.from('sellers').update({whatsapp_enabled:_esWhatsappEnabled,cart_enabled:_esCartEnabled,sheet_url:sheetUrl||null}).eq('id',user.id);
    toast('✓ تم حفظ الإعدادات');
    closeEdSettings();
  }catch(e){toast(e.message||'خطأ في الحفظ')}
  finally{if(btn){btn.disabled=false;btn.textContent='تم';}}
}

async function logOut(){
  const sb=getSb();if(!sb)return;
  try{
    await sb.auth.signOut();
    localStorage.removeItem('wardro_store_name');
    localStorage.removeItem('wardro_role');
    localStorage.removeItem('wardro_profile_image');
    clearInterval(_heroTimer);
    clearInterval(_brHeroTimer);
    closeEdSettings();
    // Reset registration form
    ['reg-store','reg-phone','reg-email','reg-pass','reg-pass2'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    clearRegErrors();
    const regBtn=document.getElementById('reg-submit');
    if(regBtn){regBtn.innerHTML='Create Store →';regBtn.style.background='';}
    const legalCb=document.getElementById('seller-legal-check');if(legalCb)legalCb.checked=false;
    updateCreateStoreButtonState();
    // Reset sign-in form
    ['si-email','si-pass'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const siBtn=document.getElementById('si-submit');
    if(siBtn){siBtn.disabled=false;siBtn.textContent='Sign In →';}
    navigateTo('s-splash','z-axis');
    toast('✓ تم تسجيل الخروج');
  }catch(e){toast(e.message||'خطأ في تسجيل الخروج')}
}

async function previewStoreProfile(input){
  if(!input.files[0])return;
  const file=input.files[0];
  if(!file.type.startsWith('image/')){toast('الرجاء اختيار صورة');input.value='';return;}
  const circle=document.getElementById('sp-img-circle');
  const spLetter=document.getElementById('sp-img-letter');
  const previewUrl=URL.createObjectURL(file);
  if(circle){circle.style.backgroundImage=`url(${previewUrl})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';}
  if(spLetter)spLetter.style.display='none';
  const sb=getSb();if(!sb)return;
  const{data:{user}}=await sb.auth.getUser();if(!user)return;
  let uploadFile=file;
  if(file.size>500*1024){try{uploadFile=await _resizeStoreImage(file);}catch(_){}}
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const path=`${user.id}/profile.${ext}`;
  const{error:upErr}=await sb.storage.from('store-profiles').upload(path,uploadFile,{upsert:true});
  URL.revokeObjectURL(previewUrl);
  if(upErr){toast('فشل رفع الصورة — حاول مجدداً');return;}
  const{data:pu}=sb.storage.from('store-profiles').getPublicUrl(path);
  await sb.from('sellers').update({profile_image:pu.publicUrl}).eq('id',user.id);
  localStorage.setItem('wardro_profile_image',pu.publicUrl);
  // Refresh circle with persisted URL (avoid ObjectURL expiry)
  if(circle){circle.style.backgroundImage=`url(${safeUrl(pu.publicUrl)})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';}
  toast('✓ تم تحديث صورة المتجر');
}

async function _resizeStoreImage(file){
  return new Promise(resolve=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,Math.sqrt((500*1024)/file.size));
      const canvas=document.createElement('canvas');
      canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>resolve(blob||file),'image/jpeg',0.85);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);resolve(file);};
    img.src=url;
  });
}

async function _compressImage(file,maxPx=1200,quality=0.82){
  return new Promise(resolve=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,maxPx/Math.max(img.width,img.height));
      const canvas=document.createElement('canvas');
      canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>resolve(blob||file),'image/jpeg',quality);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);resolve(file);};
    img.src=url;
  });
}

// ══ SHOW MODE ══
let _heroIdx=0,_heroTimer=null,_heroLen=1;
let _guestSellerId=null; // set when a customer taps Top Store
let _storeShare={id:null,name:'',city:'',phone:null}; // current store shown in #s-show

function shareStore(){
  if(!_storeShare.id)return;
  const url=location.origin+location.pathname+'?store='+_storeShare.id;
  if(navigator.share){
    navigator.share({title:_storeShare.name||'Wardro',text:'اكتشف متجر '+(_storeShare.name||'')+' على Wardro',url}).catch(()=>{});
  }else if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(()=>toast('تم نسخ الرابط')).catch(()=>{});
  }
}

function storeWhatsApp(){
  if(!_storeShare.id)return;
  const phone=String(_storeShare.phone||'').replace(/\D/g,'');
  if(!phone)return;
  const url=location.origin+location.pathname+'?store='+_storeShare.id;
  const msg='السلام عليكم\n\nمهتم بمتجرك على Wardro:\n\n🏪 '+(_storeShare.name||'')+'\n📍 '+(_storeShare.city||'ورقلة')+', الجزائر\n\n'+url+'\n\n(استفسار أكثر...)';
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank','noopener');
}

function _setStoreWaBtn(show){
  const b=document.getElementById('show-wa-btn');
  if(b)b.style.display=show?'flex':'none';
}

async function _computeSellerNumber(sellerId){
  const sb=getSb();if(!sb)return null;
  try{
    const{data,error}=await sb.from('sellers').select('id,created_at').eq('is_founding_seller',true).order('created_at',{ascending:true});
    if(error||!data)return null;
    const idx=data.findIndex(s=>s.id===sellerId);
    return idx===-1?null:'#'+String(idx+1).padStart(3,'0');
  }catch(_){return null;}
}
function _setSellerNumber(num){
  const el=document.getElementById('show-seller-number');
  if(el)el.textContent=num||'—';
}
function _setStoreCity(city){
  const el=document.getElementById('show-trust-city');
  if(el)el.textContent=city||'Ouargla';
}

function loadShowMode(){
  if(_guestSellerId)return; // guest view already populated by openStoreView
  // Ensure seller's own show mode has no guest class
  const ss=document.getElementById('s-show');
  if(ss)ss.classList.remove('s-show--guest');
  const img=localStorage.getItem('wardro_profile_image');
  const name=localStorage.getItem('wardro_store_name')||'—';
  // Avatar in header
  const av=document.getElementById('show-avatar');
  if(av){
    if(img){av.style.backgroundImage=`url(${safeUrl(img)})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
    else{av.style.backgroundImage='';av.innerHTML=`<span class="store-av-letter">${esc((name[0]||'?').toUpperCase())}</span>`;}
  }
  // Avatar in About tab
  const avAbout=document.getElementById('show-about-avatar');
  if(avAbout){
    if(img){avAbout.style.backgroundImage=`url(${safeUrl(img)})`;avAbout.style.backgroundSize='cover';avAbout.style.backgroundPosition='center';avAbout.innerHTML='';}
    else{avAbout.style.backgroundImage='';avAbout.innerHTML=`<span class="store-av-letter">${esc((name[0]||'?').toUpperCase())}</span>`;}
  }
  // Store name in About tab
  const aboutName=document.getElementById('show-about-name');
  if(aboutName)aboutName.textContent=name;
  // Reset to Home tab
  switchShowTab('home',document.querySelector('.show-tab[data-tab="home"]'));
  // Own store preview: never show the WhatsApp button
  _setStoreWaBtn(false);
  // Load fresh data
  loadEditorProducts();
}

// Customer taps a Top Store → read-only store view
function openStoreView(sellerId,storeName,storeImg){
  _guestSellerId=sellerId;
  _storeShare={id:sellerId,name:storeName||'',city:'',phone:null};
  _setStoreWaBtn(false); // hidden until this store's phone is known
  _logEvent('store_visit',{sellerId});
  // Mark #s-show as guest mode (CSS hides sidebar/topbar, shows back bar)
  const ss=document.getElementById('s-show');
  if(ss)ss.classList.add('s-show--guest');
  // Set guest back bar title
  const gt=document.getElementById('show-guest-store-title');
  if(gt)gt.textContent=storeName;
  // Set store header name
  const nameEl=document.getElementById('show-store-name');
  if(nameEl)nameEl.textContent=storeName;
  const av=document.getElementById('show-avatar');
  if(av){
    if(storeImg){av.style.backgroundImage=`url(${safeUrl(storeImg)})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
    else{av.style.backgroundImage='';av.innerHTML=`<span class="store-av-letter">${esc((storeName||'?')[0].toUpperCase())}</span>`;}
  }
  switchShowTab('home',document.querySelector('.show-tab[data-tab="home"]'));
  loadGuestStoreProducts(sellerId);
  navigateTo('s-show','slide');
}

function leaveGuestStore(){
  _guestSellerId=null;
  const ss=document.getElementById('s-show');
  if(ss)ss.classList.remove('s-show--guest');
  navigateTo('s-browse','slide');
}

async function loadGuestStoreProducts(sellerId){
  const sb=getSb();if(!sb)return;
  try{
    const{data:seller}=await sb.from('sellers').select('profile_image,bio,city,phone,whatsapp_enabled').eq('id',sellerId).single();
    const guestName=document.getElementById('show-store-name')?.textContent||'?';
    _storeShare={id:sellerId,name:guestName,city:seller?.city||'',phone:seller?.phone||null};
    _setStoreWaBtn(!!(seller&&seller.phone)&&seller?.whatsapp_enabled!==false);
    const av=document.getElementById('show-avatar');
    const avAbout=document.getElementById('show-about-avatar');
    if(seller?.profile_image){
      if(av){av.style.backgroundImage=`url(${safeUrl(seller.profile_image)})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
      if(avAbout){avAbout.style.backgroundImage=`url(${safeUrl(seller.profile_image)})`;avAbout.style.backgroundSize='cover';avAbout.style.backgroundPosition='center';avAbout.innerHTML='';}
    }else{
      const letter=`<span class="store-av-letter">${esc((guestName[0]||'?').toUpperCase())}</span>`;
      if(av){av.style.backgroundImage='';av.innerHTML=letter;}
      if(avAbout){avAbout.style.backgroundImage='';avAbout.innerHTML=letter;}
    }
    const aboutDesc=document.getElementById('show-about-desc');
    if(aboutDesc)aboutDesc.textContent=seller?.bio||'';
    _setStoreCity(seller?.city);
    _computeSellerNumber(sellerId).then(_setSellerNumber);
    const{data:prods}=await sb.from('products').select('*,seller:sellers(store_name,profile_image,phone,cart_enabled,whatsapp_enabled)').eq('seller_id',sellerId).eq('is_hidden',false).order('created_at',{ascending:false});
    const visProds=(prods||[]).filter(p=>p.slider_type!=='main_hero'||p.hero_status==='approved');
    renderShowProducts(visProds);
    // Merge into _brProds so openProdDetail works
    visProds.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
  }catch(e){}
}

function _wireHeroTap(track,cfg){
  const SWIPE=50,RESUME=4000;
  let start=null,moved=false,resumeId=null;
  function scheduleResume(){
    clearTimeout(resumeId);
    resumeId=setTimeout(()=>{if(cfg.getLen()>1)cfg.startTimer();},RESUME);
  }
  function _onStart(x,y){start={x,y};moved=false;cfg.stopTimer();clearTimeout(resumeId);}
  function _onMove(x,y){if(!start)return;const dx=x-start.x,dy=y-start.y;if(Math.sqrt(dx*dx+dy*dy)>10)moved=true;}
  function _onEnd(x){
    if(!start)return;
    const dx=x-start.x;start=null;
    if(Math.abs(dx)>=SWIPE){const n=((cfg.getIdx()+(dx<0?1:-1))%cfg.getLen()+cfg.getLen())%cfg.getLen();cfg.setIdx(n);cfg.goFn(n);moved=true;}
    scheduleResume();
  }
  // Pointer events — desktop mouse + pen
  track.onpointerdown=e=>{_onStart(e.clientX,e.clientY);};
  track.onpointermove=e=>{_onMove(e.clientX,e.clientY);};
  track.onpointerup=e=>{_onEnd(e.clientX);};
  track.onpointercancel=()=>{start=null;scheduleResume();};
  // Native touch events — real mobile (share state; onpointerup nulls start first so ontouchend exits early when both fire)
  track.ontouchstart=e=>{const t=e.touches[0];_onStart(t.clientX,t.clientY);};
  track.ontouchmove=e=>{const t=e.touches[0];_onMove(t.clientX,t.clientY);};
  track.ontouchend=e=>{const t=e.changedTouches[0];_onEnd(t.clientX);};
  track.onclick=e=>{
    if(moved){moved=false;return;}
    const slide=e.target.closest('.show-hero-slide,.br-hero-slide');
    const id=slide&&slide.dataset.id;
    if(id)openProdDetail(id);
  };
}

function buildHeroSlider(prods){
  const track=document.getElementById('show-hero-track');
  const dotsEl=document.getElementById('show-hero-dots');
  if(!track||!dotsEl)return;
  clearInterval(_heroTimer);_heroIdx=0;
  let heroProds=prods.filter(p=>p.image&&(p.slider_type==='hero'||(p.slider_type==='main_hero'&&p.hero_status==='approved')));
  if(!heroProds.length)heroProds=prods.filter(p=>p.image).slice(0,20);
  else heroProds=heroProds.slice(0,20);
  let slides;
  if(!heroProds.length){
    slides=[{bg:null,id:null,label:'NEW COLLECTION',title:'SUMMER 2026',sub:'Timeless style, elevated for you',cta:'SHOP NOW'}];
  }else{
    slides=heroProds.map(p=>({bg:p.image,id:p.id,label:(p.type||'FEATURED').toUpperCase(),title:p.name,sub:p.description||'Premium quality clothing',cta:_priceLabel(p),approval_status:p.approval_status}));
  }
  _heroLen=slides.length;
  track.innerHTML=slides.map((s,i)=>`
    <div class="show-hero-slide${!s.bg?' show-hero-slide--ph':''}${i===0?' active':''}" data-id="${s.id||''}"${s.bg?` style="background-image:url('${safeUrl(s.bg)}')"`:''}>
      <div class="show-hero-overlay"></div>
      ${s.approval_status==='pending'?'<div class="show-hero-appr-badge">قيد المراجعة</div>':s.approval_status==='rejected'?'<div class="show-hero-appr-badge show-hero-appr-badge--rejected">تم الرفض</div>':''}
      <div class="show-hero-content">
        <div class="show-hero-label">${esc(s.label)}</div>
        <div class="show-hero-title">${esc(s.title)}</div>
        <div class="show-hero-sub">${esc(s.sub)}</div>
        <div class="show-hero-cta">${esc(s.cta)} →</div>
      </div>
    </div>`).join('');
  dotsEl.innerHTML=slides.map((_,i)=>`<button class="show-hero-dot${i===0?' active':''}" onclick="goHeroSlide(${i})"></button>`).join('');
  function _startHeroTimer(){clearInterval(_heroTimer);if(_heroLen>1)_heroTimer=setInterval(()=>{_heroIdx=(_heroIdx+1)%_heroLen;goHeroSlide(_heroIdx);},3800);}
  _startHeroTimer();
  _wireHeroTap(track,{goFn:goHeroSlide,getIdx:()=>_heroIdx,setIdx:i=>{_heroIdx=i;},getLen:()=>_heroLen,stopTimer:()=>{clearInterval(_heroTimer);_heroTimer=null;},startTimer:_startHeroTimer});
}

function goHeroSlide(idx){
  _heroIdx=idx;
  document.querySelectorAll('.show-hero-slide').forEach((s,i)=>s.classList.toggle('active',i===idx));
  document.querySelectorAll('.show-hero-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

function switchShowTab(tab,btn){
  document.querySelectorAll('.show-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.show-tab-panel').forEach(p=>p.style.display='none');
  if(btn)btn.classList.add('active');
  const panel=document.getElementById('show-tab-'+tab);
  if(panel)panel.style.display='block';
  if(tab==='collections')renderCollectionsPublic();
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
    if(obSlide===2){btn.textContent='START EXPERIENCE →';const ll=document.getElementById('ob-legal-line');if(ll)ll.style.display='block';}
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

// ══ CUSTOMER BROWSE ══
let _brHeroIdx=0,_brHeroTimer=null;
let _brProds=[];
let _pdCurrentId=null;
let _pdImages=[],_pdCarouselIdx=0;
let _svItemMap={};
let _explorePool=[],_exploreOffset=0,_exploreObserver=null,_explorePending=false;

const BR_SLIDES=[
  {label:'NEW COLLECTION',title:'SUMMER 2026',sub:'Explore featured stores',cta:'Explore'},
  {label:'SPORT ESSENTIALS',title:'ACTIVE WEAR',sub:'Premium sportswear, built for you',cta:'Shop Now'},
  {label:'JUST FOR YOU',title:'TOP PICKS',sub:'Curated from the best stores',cta:'Discover'},
];

function _fyshuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function _renderVGrid(gridId,secId,prods){
  const sec=document.getElementById(secId);
  const el=document.getElementById(gridId);
  if(!sec||!el)return;
  if(!prods.length){sec.style.display='none';return;}
  sec.style.display='';
  el.innerHTML=prods.map(p=>`
    <div class="br-prod-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="br-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
      <div class="br-prod-info"><div class="br-prod-name">${esc(p.name||'')}</div><div class="br-prod-price">${_priceLabel(p)}</div></div>
    </div>`).join('');
}

function _renderHStrip(stripId,secId,prods,opts={}){
  const{minCount=2,totalCount=null,viewAllKey=null}=opts;
  const sec=document.getElementById(secId);
  const el=document.getElementById(stripId);
  if(!sec||!el)return;
  const existingBtn=sec.querySelector('.br-view-all');
  if(prods.length<minCount){
    sec.style.display='none';
    if(existingBtn)existingBtn.remove();
    return;
  }
  sec.style.display='';
  el.innerHTML=prods.map(p=>`
    <div class="br-strip-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="br-strip-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-strip-img br-strip-img--ph"></div>`}
      <div class="br-strip-info"><div class="br-strip-name">${esc(p.name||'')}</div><div class="br-strip-price">${_priceLabel(p)}</div></div>
    </div>`).join('');
  const total=totalCount!=null?totalCount:prods.length;
  if(viewAllKey!==null&&total>12){
    let btn=existingBtn;
    if(!btn){
      btn=document.createElement('div');
      btn.className='br-view-all';
      el.insertAdjacentElement('afterend',btn);
    }
    btn.textContent='عرض الكل';
    btn.onclick=()=>console.log('view-all:',viewAllKey);
  }else if(existingBtn){
    existingBtn.remove();
  }
}

const _CAT_LIST=['casual','sport','streetwear','classic','old_money'];
const _CAT_TITLES={casual:'Casual Collection',sport:'Sport Collection',streetwear:'Streetwear',classic:'Classic Collection',old_money:'Old Money'};
// Physical DOM slot order for the 5 category-strip positions (fixed — never reordered).
// Which CATEGORY renders into which slot is decided at runtime by anchor/fallback + count sort below.
const _CAT_SLOT_SEC={casual:'br-sec-casual',sport:'br-sec-sport',streetwear:'br-sec-streetwear',classic:'br-sec-classic',old_money:'br-sec-oldmoney'};
const _CAT_SLOT_STRIP={casual:'br-strip-casual',sport:'br-strip-sport',streetwear:'br-strip-streetwear',classic:'br-strip-classic',old_money:'br-strip-oldmoney'};
const _CAT_SLOT_ORDER=['casual','sport','streetwear','classic','old_money'];

// Dormant until a category count grows past 8 — see rule 4 in the task spec.
function _repeatAppearances(count){
  if(count<8)return 1;
  if(count<=15)return 2;
  return Math.ceil(count/6);
}

function _showSec(id){const el=document.getElementById(id);if(el)el.style.display='';}
function _hideSec(id){const el=document.getElementById(id);if(el)el.style.display='none';}

function _renderBrowseSections(prods){
  const MIN_ANCHOR_COUNT=4;
  const sevenDaysAgo=new Date(Date.now()-7*24*60*60*1000);
  const newStripFull=prods.filter(p=>p.created_at&&new Date(p.created_at)>=sevenDaysAgo);

  const catProds={};
  _CAT_LIST.forEach(c=>{catProds[c]=prods.filter(p=>p.type===c);});

  // Premium anchor — fallback chain: old_money → classic → streetwear → richest remaining category
  let anchorCat;
  if(catProds.old_money.length>=MIN_ANCHOR_COUNT)anchorCat='old_money';
  else if(catProds.classic.length>=MIN_ANCHOR_COUNT)anchorCat='classic';
  else if(catProds.streetwear.length>=MIN_ANCHOR_COUNT)anchorCat='streetwear';
  else anchorCat=_CAT_LIST.reduce((best,c)=>catProds[c].length>catProds[best].length?c:best,_CAT_LIST[0]);

  // Mid-order: the 4 non-anchor categories, richest first, filling the remaining slots in physical order
  const midCats=_CAT_LIST.filter(c=>c!==anchorCat).sort((a,b)=>catProds[b].length-catProds[a].length);
  const slotAssignment={};
  slotAssignment[_CAT_SLOT_ORDER[0]]=anchorCat;
  midCats.forEach((c,i)=>{slotAssignment[_CAT_SLOT_ORDER[i+1]]=c;});

  // Phase detection — drives how many vgrids are active and how big each one is
  const phase=prods.length<40?'small':prods.length<=120?'medium':'large';
  const _PHASE_CFG={
    small:{grids:[1,2,3],sizes:[8,5,4]},
    medium:{grids:[1,2,3,4,5],sizes:[11,8,7,5,5]},
    large:{grids:[1,2,3,4,5,6,7],sizes:[17,11,8,8,7,7,7]}
  };
  const activeGrids=_PHASE_CFG[phase].grids;
  const gridSizes=_PHASE_CFG[phase].sizes;

  // Horizontal strip item count — phase-aware, closes over `phase` above
  function _stripCount(total){
    if(phase==='small')return Math.min(4,total);
    if(phase==='medium')return Math.min(8,Math.max(3,Math.floor(total/2.5)));
    return Math.min(8,Math.max(3,Math.floor(total/3)));
  }
  const newStrip=newStripFull.slice(0,_stripCount(newStripFull.length));

  // Vertical grids — ALL approved products, shuffled per session
  const pool=_fyshuffle([...prods]);
  let pos=0;
  const usedInGrids=new Set();
  const gridContents={};
  activeGrids.forEach((n,i)=>{
    const items=pool.slice(pos,pos+gridSizes[i]);pos+=gridSizes[i];
    items.forEach(p=>usedInGrids.add(p.id));
    gridContents[n]=items;
  });
  for(let n=1;n<=10;n++){
    const gridId=`br-vgrid-${n}`,secId=`br-sec-vgrid-${n}`;
    if(activeGrids.includes(n)){
      _renderVGrid(gridId,secId,gridContents[n]);
    }else{
      const el=document.getElementById(gridId);if(el)el.innerHTML='';
      _hideSec(secId);
    }
  }
  // vgrid-close belongs to color interleaving (Part 2) — stays hidden for now
  const closeEl=document.getElementById('br-vgrid-close');if(closeEl)closeEl.innerHTML='';
  _hideSec('br-sec-vgrid-close');

  function _renderCatSlot(slotId){
    const assignedCat=slotAssignment[slotId];
    const secEl=document.getElementById(_CAT_SLOT_SEC[slotId]);
    if(secEl){const t=secEl.querySelector('.br-sec-title');if(t)t.textContent=_CAT_TITLES[assignedCat];}
    const catList=catProds[assignedCat];
    const sliced=catList.slice(0,_stripCount(catList.length));
    _renderHStrip(_CAT_SLOT_STRIP[slotId],_CAT_SLOT_SEC[slotId],sliced,{minCount:2,totalCount:catList.length,viewAllKey:slotId});
  }

  _renderCatSlot('casual'); // slot 1 — always the anchor
  _renderHStrip('br-strip-new','br-sec-new',newStrip,{minCount:4,totalCount:newStripFull.length,viewAllKey:'new'});
  _renderCatSlot('sport'); // slot 2
  _renderCatSlot('streetwear'); // slot 3

  // Top Stores — R2: always show if 1+ sellers, hide only when 0 sellers
  const stores=[],seen=new Set();
  for(const p of prods){if(p.seller&&!seen.has(p.seller_id)){seen.add(p.seller_id);stores.push({id:p.seller_id,name:p.seller.store_name,img:p.seller.profile_image});}}
  const storesSec=document.getElementById('br-sec-stores');
  if(stores.length){renderTopStores(stores);if(storesSec)storesSec.style.display='';}
  else{if(storesSec)storesSec.style.display='none';}

  _renderCatSlot('classic'); // slot 4
  _renderCatSlot('old_money'); // slot 5

  // Color sections — dormant until Part 2
  _hideSec('br-sec-color-black');_hideSec('br-sec-color-white');
  _hideSec('br-sec-color-brown');_hideSec('br-sec-color-wild1');
  _hideSec('br-sec-color-wild2');

  // Repeat appearances (dormant today — no category reaches the 8-item threshold yet).
  // Auto-activates: extra chunks render into #br-sec-repeats, right before Explore.
  const repeatSec=document.getElementById('br-sec-repeats');
  if(repeatSec){
    const extraChunks=[];
    _CAT_LIST.forEach(c=>{
      const list=catProds[c];
      const reps=_repeatAppearances(list.length);
      if(reps>1){
        const perChunk=Math.ceil(list.length/reps);
        for(let i=1;i<reps;i++)extraChunks.push({cat:c,items:list.slice(i*perChunk,(i+1)*perChunk)});
      }
    });
    if(extraChunks.length){
      repeatSec.style.display='';
      repeatSec.innerHTML=extraChunks.map((_,i)=>`
        <div class="br-section" id="br-repeat-sec-${i}">
          <div class="br-prod-grid" id="br-repeat-vgrid-${i}"></div>
          <div class="br-sec-head"><span class="br-sec-title"></span></div>
          <div class="br-strip-scroll" id="br-repeat-strip-${i}"></div>
        </div>`).join('');
      extraChunks.forEach((chunk,i)=>{
        const filler=pool.slice(pos,pos+6);pos+=6;
        const titleEl=document.getElementById(`br-repeat-sec-${i}`)?.querySelector('.br-sec-title');
        if(titleEl)titleEl.textContent=_CAT_TITLES[chunk.cat];
        _renderVGrid(`br-repeat-vgrid-${i}`,`br-repeat-sec-${i}`,filler);
        _renderHStrip(`br-repeat-strip-${i}`,`br-repeat-sec-${i}`,chunk.items);
      });
    }else{repeatSec.style.display='none';repeatSec.innerHTML='';}
  }

  // §12 — pool is products not consumed by upper grids or the anchor strip, freshly shuffled
  const anchorIds=catProds[anchorCat].slice(0,8).map(p=>p.id);
  const usedIds=new Set([...usedInGrids,...anchorIds]);
  _initExplore(_fyshuffle(prods.filter(p=>!usedIds.has(p.id))));
}

// ══ EXPLORE INFINITE SCROLL (§12) ══
function _initExplore(pool){
  if(_exploreObserver){_exploreObserver.disconnect();_exploreObserver=null;}
  _explorePool=pool;_exploreOffset=0;_explorePending=false;
  const grid=document.getElementById('br-vgrid-explore');
  const emptyEl=document.getElementById('br-explore-empty');
  const spinner=document.getElementById('br-explore-spinner');
  const endEl=document.getElementById('br-explore-end');
  const sentinel=document.getElementById('br-explore-sentinel');
  if(!grid)return;
  grid.innerHTML='';
  if(emptyEl)emptyEl.style.display='none';
  if(spinner)spinner.style.display='none';
  if(endEl)endEl.style.display='none';
  if(!pool.length){if(emptyEl)emptyEl.style.display='block';return;}
  _exploreRenderBatch();
  if(_exploreOffset>=pool.length){if(endEl)endEl.style.display='block';return;}
  if(!sentinel)return;
  _exploreObserver=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting)_exploreLoadMore();
  },{rootMargin:'200px'});
  _exploreObserver.observe(sentinel);
}

function _exploreRenderBatch(){
  const grid=document.getElementById('br-vgrid-explore');if(!grid)return;
  const batch=_explorePool.slice(_exploreOffset,_exploreOffset+30);
  _exploreOffset+=batch.length;
  grid.insertAdjacentHTML('beforeend',batch.map(p=>`
    <div class="br-prod-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="br-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
      <div class="br-prod-info"><div class="br-prod-name">${esc(p.name||'')}</div><div class="br-prod-price">${_priceLabel(p)}</div></div>
    </div>`).join(''));
}

function _exploreLoadMore(){
  if(_explorePending)return;
  if(_exploreOffset>=_explorePool.length){
    if(_exploreObserver){_exploreObserver.disconnect();_exploreObserver=null;}
    const endEl=document.getElementById('br-explore-end');
    if(endEl)endEl.style.display='block';
    return;
  }
  _explorePending=true;
  const spinner=document.getElementById('br-explore-spinner');
  if(spinner)spinner.style.display='flex';
  requestAnimationFrame(()=>{
    _exploreRenderBatch();
    if(spinner)spinner.style.display='none';
    _explorePending=false;
    if(_exploreOffset>=_explorePool.length){
      if(_exploreObserver){_exploreObserver.disconnect();_exploreObserver=null;}
      const endEl=document.getElementById('br-explore-end');
      if(endEl)endEl.style.display='block';
    }
  });
}

async function loadBrowse(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:prods,error}=await sb.from('products').select('*,seller:sellers(store_name,profile_image,phone,cart_enabled,whatsapp_enabled,sheet_url)').eq('is_hidden',false).order('created_at',{ascending:false});
    if(error){console.error('browse query error:',error);throw error;}
    console.log('browse loaded:',prods?.length,'products');
    _brProds=(prods||[]).filter(p=>p.slider_type!=='main_hero'||p.hero_status==='approved');
    buildBrowseHero(_brProds);
    _renderBrowseSections(_brProds);
  }catch(e){toast('❌ browse: '+e.message);console.error('browse load:',e)}
}

function makeDemoProds(n){
  return Array.from({length:n},(_,i)=>({id:'demo-'+i,_demo:true,name:'',price:null,image:null,sizes:[],color:'',description:''}));
}

function renderBrGrid(id,prods){
  const el=document.getElementById(id);if(!el)return;
  if(!prods.length){el.innerHTML='<div class="br-empty">لا توجد قطع</div>';return}
  el.innerHTML=prods.map(p=>`
    <div class="br-prod-card${p._demo?' br-prod-card--demo':''}"${p._demo?'':` onclick="openProdDetail('${p.id}')"`}>
      ${p.image?`<img class="br-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
      ${!p._demo?`<div class="br-prod-info"><div class="br-prod-name">${esc(p.name)}</div><div class="br-prod-price">${_priceLabel(p)}</div></div>`:''}
    </div>`).join('');
}

function renderTopStores(stores){
  const el=document.getElementById('br-stores-row');if(!el)return;
  const list=stores.length?stores:Array.from({length:4},(_,i)=>({id:'ds-'+i,_demo:true,name:'',img:null}));
  el.innerHTML=list.map(s=>`
    <div class="br-store-item"${s._demo?'':` data-sid="${esc(s.id)}" data-sname="${esc(s.name||'')}" data-simg="${esc(safeUrl(s.img||''))}"`}>
      <div class="br-store-circle"${s.img?` style="background-image:url('${safeUrl(s.img||'')}')"`:''}>${!s.img&&!s._demo?`<span class="store-av-letter" style="font-size:26px">${esc((s.name||'?')[0].toUpperCase())}</span>`:''}${!s.img&&s._demo?`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35"><path d="M3 9h18l-2 11H5L3 9Z"/><path d="M8 9V5a4 4 0 0 1 8 0v4"/></svg>`:''}</div>
      <div class="br-store-name${s._demo?' br-store-name--ph':''}">${s._demo?'':esc(s.name)}</div>
    </div>`).join('');
  el.querySelectorAll('.br-store-item[data-sid]').forEach(item=>{
    item.onclick=()=>openStoreView(item.dataset.sid,item.dataset.sname,item.dataset.simg);
  });
}

function buildBrowseHero(prods){
  const track=document.getElementById('br-hero-track');
  const dots=document.getElementById('br-hero-dots');
  if(!track||!dots)return;
  clearInterval(_brHeroTimer);_brHeroIdx=0;

  // Use real product images when available; fall back to editorial gradients
  let slides;
  if(prods&&prods.length){
    let heroProds=prods.filter(p=>p.slider_type==='main_hero'&&p.hero_status==='approved'&&p.image);
    if(!heroProds.length)heroProds=prods.filter(p=>p.image);
    if(heroProds.length){
      slides=heroProds.slice(0,20).map(p=>({
        bg:p.image,
        id:p.id,
        label:(p.type||'FEATURED').toUpperCase(),
        title:p.name,
        sub:p.description||'Premium quality clothing',
        cta:_priceLabel(p)
      }));
    }
  }
  if(!slides){
    slides=BR_SLIDES.map((s,i)=>({...s,bg:null,id:null,idx:i}));
  }

  track.innerHTML=slides.map((s,i)=>`
    <div class="br-hero-slide${!s.bg?' br-hero-slide--'+(s.idx??i):''}${i===0?' active':''}" data-id="${s.id||''}"${s.bg?` style="background-image:url('${safeUrl(s.bg)}')"`:''}>
      <div class="br-hero-overlay"></div>
      <div class="br-hero-content">
        <div class="br-hero-label">${esc(s.label)}</div>
        <div class="br-hero-title">${esc(s.title)}</div>
        <div class="br-hero-sub">${esc(s.sub)}</div>
        ${s.id?`<div class="br-hero-cta">${esc(s.cta)} →</div>`:`<button class="br-hero-cta" onclick="toast('${s.cta} — قريباً')">${esc(s.cta)} →</button>`}
      </div>
    </div>`).join('');
  dots.innerHTML=slides.map((_,i)=>`<button class="br-hero-dot${i===0?' active':''}" onclick="goBrHeroSlide(${i})"></button>`).join('');
  function _startBrHeroTimer(){clearInterval(_brHeroTimer);if(slides.length>1)_brHeroTimer=setInterval(()=>{_brHeroIdx=(_brHeroIdx+1)%slides.length;goBrHeroSlide(_brHeroIdx);},3800);}
  _startBrHeroTimer();
  _wireHeroTap(track,{goFn:goBrHeroSlide,getIdx:()=>_brHeroIdx,setIdx:i=>{_brHeroIdx=i;},getLen:()=>slides.length,stopTimer:()=>{clearInterval(_brHeroTimer);_brHeroTimer=null;},startTimer:_startBrHeroTimer});
}

function goBrHeroSlide(idx){
  _brHeroIdx=idx;
  document.querySelectorAll('.br-hero-slide').forEach((s,i)=>s.classList.toggle('active',i===idx));
  document.querySelectorAll('.br-hero-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}

function brNavSwitch(tab,btn){
  document.querySelectorAll('#s-browse .br-nav-btn').forEach(b=>b.classList.remove('br-nav-btn--active'));
  btn.classList.add('br-nav-btn--active');
  if(tab==='saved'){navigateTo('s-saved','slide');}
  else if(tab==='discover'){navigateTo('s-discover','slide');}
  else if(tab==='profile'){openCustomerProfile();}
  else if(tab!=='home')toast(tab+' — قريباً');
}

// ── Product Detail ──
function openProdDetail(id){
  const p=_brProds.find(x=>x.id===id);if(!p)return;
  _pdCurrentId=id;
  _logEvent('view',{productId:p.id,sellerId:p.seller_id});
  const colorImgs=(Array.isArray(p.images)&&p.images.length)?p.images:(p.image?[p.image]:[]);
  const detailImgs=Array.isArray(p.detail_images)?p.detail_images:[];
  _pdImages=[...colorImgs,...detailImgs];
  _pdCarouselIdx=0;
  const ov=document.getElementById('pd-overlay');
  const carousel=document.getElementById('pd-carousel');
  const track=document.getElementById('pd-carousel-track');
  const dotsEl=document.getElementById('pd-dots');
  // Show overlay first (still opacity:0) so carousel has real layout width
  ov.style.display='flex';
  const w=carousel?carousel.offsetWidth:0;
  if(track){
    if(_pdImages.length){
      track.innerHTML=_pdImages.map(src=>`<img class="pd-carousel-img"${w?` style="width:${w}px"`:''} src="${safeUrl(src)}" alt="${esc(p.name||'')}" draggable="false">`).join('');
    }else{
      track.innerHTML=`<div class="pd-carousel-ph">👔</div>`;
    }
    track.style.transform='translateX(0)';
  }
  if(dotsEl){
    dotsEl.style.display=_pdImages.length>1?'flex':'none';
    dotsEl.innerHTML=_pdImages.map((_,i)=>`<span class="pd-dot${i===0?' pd-dot--active':''}" onclick="pdGoSlide(${i})"></span>`).join('');
  }
  document.getElementById('pd-name').textContent=p.name||'';
  document.getElementById('pd-price').textContent=_priceLabel(p);
  const _sn=document.getElementById('pd-store-name');
  if(_sn){const _nm=p.seller?.store_name;if(_nm){_sn.textContent='من متجر '+_nm;_sn.style.display='';_sn.onclick=()=>{closeProdDetail();openStoreView(p.seller_id,_nm,p.seller?.profile_image||null);};}else{_sn.textContent='';_sn.style.display='none';_sn.onclick=null;}}
  document.getElementById('pd-desc').textContent=p.description||'';
  const _avail=p.is_available!==false;
  const _lbl=document.getElementById('pd-stock-lbl');
  const _dot=document.getElementById('pd-stock-dot');
  if(_lbl){_lbl.textContent=_avail?'متوفر':'غير متوفر';_lbl.className='pd-stock-lbl '+(_avail?'pd-stock-lbl--yes':'pd-stock-lbl--no');}
  if(_dot){_dot.className='pd-stock-dot'+(_avail?'':' pd-stock-dot--no');}
  _renderColorCircles('pd-colors-wrap',_pdColorKeys(p),null,'pdSelectColor');
  const sPills=document.getElementById('pd-size-pills');
  sPills.innerHTML=(p.sizes||[]).map((s,i)=>`<button class="pd-size-pill${i===0?' pd-size-pill--active':''}" onclick="pdSelectSize(this)">${esc(s)}</button>`).join('');
  const btn=document.getElementById('pd-save-btn');
  btn.textContent='Save';btn.disabled=false;btn.classList.remove('pd-save-btn--saved');
  const canWa=!!(p.seller&&p.seller.phone)&&p.seller?.whatsapp_enabled!==false;
  const canCart=!!p.seller?.cart_enabled;
  const wa=document.getElementById('pd-wa-btn');
  if(wa)wa.style.display=canWa?'flex':'none';
  const cartBtn=document.getElementById('pd-cart-btn');
  if(cartBtn)cartBtn.style.display=canCart?'flex':'none';
  btn.style.display='';
  const actionsWrap=document.getElementById('pd-actions');
  if(actionsWrap)actionsWrap.classList.toggle('pd-actions--split',canWa&&canCart);
  const h=document.getElementById('pd-heart-btn');if(h){h.textContent='♡';h.classList.remove('active');}
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add('pd-overlay--open')));
  _pdCarouselTouch();
}

function closeProdDetail(){
  const ov=document.getElementById('pd-overlay');
  ov.classList.remove('pd-overlay--open');
  setTimeout(()=>{ov.style.display='none';},380);
}

function pdGoSlide(idx){
  if(idx<0||idx>=_pdImages.length)return;
  _pdCarouselIdx=idx;
  const carousel=document.getElementById('pd-carousel');
  const track=document.getElementById('pd-carousel-track');
  if(track&&carousel)track.style.transform=`translateX(${-idx*carousel.offsetWidth}px)`;
  document.querySelectorAll('.pd-dot').forEach((d,i)=>d.classList.toggle('pd-dot--active',i===idx));
}

function _pdCarouselTouch(){
  const carousel=document.getElementById('pd-carousel');
  if(!carousel||carousel._pdTouchBound)return;
  carousel._pdTouchBound=true;
  let sx=0,sy=0,axisLocked=null,tracking=false;
  carousel.addEventListener('touchstart',e=>{
    const t=e.touches[0];sx=t.clientX;sy=t.clientY;axisLocked=null;tracking=true;
  },{passive:true});
  carousel.addEventListener('touchmove',e=>{
    if(!tracking)return;
    const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(!axisLocked){
      if(Math.abs(dx)>Math.abs(dy)+3)axisLocked='h';
      else if(Math.abs(dy)>Math.abs(dx)+3)axisLocked='v';
    }
    if(axisLocked==='h')e.preventDefault();
  },{passive:false});
  carousel.addEventListener('touchend',e=>{
    if(!tracking||axisLocked!=='h'){tracking=false;return;}
    const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40){dx<0?pdGoSlide(_pdCarouselIdx-1):pdGoSlide(_pdCarouselIdx+1);}
    tracking=false;
  },{passive:true});
}

function pdToggleHeart(){
  const h=document.getElementById('pd-heart-btn');if(!h)return;
  const on=h.classList.toggle('active');
  h.textContent=on?'♥':'♡';
}

function pdSelectSize(btn){
  document.querySelectorAll('.pd-size-pill').forEach(b=>b.classList.remove('pd-size-pill--active'));
  btn.classList.add('pd-size-pill--active');
}

function _pdColorKeys(p){
  return(p.color_tags&&p.color_tags.length)?p.color_tags:(p.color?[p.color]:[]);
}

function _renderColorCircles(containerId,colorKeys,activeKey,handlerName,extraClass){
  const wrap=document.getElementById(containerId);if(!wrap)return;
  if(!colorKeys||!colorKeys.length){wrap.innerHTML='—';return;}
  wrap.innerHTML=colorKeys.map((key,i)=>{
    const info=_AP_COLORS.find(c=>c.key===key)||{key,hex:key,ar:key};
    const isActive=activeKey?key===activeKey:i===0;
    const cls=['pd-color-circle',info.border?'pd-color-circle--light':'',extraClass||'',isActive?'pd-color-circle--active':''].filter(Boolean).join(' ');
    return `<button type="button" class="${cls}" style="background:${esc(info.hex)}" data-key="${esc(key)}" data-idx="${i}" onclick="${handlerName}(this)" aria-label="${esc(info.ar||key)}"></button>`;
  }).join('');
}

function pdSelectColor(btn){
  document.querySelectorAll('#pd-colors-wrap .pd-color-circle').forEach(b=>b.classList.remove('pd-color-circle--active'));
  btn.classList.add('pd-color-circle--active');
  const idx=parseInt(btn.dataset.idx,10);
  if(!isNaN(idx))pdGoSlide(Math.min(idx,_pdImages.length-1));
}

function pdOrderWhatsApp(){
  const p=_brProds.find(x=>x.id===_pdCurrentId);if(!p)return;
  const phone=String(p.seller?.phone||'').replace(/\D/g,'');
  if(!phone)return;
  const link=location.origin+location.pathname+'?product='+p.id;
  const priceLine=p.is_exclusive?'السعر: (حصري)':Number(p.price||0).toLocaleString()+' DZD';
  const msg='السلام عليكم\n\nمهتم بهذي القطعة من متجرك على Wardro:\n\n📌 '+(p.name||'')+'\n💰 '+priceLine+'\n📏 المقاس: (..)\n📞 رقم هاتفي: .... \n🎨 اللون: (..)\n\n'+link+'\n\n(استفسار أكثر...)';
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank','noopener');
}

// ══ ORDER FORM (cart checkout UI — no data sent yet) ══
const _DZ_WILAYAS=[
  ['01','أدرار'],['02','الشلف'],['03','الأغواط'],['04','أم البواقي'],['05','باتنة'],
  ['06','بجاية'],['07','بسكرة'],['08','بشار'],['09','البليدة'],['10','البويرة'],
  ['11','تمنراست'],['12','تبسة'],['13','تلمسان'],['14','تيارت'],['15','تيزي وزو'],
  ['16','الجزائر'],['17','الجلفة'],['18','جيجل'],['19','سطيف'],['20','سعيدة'],
  ['21','سكيكدة'],['22','سيدي بلعباس'],['23','عنابة'],['24','قالمة'],['25','قسنطينة'],
  ['26','المدية'],['27','مستغانم'],['28','المسيلة'],['29','معسكر'],['30','ورقلة'],
  ['31','وهران'],['32','البيض'],['33','إليزي'],['34','برج بوعريريج'],['35','بومرداس'],
  ['36','الطارف'],['37','تندوف'],['38','تيسمسيلت'],['39','الوادي'],['40','خنشلة'],
  ['41','سوق أهراس'],['42','تيبازة'],['43','ميلة'],['44','عين الدفلى'],['45','النعامة'],
  ['46','عين تموشنت'],['47','غرداية'],['48','غليزان'],['49','تيميمون'],['50','برج باجي مختار'],
  ['51','أولاد جلال'],['52','بني عباس'],['53','عين صالح'],['54','عين قزام'],['55','تقرت'],
  ['56','جانت'],['57','المغير'],['58','المنيعة']
];
const _DZ_COMMUNES={
  '01':['أدرار','اقبلي','أولف','بودة','فنوغيل','إن زغمير','أولاد أحمد تيمي','رقان','سالي','السبع','تامنطيط','تامست','تيمقتن','تيت','تسابيت','زاوية كنتة'],
  '02':['أبو الحسن','عين مران','بنايرية','بني بوعتاب','بني حواء','بني راشد','بوقادير','بوزغاية','بريرة','الشطية','الشلف','الظهرة','الحجاج','الكريمية','المرسى','حرشون','الهرانفة','الأبيض مجاجة','مصدق','وادي الفضة','وادي قوسين','وادي سلي','أولاد عباس','أولاد بن عبد القادر','أولاد فارس','أم الدروع','سنجاس','سيدي عبد الرحمن','سيدي عكاشة','الصبحة','تاجنة','تلعصة','تاوقريت','تنس','الزبوجة'],
  '03':['أفلو','عين ماضي','عين سيدي علي','البيضاء','بن ناصر بن شهرة','بريدة','العسافية','الغيشة','الحويطة','قلتة سيدي سعد','الحاج مشري','حاسي الدلاعة','حاسي الرمل','الخنق','قصر الحيران','الأغواط','وادي مرة','وادي مزي','سبقاق','سيدي بوزيد','سيدي مخلوف','تاجموت','تاجرونة','تاويالة'],
  '04':['عين ببوش','عين البيضاء','عين الديس','عين فكرون','عين كرشة','عين مليلة','عين الزيتون','بحير الشرقي','بريش','بئر الشهداء','الضلعة','العامرية','البلالة','الجازية','الفجوج بوغرارة سعودي','الحرملية','فكيرينة','هنشير تومغني','قصر الصباحي','مسكيانة','وادي نيني','أولاد قاسم','أولاد حملة','أولاد زواي','أم البواقي','الرحية','سيقوس','سوق نعمان','الزرق'],
  '05':['عين جاسر','عين التوتة','عين ياقوت','أريس','عزيل عبد القادر','بريكة','باتنة','بني فضالة الحقانية','بيطام','بولهيلات','بومقر','بومية','بوزينة','الشمرة','شير','جرمة','الجزار','الحاسي','المعذر','فسديس','فم الطوب','غسيرة','القصبات','القيقبة','حيدوسة','إشمول','إينوغيسن','كيمل','قصر بلزمة','لارباع','لازرو','لمسان','إمدوكل','معافة','منعة','مروانة','نقاوس','وادي الشعبة','وادي الماء','وادي الطاقة','أولاد عمار','أولاد عوف','أولاد فاضل','أولاد سلام','أولاد سي سليمان','عيون العصافير','الرحبات','رأس العيون','سفيان','سقانة','سريانة','تكوت','تالخمت','تاكسلانت','تازولت','ثنية العابد','تيغانمين','تغرغار','تيلاطو','تيمقاد','زانة البيضاء'],
  '06':['أدكار','أيت رزين','أيت إسماعيل','أقبو','أكفادو','أمالو','أميزور','أوقاس','برباشة','بجاية','بني جليل','بني كسيلة','بني مليكش','بني معوش','بو جليل','بوحمزة','بوخليفة','شلاطة','شميني','درقينة','ذراع القايد','الفلاي','القصر','فناية الماثن','فرعون','أوزلاقن','إغيل علي','اغرم','كنديرة','خراطة','مسيسنة','مالبو','وادي غير','صدوق','سيدي عياد','سيدي عيش','سمعون','سوق لإثنين','سوق اوفلا','تالة حمزة','تامقرة','تامريجت','تاوريرت إغيل','تاسكريوت','تازمالت','طيبان','تيشي','تيفرة','تيمزريت','تينبدار','تيزي نبربر','توجة'],
  '07':['عين الناقة','عين زعطوط','بسكرة','برج بن عزوز','بوشقرون','برانيس','شتمة','جمورة','الفيض','الغروس','الحاجب','الحوش','القنطرة','الوطاية','فوغالة','خنقة سيدي ناجي','ليشانة','ليوة','مشونش','مخادمة','المزيرعة','مليلي','أوماش','أورلال','سيدي عقبة','طولقة','زريبة الوادي'],
  '08':['العبادلة','بشار','بني ونيف','بوكايس','عرق فراج','القنادسة','لحمر','مشرع هواري بومدين','المريجة','موغل','تبلبالة','تاغيت'],
  '09':['عين الرمانة','بني مراد','بني تامو','بن خليل','البليدة','بوعرفة','بوفاريك','بوقرة','بوعينان','الشبلي','الشفة','الشريعة','جبابرة','العفرون','قرواو','حمام ملوان','الأربعاء','مفتاح','موزاية','وادي جر','وادي العلايق','اولاد سلامة','أولاد يعيش','صوحان','الصومعة'],
  '10':['أغبالو','أهل القصر','عين الحجر','عين العلوي','عين الترك','عين بسام','أيت لعزيز','أعمر','بشلول','بئر غبالو','برج أوخريص','بودربالة','البويرة','بوكرم','شرفة','الدشمية','ديرة','جباحية','العجيبة','الأسنام','الهاشمية','الخبوزية','الحاكمية','المقراني','قرومة','الحجرة الزرقاء','حيزر','حنيف','قادرية','الأخضرية','أمشدالة','معلة','المعمورة','مزدور','وادي البردي','أولاد راشد','روراوة','ريدان','سحاريج','سوق الخميس','سور الغزلان','تاغزوت','تاقديت','آث  منصور','زبربر'],
  '11':['ابلسة','عين امقل','أدلس','تمنراست','تاظروك'],
  '12':['عين الزرقاء','بجن','بكارية','بئر الذهب','بئر مقدم','بئر العاتر','بوخضرة','بولحاف الدير','الشريعة','الكويف','الماء الابيض','المريج','المزرعة','العقلة','العقلة المالحة','العوينات','الحويجبات','فركان','قريقر','الحمامات','مرسط','نقرين','الونزة','أم علي','صفصاف الوسرى','سطح قنطيس','تبسة','ثليجان'],
  '13':['عين فتاح','عين فزة','عين غرابة','عين الكبيرة','عين النحالة','عين تالوت','عين يوسف','عمير','باب العسة','بني بهدل','بني بوسعيد','بني خلاد','بني مستر','بني وارسوس','بني صميل','بني سنوس','بن سكران','بوحلو','البويهي','شتوان','دار يغمراسن','جبالة','العريشة','العزايل','الفحول','القور','فلاوسن','الغزوات','حمام بوغرارة','الحناية','هنين','مغنية','منصورة','مرسى بن مهيدي','مسيردة الفواقة','ندرومة','وادي الخضر','أولاد ميمون','أولاد رياح','الرمشي','صبرة','سبعة شيوخ','سبدو','سيدي العبدلي','سيدي الجيلالي','سيدي مجاهد','السواحلية','السواني','سوق الثلاثاء','تيرني بني هديل','تيانت','تلمسان','زناتة'],
  '14':['عين بوشقيف','عين الذهب','عين دزاريت','عين الحديد','عين كرمس','بوقرة','شحيمة','دحموني','جبيلات الرصفاء','جيلالي بن عمار','الفايجة','فرندة','قرطوفة','حمادية','قصر الشلالة','مادنة','مهدية','مشرع الصفا','مدريسة','مدروسة','مغيلة','ملاكو','الناظورة','النعيمة','وادي ليلي','الرحوية','الرشايقة','السبعين','السبت','سرغين','سي عبد الغني','سيدي عبد الرحمن','سيدي علي ملال','سيدي بختي','سيدي حسني','السوقر','تاقدمت','تخمرت','تيارت','تيدة','توسنينة','زمالة  الأمير عبد القادر'],
  '15':['أبي يوسف','أغريب','أقني قغران','عين الحمام','عين الزاوية','أيت عقـواشة','أيت بــوادو','أيت بومهدي','أيت خليلي','أيت يحي موسى','أيت عيسى ميمون','أيت شافع','أيت محمود','أيت  أومالو','أيت تودرت','أيت يحيى','اقبيل','أقرو','أسي يوسف','عزازقة','أزفون','بنــــي زمنزار','بني عيسي','بني دوالة','بني يني','بني زيكــي','بوغني','بوجيمة','بونوح','بوزقــن','ذراع بن خدة','ذراع الميزان','فريحة','فريقات','إبودرارن','إيجــار','إفــرحــونان','إيفيغاء','إفليـــسن','إيلـيــلتـن','إيلولة أومـــالو','إمســوحال','إيرجـــن','الأربعــاء ناث إيراثن','معـــاتقة','ماكودة','مشطراس','مقــلع','ميزرانـــة','مكيرة','واسيف','واضية','واقنون','سيدي نعمان','صوامـــع','سوق الإثنين','تادمايت','تيقـزيرت','تيمـيزار','تيرمتين','تيزي نثلاثة','تيزي غنيف','تيزي وزو','تيزي راشد','إعــكورن','يطــافن','زكري'],
  '16':['عين بنيان','عين طاية','الجزائر الوسطى','باب الوادي','باب الزوار','بابا حسن','باش جراح','براقي','ابن عكنون','بني مسوس','بئر مراد رايس','بئر خادم','بئر توتة','بولوغين بن زيري','برج البحري','برج الكيفان','بوروبة','بوزريعة','القصبة','الشراقة','الدار البيضاء','دالي ابراهيم','جسر قسنطينة','الدويرة','الدرارية','العاشور','الابيار','الحراش','المدنية','المغارية','المرسى','المرادية','الحمامات','هراوة','حسين داي','حيدرة','الخرايسية','القبة','الكاليتوس','المعالمة','محمد بلوزداد','المحمدية','وادي قريش','وادي السمار','اولاد شبل','اولاد فايت','الرحمانية','الرايس حميدو','رغاية','الرويبة','السحاولة','سيدي امحمد','سيدي موسى','سويدانية','سطاوالي','تسالة المرجة','زرالدة'],
  '17':['عين الشهداء','عين الإبل','عين فقه','عين معبد','عين وسارة','عمورة','بنهار','بن يعقوب','بيرين','بويرة الأحداب','الشارف','دار الشيوخ','دلدول','الجلفة','دويس','القديد','الادريسية','الخميس','فيض البطمة','قرنيني','قطارة','حد الصحاري','حاسي بحبح','حاسي العش','حاسي فدول','مسعد','مليليحة','مجبارة','أم العظام','سد الرحال','سلمانة','سيدي بايزيد','سيدي لعجال','تعظميت','زعفران','زكار'],
  '18':['برج الطهر','بودريعة بني  ياجيس','بوراوي بلهادف','بوسيف أولاد عسكر','الشحنة','الشقفة','الجمعة بني حبيبي','جيملة','العنصر','العوانة','القنار نشفي','الميلية','الامير عبد القادر','أراقن سويسي','غبالة','جيجل','قاوس','خيري واد عجول','وجانة','أولاد رابح','أولاد يحيى خدروش','سلمى بن زيادة','السطارة','سيدي عبد العزيز','سيدي معروف','الطاهير','تاكسنة','زيامة منصورية'],
  '19':['عين عباسة','عين أرنات','عين أزال','عين الكبيرة','عين الحجر','عين ولمان','عين لقراج','عين الروى','عين السبت','أيت نوال مزادة','ايت تيزي','عموشة','بابور','بازر سكرة','بيضاء برج','بلاعة','بني شبانة','بني فودة','بني ورتيلان','بني وسين','بني عزيز','بني موحلي','بئر حدادة','بئر العرش','بوعنداس','بوقاعة','بوسلام','بوطالب','الدهامشة','جميلة','ذراع قبيلة','العلمة','أوريسيا','الولجة','قلال','قلتة زرقاء','قنزات','قجال','حمام السخنة','الحامة','حمام قرقور','حربيل','قصر الابطال','معاوية','ماوكلان','مزلوق','واد البارد','أولاد عدوان','أولاد صابر','أولاد سي أحمد','أولاد تبان','الرصفة','صالح باي','سرج الغول','سطيف','تاشودة','تالة إيفاسن','الطاية','التلة','تيزي نبشار'],
  '20':['عين الحجر','عين السخونة','عين السلطان','دوي ثابت','الحساسنة','هونت','المعمورة','مولاي العربي','أولاد إبراهيم','أولاد خالد','سعيدة','سيدي احمد','سيدي عمر','سيدي بوبكر','تيرسين','يوب'],
  '21':['عين بوزيان','عين شرشار','عين قشرة','عين زويت','عزابة','بكوش لخضر','بن عزوز','بني بشير','بني ولبان','بني زيد','بين الويدان','بوشطاطة','الشرايع','القل','جندل سعدي محمد','الحروش','الغدير','الحدائق','المرسى','مجاز الدشيش','السبت','فلفلة','حمادي كرومة','قنواع','الكركرة','خناق مايو','وادي الزهور','الولجة بولبلوط','أولاد عطية','أولاد حبابة','أم الطوب','رمضان جمال','صالح بو الشعور','سيدي مزغيش','سكيكدة','تمالوس','زردازة','الزيتونة'],
  '22':['عين البرد','عين قادة','عين الثريد','عين تندمين','عين أدن','العمارنة','بضرابين المقراني','بلعربي','بن باديس','بن عشيبة شلية','بئر الحمام','بوجبهة البرج','بوخنفيس','شيطوان البلايلة','الضاية','الحصيبة','حاسي دحو','حاسي زهانة','لمطار','مكدرة','مرحوم','مسيد','مرين','مزاورو','مصطفى بن ابراهيم','مولاي سليسن','وادي السبع','وادي سفيون','وادي تاوريرة','راس الماء','رجم دموش','السهالة الثورة','سفيزف','سيدي علي بن يوب','سيدي علي بوسيدي','سيدي بلعباس','سيدي ابراهيم','سيدي شعيب','سيدي دحو الزاير','سيدي حمادوش','سيدي خالد','سيدي لحسن','سيدي يعقوب','طابية','تاودموت','تفسور','تغاليمت','تلاغ','تنيرة','تسالة','تلموني','زروالة'],
  '23':['عين الباردة','عنابة','برحال','شطايبي','الشرفة','البوني','العلمة','الحجار','واد العنب','سرايدي','سيدي عمار','التريعات'],
  '24':['عين بن بيضاء','عين العربي','عين مخلوف','عين رقادة','عين صندل','بلخير','بن جراح','بني مزلين','برج صباط','بوحشانة','بوحمدان','بوعاتي محمود','بوشقوف','بومهرة أحمد','الدهوارة','جبالة الخميسي','الفجوج','قلعة بوصبع','قالمة','حمام دباغ','حمام النبايل','هيليوبوليس','نشماية','لخزارة','مجاز عمار','مجاز الصفاء','هواري بومدين','وادي الشحم','وادي فراغة','وادي الزناتي','رأس العقبة','الركنية','سلاوة عنونة','تاملوكة'],
  '25':['عين عبيد','عين السمارة','أبن باديس الهرية','بني حميدان','قسنطينة','ديدوش مراد','الخروب','حامة بوزيان','ابن زياد','بوجريو مسعود','أولاد رحمون','زيغود يوسف'],
  '26':['عين بوسيف','عين اقصير','العيساوية','عزيز','بعطة','بن شكاو','بني سليمان','البرواقية','بئر بن عابد','بوغار','بوعيش','بوعيشون','بوشراحيل','بوغزول','بوسكن','الشهبونية','شلالة العذاورة','شنيقل','دراق','جواب','ذراع السمار','العزيزية','القلب الكبير','الحمدانية','الحوضان','العمارية','العوينات','حناشة','الكاف الاخضر','خمس جوامع','قصر البخاري','مغراوة','المدية','مجبر','مزغنة','مفاتحة','ميهوب','عوامري','وادي حربيل','أولاد عنتر','أولاد بوعشرة','أولاد إبراهيم','أولاد دايد','أولاد امعرف','أولاد هلال','أم الجليل','وزرة','الربعية','السانق','سدراية','سغوان','سي المحجوب','سيدي دامد','سيدي نعمان','سيدي الربيع','سيدي زهار','سيدي زيان','السواقي','تابلاط','تفراوت','تمسقيدة','تيزي مهدي','ثلاث دوائر','الزبيرية'],
  '27':['عشعاشة','عين بودينار','عين نويسي','عين سيدي الشريف','عين تادلس','بن عبد المالك رمضان','بوقيراط','فرناقة','حجاج','حاسي ماماش','الحسيان (بني ياحي','خضرة','خير الدين','منصورة','مزغران','ماسرة','مستغانم','نكمارية','وادي الخير','أولاد بوغالم','أولاد مع الله','صفصاف','صيادة','سيدي علي','سيدي بلعطار','سيدي لخضر','سيرات','السوافلية','سور','ستيدية','تزقايت','الطواهرية'],
  '28':['عين الحجل','عين الملح','عين فارس','عين الخضراء','عين الريش','بلعايبة','بن سرور','بني يلمان','بن زوه','برهوم','بئر فضة','بوسعادة','بوطي السايح','شلال','دهاهنة','جبل مساعد','الهامل','الحوامد','حمام الضلعة','خطوطي سد الجير','خبانة','المعاضيد','معاريف','مقرة','مسيف','امجدل','مناعة','محمد بوضياف','المسيلة','المطارفة','ونوغة','أولاد عدي لقبالة','أولاد دراج','أولاد ماضي','أولاد منصور','أولاد سيدي ابراهيم','أولاد سليمان','ولتام','سيدي عيسى','سيدي عامر','سيدي هجرس','سيدي امحمد','سليم','السوامع','تامسة','تارمونت','زرزور'],
  '29':['عين فارس','عين فكان','عين فراح','عين أفرص','العلايمية','عوف','بنيان','بوهني','بوحنيفية','الشرفاء','البرج','القعدة','الغمري','القطنة','الحشم','القرط','المأمونية','المنور','فراقيق','فروحة','غروس','غريس','قرجوم','حسين','خلوية','ماقضة','ماوسة','معسكر','المطمور','مقطع الدوز','المحمدية','نسمط','عقاز','وادي الأبطال','وادي التاغية','رأس عين عميروش','سجرارة','السهايلية','سيدي عبد الجبار','سيدي عبد المومن','سيدي بوسعيد','سيدي قادة','سيق','تيغنيف','تيزي','زهانة','زلامطة'],
  '30':['عين البيضاء','البرمة','حاسي بن عبد الله','حاسي مسعود','انقوسة','ورقلة','الرويسات','سيدي خويلد'],
  '31':['عين البية','عين الكرمة','عين الترك','أرزيو','بن فريحة','بطيوة','بئر الجير','بوفاتيس','بوسفر','بوتليليس','العنصر','البراية','الكرمة','السانية','قديل','حاسي بن عقبة','حاسي بونيف','حاسي مفسوخ','مرسى الحجاج','المرسى الكبير','مسرغين','وهران','وادي تليلات','سيدي بن يبقى','سيدي الشحمي','طفراوي'],
  '32':['عين العراك','اربوات','بوعلام','بوقطب','بوسمغون','بريزينة','الشقيق','شلالة','البيض','الأبيض سيدي الشيخ','البنود','الخيثر','المحرة','الغاسول','الكاف الأحمر','كراكدة','رقاصة','سيدي عامر','سيدي سليمان','سيدي طيفور','ستيتن','توسمولين'],
  '33':['برج عمر إدريس','دبداب','إيليزي','إن أمناس'],
  '34':['عين تاغروت','عين تسرة','برج بوعريرج','بليمور','بن داود','بئر قاصد علي','برج الغدير','برج زمورة','القلة','جعافرة','العش','الياشير','العناصر','الحمادية','الماين','المهير','غيلاسة','حرازة','حسناوة','خليل','القصور','المنصورة','مجانة','أولاد أبراهم','أولاد دحمان','أولاد سيدي ابراهيم','الرابطة','رأس الوادي','سيدي أمبارك','تفرق','تقلعيت','تسامرت','ثنية النصر','تيكستار'],
  '35':['أعفير','عمال','بغلية','بن شود','بني عمران','برج منايل','بودواو','بودواو البحري','بومرداس','بوزقزة قدارة','شعبة العامر','قورصو','دلس','جنات','الخروبة','حمادي','يسر','خميس الخشنة','الاربعطاش','لقاطة','الناصرية','أولاد عيسى','أولاد هداج','أولاد موسى','سي مصطفى','سيدي داود','سوق الحد','تاورقة','الثنية','تيجلابين','تيمزريت','زموري'],
  '36':['عين العسل','عين الكرمة','عصفور','بن مهيدي','بريحان','البسباس','بوقوس','بوحجار','بوثلجة','شبيطة مختار','الشافية','شحاني','الذرعـان','الشط','العيون','القالة','الطارف','حمام بني صالح','بحيرة الطيور','وادي الزيتون','رمل السوق','السوارخ','زريزر','الزيتونة'],
  '37':['أم العسل','تندوف'],
  '38':['عماري','بني شعيب','بني لحسن','برج بونعامة','برج الأمير عبد القادر','بوقائد','خميستي','الأربعاء','لرجام','العيون','الأزهرية','المعاصم','الملعب','أولاد بسام','سيدي عابد','سيدي بوتوشنت','سيدي العنتري','سيدي سليمان','تملاحت','ثنية الاحد','تيسمسيلت','اليوسفية'],
  '39':['البياضة','بن  قشة','الدبيلة','دوار الماء','العقلة','الوادي','قمار','الحمراية','حساني عبد الكريم','حاسي خليفة','كوينين','المقرن','اميه وانسة','النخلة','وادي العلندة','ورماس','الرقيبة','الرباح','سيدي عون','تغزوت','الطالب العربي','الطريفاوي'],
  '40':['عين الطويلة','بابار','بغاي','بوحمامة','ششار','شلية','جلال','الحامة','المحمل','الولجة','انسيغة','قايس','خنشلة','خيران','مصارة','متوسة','أولاد رشاش','الرميلة','طامزة','تاوزيانت','يابوس'],
  '41':['عين سلطان','عين الزانة','بئر بوحوش','الدريعة','الحدادة','الحنانشة','الخضارة','خميسة','المشروحة','مداوروش','المراهنة','وادي الكبريت','أولاد إدريس','أولاد مومن','أم العظايم','ويلان','الراقوبة','سافل الويدان','سدراتة','سيدي فرج','سوق أهراس','تاورة','ترقالت','تيفاش','الزعرورية','الزوابي'],
  '42':['أغبال','أحمر العين','عين تاقورايت','الحطاطبة','بني ميلك','بوهارون','بواسماعيل','بورقيقة','الشعيبة','شرشال','الداموس','دواودة','فوكة','قوراية','حجوط','حجرة النص','خميستي','القليعة','الأرهاط','مناصر','مراد','مسلمون','الناظور','سيدي غيلاس','سيدي راشد','سيدي سميان','سيدي عامر','تيبازة'],
  '43':['أحمد راشدي','عين البيضاء أحريش','عين الملوك','عين التين','اعميرة اراس','بن يحي عبد الرحمن','بوحاتم','شلغوم العيد','الشيقارة','دراحي بوصلاح','العياضي برباس','مشيرة','فرجيوة','القرارم قوقة','حمالة','ميلة','مينار زارزة','وادي العثمانية','وادي النجاء','وادي سقان','أولاد اخلوف','الرواشد','سيدي خليفة','سيدي مروان','تاجنانت','تسدان حدادة','التلاغمة','ترعي باينان','تسالة لمطاعي','تيبرقنت','يحي بني قشة','زغاية'],
  '44':['عين البنيان','عين بويحيى','عين الدفلى','عين الاشياخ','عين السلطان','عين التركي','عريب','بربوش','بطحية','بلعاص','بن علال','بئر ولد خليفة','برج الأمير خالد','بومدفع','بوراشد','جليدة','جمعة أولاد الشيخ','جندل','العبادية','العامرة','العطاف','الماين','حمام ريغة','الحسانية','الحسينية','خميس مليانة','المخاطرية','مليانة','وادي الشرفاء','واد الجمعة','الروينة','سيدي الأخضر','تاشتة زقاغة','طارق بن زياد','تبركانين','زدين'],
  '45':['عين بن خليل','عين الصفراء','عسلة','جنين بورزق','البيوض','القصدير','مكمن بن عمار','المشرية','مغرار','النعامة','سفيسيفة','تيوت'],
  '46':['أغلال','عين الأربعاء','عين الكيحل','عين تموشنت','عين الطلبة','عقب الليل','بني صاف','بوزجار','شعبة اللحم','شنتوف','العامرية','المالح','المساعيد','الأمير عبد القادر','حمام بوحجر','الحساسنة','حاسي الغلة','وادي برقش','وادي الصباح','أولاد بوجمعة','أولاد الكيحل','ولهاصة الغرابة','سيدي بن عدة','سيدي بومدين','سيدي ورياش','سيدي صافي','تامزورة','تارقة'],
  '47':['بريان','بونورة','ضاية بن ضحوة','العطف','غرداية','القرارة','المنصورة','متليلي','سبسب','زلفانة'],
  '48':['عين الرحمة','عين طارق','عمي موسى','بلعسل بوزقزة','بن داود','بني درقن','بني زنطيس','دار بن عبد الله','جديوية','الحاسي','الحمادنة','الولجة','القطار','المطمر','حد الشكالة','حمري','القلعة','لحلاف','مازونة','مديونة','منداس','مرجة سيدي عابد','واريزان','وادي الجمعة','وادي السلام','وادي رهيو','أولاد يعيش','أولاد سيدي الميهوب','الرمكة','غليزان','سيدي  خطاب','سيدي لزرق','سيدي أمحمد بن علي','سيدي امحمد بن عودة','سيدي سعادة','سوق الحد','يلل','زمورة'],
  '49':['أوقروت','شروين','دلدول','قصر قدور','المطارفة','أولاد عيسى','أولاد السعيد','طالمين','تيميمون','تنركوك'],
  '50':['برج باجي مختار','تيمياوين'],
  '51':['بسباس','الشعيبة','الدوسن','أولاد جلال','رأس الميعاد','سيدي  خالد'],
  '52':['بني عباس','بن يخلف','الواتة','إقلي','كرزاز','القصابي','أولاد خضير','تامترت','تيمودي'],
  '53':['عين صالح','فقارة الزوى','إينغر'],
  '54':['عين قزام','تين زواتين'],
  '55':['بن ناصر','بلدة اعمر','العالية','الحجيرة','المقارين','المنقر','النزلة','سيدي سليمان','الطيبات','تبسبست','تماسين','تقرت','الزاوية العابدية'],
  '56':['برج الحواس','جانت'],
  '57':['جامعة','المغير','المرارة','أم الطيور','سيدي عمران','سيدي خليل','سطيل','تندلة'],
  '58':['المنيعة','حاسي الفحل','حاسي القارة']
};

function _dzCommunesFor(wilayaName){
  const entry=_DZ_WILAYAS.find(w=>w[1]===wilayaName);
  if(!entry)return[];
  return _DZ_COMMUNES[entry[0]]||[wilayaName];
}

let _cfDelivery='home';
let _cfQty=1;

function cfChangeQty(delta){
  _cfQty=Math.max(1,_cfQty+delta);
  const el=document.getElementById('cf-qty-val');if(el)el.textContent=_cfQty;
}

function _cfPopulateWilayas(){
  const sel=document.getElementById('cf-wilaya');
  if(!sel||sel.dataset.filled)return;
  sel.innerHTML='<option value="">الولاية</option>'+_DZ_WILAYAS.map(w=>`<option value="${w[1]}">${w[0]} - ${w[1]}</option>`).join('');
  sel.dataset.filled='1';
}

function cfWilayaChanged(){
  const wilaya=document.getElementById('cf-wilaya')?.value||'';
  const communeSel=document.getElementById('cf-commune');if(!communeSel)return;
  if(!wilaya){
    communeSel.innerHTML='<option value="">البلدية</option>';
    communeSel.disabled=true;
    return;
  }
  const communes=_dzCommunesFor(wilaya);
  communeSel.innerHTML='<option value="">البلدية</option>'+communes.map(c=>`<option value="${c}">${c}</option>`).join('');
  communeSel.disabled=false;
}

function cfSetDelivery(mode){
  _cfDelivery=mode;
  const home=document.getElementById('cf-deliv-home');
  const office=document.getElementById('cf-deliv-office');
  const homeOn=mode==='home';
  home?.classList.toggle('cf-delivery-opt--active',homeOn);
  office?.classList.toggle('cf-delivery-opt--active',!homeOn);
  home?.querySelector('.cf-radio-dot')?.classList.toggle('cf-radio-dot--active',homeOn);
  office?.querySelector('.cf-radio-dot')?.classList.toggle('cf-radio-dot--active',!homeOn);
  const hint=document.getElementById('cf-delivery-hint');
  if(hint)hint.textContent=homeOn?'توصيل سريع وآمن إلى باب منزلك':'استلم طلبك من أقرب مكتب توصيل';
}

function openOrderForm(){
  const p=_brProds.find(x=>x.id===_pdCurrentId);if(!p)return;
  _cfPopulateWilayas();
  cfChangeQty(1-_cfQty);
  const nameEl=document.getElementById('cf-prod-name');if(nameEl)nameEl.textContent=p.name||'';
  const priceEl=document.getElementById('cf-prod-price');if(priceEl)priceEl.textContent=_priceLabel(p);
  const activeColorBtn=document.querySelector('#pd-colors-wrap .pd-color-circle--active');
  const activeColorIdx=activeColorBtn?parseInt(activeColorBtn.dataset.idx,10):0;
  const img=document.getElementById('cf-prod-img');
  if(img)img.src=safeUrl(_pdImages[activeColorIdx]||_pdImages[0]||p.image||'');
  _renderColorCircles('cf-prod-color',_pdColorKeys(p),activeColorBtn?activeColorBtn.dataset.key:null,'cfSelectColor','pd-color-circle--sm');
  const activeSizeBtn=document.querySelector('.pd-size-pill--active');
  const sizeEl=document.getElementById('cf-prod-size');
  if(sizeEl)sizeEl.textContent=(activeSizeBtn?activeSizeBtn.textContent:(p.sizes&&p.sizes[0]))||'—';
  ['cf-name','cf-phone','cf-address'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const wilayaSel=document.getElementById('cf-wilaya');if(wilayaSel)wilayaSel.value='';
  cfWilayaChanged();
  cfSetDelivery('home');
  const waBtn=document.getElementById('cf-wa-btn');
  const _waEnabled=p.seller?.whatsapp_enabled!==false;
  const _cartEnabled=!!p.seller?.cart_enabled;
  if(waBtn)waBtn.style.display=(_waEnabled&&!_cartEnabled)?'':'none';
  const pdOv=document.getElementById('pd-overlay');if(pdOv)pdOv.style.display='none';
  const cfOv=document.getElementById('cf-overlay');if(!cfOv)return;
  cfOv.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>cfOv.classList.add('cf-overlay--open')));
}

function cfSelectColor(btn){
  document.querySelectorAll('#cf-prod-color .pd-color-circle').forEach(b=>b.classList.remove('pd-color-circle--active'));
  btn.classList.add('pd-color-circle--active');
  const idx=parseInt(btn.dataset.idx,10);
  const img=document.getElementById('cf-prod-img');
  if(img&&!isNaN(idx)&&_pdImages[idx])img.src=safeUrl(_pdImages[idx]);
}

function closeOrderForm(){
  const cfOv=document.getElementById('cf-overlay');if(!cfOv)return;
  cfOv.classList.remove('cf-overlay--open');
  setTimeout(()=>{cfOv.style.display='none';},380);
  const pdOv=document.getElementById('pd-overlay');if(pdOv)pdOv.style.display='flex';
}

function cfConfirmOrder(){
  const p=_brProds.find(x=>x.id===_pdCurrentId);if(!p)return;
  const name=document.getElementById('cf-name')?.value.trim()||'';
  const phone=document.getElementById('cf-phone')?.value.trim()||'';
  const wilaya=document.getElementById('cf-wilaya')?.value||'';
  if(!name||!phone||!wilaya){
    toast('يرجى ملء جميع الحقول المطلوبة');
    return;
  }
  const orderNumber='#WR-'+String(Math.floor(10000+Math.random()*90000));
  const color=document.querySelector('#cf-prod-color .pd-color-circle--active')?.dataset.key||'';
  const images=p.images||[];
  const colorTags=p.color_tags||[];
  const selColorIdx=colorTags.length?colorTags.indexOf(color):-1;
  const imageUrl=(selColorIdx>-1?images[selColorIdx]:images[0])||'';
  const productLink='https://hawwadmowissa-art.github.io/wardro-alpha-0.95/?product='+p.id;
  const payload={
    orderNumber,
    productName:p.name||'',
    color,
    size:document.getElementById('cf-prod-size')?.textContent||'',
    quantity:_cfQty,
    price:p.price??'',
    customerName:name,
    customerPhone:phone,
    wilaya,
    baladia:document.getElementById('cf-commune')?.value||'',
    address:document.getElementById('cf-address')?.value.trim()||'',
    deliveryMethod:_cfDelivery,
    timestamp:new Date().toISOString(),
    storeName:p.seller?.store_name||'',
    imageUrl,
    productLink
  };
  const sheetUrl=p.seller?.sheet_url;
  if(!sheetUrl){
    ocStart(true,orderNumber);
    return;
  }
  ocStart(false,orderNumber);
  fetch(sheetUrl,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)})
    .then(res=>{
      if(res.ok)ocShowSuccess();else ocFail();
    })
    .catch(()=>ocFail());
}

// ══ ORDER CONFIRMATION ANIMATION (Phase 1: Sending / Phase 2: Success) — UI shell only ══
function ocStart(auto,orderNumber){
  if(auto===undefined)auto=true;
  const ov=document.getElementById('oc-overlay');if(!ov)return;
  const sending=document.getElementById('oc-phase-sending');
  const success=document.getElementById('oc-phase-success');
  success.classList.remove('oc-phase--active');
  sending.classList.add('oc-phase--active');
  const orderNum=document.getElementById('oc-order-num');
  if(orderNum)orderNum.textContent=orderNumber||('#WR-'+String(Math.floor(10000+Math.random()*90000)));
  ov.classList.add('oc-overlay--open');
  if(auto){
    setTimeout(()=>{
      sending.classList.remove('oc-phase--active');
      success.classList.add('oc-phase--active');
    },2500);
  }
}

function ocShowSuccess(){
  const sending=document.getElementById('oc-phase-sending');
  const success=document.getElementById('oc-phase-success');
  if(sending)sending.classList.remove('oc-phase--active');
  if(success)success.classList.add('oc-phase--active');
}

function ocFail(){
  const ov=document.getElementById('oc-overlay');if(ov)ov.classList.remove('oc-overlay--open');
  toast('فشل إرسال الطلب، حاول مجدداً');
}

function ocCloseToHome(){
  const ov=document.getElementById('oc-overlay');if(ov)ov.classList.remove('oc-overlay--open');
  const cfOv=document.getElementById('cf-overlay');if(cfOv)cfOv.style.display='none';
  closeProdDetail();
  const home=document.getElementById('s-browse');
  if(home&&!home.classList.contains('active'))navigateTo('s-browse','z-axis');
}

function cfOrderWhatsApp(){
  const p=_brProds.find(x=>x.id===_pdCurrentId);if(!p)return;
  if(p.seller?.whatsapp_enabled===false){
    toast('البائع لا يدعم الطلب عبر واتساب حالياً');
    return;
  }
  pdOrderWhatsApp();
}

function _logBehavior(action,product){
  if(localStorage.getItem('wardro_role')==='seller')return;
  const sb=window.db;if(!sb)return;
  sb.auth.getSession().then(({data})=>{
    const uid=data?.session?.user?.id;if(!uid)return;
    sb.from('user_behavior_log').insert({
      user_id:uid,
      action,
      product_id:product.id||null,
      store_id:product.seller_id||null,
      product_type:product.product_type||'shirt',
      color_tags:product.color_tags||[],
      product_category:product.type||null
    }).then(({error})=>{if(error)console.error('behavior log:',error);});
  }).catch(()=>{});
}

// Fire-and-forget event stream (view/save/store_visit) — works for anonymous visitors too.
// Never blocks the UI action it's attached to and never surfaces errors to the user.
function _logEvent(eventType,{productId,sellerId}={}){
  const sb=window.db;if(!sb)return;
  try{
    sb.from('user_behavior_log').insert({
      action:eventType,
      event_type:eventType,
      product_id:productId||null,
      seller_id:sellerId||null
    }).then(({error})=>{if(error)console.error('event log:',error);}).catch(()=>{});
  }catch(_){}
}

async function saveItem(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(!session){openCustAuth();return;}
    const btn=document.getElementById('pd-save-btn');
    btn.textContent='Saving...';btn.disabled=true;
    const{error}=await sb.from('saved_items').insert({customer_id:session.user.id,product_id:_pdCurrentId});
    if(error&&error.code==='23505'){
      btn.textContent='Already Saved ✓';btn.classList.add('pd-save-btn--saved');
    }else if(error){throw error;}
    else{
      btn.textContent='Added to Saved ✓';btn.classList.add('pd-save-btn--saved');
      const p=_brProds.find(x=>x.id===_pdCurrentId);
      if(p){_logBehavior('save',p);_logEvent('save',{productId:p.id,sellerId:p.seller_id});}
    }
  }catch(e){toast(e.message||'خطأ في الحفظ');const btn=document.getElementById('pd-save-btn');if(btn){btn.textContent='Save';btn.disabled=false;}}
}

// ══ COLLECTIONS — public outfit grid + detail sheet (Show Mode + Guest Store View) ══
let _colOutfits=[],_odCurrentId=null;

function _colPriceLabel(o){
  if(o.is_exclusive)return 'حصري';
  if(o.total_price==null||o.total_price==='')return '';
  return Number(o.total_price).toLocaleString()+' دج';
}

async function renderCollectionsPublic(){
  const sb=getSb();if(!sb)return;
  const empty=document.getElementById('show-collections-empty');
  const grid=document.getElementById('show-collections-grid');
  if(!empty||!grid)return;
  let sellerId=_guestSellerId;
  if(!sellerId){
    const{data:{user}}=await sb.auth.getUser();
    sellerId=user?.id||null;
  }
  if(!sellerId){_colOutfits=[];_renderCollectionsGrid();return;}
  try{
    const{data,error}=await sb.from('outfits')
      .select('*, outfit_items(id,product_id,position,product:products(id,name,image,price,is_exclusive,product_type))')
      .eq('seller_id',sellerId)
      .order('created_at',{ascending:false});
    if(error)throw error;
    _colOutfits=(data||[]).map(o=>({...o,items:(o.outfit_items||[]).slice().sort((a,b)=>a.position-b.position)}));
    _colOutfits.forEach(o=>o.items.forEach(it=>{const p=it.product;if(p&&!_brProds.find(x=>x.id===p.id))_brProds.push(p);}));
    _renderCollectionsGrid();
  }catch(e){console.error('renderCollectionsPublic:',e);}
}

function _colCardHtml(o){
  const inner=o.cover_image
    ?`<img class="of-frame-img" src="${safeUrl(o.cover_image)}" alt="${esc(o.name)}" loading="lazy">`
    :`<div class="of-mini-stack">${o.items.slice(0,3).map(it=>{
        const p=it.product||{};
        return `<div class="of-mini">
          ${p.image?`<img class="of-mini-img" src="${safeUrl(p.image)}" alt="" loading="lazy">`:`<div class="of-mini-img of-mini-img--ph"></div>`}
          <span class="of-mini-type">${esc(_OF_TYPE_LABELS[p.product_type]||'Piece')}</span>
        </div>`;
      }).join('')}</div>`;
  const priceTxt=_colPriceLabel(o);
  return `<div class="of-card" onclick="openOutfitDetailPublic('${o.id}')">
    <div class="of-frame">
      ${inner}
      <button type="button" class="col-heart" data-outfit-id="${o.id}" onclick="event.stopPropagation();colToggleHeart(this)" aria-label="احفظ">♡</button>
    </div>
    <div class="of-name">${esc(o.name)}</div>
    ${priceTxt?`<div class="col-price">${esc(priceTxt)}</div>`:''}
  </div>`;
}

function _renderCollectionsGrid(){
  const empty=document.getElementById('show-collections-empty');
  const grid=document.getElementById('show-collections-grid');
  if(!empty||!grid)return;
  if(!_colOutfits.length){empty.style.display='flex';grid.style.display='none';grid.innerHTML='';return;}
  empty.style.display='none';grid.style.display='grid';
  grid.innerHTML=_colOutfits.map(_colCardHtml).join('');
}

async function _colSaveOutfit(outfitId,saveOn){
  const sb=getSb();if(!sb)return{ok:false};
  const{data:{session}}=await sb.auth.getSession();
  if(!session){openCustAuth();return{ok:false};}
  if(saveOn){
    const{error}=await sb.from('saved_outfits').insert({customer_id:session.user.id,outfit_id:outfitId});
    if(error&&error.code!=='23505')throw error;
  }else{
    const{error}=await sb.from('saved_outfits').delete().eq('customer_id',session.user.id).eq('outfit_id',outfitId);
    if(error)throw error;
  }
  return{ok:true};
}

async function colToggleHeart(btn){
  const id=btn.dataset.outfitId;if(!id)return;
  const willSave=!btn.classList.contains('active');
  try{
    const r=await _colSaveOutfit(id,willSave);
    if(!r.ok)return;
    btn.classList.toggle('active',willSave);
    btn.textContent=willSave?'♥':'♡';
  }catch(e){toast(e.message||'خطأ في الحفظ');}
}

function openOutfitDetailPublic(id){
  const o=_colOutfits.find(x=>x.id===id);if(!o)return;
  _odCurrentId=id;
  const cover=document.getElementById('od-cover');
  if(cover){
    cover.innerHTML=o.cover_image
      ?`<img class="of-frame-img" src="${safeUrl(o.cover_image)}" alt="${esc(o.name)}">`
      :`<div class="of-mini-stack">${o.items.slice(0,3).map(it=>{
          const p=it.product||{};
          return `<div class="of-mini">
            ${p.image?`<img class="of-mini-img" src="${safeUrl(p.image)}" alt="">`:`<div class="of-mini-img of-mini-img--ph"></div>`}
            <span class="of-mini-type">${esc(_OF_TYPE_LABELS[p.product_type]||'Piece')}</span>
          </div>`;
        }).join('')}</div>`;
  }
  document.getElementById('od-name').textContent=o.name||'';
  const note=o.note||'';
  document.getElementById('od-about-text').textContent=note||'لا يوجد وصف لهذه التنسيقة.';
  const priceTxt=_colPriceLabel(o);
  const priceEl=document.getElementById('od-price');
  if(priceEl){priceEl.textContent=priceTxt;priceEl.style.display=priceTxt?'':'none';}
  const piecesEl=document.getElementById('od-pieces');
  if(piecesEl){
    piecesEl.innerHTML=o.items.map(it=>{
      const p=it.product||{};
      return `<div class="od-piece" onclick="closeOutfitDetailPublic();openProdDetail('${p.id}')">
        ${p.image?`<img class="od-piece-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="od-piece-img od-piece-img--ph">👔</div>`}
        <div class="od-piece-name">${esc(p.name||'')}</div>
      </div>`;
    }).join('');
  }
  const h=document.getElementById('od-heart-btn');if(h){h.textContent='♡';h.classList.remove('active');}
  const wa=document.getElementById('od-wa-btn');
  const phone=String(_storeShare.phone||'').replace(/\D/g,'');
  if(wa)wa.style.display=phone?'flex':'none';
  const ov=document.getElementById('od-overlay');
  if(ov){
    ov.style.display='flex';
    requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add('od-overlay--open')));
  }
}

function closeOutfitDetailPublic(){
  const ov=document.getElementById('od-overlay');if(!ov)return;
  ov.classList.remove('od-overlay--open');
  setTimeout(()=>{ov.style.display='none';},380);
}

async function odToggleHeart(){
  const h=document.getElementById('od-heart-btn');if(!h||!_odCurrentId)return;
  const willSave=!h.classList.contains('active');
  try{
    const r=await _colSaveOutfit(_odCurrentId,willSave);
    if(!r.ok)return;
    h.classList.toggle('active',willSave);
    h.textContent=willSave?'♥':'♡';
  }catch(e){toast(e.message||'خطأ في الحفظ');}
}

function odOrderWhatsApp(){
  const o=_colOutfits.find(x=>x.id===_odCurrentId);if(!o)return;
  const phone=String(_storeShare.phone||'').replace(/\D/g,'');
  if(!phone)return;
  const link=location.origin+location.pathname+'?outfit='+o.id;
  const priceLine=o.is_exclusive?'السعر: (حصري)':Number(o.total_price||0).toLocaleString()+' DZD';
  const msg='السلام عليكم\n\nمهتم بهذي التنسيقة من متجرك على Wardro:\n\n📌 '+(o.name||'')+'\n💰 '+priceLine+'\n\n'+link+'\n\n(استفسار أكثر...)';
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank','noopener');
}

// ── Customer Auth ──
function openCustAuth(){
  const m=document.getElementById('cust-auth-modal');
  m.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('cust-auth--open')));
}
function closeCustAuth(){
  const m=document.getElementById('cust-auth-modal');
  m.classList.remove('cust-auth--open');
  setTimeout(()=>{m.style.display='none';},380);
}
function custAuthBackdrop(e){if(e.target===e.currentTarget)closeCustAuth();}

async function doCustAuth(){
  const sb=getSb();if(!sb)return;
  const email=document.getElementById('ca-email').value.trim();
  const pass=document.getElementById('ca-pass').value;
  if(!email||!pass)return toast('أدخل البريد وكلمة المرور');
  const btn=document.getElementById('ca-submit');
  btn.textContent='...';btn.disabled=true;
  try{
    let{data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error){
      const em=(error.message||'').toLowerCase();
      if(em.includes('invalid')||em.includes('credentials')||em.includes('not found')){
        const{data:d2,error:e2}=await sb.auth.signUp({email,password:pass});
        if(e2)throw e2;
        data=d2;
      }else throw error;
    }
    if(data?.session){
      localStorage.setItem('wardro_role','customer');
      toast('✓ تم تسجيل الدخول');
      closeCustAuth();
      setTimeout(()=>saveItem(),420);
    }else{
      toast('تحقق من بريدك الإلكتروني لتأكيد الحساب');
      btn.textContent='Continue →';btn.disabled=false;
    }
  }catch(e){toast(e.message||'خطأ');btn.textContent='Continue →';btn.disabled=false;}
}

async function doCustGoogleAuth(){
  const sb=getSb();if(!sb)return;
  localStorage.setItem('wardro_role','customer');
  const{error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://hawwadmowissa-art.github.io/wardro-alpha-0.95/'}});
  if(error)toast(error.message||'تعذّر تسجيل الدخول بحساب Google');
}

// ══ SAVED SCREEN ══
function svNavSwitch(tab){
  if(tab==='home'){
    navigateTo('s-browse','z-axis');
    document.querySelectorAll('#s-browse .br-nav-btn').forEach(b=>b.classList.remove('br-nav-btn--active'));
    const homeBtn=document.querySelector('#s-browse .br-nav-btn');
    if(homeBtn)homeBtn.classList.add('br-nav-btn--active');
  }else if(tab==='discover'){navigateTo('s-discover','slide');}
  else if(tab==='profile'){openCustomerProfile();}
  else toast(tab+' — قريباً');
}

async function loadSaved(){
  const list=document.getElementById('sv-list');
  const empty=document.getElementById('sv-empty');
  if(list)list.innerHTML='';
  if(empty)empty.style.display='none';
  const sb=getSb();if(!sb)return;
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(!session){openCustAuth();return;}
    const{data,error}=await sb
      .from('saved_items')
      .select('id, products(id, name, price, is_exclusive, image, sizes, stock, is_available, seller_id, product_type, color_tags, type, seller:sellers(store_name))')
      .eq('customer_id',session.user.id)
      .order('created_at',{ascending:false});
    if(error)throw error;
    renderSaved(data||[]);
  }catch(e){toast('خطأ: '+e.message);}
}

function renderSaved(items){
  const list=document.getElementById('sv-list');
  const empty=document.getElementById('sv-empty');
  if(!list||!empty)return;
  const valid=items.filter(i=>i.products);
  _svItemMap={};
  valid.forEach(item=>{const p=item.products;_svItemMap[item.id]={id:p.id,seller_id:p.seller_id,product_type:p.product_type,color_tags:p.color_tags,type:p.type};});
  if(!valid.length){
    list.style.display='none';
    empty.style.display='flex';
    return;
  }
  empty.style.display='none';
  list.style.display='flex';
  list.innerHTML=valid.map(item=>{
    const p=item.products;
    const storeName=p.seller?.store_name||'';
    const size=(p.sizes&&p.sizes.length)?p.sizes[0]:'—';
    const isAvail=p.is_available!==false;
    const availHtml=isAvail
      ?'<span class="sv-avail sv-avail--yes">متوفر</span>'
      :'<span class="sv-avail sv-avail--no">غير متوفر</span>';
    return `
      <div class="sv-card" id="sv-card-${item.id}">
        <button class="sv-heart" onclick="removeSavedItem('${item.id}')">♥</button>
        <div class="sv-card-img-wrap">
          ${p.image
            ?`<img class="sv-card-img" src="${safeUrl(p.image)}" alt="${esc(p.name)}" loading="lazy">`
            :`<div class="sv-card-img sv-card-img--ph"></div>`}
        </div>
        <div class="sv-card-info">
          <div class="sv-store-name">${esc(storeName)}</div>
          <div class="sv-prod-name">${esc(p.name)}</div>
          <div class="sv-size">المقاس: ${esc(size)}</div>
          ${availHtml}
          <div class="sv-price">${_priceLabel(p)}</div>
        </div>
      </div>`;
  }).join('');
}

// ══ DISCOVER ══
let _dcType=null,_dcBudgetTouched=false,_dcSizes=[],_dcCategory=null,_discoverSelectedColors=[],_dcSearchQuery='';

function dcInitSlider(){
  // Do NOT reset type/sizes between visits so filters persist
  dcUpdateFill();
  dcCheckRequired();
  // Live grid (Zone 3) — reuse _brProds from Browse instead of a new query; fetch only if not loaded yet
  if(!_brProds.length)loadBrowse().then(_dcRunLiveFilter);
  else _dcRunLiveFilter();
}

function dcUpdateFill(){
  const minEl=document.getElementById('dc-min');
  const maxEl=document.getElementById('dc-max');
  const fill=document.getElementById('dc-slider-fill');
  if(!minEl||!maxEl||!fill)return;
  const min=parseInt(minEl.value);
  const max=parseInt(maxEl.value);
  fill.style.left=(min/20000*100)+'%';
  fill.style.width=((max-min)/20000*100)+'%';
}

function dcOnSliderInput(which){
  const minEl=document.getElementById('dc-min');
  const maxEl=document.getElementById('dc-max');
  if(!minEl||!maxEl)return;
  let min=parseInt(minEl.value),max=parseInt(maxEl.value);
  // Prevent handles crossing — keep 500 DZD gap
  if(which==='min'&&min>max-500){minEl.value=Math.max(0,max-500);min=parseInt(minEl.value);}
  if(which==='max'&&max<min+500){maxEl.value=Math.min(20000,min+500);max=parseInt(maxEl.value);}
  dcUpdateFill();
  const minLbl=min===0?'0':Number(min).toLocaleString();
  const maxLbl=max>=20000?'20,000+':Number(max).toLocaleString();
  const disp=document.getElementById('dc-budget-display');
  if(disp)disp.textContent=`${minLbl} DZD — ${maxLbl} DZD`;
  _dcBudgetTouched=true;
  dcCheckRequired();
  _dcRunLiveFilter();
}

function dcCheckRequired(){
  const btn=document.getElementById('dc-results-btn');
  if(!btn)return;
  const ready=_dcType!==null&&_dcBudgetTouched;
  btn.classList.toggle('dc-results-btn--active',ready);
}

function dcToggleTypeMenu(){
  const menu=document.getElementById('dc-type-menu');
  const chevron=document.getElementById('dc-chevron');
  if(!menu)return;
  const open=menu.style.display!=='none';
  menu.style.display=open?'none':'block';
  if(chevron)chevron.classList.toggle('dc-chevron--open',!open);
}

const _dcTypeLabels={casual:'Casual',sport:'Sport',streetwear:'Streetwear',classic:'Classic',old_money:'Old Money'};
const _dcPieceLabels={shirt:'Shirt',pants:'Pants',shoes:'Shoes',accessory:'Accessory',ensemble:'Ensemble',sandals:'Sandals'};
const _dcPieceIcons={shirt:'👕',pants:'👖',shoes:'👟',accessory:'🎒',ensemble:'🕴',sandals:'👡'};

function dcSelectType(btn){
  _dcType=btn.dataset.val;
  document.querySelectorAll('.dc-type-opt').forEach(b=>b.classList.remove('dc-type-opt--active'));
  btn.classList.add('dc-type-opt--active');
  const valEl=document.getElementById('dc-type-val');
  const icoEl=document.getElementById('dc-type-ico');
  if(valEl){valEl.textContent=_dcPieceLabels[_dcType]||_dcType;valEl.classList.remove('dc-select-val--ph');}
  if(icoEl)icoEl.textContent=_dcPieceIcons[_dcType]||'👔';
  const menu=document.getElementById('dc-type-menu');
  const chevron=document.getElementById('dc-chevron');
  if(menu)menu.style.display='none';
  if(chevron)chevron.classList.remove('dc-chevron--open');
  dcCheckRequired();
  _dcRunLiveFilter();
}

const _DC_OPT_KEYS=['size','color','category'];

function dcToggleOpt(key){
  const chip=document.getElementById('chip-'+key);
  const panel=document.getElementById('panel-'+key);
  if(!chip||!panel)return;
  const opening=panel.style.display==='none';
  // Close all panels first
  _DC_OPT_KEYS.forEach(k=>{
    const p=document.getElementById('panel-'+k);
    if(p&&k!==key)p.style.display='none';
  });
  panel.style.display=opening?'block':'none';
  // Update chip active state: active when panel is open OR has a selection
  _DC_OPT_KEYS.forEach(k=>{
    const c=document.getElementById('chip-'+k);
    if(!c)return;
    const hasSelection=(k==='size'&&_dcSizes.length)||
      (k==='color'&&_discoverSelectedColors.length)||
      (k==='category'&&_dcCategory);
    const isOpen=document.getElementById('panel-'+k)?.style.display!=='none';
    c.classList.toggle('dc-opt-chip--active',isOpen||!!hasSelection);
  });
}

function dcToggleSizeOpt(btn){
  btn.classList.toggle('dc-size-btn--active');
  const v=btn.dataset.val;
  if(btn.classList.contains('dc-size-btn--active')){
    if(!_dcSizes.includes(v))_dcSizes.push(v);
  }else{
    _dcSizes=_dcSizes.filter(s=>s!==v);
  }
  _dcRunLiveFilter();
}

function dcToggleCatOpt(btn){
  const wasActive=btn.classList.contains('dc-size-btn--active');
  document.querySelectorAll('#panel-category .dc-size-btn').forEach(b=>b.classList.remove('dc-size-btn--active'));
  if(!wasActive)btn.classList.add('dc-size-btn--active');
  _dcCategory=wasActive?null:btn.dataset.val;
  _dcRunLiveFilter();
}

function _initDiscoverColorSwatches(){
  const grid=document.getElementById('dc-color-swatches');
  if(!grid)return;
  grid.innerHTML=_AP_COLORS.map(c=>`<button class="dc-color-swatch" data-key="${c.key}" onclick="dcToggleColorSwatch('${c.key}')" aria-label="${esc(c.ar)}"><span class="dc-color-swatch-circle" style="background:${c.hex}${c.border?';outline:1px solid rgba(138,138,138,.4)':''}"></span><span class="dc-color-swatch-label">${esc(c.ar)}</span></button>`).join('');
}

function dcToggleColorSwatch(key){
  const idx=_discoverSelectedColors.indexOf(key);
  if(idx===-1)_discoverSelectedColors.push(key);
  else _discoverSelectedColors.splice(idx,1);
  document.querySelectorAll('.dc-color-swatch').forEach(btn=>btn.classList.toggle('dc-color-swatch--selected',_discoverSelectedColors.includes(btn.dataset.key)));
  const clearBtn=document.getElementById('dc-color-clear-btn');
  if(clearBtn)clearBtn.style.display=_discoverSelectedColors.length?'block':'none';
  _dcUpdateColorChipLabel();
  _dcRunLiveFilter();
}

function dcClearColors(){
  _discoverSelectedColors=[];
  document.querySelectorAll('.dc-color-swatch').forEach(btn=>btn.classList.remove('dc-color-swatch--selected'));
  const clearBtn=document.getElementById('dc-color-clear-btn');
  if(clearBtn)clearBtn.style.display='none';
  _dcUpdateColorChipLabel();
  _dcRunLiveFilter();
}

function _dcUpdateColorChipLabel(){
  const lbl=document.getElementById('chip-color-label');
  if(!lbl)return;
  lbl.textContent=_discoverSelectedColors.length?`اللون (${_discoverSelectedColors.length})`:'اللون';
  const chip=document.getElementById('chip-color');
  const panelOpen=document.getElementById('panel-color')?.style.display!=='none';
  if(chip)chip.classList.toggle('dc-opt-chip--active',!!_discoverSelectedColors.length||panelOpen);
}

// ══ Zone 2/3 — inline search + live grid (works alongside the full #s-results flow below) ══
function _dcStripHtml(str){return(str||'').replace(/<[^>]*>/g,'');}

function dcOnSearchInput(){
  const el=document.getElementById('dc-search-input');
  _dcSearchQuery=_dcStripHtml(el?el.value:'').toLowerCase().trim();
  _dcRunLiveFilter();
}

function _dcRenderGrid(prods){
  const el=document.getElementById('dc-grid');
  if(!el)return;
  if(!prods.length){
    el.innerHTML='<div class="dc-grid-empty">ما لقينا قطعة بهذا الوصف</div>';
    return;
  }
  el.innerHTML=prods.map(p=>`
    <div class="br-prod-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="br-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
      <div class="br-prod-info"><div class="br-prod-name">${esc(p.name||'')}</div><div class="br-prod-price">${_priceLabel(p)}</div></div>
    </div>`).join('');
}

function _dcRunLiveFilter(){
  const minEl=document.getElementById('dc-min'),maxEl=document.getElementById('dc-max');
  const min=minEl?parseInt(minEl.value)||0:0;
  const max=maxEl?parseInt(maxEl.value)||20000:20000;
  let pool=_brProds.slice();
  if(_dcType){
    const pieceTypes=_dcType==='pants'?['pants','jeans']:[_dcType];
    pool=pool.filter(p=>pieceTypes.includes(p.product_type));
  }
  pool=pool.filter(p=>{const pr=Number(p.price);return pr>=min&&pr<=max;});
  if(_dcCategory)pool=pool.filter(p=>p.type===_dcCategory);
  if(_dcSizes.length)pool=pool.filter(p=>Array.isArray(p.sizes)&&p.sizes.some(s=>_dcSizes.includes(s)));
  if(_discoverSelectedColors.length)pool=pool.filter(p=>Array.isArray(p.color_tags)&&p.color_tags.some(c=>_discoverSelectedColors.includes(c)));
  if(_dcSearchQuery)pool=pool.filter(p=>(p.name||'').toLowerCase().includes(_dcSearchQuery));
  _dcRenderGrid(pool);
}

async function dcShowResults(){
  if(!document.getElementById('dc-results-btn').classList.contains('dc-results-btn--active'))return;
  const min=parseInt(document.getElementById('dc-min').value)||0;
  const max=parseInt(document.getElementById('dc-max').value)||20000;
  _dcRunLiveFilter(); // keep #dc-grid (filters + search) in sync for when the user comes back
  navigateTo('s-results','slide');
  setTimeout(()=>runDiscover(min,max,[..._discoverSelectedColors]),320);
}

async function runDiscover(minPrice,maxPrice,selectedColors){
  const grid=document.getElementById('rs-prod-grid');
  const loading=document.getElementById('rs-loading');
  const empty=document.getElementById('rs-empty');
  const comp=document.getElementById('rs-comp-section');
  if(!grid)return;
  grid.innerHTML='';
  if(loading)loading.style.display='flex';
  if(empty)empty.style.display='none';
  if(comp)comp.style.display='none';

  const sb=getSb();if(!sb){if(loading)loading.style.display='none';return;}
  try{
    // Primary query — product_type + price (Supabase, no AI); jeans is semantically pants
    const pieceTypes=_dcType==='pants'?['pants','jeans']:[_dcType];
    let q=sb.from('products')
      .select('*, seller:sellers(store_name,phone,cart_enabled,whatsapp_enabled)')
      .in('product_type',pieceTypes)
      .eq('is_hidden',false)
      .gte('price',minPrice)
      .lte('price',maxPrice);
    if(_dcCategory){q=q.eq('type',_dcCategory);}
    if(_dcSizes.length){q=q.overlaps('sizes',_dcSizes);}
    if(selectedColors&&selectedColors.length){q=q.overlaps('color_tags',selectedColors);}
    const{data:prods,error}=await q.order('price',{ascending:true});
    if(error)throw error;

    if(loading)loading.style.display='none';

    const results=(prods||[]).filter(p=>p.slider_type!=='main_hero'||p.hero_status==='approved');

    if(!results.length){if(empty)empty.style.display='flex';return;}

    // Merge into _brProds so openProdDetail works
    results.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});

    grid.innerHTML=results.map(p=>`
      <div class="br-prod-card" onclick="openProdDetail('${p.id}')">
        ${p.image?`<img class="br-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
        <div class="br-prod-info">
          <div class="br-prod-name">${esc(p.name||'')}</div>
          <div class="br-prod-price">${_priceLabel(p)}</div>
        </div>
      </div>`).join('');

    // Complementary — different piece types, structural only (AI not wired)
    const otherTypes=['shirt','pants','jeans','shoes','accessory','sandals'].filter(t=>!pieceTypes.includes(t));
    const{data:compProds}=await sb.from('products')
      .select('*, seller:sellers(store_name,phone,cart_enabled,whatsapp_enabled)')
      .in('product_type',otherTypes)
      .eq('is_hidden',false)
      .limit(8);
    if(compProds&&compProds.length){
      const visComp=compProds.filter(p=>p.slider_type!=='main_hero'||p.hero_status==='approved');
      visComp.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
      const row=document.getElementById('rs-comp-row');
      if(row){
        row.innerHTML=visComp.map(p=>`
          <div class="rs-comp-card" onclick="openProdDetail('${p.id}')">
            ${p.image?`<img class="rs-comp-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="rs-comp-img-ph">👔</div>`}
            <div class="rs-comp-info">
              <div class="rs-comp-name">${esc(p.name||'')}</div>
              <div class="rs-comp-price">${_priceLabel(p)}</div>
            </div>
          </div>`).join('');
      }
      if(comp&&visComp.length)comp.style.display='block';
    }
  }catch(e){
    if(loading)loading.style.display='none';
    if(empty)empty.style.display='flex';
    toast('خطأ في البحث: '+e.message);
    console.error('discover error:',e);
  }
}

function dcNavSwitch(tab){
  if(tab==='home'){
    navigateTo('s-browse','z-axis');
    document.querySelectorAll('#s-browse .br-nav-btn').forEach(b=>b.classList.remove('br-nav-btn--active'));
    const h=document.querySelector('#s-browse .br-nav-btn');if(h)h.classList.add('br-nav-btn--active');
  }else if(tab==='saved'){navigateTo('s-saved','slide');}
  else if(tab==='profile'){openCustomerProfile();}
  else toast(tab+' — قريباً');
}

async function removeSavedItem(savedItemId){
  const sb=getSb();if(!sb)return;
  const card=document.getElementById('sv-card-'+savedItemId);
  if(card){card.style.opacity='.38';card.style.pointerEvents='none';}
  try{
    const{error}=await sb.from('saved_items').delete().eq('id',savedItemId);
    if(error)throw error;
    const _lp=_svItemMap[savedItemId];if(_lp)_logBehavior('unsave',_lp);
    if(card){
      const h=card.offsetHeight;
      card.style.height=h+'px';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        card.style.transform='translateX(60px)';
        card.style.opacity='0';
        setTimeout(()=>{
          card.style.height='0';
          card.style.minHeight='0';
          card.style.overflow='hidden';
          card.style.marginBottom='0';
          setTimeout(()=>{
            card.remove();
            const rem=document.querySelectorAll('#sv-list .sv-card');
            if(!rem.length){
              const l=document.getElementById('sv-list');if(l)l.style.display='none';
              const e=document.getElementById('sv-empty');if(e)e.style.display='flex';
            }
          },360);
        },360);
      }));
    }
    toast('✓ تمت الإزالة');
  }catch(e){
    if(card){card.style.opacity='1';card.style.pointerEvents='';}
    toast('خطأ: '+e.message);
  }
}

// ══ CUSTOMER PROFILE ══
async function openCustomerProfile(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(!session){openCustAuth();return;}
    const email=session.user.email||'';
    const letter=(email.charAt(0)||'?').toUpperCase();
    const lEl=document.getElementById('pf-avatar-letter');
    const eEl=document.getElementById('pf-email');
    if(lEl)lEl.textContent=letter;
    if(eEl)eEl.textContent=email;
  }catch(_){}
  navigateTo('s-profile','slide');
}

async function profileLogout(){
  const sb=getSb();if(!sb)return;
  try{await sb.auth.signOut();}catch(_){}
  localStorage.removeItem('wardro_role');
  navigateTo('s-splash','z-axis');
}

function openDeleteAccountModal(){
  const overlay=document.getElementById('del-modal');
  const btn=document.getElementById('del-modal-confirm');
  if(!overlay||!btn)return;
  btn.disabled=true;btn.style.opacity='0.4';btn.style.cursor='not-allowed';
  btn.textContent='نعم، احذف حسابي';
  overlay.style.display='flex';
  requestAnimationFrame(()=>overlay.classList.add('del-modal--open'));
  document.body.style.overflow='hidden';
  setTimeout(()=>{btn.disabled=false;btn.style.opacity='1';btn.style.cursor='';},3000);
}

function closeDeleteModal(){
  const overlay=document.getElementById('del-modal');if(!overlay)return;
  overlay.classList.remove('del-modal--open');
  setTimeout(()=>{overlay.style.display='none';document.body.style.overflow='';},250);
}

async function confirmDeleteAccount(){
  const sb=getSb();if(!sb)return;
  const btn=document.getElementById('del-modal-confirm');
  if(btn){btn.disabled=true;btn.textContent='جاري الحذف...';}
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(session){
      const uid=session.user.id;
      await sb.from('saved_items').delete().eq('user_id',uid);
      await sb.from('user_behavior_log').delete().eq('user_id',uid);
    }
    await sb.auth.signOut();
    localStorage.removeItem('wardro_role');
    closeDeleteModal();
    setTimeout(()=>{navigateTo('s-splash','z-axis');toast('تم حذف حسابك');},300);
  }catch(e){
    if(btn){btn.disabled=false;btn.textContent='نعم، احذف حسابي';btn.style.opacity='1';btn.style.cursor='';}
    toast('خطأ: '+(e.message||'حاول مجدداً'));
  }
}

// ══ LEGAL MODAL ══
const _LEGAL_TITLES={privacy:'سياسة الخصوصية',terms:'شروط الاستخدام'};
const _LEGAL_PATHS={privacy:encodeURI('Legal Docs/privacy-policy.md'),terms:encodeURI('Legal Docs/terms-of-service.md')};
let _legalCb=null,_legalEsc=null,_legalRetryDoc=null;

function _parseMd(text){
  const blocks=text.split(/\n\n+/).map(b=>b.trim()).filter(Boolean);
  let html='';let skipTitle=true;let isIntro=true;
  blocks.forEach(block=>{
    if(skipTitle){skipTitle=false;return;}
    if(block.startsWith('آخر تحديث:')){
      html+=`<p style="font-size:12px;opacity:.55;margin-top:18px;text-align:center">${esc(block)}</p>`;return;
    }
    if(isIntro){
      isIntro=false;
      html+=`<p style="font-size:15px;opacity:.9;margin:0 0 14px;line-height:1.9">${esc(block)}</p>`;return;
    }
    const hasBullets=block.includes('•');
    if(hasBullets){
      const lines=block.split('\n');let out='';let si=0;
      if(lines[0]&&!lines[0].trim().startsWith('•')){out+=`<p style="margin:0 0 6px">${esc(lines[0].trim())}</p>`;si=1;}
      out+='<ul style="margin:6px 0 12px;padding-right:18px;list-style:none">';
      for(let i=si;i<lines.length;i++){
        const t=lines[i].trim();
        if(t.startsWith('•'))out+=`<li style="margin-bottom:7px;position:relative;padding-right:14px"><span style="position:absolute;right:0;color:#D2AF69">•</span>${esc(t.replace(/^•\s*/,''))}</li>`;
        else if(t)out+=`<li style="margin-bottom:7px">${esc(t)}</li>`;
      }
      out+='</ul>';html+=out;return;
    }
    const lines=block.split('\n').filter(l=>l.trim());if(!lines.length)return;
    if(lines.length===1){
      const t=lines[0].trim();
      const isH=t.length<60&&!t.endsWith('.')&&!t.endsWith('،')&&!t.includes('@');
      html+=isH?`<h3 style="font-family:'Fraunces',serif;font-size:17px;font-weight:300;color:#D2AF69;margin:18px 0 8px">${esc(t)}</h3>`:`<p style="margin:0 0 10px">${esc(t)}</p>`;
      return;
    }
    html+=`<h3 style="font-family:'Fraunces',serif;font-size:17px;font-weight:300;color:#D2AF69;margin:18px 0 8px">${esc(lines[0])}</h3>`;
    lines.slice(1).forEach(l=>{if(l.trim())html+=`<p style="margin:0 0 9px">${esc(l.trim())}</p>`;});
  });
  return html;
}

function _legalScrollCheck(){
  const body=document.getElementById('legal-modal-body');if(!body)return;
  if(body.scrollHeight-body.scrollTop-body.clientHeight<=40){
    const btn=document.getElementById('legal-modal-accept');
    if(btn&&btn.disabled){btn.disabled=false;btn.style.opacity='1';btn.style.cursor='';}
    body.removeEventListener('scroll',_legalScrollCheck);
  }
}

function closeLegalModal(){
  const overlay=document.getElementById('legal-modal');if(!overlay)return;
  overlay.classList.remove('legal-modal--open');
  setTimeout(()=>{
    overlay.style.display='none';
    document.body.style.overflow='';
    document.getElementById('legal-modal-body')?.removeEventListener('scroll',_legalScrollCheck);
  },280);
  if(_legalEsc){document.removeEventListener('keydown',_legalEsc);_legalEsc=null;}
  _legalCb=null;
}

function _legalAccept(){const cb=_legalCb;closeLegalModal();if(cb)cb();}

function _legalRetry(){window.openLegalModal(_legalRetryDoc,_legalCb);}

window.openLegalModal=function(docType,onAcceptCallback){
  const overlay=document.getElementById('legal-modal');
  const bodyEl=document.getElementById('legal-modal-body');
  const titleEl=document.getElementById('legal-modal-title');
  const acceptBtn=document.getElementById('legal-modal-accept');
  if(!overlay||!bodyEl||!titleEl||!acceptBtn)return;
  _legalCb=onAcceptCallback||null;_legalRetryDoc=docType;
  titleEl.textContent=_LEGAL_TITLES[docType]||docType;
  bodyEl.innerHTML='<p style="color:var(--muted);font-size:14px;text-align:center;padding:36px 0;direction:rtl">جاري التحميل...</p>';
  acceptBtn.disabled=true;acceptBtn.style.opacity='0.4';acceptBtn.style.cursor='not-allowed';
  overlay.style.display='flex';
  requestAnimationFrame(()=>overlay.classList.add('legal-modal--open'));
  document.body.style.overflow='hidden';
  if(_legalEsc)document.removeEventListener('keydown',_legalEsc);
  _legalEsc=e=>{if(e.key==='Escape')closeLegalModal();};
  document.addEventListener('keydown',_legalEsc);
  fetch(_LEGAL_PATHS[docType])
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.text();})
    .then(text=>{
      bodyEl.innerHTML=`<div style="direction:rtl;line-height:1.9;color:#D8CFBA;font-family:'Tajawal',sans-serif;font-size:14px">${_parseMd(text)}</div>`;
      bodyEl.addEventListener('scroll',_legalScrollCheck,{passive:true});
      setTimeout(_legalScrollCheck,120);
    })
    .catch(()=>{
      bodyEl.innerHTML='<div style="text-align:center;padding:36px 16px;direction:rtl"><p style="color:var(--muted);margin-bottom:14px;font-family:\'Tajawal\',sans-serif">تعذّر تحميل الوثيقة. حاول لاحقاً.</p><button id="legal-retry-btn" style="background:none;border:none;color:#D2AF69;font-family:\'Tajawal\',sans-serif;font-size:14px;text-decoration:underline;cursor:pointer;padding:0">إعادة المحاولة</button></div>';
      document.getElementById('legal-retry-btn')?.addEventListener('click',_legalRetry);
    });
};

function updateCreateStoreButtonState(){
  const btn=document.getElementById('reg-submit');
  const checked=!!document.getElementById('seller-legal-check')?.checked;
  if(!btn)return;
  btn.disabled=!checked;btn.style.opacity=checked?'1':'0.45';
  btn.style.pointerEvents=checked?'':'none';
}



// ══ OUTFITS — Editor tabs + My Outfits + Build Collection ══
let _ofOutfits=[],_bcEditId=null,_bcItems=[],_bcCoverFile=null,_bcCoverUrl=null,_bcExclusive=false;
const _OF_TYPE_LABELS={shirt:'Shirt',pants:'Pants',jeans:'Jeans',shoes:'Shoes',jacket:'Jacket',accessory:'Accessory',ensemble:'Ensemble',sandals:'Sandals'};

function edSwitchTab(tab){
  const cat=document.getElementById('ed-catalog-body');
  const out=document.getElementById('ed-outfits-body');
  document.getElementById('ed-tab-btn-catalog')?.classList.toggle('ed-tab--active',tab==='catalog');
  document.getElementById('ed-tab-btn-outfits')?.classList.toggle('ed-tab--active',tab==='outfits');
  if(cat)cat.style.display=tab==='catalog'?'':'none';
  if(out)out.style.display=tab==='outfits'?'':'none';
  if(tab==='outfits')loadOutfits();
}

async function loadOutfits(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();if(!user)return;
    const{data,error}=await sb.from('outfits')
      .select('*, outfit_items(id,product_id,position,product:products(id,name,image,price,is_exclusive,product_type))')
      .eq('seller_id',user.id)
      .order('created_at',{ascending:false});
    if(error)throw error;
    _ofOutfits=(data||[]).map(o=>({...o,items:(o.outfit_items||[]).slice().sort((a,b)=>a.position-b.position)}));
    renderOutfits();
  }catch(e){console.error('loadOutfits:',e);}
}

function renderOutfits(){
  const grid=document.getElementById('of-grid');
  const empty=document.getElementById('of-empty');
  if(!grid||!empty)return;
  if(!_ofOutfits.length){
    empty.style.display='flex';grid.style.display='none';grid.innerHTML='';return;
  }
  empty.style.display='none';grid.style.display='grid';
  grid.innerHTML=_ofOutfits.map(o=>{
    const inner=o.cover_image
      ?`<img class="of-frame-img" src="${safeUrl(o.cover_image)}" alt="${esc(o.name)}" loading="lazy">`
      :`<div class="of-mini-stack">${o.items.slice(0,3).map(it=>{
          const p=it.product||{};
          return `<div class="of-mini">
            ${p.image?`<img class="of-mini-img" src="${safeUrl(p.image)}" alt="" loading="lazy">`:`<div class="of-mini-img of-mini-img--ph"></div>`}
            <span class="of-mini-type">${esc(_OF_TYPE_LABELS[p.product_type]||'Piece')}</span>
          </div>`;
        }).join('')}</div>`;
    return `<div class="of-card" onclick="openBuildCollection('${o.id}')">
      <div class="of-frame">
        <span class="of-mode-badge">${o.cover_image?'Cover':'Cards'}</span>
        ${inner}
      </div>
      <div class="of-name">${esc(o.name)}</div>
      <div class="of-sub">${o.items.length} قطعة • ${o.match_pct}% Match</div>
    </div>`;
  }).join('');
}

// ── Build Collection modal ──
function openBuildCollection(id){
  _bcEditId=id||null;
  const o=id?_ofOutfits.find(x=>x.id===id):null;
  _bcItems=o?o.items.map(it=>it.product).filter(Boolean):[];
  _bcCoverFile=null;
  _bcCoverUrl=o?o.cover_image||null:null;
  _bcExclusive=o?o.is_exclusive===true:false;
  const nameEl=document.getElementById('bc-name');if(nameEl)nameEl.value=o?o.name||'':'';
  const noteEl=document.getElementById('bc-note');if(noteEl)noteEl.value=o?o.note||'':'';
  document.getElementById('bc-excl-btn')?.classList.toggle('active',_bcExclusive);
  const priceEl=document.getElementById('bc-total');
  if(priceEl){priceEl.value=(o&&o.total_price!=null)?o.total_price:'';priceEl.disabled=_bcExclusive;}
  const del=document.getElementById('bc-delete');if(del)del.style.display=id?'':'none';
  _bcRenderCover();
  _bcRender();
  const m=document.getElementById('bc-modal');
  if(m){m.style.display='flex';requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('bc-modal--open')));}
}

function closeBuildCollection(){
  const m=document.getElementById('bc-modal');if(!m)return;
  m.classList.remove('bc-modal--open');
  setTimeout(()=>{m.style.display='none'},380);
  closeBcPicker();
}

function bcToggleExclusive(){
  _bcExclusive=!_bcExclusive;
  document.getElementById('bc-excl-btn')?.classList.toggle('active',_bcExclusive);
  const priceEl=document.getElementById('bc-total');
  if(priceEl){priceEl.disabled=_bcExclusive;if(_bcExclusive)priceEl.value='';}
  _bcRenderInfoBar();
}

function bcCoverSelected(input){
  const file=(input.files||[])[0];
  input.value='';
  if(!file)return;
  if(!file.type.startsWith('image/'))return toast('الرجاء اختيار صورة');
  if(file.size>10*1024*1024)return toast('حجم الصورة يجب ألا يتجاوز 10 ميغابايت');
  const reader=new FileReader();
  reader.onload=ev=>{_bcCoverFile={file,dataUrl:ev.target.result};_bcRenderCover();};
  reader.readAsDataURL(file);
}

function bcRemoveCover(){
  _bcCoverFile=null;_bcCoverUrl=null;
  _bcRenderCover();
}

function _bcRenderCover(){
  const drop=document.getElementById('bc-cover-drop');
  const prev=document.getElementById('bc-cover-preview');
  const img=document.getElementById('bc-cover-img');
  const has=!!(_bcCoverFile||_bcCoverUrl);
  if(drop)drop.style.display=has?'none':'flex';
  if(prev)prev.style.display=has?'block':'none';
  if(img&&has)img.src=_bcCoverFile?_bcCoverFile.dataUrl:safeUrl(_bcCoverUrl);
}

function _bcRender(){
  const grid=document.getElementById('bc-pieces-grid');if(!grid)return;
  const store=localStorage.getItem('wardro_store_name')||'—';
  grid.innerHTML=_bcItems.map((p,i)=>`
    <div class="bc-piece">
      <span class="bc-piece-num">${i+1}</span>
      <button type="button" class="bc-piece-dots" onclick="event.stopPropagation();bcToggleMenu(${i})">···</button>
      <div class="bc-piece-menu" id="bc-menu-${i}" style="display:none">
        <button type="button" onclick="bcRemovePiece(${i})">إزالة</button>
        <button type="button" onclick="bcMovePiece(${i},-1)" ${i===0?'disabled':''}>تقديم ↑</button>
        <button type="button" onclick="bcMovePiece(${i},1)" ${i===_bcItems.length-1?'disabled':''}>تأخير ↓</button>
      </div>
      ${p.image?`<img class="bc-piece-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="bc-piece-img bc-piece-img--ph"></div>`}
      <div class="bc-piece-info">
        <div class="bc-piece-name">${esc(p.name||'')}</div>
        <div class="bc-piece-store">${esc(store)}</div>
        <div class="bc-piece-price">${_priceLabel(p)}</div>
      </div>
    </div>`).join('')+`
    <button type="button" class="bc-add-cell" onclick="openBcPicker()">
      <span class="bc-add-plus">+</span>
      <span class="bc-add-label">إضافة قطعة</span>
      <span class="bc-add-hint">Shirt, Pants, Shoes, Accessories, Ensemble, Sandals</span>
    </button>`;
  _bcRenderInfoBar();
  _bcUpdateDone();
}

const _bcInfoSvg=(inner)=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

function _bcRenderInfoBar(){
  const bar=document.getElementById('bc-info-bar');if(!bar)return;
  const store=localStorage.getItem('wardro_store_name')||'—';
  const raw=(document.getElementById('bc-total')?.value||'').trim();
  const priceCell=_bcExclusive?'حصري':(raw!==''?Number(raw).toLocaleString()+' DZD':'0 DZD');
  const cells=[
    [_bcInfoSvg('<path d="M4 4.5h6.5l9 9-6.5 6.5-9-9z"/><circle cx="8.2" cy="8.7" r="1.3"/>'),'عدد القطع',String(_bcItems.length)],
    [_bcInfoSvg('<path d="M6 7h12l1 13H5z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>'),'متجر',store],
    [_bcInfoSvg('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.6-1-1.7-1.5-3-1.5-1.6 0-3 .9-3 2.2s1.2 1.8 3 2.1c1.8.3 3 .9 3 2.1s-1.4 2.1-3 2.1c-1.3 0-2.4-.5-3-1.5"/>'),'سعر تقديري',priceCell],
  ];
  bar.innerHTML=cells.map(([ic,lbl,val])=>`
    <div class="bc-info-cell">${ic}<span class="bc-info-lbl">${esc(lbl)}</span><span class="bc-info-val">${esc(val)}</span></div>`).join('');
}

function _bcUpdateDone(){
  const btn=document.getElementById('bc-done');if(!btn)return;
  const name=(document.getElementById('bc-name')?.value||'').trim();
  const ok=!!name&&_bcItems.length>=2;
  btn.disabled=!ok;btn.style.opacity=ok?'1':'0.45';
}

function bcToggleMenu(idx){
  document.querySelectorAll('.bc-piece-menu').forEach(m=>{
    if(m.id!=='bc-menu-'+idx)m.style.display='none';
  });
  const m=document.getElementById('bc-menu-'+idx);
  if(m)m.style.display=m.style.display==='none'?'flex':'none';
}

function bcRemovePiece(idx){
  _bcItems.splice(idx,1);
  _bcRender();
}

function bcMovePiece(idx,dir){
  const j=idx+dir;
  if(j<0||j>=_bcItems.length)return;
  const tmp=_bcItems[idx];_bcItems[idx]=_bcItems[j];_bcItems[j]=tmp;
  _bcRender();
}

// ── Piece picker ──
function openBcPicker(){
  const list=document.getElementById('bc-picker-list');
  const overlay=document.getElementById('bc-picker');
  if(!list||!overlay)return;
  const chosen={};_bcItems.forEach(p=>{chosen[p.id]=true;});
  const prods=Object.values(_editorProds).filter(p=>!chosen[p.id]);
  list.innerHTML=prods.length?prods.map(p=>`
    <div class="bc-picker-row" onclick="bcPickPiece('${p.id}')">
      ${p.image?`<img class="bc-picker-img" src="${safeUrl(p.image)}" alt="" loading="lazy">`:`<div class="bc-picker-img bc-picker-img--ph"></div>`}
      <div class="bc-picker-info">
        <div class="bc-picker-name">${esc(p.name||'')}</div>
        <div class="bc-picker-type">${esc(_OF_TYPE_LABELS[p.product_type]||'')}</div>
      </div>
      <div class="bc-picker-price">${_priceLabel(p)}</div>
    </div>`).join('')
    :'<div class="bc-picker-empty">كل قطع الكتالوج مضافة — أو الكتالوج فارغ</div>';
  overlay.style.display='flex';
}

function closeBcPicker(){
  const overlay=document.getElementById('bc-picker');
  if(overlay)overlay.style.display='none';
}

function bcPickPiece(id){
  const p=_editorProds[id];if(!p)return;
  _bcItems.push(p);
  closeBcPicker();
  _bcRender();
}

// ── Save / delete ──
async function saveOutfit(){
  const btn=document.getElementById('bc-done');
  const name=(document.getElementById('bc-name')?.value||'').trim();
  const note=(document.getElementById('bc-note')?.value||'').trim();
  if(!name)return toast('أدخل اسم التنسيق');
  if(_bcItems.length<2)return toast('أضف قطعتين على الأقل');
  const sb=getSb();if(!sb)return;
  if(btn){btn.textContent='جاري الحفظ...';btn.disabled=true;}
  try{
    const{data:{user}}=await sb.auth.getUser();
    if(!user)throw new Error('سجّل الدخول أولاً');
    const match=_bcItems.length>=4?92:_bcItems.length===3?87:80;
    const priceRaw=(document.getElementById('bc-total')?.value||'').trim();
    const total_price=_bcExclusive?null:(priceRaw!==''?parseFloat(priceRaw):null);
    const payload={name,state:'close',is_exclusive:_bcExclusive,note:note||null,total_price,match_pct:match};
    let outfitId=_bcEditId;
    if(outfitId){
      const{error}=await sb.from('outfits').update(payload).eq('id',outfitId);
      if(error)throw error;
      const{error:delErr}=await sb.from('outfit_items').delete().eq('outfit_id',outfitId);
      if(delErr)throw delErr;
    }else{
      const{data,error}=await sb.from('outfits').insert({seller_id:user.id,...payload}).select('id').single();
      if(error)throw error;
      outfitId=data.id;
    }
    const rows=_bcItems.map((p,i)=>({outfit_id:outfitId,product_id:p.id,position:i,added_by:user.id}));
    const{error:itemsErr}=await sb.from('outfit_items').insert(rows);
    if(itemsErr)throw itemsErr;
    let coverUrl=_bcCoverUrl;
    if(_bcCoverFile){
      const path=`outfits/${user.id}/${outfitId}.jpg`;
      const{error:upErr}=await sb.storage.from('product-images').upload(path,_bcCoverFile.file,{upsert:true,contentType:_bcCoverFile.file.type});
      if(upErr){toast('فشل رفع الصورة — حاول مجدداً');return;}
      const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);
      coverUrl=pu.publicUrl+'?v='+Date.now();
    }
    const{error:covErr}=await sb.from('outfits').update({cover_image:coverUrl||null}).eq('id',outfitId);
    if(covErr)throw covErr;
    toast(_bcEditId?'✓ تم تحديث التنسيقة':'✓ تم إنشاء التنسيقة');
    closeBuildCollection();
    await loadOutfits();
  }catch(e){toast(e.message||'حدث خطأ');}
  finally{if(btn){btn.textContent='Done ✓';btn.disabled=false;btn.style.opacity='1';}}
}

async function deleteOutfit(){
  if(!_bcEditId)return;
  if(!confirm('حذف هذه التنسيقة نهائياً؟'))return;
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();
    const{error}=await sb.from('outfits').delete().eq('id',_bcEditId);
    if(error)throw error;
    if(user){try{await sb.storage.from('product-images').remove(['outfits/'+user.id+'/'+_bcEditId+'.jpg']);}catch(_e){}}
    toast('✓ تم حذف التنسيقة');
    closeBuildCollection();
    await loadOutfits();
  }catch(e){toast(e.message||'حدث خطأ');}
}

window.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('bc-name')?.addEventListener('input',_bcUpdateDone);
  document.addEventListener('click',e=>{
    if(!e.target.closest('.bc-piece-dots')&&!e.target.closest('.bc-piece-menu')){
      document.querySelectorAll('.bc-piece-menu').forEach(m=>m.style.display='none');
    }
  });
});

// ══ EDITOR/SHOW SIDEBAR — slide-in drawer (shared component, scoped to active screen) ══
function openEdSidebar(btn){
  const screen=(btn&&btn.closest('.screen'))||document.querySelector('.screen.active');
  screen?.querySelector('.ed-sidebar')?.classList.add('ed-sidebar--open');
  screen?.querySelector('.ed-sidebar-backdrop')?.classList.add('ed-sidebar-backdrop--open');
}

function closeEdSidebar(btn){
  const screen=(btn&&btn.closest('.screen'))||document.querySelector('.screen.active');
  screen?.querySelector('.ed-sidebar')?.classList.remove('ed-sidebar--open');
  screen?.querySelector('.ed-sidebar-backdrop')?.classList.remove('ed-sidebar-backdrop--open');
}
