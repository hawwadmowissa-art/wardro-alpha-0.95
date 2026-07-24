# CLAUDE.md — Wardro Alpha 0.95
> الدليل التشغيلي لـ Claude Code | اقرأ هذا أولاً قبل أي خطوة

---

## المشروع
تطبيق ذكاء اصطناعي لتنسيق الملابس الرجالية — السوق الجزائري، يبدأ من ورقلة.
- المطور: بوجمعة (Djimi) — ورقلة، الجزائر
- الرابط: https://hawwadmowissa-art.github.io/wardro-alpha-0.95/
- الـ Repo: hawwadmowissa-art/wardro-alpha-0.95

---

## Stack الثابت — لا يتغير أبداً
| التقنية | الحالة |
|---------|--------|
| HTML + CSS + Vanilla JS | ✅ ثابت |
| Anthropic Claude API | ✅ ثابت |
| Supabase (eu-central-1) | ✅ ثابت |
| GitHub Pages | ✅ ثابت |
| React / Next.js / أي Framework | 🚫 ممنوع |
| إعادة بناء من صفر | 🚫 ممنوع |

---

## هيكل الملفات
```
wardro/
├── index.html          ← التطبيق الكامل (HTML + CSS + JS)
├── admin.html          ← لوحة تحكم المشرف — مستقلة تماماً
├── style.css           ← الأنماط المنفصلة
├── app.js              ← المنطق المنفصل
├── supabase-config.js  ← محلي فقط — لا يُرفع أبداً
├── products.json       ← بيانات ديمو
├── CLAUDE.md           ← هذا الملف
├── AGENTS.md           ← أدوار Workers
├── .gitignore          ← يحتوي supabase-config.js
└── docs/
    └── PRD.md          ← وثيقة المتطلبات
```

---

## ما تم إنجازه ✅
| المرحلة | التفاصيل | التاريخ |
|---------|----------|---------|
| Phase 1 — Deploy | GitHub Pages + API Key في localStorage | مايو 2026 |
| Phase 2 — Database | Supabase متصل، sellers + products + RLS | يونيو 2026 |
| Restructure Phase 1 — Editor Mode | عمود `slider_type` (none/hero/main_hero) بدّل `hero` (bool)؛ Editor مقسّم لـ 3 أقسام مستقلة (Main Hero Slider / Hero Slider / Products) كل واحد بـ dashed "+" tile خاص؛ Edit form فيه segmented control لتغيير القسم؛ حذف toggleHero() وQuick Add row | يونيو 2026 |
| Seller Approval — Step 1 (DB) | `sellers.approval_status` (default 'pending') + `products.approval_status` (default 'approved')؛ RLS مُحدَّث: public يرى المعتمدين فقط؛ is_admin() + seller_is_approved() كـ SECURITY DEFINER functions؛ البائعين السبعة الحاليين أُبقوا بحالة 'approved' | يونيو 2026 |
| Seller Approval — Step 2 (UI) | شاشة `#s-pending` جديدة: WR emblem + "حسابك قيد المراجعة" + اسم المتجر + إيميل + زر تسجيل خروج؛ Routing محدَّث في Registration/SignIn/Session Restore — pending/rejected يذهبون لـ #s-pending، approved للـ editor كالمعتاد | يونيو 2026 |
| Seller Approval — Step 2 (Logout Fix) | logOut() يُعيد ضبط حقول reg + signin (قيم + أزرار + أخطاء)؛ goSeller() يوجّه لـ signin بدل reg؛ doSellerReg() يُجرّب sign-in صامت عند "already registered" ويوجّه حسب approval_status | يونيو 2026 |
| Seller Approval — Step 3 (Admin) | `admin.html` مستقل: بوابة تسجيل دخول + فحص ADMIN_EMAIL؛ تابين (بائعون قيد المراجعة / منتجات Main Hero)؛ موافقة/رفض مع تأكيد + toast؛ Session Restore للمشرف؛ محمي من غير المصرح لهم | يونيو 2026 |
| Security Audit — API Key + XSS | حذف `getApiKey/showApiKeyModal/saveApiKey` + cleanup `wardro_claude_key`؛ إضافة `esc()` + `safeUrl()` في `app.js`؛ تأمين كل نقاط `innerHTML`: بطاقات Editor/Show/Browse/Saved/Discover/Results/Hero Sliders + Product Detail + Top Stores (data-attributes بدل onclick injection) | يونيو 2026 |
| Phase 3 DB Foundation — Migration | `products.product_type` (text NOT NULL DEFAULT 'shirt' CHECK IN shirt/pants/shoes/jacket/accessory)؛ `products.color_tags` (text[] NOT NULL DEFAULT '{}')؛ جدول `user_behavior_log` جديد (id/user_id/action/product_id/store_id/product_type/color_tags/product_category/created_at) مع RLS: users يكتبون/يقرأون سجلاتهم فقط، admin يقرأ الكل عبر is_admin()، لا UPDATE/DELETE (immutable log) | يونيو 2026 |
| Phase 2A — Product Type + Dynamic Sizes | Editor: حقل "Product Type" مطلوب (Shirt/Pants/Shoes/Jacket/Accessory) قبل size selector؛ sizes ديناميكية حسب النوع (S-XXL للملابس، 39-46 للأحذية، One Size للاكسسوار)؛ زر الحفظ disabled حتى يُختار النوع + الاسم + السعر؛ Edit mode يعبئ مسبقاً + يفلتر sizes غير المتوافقة؛ product_type يُحفظ في DB | يونيو 2026 |
| Phase 2B — Color Chips + Hide Traditional | Editor: استبدال حقل اللون النصي بـ 12 chip ملونة (black→rust) مع سواتش + تسميات عربية؛ multi-select اختياري؛ color_tags يُحفظ في DB؛ إشعار "اختر من اللوحة الجديدة" للمنتجات القديمة؛ حذف Traditional من cat-btns + إشعار للمنتجات التقليدية يجبر إعادة الاختيار؛ زر الحفظ يتطلب الآن product_type + type + name + price | يونيو 2026 |
| Phase 2C — Save Event Logger | Customer: _logBehavior(action, product) fire-and-forget يُدرج في user_behavior_log عند save/unsave؛ يتخطى صامتاً إذا anonymous أو seller؛ console.error عند الفشل فقط؛ _svItemMap يُحفظ في renderSaved() لتوفير بيانات المنتج لـ removeSavedItem؛ query loadSaved مُوسَّع بـ seller_id/product_type/color_tags/type | يونيو 2026 |
| Phase 3A — Home 11-Section Redesign | Customer Home: 11 قسم ثابت متبادل (عمودي/أفقي)؛ 5 grids عشوائية (Fisher-Yates per session)؛ 4 strips أفقية (Casual/New This Week/Sport/Formal)؛ Top Stores دائم؛ R1: strip تختفي إذا < 2 منتجات؛ R2: Top Stores دائمة إذا 1+ seller؛ 15-20% تكرار مضبوط؛ توزيع 12/8/6/6/4 للـ grids؛ Section 12 مؤجلة لـ Phase 3B | يونيو 2026 |
| Ensemble — Product Type (Batch 1) | نوع سادس "Ensemble" في Editor (بعد Accessory)؛ مقاسات قميص S-XXL؛ حقل "الحالة" (🔓 Open default / 🔒 Close) يظهر للـ ensemble فقط؛ عمود `products.ensemble_state` (nullable، CHECK open/close)؛ CHECK constraint لـ product_type وُسِّع ليشمل ensemble + jeans (كان jeans مفقوداً — أي حفظ Jeans كان يفشل صامتاً!)؛ Discover: خيار 🕴 Ensemble كـ bucket مستقل (لا يتداخل مع Pants)؛ شارة "ENSEMBLE 🔓/🔒" ذهبية صغيرة على بطاقات الـ Catalog | يوليو 2026 |
| Outfits — Batch 2 (Editor Tabs + My Outfits + Build Collection) | Editor مقسّم لتابين: Catalog (المحتوى القديم كما هو) + Outfits؛ sub-tabs pill: My Outfits (default) / Other Sellers' Outfits (placeholder "قريباً")؛ My Outfits: empty state (أيقونة علّاقة SVG ذهبية + زر إنشاء) أو grid 2-col من بطاقات outfit بوضعين — Cover (صورة full-bleed) / Cards (حتى 3 mini-cards صورة+نوع بحد ذهبي 15%)؛ badge Cover/Cards أعلى-يسار؛ اسم Fraunces ذهبي + "N قطعة • X% Match"؛ Build Collection modal كامل الشاشة: اسم + غلاف اختياري (رفع لـ `product-images/outfits/{seller_id}/{outfit_id}.jpg`) + شبكة قطع مرقّمة مع قائمة "..." (إزالة/تقديم/تأخير) + خلية "+" dashed تفتح picker من كتالوج البائع + سعر إجمالي auto-sum + Exclusive + ملاحظة + info bar (عدد/متجر/سعر/حالة) + toggle مفتوح/مقفل بالـ header + Done/إلغاء/حذف؛ Match% ثابت: 2→80، 3→87، 4+→92؛ جدولا `outfits` و`outfit_items` (position، added_by، CASCADE) مع RLS: قراءة عامة، كتابة للمالك فقط (outfit_items عبر EXISTS على الأب) | يوليو 2026 |
| Outfits — Simplification (إزالة المشاركة بين البائعين) | حذف sub-tabs (My Outfits / Other Sellers') من تاب Outfits — الشبكة تظهر مباشرة؛ حذف toggle مفتوح/مقفل من Build Collection modal (`saveOutfit` يكتب `state:'close'` دائماً)؛ حذف حقل "الحالة" 🔓/🔒 من Ensemble في Catalog (`saveProduct` يكتب `ensemble_state:'close'` دائماً عند product_type='ensemble')؛ الأعمدة `outfits.state` و`products.ensemble_state` بقيت في DB (inert، دائماً 'close') — لم تُحذف | يوليو 2026 |
| Collections — Public Outfit Grid + Detail Sheet (Show Mode + Guest Store View) | تاب Collections في #s-show (كلا الوضعين) أصبح فعّال: `renderCollectionsPublic()` يجيب outfits+outfit_items(product) للـ seller_id الحالي (Show Mode: current user، Guest: `_guestSellerId`) عبر hook في `switchShowTab`؛ يعيد استخدام `.of-grid/.of-frame/.of-frame-img` + mini-stack fallback من Editor بدون تعديل؛ بطاقة عامة جديدة بكلاسات `.col-heart` (قلب أعلى-يمين، نمط شبيه بـ pd-heart-btn لأن "br-prod-card heart" غير موجود أصلاً بالكود) و`.col-price` (بدل badge Cover/Cards المحذوف + بدل Match%؛ حصري بالذهبي أو `${total_price} دج`، يختفي السطر إذا فارغ وغير حصري)؛ **جدول DB جديد `saved_outfits`** (customer_id/outfit_id/created_at + RLS مطابقة لـ saved_items) — أُنشئ بعد سؤال المستخدم لأن `saved_items` الحالي عمود `product_id` NOT NULL بـ FK على `products` فقط، لا يقبل معرّف outfit | يوليو 2026 |
| Collections — Outfit Detail Sheet scroll fix + بار أزرار مبسّط | `.od-sheet` (لا `.od-info`) هو حاوي التمرير الوحيد الآن (`overflow-y:auto` انتقل من الداخل للخارج) — كان `.od-info{overflow-y:auto;flex:1;min-height:0}` محشور تحت `.od-frame` بنسبة 3/4 فيسبب نافذة تمرير داخلية صغيرة مقصوصة أفقياً وعمودياً؛ الترتيب الجديد: اسم → سعر → "عن التنسيقة" → عنوان "القطع" + شريط أفقي (`.od-pieces-row` بلا تمرير عمودي)؛ حُذف `.od-desc` (الوصف يظهر مرة واحدة فقط ضمن "عن التنسيقة")؛ زر "حفظ" السفلي حُذف نهائياً — `.od-actions` بقي بزر واتساب فقط (عرض كامل، `position:sticky;bottom:0` ضمن `.od-sheet`)؛ القلب أعلى-يمين الصورة (`odToggleHeart`) أصبح هو آلية الحفظ الفعلية الوحيدة بالـ sheet (يكتب لـ `saved_outfits` مباشرة، بدل كونه تجميلياً فقط كـ pdToggleHeart)؛ `odSaveOutfit()` و`.od-eq-btn` حُذفا (كود ميت) | يوليو 2026 |
| Product Type — إضافة "Sandals" | نوع سابع `sandals` أُضيف لكل قوائم product_type: زر Add/Edit Product (`product-type-btns`)، `_AP_TYPE_SIZES` (مقاسات 39-46 مثل shoes)، فلتر Discover (`dc-type-menu` + `_dcPieceLabels`/`_dcPieceIcons` 👡)، `otherTypes` بكويري "قطع تتناسق معها"، `_OF_TYPE_LABELS`، نص تلميح Build Collection picker؛ **CHECK constraint** `products_product_type_check` وُسِّع ليشمل sandals (لولاها كان أي حفظ Sandals يفشل بصمت كما حصل سابقاً مع jeans) — تم بعد سؤال المستخدم رغم أن المهمة ذكرت "no migration needed" | يوليو 2026 |
| Editor — رفع الصور من 5 إلى 10 | حد صور المنتج الواحد رُفع من 5 إلى 10 في 4 مواضع بـ`app.js` (شرط ظهور زر "+"، نص التلميح والتحذير، فحص `addProductImages`، و`slice(0,10)` النهائي عند الحفظ) + نص التلميح الافتراضي بـ`index.html`؛ لا تغيير بمخطط DB أو bucket (عمود `images` أصلاً `text[]` بلا حد أقصى) | يوليو 2026 |
| PWA — Android Back Button History | `navigateTo()` (الدالة المركزية الوحيدة لكل انتقال شاشة — كل التابات الفرعية Saved/Discover/Profile تمر عبرها أصلاً) تدفع الآن `history.pushState({screen:targetId},'','')` عند كل انتقال حقيقي، مع باراميتر ثالث اختياري `fromHistory` لتفادي push مضاعف عند العودة عبر الخلف؛ `popstate` listener واحد عند تحميل السكريبت يستدعي `navigateTo(screen,'z-axis',true)` (نفس نظام التنقل الموجود، بدون إنشاء نظام جديد)؛ `history.pushState({screen:'s-splash'},'','')` أول سطر بالملف كـ"أرضية" تمنع خروج التطبيق من أول ضغطة رجوع؛ لم تُمس أي أنيميشن أو منطق تنقل موجود | يوليو 2026 |
| PWA — Offline Fallback Page | `offline.html` جديد بالجذر: WR mark نصي ذهبي + "WARDRO" + "لا يوجد اتصال بالإنترنت" + زر "إعادة المحاولة" (`window.location.reload()`)؛ كله inline بلا أي طلب خارجي (لا @import للخطوط — يعتمد fallback نظامي `Georgia,serif`/`Segoe UI,sans-serif` لأن أي طلب شبكة سيفشل أصلاً وهو offline)؛ `service-worker.js`: أُضيف `./offline.html` لمصفوفة `SHELL` (يُخزَّن عند `install`)، وسلسلة fallback الـ navigate صارت `caches.match('./') → './index.html' → './offline.html'` (نفس `CACHE_VERSION='wardro-v1'` — تغيّر محتوى الملف كافٍ ليُعاد تشغيل install/activate عند الزيارة القادمة)؛ منطق cache-first للأصول الثابتة (CSS/JS/صور) لم يُمس | يوليو 2026 |
| Product Detail — اتجاه Swipe للصور | `_pdCarouselTouch` (touchend): قُلب الـ ternary (`dx<0?idx-1:idx+1` بدل `idx+1:idx-1`)؛ التتبع الرياضي للكود الأصلي كان يطابق نظرياً "swipe left→next" مسبقاً، لكن المستخدم أكّد اختباراً فعلياً على جهاز أن السلوك المعروض كان معكوساً — تم الانعكاس بناءً على ذلك التأكيد المباشر؛ `_wireHeroTap` (hero sliders) لم يُمس، غير مرتبط بهذه البطاقة | يوليو 2026 |
| Product Images — إصلاح Silent Failures + ضغط الصور | `saveProduct` (صور المنتج + صور التفاصيل) وحفظ التنسيقة (outfit cover) كانوا يبتلعون أخطاء رفع Supabase Storage بصمت (`if(!upErr){...}` بلا else) — أُضيف `toast` عربي عند فشل الرفع (نفس نمط `previewStoreProfile` الموجود مسبقاً)؛ دالة جديدة `_compressImage(file,maxPx=1200,quality=0.82)` (Canvas API) تُطبَّق على صور المنتج والتفاصيل قبل الرفع — خفّضت الحجم من ~2.5-3.5MB إلى ~150-165KB للصورة الواحدة؛ `pdSelectColor` أيضاً أُصلح (لون بدون صورة مقابلة يذهب لآخر صورة متاحة بدل ألا يفعل شيئاً) | يوليو 2026 |
| تذكرني + Google Sign-In (Customer فقط) | Checkbox "تذكرني" (`.remember-row/.remember-box`) أُضيف تحت حقل كلمة المرور بشاشة Seller Sign-In (`si-remember`) ونافذة Customer Auth (`ca-remember`) — بلا منطق إضافي لأن Supabase يحفظ الجلسة افتراضياً؛ زر "متابعة بحساب Google" (SVG multicolor inline، بدون CDN) أُضيف في Customer Auth Modal فقط (بعد divider "أو")، يستدعي `doCustGoogleAuth()` الجديدة في `app.js` (`signInWithOAuth({provider:'google',redirectTo:'.../wardro-alpha-0.95/'})`)؛ شاشة Seller Sign-In لم تُمس بخلاف الـ checkbox؛ ⚠️ هذه الميزة كانت مدرجة سابقاً ضمن "خارج النطاق الآن" (تسجيل الدخول/Auth) — نُفذت بعد سؤال المستخدم مباشرة وتم حذفها من قائمة الاستثناءات | يوليو 2026 |
| Order Confirmation — Animation Shell (UI فقط) | عند الضغط "تأكيد الطلب" بنموذج الطلب: منطق الإرسال القديم بـ `cfConfirmOrder()` عُلِّق بتعليق `// TODO: order submission` (لم يُحذف) واستُبدل باستدعاء `ocStart()` الجديدة؛ overlay جديد `#oc-overlay` (z-index:950، فوق `cf-overlay` 650 و`cust-auth-modal` 700) بمرحلتين: Phase 1 "جاري إرسال طلبك..." (شعار W بتوهج ذهبي نابض + حلقة دوارة + connector منقّط + 3 خطوات تظهر بفارق 0.7ث عبر `animation-delay` على `#oc-step-1/2/3` — المدة الكلية تتزامن تلقائياً مع مهلة الـ2.5ث بـ`ocStart()`)، ثم Phase 2 "تم استلام طلبك" (علامة صح SVG ترتسم بـ`stroke-dashoffset` + شرارات ✦ + رقم طلب عشوائي `#WR-XXXXX` عبر `Math.random()` + جدول حالة 3 صفوف RTL)؛ `ocCloseToHome()` تغلق كل الطبقات (`oc-overlay` + `cf-overlay` + `closeProdDetail()` الموجودة) وتنتقل لـ `s-browse` عبر `navigateTo` الموجودة؛ CSS keyframes فقط، لا مكتبات خارجية؛ لا لمس لحقول نموذج الطلب أو زر واتساب أو أي شاشة أخرى | يوليو 2026 |
| Home Algorithm — Part 1 (Phase-Based Grids + Price Strip + DOM Reorder) | `index.html` #s-browse: إعادة ترتيب الأقسام (Top Stores انتقل لأعلى بعد Sport) + 12 قسم جديد `display:none` مؤقتاً: `#br-sec-price-low` (شريط "تحت 3,000 دج")، 5 أقسام لون (`#br-sec-color-black/white/brown/wild1/wild2` — wild1/wild2 بعنوان فارغ يُملأ بالـ JS)، 5 vgrids جديدة (`#br-sec-vgrid-6..10`) و`#br-sec-vgrid-close` بلا عنوان قبل Explore مباشرة؛ `app.js`: حذف `_vgridSizePattern` نهائياً، إعادة كتابة `_renderBrowseSections` بمنطق phase-based (`small`<40: vgrid 1-3 بـ[9,6,4] / `medium`≤120: vgrid 1-5 بـ[12,9,6,6,6] / `large`>120: vgrid 1-7 بـ[18,12,9,9,9,9,9])؛ `usedInGrids` Set يتتبّع القطع المستهلكة عبر vgrid واحد فقط (شافل Fisher-Yates واحد)؛ إضافة `_showSec`/`_hideSec` كـ helpers عامة؛ شريط السعر يفلتر `Number(p.price)<3000`؛ vgrid-8/9/10/close وكل أقسام اللون تبقى مخفية ومفرّغة (dormant لحد Part 2)؛ **تغيير سلوك متعمّد**: pool الـ Explore (§12) لم يعد يستثني قطع `#br-sec-repeats` (كان يستثنيها سابقاً) — التعليمات الجديدة حددت الاستثناء بـ`usedInGrids` + anchor فقط، فبعض القطع قد تظهر في كل من Repeats و Explore الآن | يوليو 2026 |
| Home Algorithm — Part 1 تصحيحات (حذف Price Strip + عدد ديناميكي + View All) | حذف `#br-sec-price-low`/`#br-strip-price-low` نهائياً من `index.html` وكل منطقه من `app.js` (كان مضافاً بالمهمة السابقة، تراجع كامل)؛ helper جديد `_stripCount(total)` داخل `_renderBrowseSections` (`min(8,max(2,floor(total/3)))`) يحل محل كل `slice(0,8)` الثابت بشرائط الأقسام (casual/sport/streetwear/classic/oldmoney + New This Week)؛ `_renderHStrip` أصبح يقبل `opts={minCount,totalCount,viewAllKey}` بدل عتبة `<2` الثابتة — شرائط الفئات `minCount:2`، New This Week `minCount:4` (نفس العتبة ستُطبَّق على شرائط اللون بـ Part 2)؛ زر "عرض الكل" (`.br-view-all`، CSS جديد بـ`style.css`) يظهر تلقائياً بعد أي شريط إذا كان العدد الكلي لمصدره (قبل القص) > 8، بـ`onclick` مؤقت `console.log('view-all:',key)` — Part 2 سيربطه فعلياً؛ شرائط Repeats (`#br-repeat-strip-*`) لم تُمس (خارج نطاق هذه المهمة، تستخدم `_renderHStrip` بإعداداتها الافتراضية) | يوليو 2026 |
| Home Algorithm — Part 1 تصحيح ثانٍ (`_stripCount` phase-aware) | `_stripCount` نُقل ليصبح معرّفاً بعد كتلة phase detection/`_PHASE_CFG` داخل `_renderBrowseSections` (كان قبلها، فيمنعه من قراءة `phase`) ليصبح closure عليها؛ الصيغة صارت مرتبطة بالـ phase: `small` → `min(4,total)`، `medium` → `min(8,max(3,floor(total/2.5)))`، `large` → `min(8,max(3,floor(total/3)))` (بدل صيغة واحدة ثابتة `min(8,max(2,floor(total/3)))` لكل الحالات)؛ `newStrip` (New This Week) أيضاً انتقل حسابه لبعد التعريف الجديد لأنه يعتمد على `_stripCount`؛ شرائط اللون (Part 2) خارج النطاق كالمعتاد | يوليو 2026 |
| Home Algorithm — تعديل أحجام vgrid (مساحة تنفّس) | تعديل بسيط بـ`_PHASE_CFG` داخل `_renderBrowseSections`: `small` من `[9,6,4]` إلى `[8,5,4]`، `medium` من `[12,9,6,6,6]` إلى `[11,8,7,5,5]`، `large` من `[18,12,9,9,9,9,9]` إلى `[17,11,8,8,7,7,7]`؛ لا تغيير بعدد الـ grids النشطة ولا بمنطق الـ phase/anchor/`_stripCount` | يوليو 2026 |
| Discover Screen — Zone 2 (بحث) + Zone 3 (شبكة حيّة) | `#s-discover` أصبح 3 مناطق: Zone 1 (فلاتر — لم تُمس، بما فيها زر "أظهر النتائج" وتدفق `#s-results`/`runDiscover` الكامل الذي بقي سليماً كما هو)؛ Zone 2 حقل بحث جديد `#dc-search-input` (RTL، نمط `.cf-input` الموجود)؛ Zone 3 شبكة جديدة `#dc-grid` (`.br-prod-grid`، نفس كلاس Browse)؛ الشبكة تعيد استخدام `_brProds` (المصفوفة المشتركة التي يملأها `loadBrowse()` أصلاً — لا استعلام Supabase جديد؛ إن كانت فارغة عند فتح Discover يُستدعى `loadBrowse()` مرة واحدة فقط ثم `_dcRunLiveFilter()`)؛ `_dcRunLiveFilter()` جديدة تطبّق كل فلاتر Zone 1 (النوع/الميزانية/الفئة/المقاس/اللون — بنفس منطق `runDiscover` لكن بفلترة JS محلية بدل استعلام) + نص البحث (`.toLowerCase().includes()`، مع `_dcStripHtml()` يزيل أي وسم HTML قبل المقارنة أمانًا)؛ تُستدعى تلقائياً من كل callback فلتر موجود (`dcSelectType`/`dcOnSliderInput`/`dcToggleSizeOpt`/`dcToggleCatOpt`/`dcToggleColorSwatch`/`dcClearColors`) عبر إضافة سطر استدعاء واحد بنهاية كل دالة؛ `_dcRenderGrid()` جديدة تُكرر نفس قالب بطاقة `.br-prod-card` الموجود بـ`_renderVGrid` (لم تُعدَّل `_renderVGrid` نفسها لأنها بقائمة "لا تُمس" ولأن سلوكها بإخفاء القسم كاملاً عند الفراغ لا يناسب حاجة Zone 3 لعرض نص فارغ داخل الشبكة)؛ حالة الفراغ: "ما لقينا قطعة بهذا الوصف" (`.dc-grid-empty`) | يوليو 2026 |
| Discover Screen — تصحيحان (موضع زر النتائج + مزامنة الشبكة) | زر "أظهر النتائج" (`.dc-footer`) نُقل من خارج `.dc-body` (كان sibling منفصل بـ`flex-shrink:0` يبقى مثبتاً تحت المحتوى القابل للتمرير) ليصبح آخر عنصر **داخل** `.dc-body` نفسها، بعد `#dc-grid` مباشرة — يتمرّر الآن طبيعياً مع البقية؛ لا تغيير بمنطقه (`dcShowResults`) أو حالة التفعيل؛ `dcShowResults()` صار يستدعي `_dcRunLiveFilter()` أيضاً قبل الانتقال لـ`#s-results` (كانت تُحدَّث فقط عند تغيير فلتر/بحث، الآن تُحدَّث أيضاً عند الضغط على الزر — يبقى `#dc-grid` متزامناً عند العودة لـ Discover)؛ Zone 2/الشبكة أنفسهما لم يُعاد إنشاؤهما (كانا موجودين من مهمة سابقة، `_brProds` أُعيد استخدامها كالمعتاد بلا `_allProds` جديد) | يوليو 2026 |
| Discover Screen — إعادة ترتيب أخيرة (الزر قبل حقل البحث) | ترتيب DOM بـ`#s-discover` صار: نموذج الفلاتر → زر "أظهر النتائج" (`.dc-footer`) → حقل البحث `#dc-search-input` → الشبكة `#dc-grid` (كان الزر بعد الشبكة من المهمة السابقة، انتقل الآن ليسبق حقل البحث مباشرة كما طُلب)؛ لا توجد أي قاعدة `position:fixed`/`sticky`/`bottom:0` بـ`style.css` أو inline على `.dc-footer`/`.dc-results-btn` أصلاً (تأكيد فقط، لا حذف مطلوب)؛ لا تغيير بأي منطق JS — كل ربط `_dcRunLiveFilter`/`_dcRenderGrid`/`_brProds` كان منجزاً من المهام السابقة | يوليو 2026 |

---

## المرحلة الحالية
**Phase 3 — UI/UX**
- Hero Slider تلقائي (أقوى القطع / عروض البائع)
- Horizontal Sections (عروض / تخفيضات / رياضي / جديد)
- Product Cards (صورة + نجوم + وفرة + سعر)
- حواف ناعمة + خلفية فخمة + انتقالات سلسة
- Full-Screen Immersive Mode للتنسيقات
- Variable Reward في الـ Browse (محتوى غير متوقع)

**Restructure (موازي) — Editor Mode + DB foundation**
- ✅ Phase 1: DB migration (`slider_type`) + فصل Editor لـ 3 أقسام — منتهي
- 🔜 Phase 2: ربط جهة الزبون (buildHeroSlider/buildBrowseHero تقرأ `slider_type` بدل `hero` القديم) + إصلاح bug الضغط على الـ hero
- 🔜 Phase 3: تلميع بصري (ارتفاع الـ hero 480px، إلخ)

**Home Algorithm (موازي) — Part 1/2**
- ✅ Part 1: DOM reorder + phase-based vgrid sizing (small/medium/large) + عدد ديناميكي بـ`_stripCount` + عتبات ظهور (2 للفئات/4 للـNew) + زر View All — منتهي (لا يوجد price strip، أُلغي)
- 🔜 Part 2: أقسام اللون (black/white/brown/wild1/wild2) + تفعيل vgrid-6..10 وvgrid-close + color-aware rendering + ربط View All فعلياً

---

## قواعد الكود الثابتة
- **Diff Style فقط** — لا تعيد كتابة ملف كامل، عدّل ما يحتاج تعديل
- **لا تكسر ما يشتغل** — كل تعديل يكمل ما هو موجود
- **الحل الأبسط دائماً** — لا تعقيد غير ضروري
- **AI via Edge Functions** — لا مفاتيح API في الـ frontend؛ كل نداء لـ Claude يمر عبر Supabase Edge Function
- **supabase-config.js** — لا تلمسه، لا ترفعه
- **XSS — esc() + safeUrl()** — كل string من DB يُحقن في `innerHTML` يمر عبر `esc()`؛ كل URL يُستخدم في `src` أو `style background-image` يمر عبر `safeUrl()`؛ استخدم `textContent` حيثما أمكن
- **products.slider_type** (`none`/`hero`/`main_hero`) هو المرجع الوحيد لمكان ظهور القطعة — عمود `hero` (bool) القديم محذوف نهائياً. ⚠️ `buildHeroSlider`/`buildBrowseHero` بـ app.js لسا يقرأو `p.hero` القديم (دائماً undefined الآن) — لازم تحديثهم لـ `p.slider_type==='hero'`/`'main_hero'` في Restructure Phase 2 وإلا الـ hero slider عند الزبون يبقى فاضي

---

## الهوية البصرية — لا تتغير
```css
--bg:    #0B0A08   /* أسود دافئ */
--gold:  #D2AF69   /* ذهبي رئيسي */
--rust:  #A83D22   /* أحمر CTA */
--card:  #1C1915   /* بطاقات */
--txt:   #D8CFBA   /* نص عام */
```
- خطوط: Fraunces (عناوين) + Tajawal (عربي)
- أنيميشن: بطيء ناعم — cubic-bezier springs
- لا ألوان زاهية — فخامة هادئة دائماً

---

## خارج النطاق الآن 🚫
لا تقترح هذه الميزات في Phase 3:
- Camera Scan للملابس
- نظام اشتراكات مدفوع
- React Native / Flutter
- PWA conversion
- Style Passport
- Outfit Rating + QR

---

## قاعدة التحديث التلقائي
**بعد كل مهمة مكتملة — قبل الانتقال للتالية:**
1. حدّث قسم "ما تم إنجازه" بالمهمة الجديدة
2. حدّث "المرحلة الحالية" إذا تغيرت
3. أضف أي قاعدة جديدة اكتشفتها لقسم "قواعد الكود"

---

*آخر تحديث: يوليو 2026 | Claude Code — Order Confirmation Animation Shell*
