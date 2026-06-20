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
| Phase 3A — Home 11-Section Redesign | Customer Home: 11 قسم ثابت متبادل (عمودي/أفقي)؛ 5 grids عشوائية (Fisher-Yates per session)؛ 4 strips أفقية (Casual/New This Week/Sport/Formal)؛ Top Stores دائم؛ R1: strip تختفي إذا < 2 منتجات؛ R2: Top Stores دائمة إذا 1+ seller؛ 15-20% تكرار مضبوط؛ توزيع 18/12/9/9/9 للـ grids | يونيو 2026 |
| Phase 3B — Section 12 "اكتشف أكثر" | قسم ثاني عشر ونهائي في الـ Home: lazy-load infinite scroll للمنتجات خارج الـ 57 الأولى في الـ upper grids؛ IntersectionObserver (200px rootMargin)؛ 30 منتج per batch؛ shuffle مستقل per session؛ empty state "ولا قطعة جديدة دابا" عند catalogs ≤ 57 منتج؛ "✓ شفت كلش" عند استنفاد البضاعة؛ gold spinner أثناء التحميل | يونيو 2026 |
| Phase 4 — Discover Color Panel | استبدال حقل اللون النصي في Discover بـ 12 swatch دائري يستخدم _AP_COLORS كـ single source of truth؛ multi-select مع gold ring للمحدد؛ بادج عداد على الـ chip (اللون (N))؛ زر "مسح الكل" يظهر عند الاختيار؛ _discoverSelectedColors[] يُمرَّر لـ runDiscover → Supabase .overlaps('color_tags', ...) بدل client-side filter؛ color اختياري لا يؤثر على enablement logic | يونيو 2026 |
| Profile MVP | شاشة #s-profile: avatar دائري (الحرف الأول من الإيميل، Fraunces gold)؛ إيميل كامل؛ 3 صفوف (سياسة الخصوصية/شروط الاستخدام → openLegalModal، تسجيل الخروج → signOut+navigate)؛ صف خطر "حذف الحساب" (نبيذي)؛ مودال تأكيد الحذف مع countdown 3 ثوانٍ قبل تفعيل "نعم، احذف حسابي"؛ الحذف يمسح saved_items + user_behavior_log ثم signOut؛ brNavSwitch/svNavSwitch/dcNavSwitch تدعم الآن 'profile' | يونيو 2026 |
| Sleeper B — Availability Toggle | `products.is_available` (boolean NOT NULL DEFAULT true) أُضيف؛ كل الصفوف الموجودة = true تلقائياً؛ Editor: toggle pill "متوفر / غير متوفر" يُحفظ عند Save ويُعبَّأ عند Edit؛ Product Detail: pill "متوفر" (أخضر) / "غير متوفر" (نبيذي) يحلّ محلّ "Quantity Available" الإنجليزي؛ Saved list: منطق مُصلَح — يقرأ is_available بدل stock؛ "نفدت الكمية" غيّرنا لـ "غير متوفر"؛ products.stock يبقى كما هو | يونيو 2026 |
| Phase 5 — Legal Docs Integration | window.openLegalModal(docType, callback) reusable modal: fetch .md من Legal Docs/ بـ URL encoding، parser بسيط (عناوين/bullets/intro)، scroll-to-enable accept؛ .legal-line فوق CTA الأونبوردينغ (slide 3 فقط، informational)؛ .legal-check checkbox يحجب "Create Store" في Seller Reg حتى الموافقة؛ Accept في الـ modal يُفعّل الـ callback (auto-check box)؛ Backdrop/ESC/X يُغلق دون callback | يونيو 2026 |

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
- ✅ Phase 2: ربط جهة الزبون — تم (تأكيد يونيو 2026): `buildHeroSlider` (س726) و`buildBrowseHero` (س989) يقرأان `slider_type` بشكل صحيح؛ لا أثر لـ `p.hero` في app.js
- 🔜 Phase 3: تلميع بصري (ارتفاع الـ hero 480px، إلخ)

---

## قواعد الكود الثابتة
- **Diff Style فقط** — لا تعيد كتابة ملف كامل، عدّل ما يحتاج تعديل
- **لا تكسر ما يشتغل** — كل تعديل يكمل ما هو موجود
- **الحل الأبسط دائماً** — لا تعقيد غير ضروري
- **AI via Edge Functions** — لا مفاتيح API في الـ frontend؛ كل نداء لـ Claude يمر عبر Supabase Edge Function
- **supabase-config.js** — لا تلمسه، لا ترفعه
- **XSS — esc() + safeUrl()** — كل string من DB يُحقن في `innerHTML` يمر عبر `esc()`؛ كل URL يُستخدم في `src` أو `style background-image` يمر عبر `safeUrl()`؛ استخدم `textContent` حيثما أمكن
- **products.slider_type** (`none`/`hero`/`main_hero`) هو المرجع الوحيد لمكان ظهور القطعة — عمود `hero` (bool) القديم محذوف نهائياً. ✅ تم التحقق (يونيو 2026): `buildHeroSlider` و`buildBrowseHero` يقرأان `slider_type` بشكل صحيح — لا أثر لـ `p.hero` في app.js، والـ hero sliders تعمل على الـ live site

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

*آخر تحديث: يونيو 2026 | Claude Code — Profile MVP*
