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
| Phase 3 — Hero Slider | `heroSlides[]` + `initHeroSlider()` في app.js، شاشة #s-browse في index.html، styles في style.css | يونيو 2026 |

---

## المرحلة الحالية
**Phase 3 — UI/UX**
- Hero Slider تلقائي (أقوى القطع / عروض البائع)
- Horizontal Sections (عروض / تخفيضات / رياضي / جديد)
- Product Cards (صورة + نجوم + وفرة + سعر)
- حواف ناعمة + خلفية فخمة + انتقالات سلسة
- Full-Screen Immersive Mode للتنسيقات
- Variable Reward في الـ Browse (محتوى غير متوقع)

---

## قواعد الكود الثابتة
- **Diff Style فقط** — لا تعيد كتابة ملف كامل، عدّل ما يحتاج تعديل
- **لا تكسر ما يشتغل** — كل تعديل يكمل ما هو موجود
- **الحل الأبسط دائماً** — لا تعقيد غير ضروري
- **API calls محمية** — تحقق من `wardro_claude_key` في localStorage قبل كل call
- **supabase-config.js** — لا تلمسه، لا ترفعه

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

*آخر تحديث: يونيو 2026 | General 2*
