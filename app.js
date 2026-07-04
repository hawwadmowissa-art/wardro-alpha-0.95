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
          return;
        }
      }catch(_){}
    }
    if(window.db&&localStorage.getItem('wardro_role')==='customer'){
      try{
        const{data:{session}}=await window.db.auth.getSession();
        if(session){navigateTo('s-browse','z-axis');_handleStoreDeepLink();return;}
      }catch(_){}
    }
    document.querySelectorAll('.rs-card').forEach((c,i)=>setTimeout(()=>c.classList.add('visible'),200+i*150));
    _handleStoreDeepLink();
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
];

const _AP_TYPE_SIZES={shirt:['S','M','L','XL','XXL'],jacket:['S','M','L','XL','XXL'],pants:['S','M','L','XL','XXL'],shoes:['39','40','41','42','43','44','45','46'],accessory:['one-size']};

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
  if(total<5){
    html+=`<button type="button" class="ap-img-add" onclick="document.getElementById('ap-img-input').click()">+<span>إضافة صورة</span></button>`;
  }
  strip.innerHTML=html;
  const hint=document.getElementById('ap-imgs-hint');
  if(hint)hint.textContent=total>=5?'الحد الأقصى 5 صور':'اضغط على + لإضافة صورة (1–5)';
}

function addProductImages(input){
  const files=Array.from(input.files||[]);
  let pending=0;
  for(const file of files){
    const total=_apExistingUrls.length+_apImgFiles.length+pending;
    if(total>=5){toast('الحد الأقصى 5 صور للقطعة الواحدة');break;}
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
      const{error:upErr}=await sb.storage.from('product-images').upload(path,file,{upsert:true});
      if(!upErr){const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);newUrls.push(pu.publicUrl);}
    }
    const allImages=[..._apExistingUrls,...newUrls].slice(0,5);
    const img_url=allImages[0]||null;
    const hero_status=_apSliderType==='main_hero'?'pending':'none';
    const payload={name,price:_apExclusive?null:parseFloat(price),sizes:_apSizes,type:_apCat,color_tags:_apColorTags,description:desc,image:img_url,images:allImages,slider_type:_apSliderType,hero_status,product_type:_apProductType,is_available:_apAvailable,is_exclusive:_apExclusive};
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
    const{data:seller}=await sb.from('sellers').select('profile_image,bio').eq('id',user.id).single();
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
    const{data:prods}=await sb.from('products').select('*').eq('seller_id',user.id).order('created_at',{ascending:false});
    renderEditorProducts(prods||[]);
    renderShowProducts(prods||[]);
  }catch(e){}
}

function _edProdCardHtml(p){
  const apprBadge=p.hero_status==='pending'
    ?`<div class="ed-appr-badge ed-appr-badge--pending">قيد المراجعة</div>`
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

function renderShowProducts(prods){
  buildHeroSlider(prods);
  prods.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
  const cardHtml=p=>`
    <div class="show-prod-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="show-prod-img" src="${safeUrl(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="show-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;opacity:.3">👔</div>`}
      <div class="show-prod-info"><div class="show-prod-name">${esc(p.name)}</div><div class="show-prod-price">${_priceLabel(p)}</div><div class="show-prod-cat">${esc(p.type||'')}</div></div>
    </div>`;
  // Featured grid (Home tab — first 4)
  const grid=document.getElementById('show-prod-grid');
  const empty=document.getElementById('show-empty');
  if(grid&&empty){
    if(!prods.length){grid.style.display='none';empty.style.display='block';}
    else{empty.style.display='none';grid.style.display='grid';grid.innerHTML=prods.slice(0,4).map(cardHtml).join('');}
  }
  // All-products grid (Products tab)
  const allGrid=document.getElementById('show-all-prod-grid');
  const allEmpty=document.getElementById('show-empty-all');
  if(allGrid&&allEmpty){
    if(!prods.length){allGrid.style.display='none';allEmpty.style.display='block';}
    else{allEmpty.style.display='none';allGrid.style.display='grid';allGrid.innerHTML=prods.map(cardHtml).join('');}
  }
  // About tab stats
  const cnt=document.getElementById('show-prod-count');
  if(cnt)cnt.textContent=prods.length;
}

function _resetModalForm(){
  document.getElementById('ap-name').value='';
  document.getElementById('ap-price').value='';
  document.getElementById('ap-desc').value='';
  _apSizes=[];_apCat=null;_apImgFiles=[];_apExistingUrls=[];_apProductType=null;_apColorTags=[];
  document.querySelectorAll('.sel-btn').forEach(b=>b.classList.remove('active'));
  const sizeBtns=document.getElementById('size-btns');
  if(sizeBtns)sizeBtns.innerHTML='<span style="color:var(--muted);font-size:12px;padding:4px 0">اختر نوع القطعة أولاً</span>';
  _renderImgStrip();
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

async function logOut(){
  const sb=getSb();if(!sb)return;
  try{
    await sb.auth.signOut();
    localStorage.removeItem('wardro_store_name');
    localStorage.removeItem('wardro_role');
    localStorage.removeItem('wardro_profile_image');
    clearInterval(_heroTimer);
    clearInterval(_brHeroTimer);
    // Reset registration form
    ['reg-store','reg-email','reg-pass','reg-pass2'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
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

// ══ SHOW MODE ══
let _heroIdx=0,_heroTimer=null,_heroLen=1;
let _guestSellerId=null; // set when a customer taps Top Store

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
  // Load fresh data
  loadEditorProducts();
}

// Customer taps a Top Store → read-only store view
function openStoreView(sellerId,storeName,storeImg){
  _guestSellerId=sellerId;
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
    if(storeImg){av.style.backgroundImage=`url(${storeImg})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
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
    const{data:seller}=await sb.from('sellers').select('profile_image,bio').eq('id',sellerId).single();
    const guestName=document.getElementById('show-store-name')?.textContent||'?';
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
    const{data:prods}=await sb.from('products').select('*').eq('seller_id',sellerId).eq('is_hidden',false).order('created_at',{ascending:false});
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

function _renderHStrip(stripId,secId,prods){
  const sec=document.getElementById(secId);
  const el=document.getElementById(stripId);
  if(!sec||!el)return;
  if(prods.length<2){sec.style.display='none';return;}
  sec.style.display='';
  el.innerHTML=prods.map(p=>`
    <div class="br-strip-card" onclick="openProdDetail('${p.id}')">
      ${p.image?`<img class="br-strip-img" src="${safeUrl(p.image)}" alt="${esc(p.name||'')}" loading="lazy">`:`<div class="br-strip-img br-strip-img--ph"></div>`}
      <div class="br-strip-info"><div class="br-strip-name">${esc(p.name||'')}</div><div class="br-strip-price">${_priceLabel(p)}</div></div>
    </div>`).join('');
}

function _renderBrowseSections(prods){
  const sevenDaysAgo=new Date(Date.now()-7*24*60*60*1000);

  // Horizontal strips — independent category subsets, max 8, sorted DESC
  // Overlap with vertical grids is natural and expected
  const casualStrip=prods.filter(p=>p.type==='casual').slice(0,8);
  const newStrip=prods.filter(p=>p.created_at&&new Date(p.created_at)>=sevenDaysAgo).slice(0,8);
  const sportStrip=prods.filter(p=>p.type==='sport').slice(0,8);
  const classicStrip=prods.filter(p=>p.type==='classic').slice(0,8);

  // Vertical grids — ALL approved products, shuffled per session
  // Caps: 18 / 12 / 9 / 9 / 9 products (positions §2/§4/§6/§8/§10)
  const pool=_fyshuffle([...prods]);
  let pos=0;
  const grids=[18,12,9,9,9].map(n=>{const s=pool.slice(pos,pos+n);pos+=n;return s;});

  _renderVGrid('br-vgrid-1','br-sec-vgrid-1',grids[0]);
  _renderHStrip('br-strip-casual','br-sec-casual',casualStrip);
  _renderVGrid('br-vgrid-2','br-sec-vgrid-2',grids[1]);
  _renderHStrip('br-strip-new','br-sec-new',newStrip);
  _renderVGrid('br-vgrid-3','br-sec-vgrid-3',grids[2]);
  _renderHStrip('br-strip-sport','br-sec-sport',sportStrip);
  _renderVGrid('br-vgrid-4','br-sec-vgrid-4',grids[3]);

  // Top Stores — R2: always show if 1+ sellers, hide only when 0 sellers
  const stores=[],seen=new Set();
  for(const p of prods){if(p.seller&&!seen.has(p.seller_id)){seen.add(p.seller_id);stores.push({id:p.seller_id,name:p.seller.store_name,img:p.seller.profile_image});}}
  const storesSec=document.getElementById('br-sec-stores');
  if(stores.length){renderTopStores(stores);if(storesSec)storesSec.style.display='';}
  else{if(storesSec)storesSec.style.display='none';}

  _renderVGrid('br-vgrid-5','br-sec-vgrid-5',grids[4]);
  _renderHStrip('br-strip-classic','br-sec-classic',classicStrip);

  // §12 — pool is products not consumed by upper grids, freshly shuffled
  const usedIds=new Set(grids.flat().map(p=>p.id));
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
    const{data:prods,error}=await sb.from('products').select('*,seller:sellers(store_name,profile_image)').eq('is_hidden',false).order('created_at',{ascending:false});
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
  _pdImages=(Array.isArray(p.images)&&p.images.length)?p.images:(p.image?[p.image]:[]);
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
  const cWrap=document.getElementById('pd-colors-wrap');
  cWrap.innerHTML=p.color?`<span class="pd-color-chip pd-color-chip--active">${esc(p.color_name||p.color)}</span>`:'';
  const sPills=document.getElementById('pd-size-pills');
  sPills.innerHTML=(p.sizes||[]).map((s,i)=>`<button class="pd-size-pill${i===0?' pd-size-pill--active':''}" onclick="pdSelectSize(this)">${esc(s)}</button>`).join('');
  const btn=document.getElementById('pd-save-btn');
  btn.textContent='Save';btn.disabled=false;btn.classList.remove('pd-save-btn--saved');
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
    if(Math.abs(dx)>40){dx<0?pdGoSlide(_pdCarouselIdx+1):pdGoSlide(_pdCarouselIdx-1);}
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
let _dcType=null,_dcBudgetTouched=false,_dcSizes=[],_dcOccasion=null,_discoverSelectedColors=[];

function dcInitSlider(){
  // Do NOT reset type/sizes between visits so filters persist
  dcUpdateFill();
  dcCheckRequired();
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
const _dcTypeIcons={casual:'👕',sport:'🏃',streetwear:'🧢',classic:'🤵',old_money:'🎩'};

function dcSelectType(btn){
  _dcType=btn.dataset.val;
  document.querySelectorAll('.dc-type-opt').forEach(b=>b.classList.remove('dc-type-opt--active'));
  btn.classList.add('dc-type-opt--active');
  const valEl=document.getElementById('dc-type-val');
  const icoEl=document.getElementById('dc-type-ico');
  if(valEl){valEl.textContent=_dcTypeLabels[_dcType]||_dcType;valEl.classList.remove('dc-select-val--ph');}
  if(icoEl)icoEl.textContent=_dcTypeIcons[_dcType]||'👔';
  const menu=document.getElementById('dc-type-menu');
  const chevron=document.getElementById('dc-chevron');
  if(menu)menu.style.display='none';
  if(chevron)chevron.classList.remove('dc-chevron--open');
  dcCheckRequired();
}

const _DC_OPT_KEYS=['size','occasion','color','category'];

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
    const hasSelection=(k==='size'&&_dcSizes.length)||(k==='occasion'&&_dcOccasion)||
      (k==='color'&&_discoverSelectedColors.length)||
      (k==='category'&&document.querySelector('#panel-category .dc-size-btn--active'));
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
}

function dcSelectOccasion(btn){
  document.querySelectorAll('#panel-occasion .dc-size-btn').forEach(b=>b.classList.remove('dc-size-btn--active'));
  btn.classList.add('dc-size-btn--active');
  _dcOccasion=btn.dataset.val;
}

function dcToggleCatOpt(btn){
  const wasActive=btn.classList.contains('dc-size-btn--active');
  document.querySelectorAll('#panel-category .dc-size-btn').forEach(b=>b.classList.remove('dc-size-btn--active'));
  if(!wasActive)btn.classList.add('dc-size-btn--active');
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
}

function dcClearColors(){
  _discoverSelectedColors=[];
  document.querySelectorAll('.dc-color-swatch').forEach(btn=>btn.classList.remove('dc-color-swatch--selected'));
  const clearBtn=document.getElementById('dc-color-clear-btn');
  if(clearBtn)clearBtn.style.display='none';
  _dcUpdateColorChipLabel();
}

function _dcUpdateColorChipLabel(){
  const lbl=document.getElementById('chip-color-label');
  if(!lbl)return;
  lbl.textContent=_discoverSelectedColors.length?`اللون (${_discoverSelectedColors.length})`:'اللون';
  const chip=document.getElementById('chip-color');
  const panelOpen=document.getElementById('panel-color')?.style.display!=='none';
  if(chip)chip.classList.toggle('dc-opt-chip--active',!!_discoverSelectedColors.length||panelOpen);
}

async function dcShowResults(){
  if(!document.getElementById('dc-results-btn').classList.contains('dc-results-btn--active'))return;
  const min=parseInt(document.getElementById('dc-min').value)||0;
  const max=parseInt(document.getElementById('dc-max').value)||20000;
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
    // Primary query — type + price (Supabase, no AI)
    const typeToQuery=_dcOccasion||_dcType;
    let q=sb.from('products')
      .select('*, seller:sellers(store_name)')
      .eq('type',typeToQuery)
      .eq('is_hidden',false)
      .gte('price',minPrice)
      .lte('price',maxPrice);
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

    // Complementary — different types, structural only (AI not wired)
    const otherTypes=['casual','sport','streetwear','classic','old_money'].filter(t=>t!==typeToQuery);
    const{data:compProds}=await sb.from('products')
      .select('*, seller:sellers(store_name)')
      .in('type',otherTypes)
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


