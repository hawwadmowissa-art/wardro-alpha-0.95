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
- **API calls محمية** — تحقق من `wardro_claude_key` في localStorage قبل كل call
- **supabase-config.js** — لا تلمسه، لا ترفعه
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

*آخر تحديث: يونيو 2026 | Claude Code — Seller Approval Step 3 (Admin Page)*
