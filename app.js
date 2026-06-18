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
          return;
        }
      }catch(_){}
    }
    if(window.db&&localStorage.getItem('wardro_role')==='customer'){
      try{
        const{data:{session}}=await window.db.auth.getSession();
        if(session){navigateTo('s-browse','z-axis');return;}
      }catch(_){}
    }
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
let _apSizes=[],_apCat=null,_apSliderType='none',_apImgFile=null,_apEditId=null,_apEditImg=null,_editorProds={};

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
  document.getElementById('slidertype-btns')?.addEventListener('click',e=>{
    const b=e.target.closest('.sel-btn');if(!b)return;
    document.querySelectorAll('#slidertype-btns .sel-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');_apSliderType=b.dataset.val;
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
    const{data:{user}}=await sb.auth.getUser();
    let img_url=_apEditId?(_apEditImg||null):null;
    if(_apImgFile){
      const ext=_apImgFile.name.split('.').pop();
      const path=`products/${user.id}/${Date.now()}.${ext}`;
      const{error:upErr}=await sb.storage.from('product-images').upload(path,_apImgFile,{upsert:true});
      if(!upErr){const{data:pu}=sb.storage.from('product-images').getPublicUrl(path);img_url=pu.publicUrl}
    }
    const payload={name,price:parseFloat(price),sizes:_apSizes,type:_apCat,color,description:desc,image:img_url,slider_type:_apSliderType};
    if(_apEditId){
      const{error}=await sb.from('products').update(payload).eq('id',_apEditId);
      if(error)throw error;
      toast('✓ تم تحديث القطعة');
    }else{
      const{error}=await sb.from('products').insert({seller_id:user.id,...payload});
      if(error)throw error;
      toast('✓ تمت إضافة القطعة');
    }
    btn.textContent='Done ✓';btn.disabled=false;
    closeAddProduct();
    await loadEditorProducts();
  }catch(e){toast(e.message||'حدث خطأ');btn.textContent='Done ✓';btn.disabled=false}
}

async function loadEditorProducts(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:{user}}=await sb.auth.getUser();
    if(!user)return;
    const{data:seller}=await sb.from('sellers').select('profile_image,bio').eq('id',user.id).single();
    if(seller?.profile_image){
      const circle=document.getElementById('sp-img-circle');
      if(circle){circle.style.backgroundImage=`url(${seller.profile_image})`;circle.style.backgroundSize='cover';circle.style.backgroundPosition='center';circle.innerHTML='';}
      localStorage.setItem('wardro_profile_image',seller.profile_image);
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
  return `
    <div class="ed-prod-card" onclick="openEditProduct('${p.id}')">
      <button class="ed-prod-dots" onclick="event.stopPropagation();openEditProduct('${p.id}')">···</button>
      ${p.image?`<img class="ed-prod-img" src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="ed-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.3">👔</div>`}
      <div class="ed-prod-info">
        <div class="ed-prod-name">${p.name}</div>
        <div class="ed-prod-price">${Number(p.price).toLocaleString()} DZD</div>
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
      ${p.image?`<img class="show-prod-img" src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="show-prod-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;opacity:.3">👔</div>`}
      <div class="show-prod-info"><div class="show-prod-name">${p.name}</div><div class="show-prod-price">${Number(p.price).toLocaleString()} DZD</div><div class="show-prod-cat">${p.type||''}</div></div>
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
  document.getElementById('ap-color').value='';
  document.getElementById('ap-desc').value='';
  _apSizes=[];_apCat=null;_apImgFile=null;
  document.querySelectorAll('.sel-btn').forEach(b=>b.classList.remove('active'));
  const zone=document.getElementById('ap-img-zone');
  if(zone){zone.style.backgroundImage='';zone.style.backgroundSize='';zone.style.backgroundPosition='';zone.style.borderStyle='';}
  const ph=document.getElementById('ap-img-preview');if(ph)ph.style.display='';
}

function _showModal(){
  const m=document.getElementById('ap-modal');if(!m)return;
  m.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>m.classList.add('ap-modal--open')));
}

function openAddProduct(sliderType){
  _apEditId=null;_apEditImg=null;_apSliderType=sliderType||'none';
  _resetModalForm();
  const stGroup=document.getElementById('slidertype-group');if(stGroup)stGroup.style.display='none';
  const del=document.getElementById('ap-delete');if(del)del.style.display='none';
  const title=document.querySelector('.ap-modal-title');if(title)title.textContent='Add Product';
  _showModal();
}

function openEditProduct(id){
  const p=_editorProds[id];if(!p)return;
  _apEditId=p.id;_apEditImg=p.image||null;_apImgFile=null;
  _resetModalForm();
  document.getElementById('ap-name').value=p.name||'';
  document.getElementById('ap-price').value=p.price||'';
  document.getElementById('ap-color').value=p.color||'';
  document.getElementById('ap-desc').value=p.description||'';
  _apSizes=[...(p.sizes||[])];
  document.querySelectorAll('#size-btns .sel-btn').forEach(b=>b.classList.toggle('active',_apSizes.includes(b.dataset.val)));
  _apCat=p.type||null;
  document.querySelectorAll('#cat-btns .sel-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===_apCat));
  _apSliderType=p.slider_type||'none';
  document.querySelectorAll('#slidertype-btns .sel-btn').forEach(b=>b.classList.toggle('active',b.dataset.val===_apSliderType));
  const stGroup=document.getElementById('slidertype-group');if(stGroup)stGroup.style.display='';
  const zone=document.getElementById('ap-img-zone');
  if(zone&&p.image){zone.style.backgroundImage=`url(${p.image})`;zone.style.backgroundSize='cover';zone.style.backgroundPosition='center';zone.style.borderStyle='solid';}
  const ph=document.getElementById('ap-img-preview');if(ph)ph.style.display=p.image?'none':'';
  const del=document.getElementById('ap-delete');if(del)del.style.display='';
  const title=document.querySelector('.ap-modal-title');if(title)title.textContent='Edit Product';
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
    if(_apEditImg){
      const m=_apEditImg.match(/\/product-images\/(.+)$/);
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
    if(regBtn){regBtn.disabled=false;regBtn.innerHTML='Create Store →';regBtn.style.background='';}
    // Reset sign-in form
    ['si-email','si-pass'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const siBtn=document.getElementById('si-submit');
    if(siBtn){siBtn.disabled=false;siBtn.textContent='Sign In →';}
    navigateTo('s-splash','z-axis');
    toast('✓ تم تسجيل الخروج');
  }catch(e){toast(e.message||'خطأ في تسجيل الخروج')}
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
  if(av&&img){av.style.backgroundImage=`url(${img})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
  // Avatar in About tab
  const avAbout=document.getElementById('show-about-avatar');
  if(avAbout&&img){avAbout.style.backgroundImage=`url(${img})`;avAbout.style.backgroundSize='cover';avAbout.style.backgroundPosition='center';avAbout.innerHTML='';}
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
    else{av.style.backgroundImage='';av.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';}
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
    if(seller?.profile_image){
      const av=document.getElementById('show-avatar');
      if(av){av.style.backgroundImage=`url(${seller.profile_image})`;av.style.backgroundSize='cover';av.style.backgroundPosition='center';av.innerHTML='';}
      const avAbout=document.getElementById('show-about-avatar');
      if(avAbout){avAbout.style.backgroundImage=`url(${seller.profile_image})`;avAbout.style.backgroundSize='cover';avAbout.style.backgroundPosition='center';avAbout.innerHTML='';}
    }
    const aboutDesc=document.getElementById('show-about-desc');
    if(aboutDesc)aboutDesc.textContent=seller?.bio||'';
    const{data:prods}=await sb.from('products').select('*').eq('seller_id',sellerId).order('created_at',{ascending:false});
    renderShowProducts(prods||[]);
    // Merge into _brProds so openProdDetail works
    (prods||[]).forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
  }catch(e){}
}

function _wireHeroTap(track){
  let start=null,moved=false;
  track.ontouchstart=e=>{const t=e.touches[0];start={x:t.clientX,y:t.clientY};moved=false;};
  track.ontouchmove=e=>{
    if(!start)return;
    const t=e.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
    if(Math.sqrt(dx*dx+dy*dy)>10)moved=true;
  };
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
  let heroProds=prods.filter(p=>p.slider_type==='hero'&&p.image);
  if(!heroProds.length)heroProds=prods.filter(p=>p.image).slice(0,3);
  else heroProds=heroProds.slice(0,3);
  let slides;
  if(!heroProds.length){
    slides=[{bg:null,id:null,label:'NEW COLLECTION',title:'SUMMER 2026',sub:'Timeless style, elevated for you',cta:'SHOP NOW'}];
  }else{
    slides=heroProds.map(p=>({bg:p.image,id:p.id,label:(p.type||'FEATURED').toUpperCase(),title:p.name,sub:p.description||'Premium quality clothing',cta:`${Number(p.price).toLocaleString()} DZD`}));
  }
  _heroLen=slides.length;
  track.innerHTML=slides.map((s,i)=>`
    <div class="show-hero-slide${!s.bg?' show-hero-slide--ph':''}${i===0?' active':''}" data-id="${s.id||''}"${s.bg?` style="background-image:url('${s.bg}')"`:''}>
      <div class="show-hero-overlay"></div>
      <div class="show-hero-content">
        <div class="show-hero-label">${s.label}</div>
        <div class="show-hero-title">${s.title}</div>
        <div class="show-hero-sub">${s.sub}</div>
        <div class="show-hero-cta">${s.cta} →</div>
      </div>
    </div>`).join('');
  dotsEl.innerHTML=slides.map((_,i)=>`<button class="show-hero-dot${i===0?' active':''}" onclick="goHeroSlide(${i})"></button>`).join('');
  if(slides.length>1){_heroTimer=setInterval(()=>{_heroIdx=(_heroIdx+1)%_heroLen;goHeroSlide(_heroIdx);},3800);}
  _wireHeroTap(track);
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

// ══ CUSTOMER BROWSE ══
let _brHeroIdx=0,_brHeroTimer=null;
let _brProds=[];
let _pdCurrentId=null;

const BR_SLIDES=[
  {label:'NEW COLLECTION',title:'SUMMER 2026',sub:'Explore featured stores',cta:'Explore'},
  {label:'SPORT ESSENTIALS',title:'ACTIVE WEAR',sub:'Premium sportswear, built for you',cta:'Shop Now'},
  {label:'JUST FOR YOU',title:'TOP PICKS',sub:'Curated from the best stores',cta:'Discover'},
];

async function loadBrowse(){
  const sb=getSb();if(!sb)return;
  try{
    const{data:prods,error}=await sb.from('products').select('*, seller:sellers(store_name,profile_image)').order('created_at',{ascending:false});
    if(error){console.error('browse query error:',error);throw error;}
    console.log('browse loaded:',prods?.length,'products');
    _brProds=prods||[];
    // Rebuild hero with real product images now that they're loaded
    buildBrowseHero(_brProds);
    renderBrGrid('br-rec-grid',_brProds.slice(0,9));
    const sport=_brProds.filter(p=>p.type==='sport');
    renderBrGrid('br-sport-grid',sport.length?sport:makeDemoProds(6));
    const casual=_brProds.filter(p=>p.type==='casual');
    renderBrGrid('br-casual-grid',casual.length?casual:makeDemoProds(6));
    const stores=[],seen=new Set();
    for(const p of _brProds){
      if(p.seller&&!seen.has(p.seller_id)){
        seen.add(p.seller_id);
        stores.push({id:p.seller_id,name:p.seller.store_name,img:p.seller.profile_image});
      }
    }
    renderTopStores(stores);
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
      ${p.image?`<img class="br-prod-img" src="${p.image}" alt="${p.name||''}">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
      ${!p._demo?`<div class="br-prod-info"><div class="br-prod-name">${p.name}</div><div class="br-prod-price">${Number(p.price).toLocaleString()} DZD</div></div>`:''}
    </div>`).join('');
}

function renderTopStores(stores){
  const el=document.getElementById('br-stores-row');if(!el)return;
  const list=stores.length?stores:Array.from({length:4},(_,i)=>({id:'ds-'+i,_demo:true,name:'',img:null}));
  el.innerHTML=list.map(s=>`
    <div class="br-store-item"${s._demo?'':` onclick="openStoreView('${s.id}','${(s.name||'').replace(/'/g,"\\'")}','${s.img||''}')" `}>
      <div class="br-store-circle"${s.img?` style="background-image:url('${s.img}')"`:''}>${!s.img?`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35"><path d="M3 9h18l-2 11H5L3 9Z"/><path d="M8 9V5a4 4 0 0 1 8 0v4"/></svg>`:''}</div>
      <div class="br-store-name${s._demo?' br-store-name--ph':''}">${s._demo?'':s.name}</div>
    </div>`).join('');
}

function buildBrowseHero(prods){
  const track=document.getElementById('br-hero-track');
  const dots=document.getElementById('br-hero-dots');
  if(!track||!dots)return;
  clearInterval(_brHeroTimer);_brHeroIdx=0;

  // Use real product images when available; fall back to editorial gradients
  let slides;
  if(prods&&prods.length){
    let heroProds=prods.filter(p=>p.slider_type==='main_hero'&&p.image);
    if(!heroProds.length)heroProds=prods.filter(p=>p.image);
    if(heroProds.length){
      slides=heroProds.slice(0,5).map(p=>({
        bg:p.image,
        id:p.id,
        label:(p.type||'FEATURED').toUpperCase(),
        title:p.name,
        sub:p.description||'Premium quality clothing',
        cta:`${Number(p.price||0).toLocaleString()} DZD`
      }));
    }
  }
  if(!slides){
    slides=BR_SLIDES.map((s,i)=>({...s,bg:null,id:null,idx:i}));
  }

  track.innerHTML=slides.map((s,i)=>`
    <div class="br-hero-slide${!s.bg?' br-hero-slide--'+(s.idx??i):''}${i===0?' active':''}" data-id="${s.id||''}"${s.bg?` style="background-image:url('${s.bg}')"`:''}>
      <div class="br-hero-overlay"></div>
      <div class="br-hero-content">
        <div class="br-hero-label">${s.label}</div>
        <div class="br-hero-title">${s.title}</div>
        <div class="br-hero-sub">${s.sub}</div>
        ${s.id?`<div class="br-hero-cta">${s.cta} →</div>`:`<button class="br-hero-cta" onclick="toast('${s.cta} — قريباً')">${s.cta} →</button>`}
      </div>
    </div>`).join('');
  dots.innerHTML=slides.map((_,i)=>`<button class="br-hero-dot${i===0?' active':''}" onclick="goBrHeroSlide(${i})"></button>`).join('');
  if(slides.length>1){_brHeroTimer=setInterval(()=>{_brHeroIdx=(_brHeroIdx+1)%slides.length;goBrHeroSlide(_brHeroIdx);},3800);}
  _wireHeroTap(track);
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
  else if(tab!=='home')toast(tab+' — قريباً');
}

// ── Product Detail ──
function openProdDetail(id){
  const p=_brProds.find(x=>x.id===id);if(!p)return;
  _pdCurrentId=id;
  const img=document.getElementById('pd-img');
  const ph=document.getElementById('pd-img-ph');
  if(p.image){img.src=p.image;img.style.display='block';if(ph)ph.style.display='none';}
  else{img.style.display='none';if(ph)ph.style.display='flex';}
  document.getElementById('pd-name').textContent=p.name;
  document.getElementById('pd-price').textContent=Number(p.price).toLocaleString()+' DZD';
  document.getElementById('pd-desc').textContent=p.description||'';
  document.getElementById('pd-stock-lbl').textContent=(p.stock>0?'متوفر — '+p.stock+' قطعة':'Quantity Available');
  const cWrap=document.getElementById('pd-colors-wrap');
  cWrap.innerHTML=p.color?`<span class="pd-color-chip pd-color-chip--active">${p.color_name||p.color}</span>`:'';
  const sPills=document.getElementById('pd-size-pills');
  sPills.innerHTML=(p.sizes||[]).map((s,i)=>`<button class="pd-size-pill${i===0?' pd-size-pill--active':''}" onclick="pdSelectSize(this)">${s}</button>`).join('');
  const btn=document.getElementById('pd-save-btn');
  btn.textContent='Save';btn.disabled=false;btn.classList.remove('pd-save-btn--saved');
  const ov=document.getElementById('pd-overlay');
  ov.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add('pd-overlay--open')));
}

function closeProdDetail(){
  const ov=document.getElementById('pd-overlay');
  ov.classList.remove('pd-overlay--open');
  setTimeout(()=>{ov.style.display='none';},380);
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
    else{btn.textContent='Added to Saved ✓';btn.classList.add('pd-save-btn--saved');}
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
      .select('id, products(id, name, price, image, sizes, stock, seller:sellers(store_name))')
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
    const inStock=p.stock==null||p.stock>0;
    const availHtml=inStock
      ?'<span class="sv-avail sv-avail--yes">متوفر</span>'
      :'<span class="sv-avail sv-avail--no">نفدت الكمية</span>';
    return `
      <div class="sv-card" id="sv-card-${item.id}">
        <button class="sv-heart" onclick="removeSavedItem('${item.id}')">♥</button>
        <div class="sv-card-img-wrap">
          ${p.image
            ?`<img class="sv-card-img" src="${p.image}" alt="${p.name}" loading="lazy">`
            :`<div class="sv-card-img sv-card-img--ph"></div>`}
        </div>
        <div class="sv-card-info">
          <div class="sv-store-name">${storeName}</div>
          <div class="sv-prod-name">${p.name}</div>
          <div class="sv-size">المقاس: ${size}</div>
          ${availHtml}
          <div class="sv-price">${Number(p.price||0).toLocaleString()} DZD</div>
        </div>
      </div>`;
  }).join('');
}

// ══ DISCOVER ══
let _dcType=null,_dcBudgetTouched=false,_dcSizes=[],_dcOccasion=null;

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

const _dcTypeLabels={formal:'رسمي',casual:'كاجوال',sport:'رياضي',traditional:'تقليدي'};
const _dcTypeIcons={formal:'🤵',casual:'👕',sport:'🏃',traditional:'🌟'};

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
      (k==='color'&&(document.getElementById('dc-color-input')?.value||'').trim())||
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

async function dcShowResults(){
  if(!document.getElementById('dc-results-btn').classList.contains('dc-results-btn--active'))return;
  const min=parseInt(document.getElementById('dc-min').value)||0;
  const max=parseInt(document.getElementById('dc-max').value)||20000;
  const color=(document.getElementById('dc-color-input')?.value||'').trim().toLowerCase();
  navigateTo('s-results','slide');
  setTimeout(()=>runDiscover(min,max,color),320);
}

async function runDiscover(minPrice,maxPrice,colorFilter){
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
      .gte('price',minPrice)
      .lte('price',maxPrice);
    if(_dcSizes.length){q=q.overlaps('sizes',_dcSizes);}
    const{data:prods,error}=await q.order('price',{ascending:true});
    if(error)throw error;

    if(loading)loading.style.display='none';

    // Client-side color filter
    let results=prods||[];
    if(colorFilter){
      results=results.filter(p=>{
        const c=(p.color||p.color_name||'').toLowerCase();
        return c.includes(colorFilter);
      });
    }

    if(!results.length){if(empty)empty.style.display='flex';return;}

    // Merge into _brProds so openProdDetail works
    results.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});

    grid.innerHTML=results.map(p=>`
      <div class="br-prod-card" onclick="openProdDetail('${p.id}')">
        ${p.image?`<img class="br-prod-img" src="${p.image}" alt="${p.name||''}" loading="lazy">`:`<div class="br-prod-img br-prod-img--ph"></div>`}
        <div class="br-prod-info">
          <div class="br-prod-name">${p.name||''}</div>
          <div class="br-prod-price">${Number(p.price||0).toLocaleString()} DZD</div>
        </div>
      </div>`).join('');

    // Complementary — different types, structural only (AI not wired)
    const otherTypes=['casual','formal','sport','traditional'].filter(t=>t!==typeToQuery);
    const{data:compProds}=await sb.from('products')
      .select('*, seller:sellers(store_name)')
      .in('type',otherTypes)
      .limit(8);
    if(compProds&&compProds.length){
      compProds.forEach(p=>{if(!_brProds.find(x=>x.id===p.id))_brProds.push(p);});
      const row=document.getElementById('rs-comp-row');
      if(row){
        row.innerHTML=compProds.map(p=>`
          <div class="rs-comp-card" onclick="openProdDetail('${p.id}')">
            ${p.image?`<img class="rs-comp-img" src="${p.image}" alt="${p.name||''}" loading="lazy">`:`<div class="rs-comp-img-ph">👔</div>`}
            <div class="rs-comp-info">
              <div class="rs-comp-name">${p.name||''}</div>
              <div class="rs-comp-price">${Number(p.price||0).toLocaleString()} DZD</div>
            </div>
          </div>`).join('');
      }
      if(comp)comp.style.display='block';
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
  else toast(tab+' — قريباً');
}

async function removeSavedItem(savedItemId){
  const sb=getSb();if(!sb)return;
  const card=document.getElementById('sv-card-'+savedItemId);
  if(card){card.style.opacity='.38';card.style.pointerEvents='none';}
  try{
    const{error}=await sb.from('saved_items').delete().eq('id',savedItemId);
    if(error)throw error;
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


