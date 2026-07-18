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
- تسجيل الدخول / Auth
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

*آخر تحديث: يونيو 2026 | Claude Code — Phase 3A: Home 11-Section Redesign*
