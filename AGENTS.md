# AGENTS.md — Wardro Workers Protocol
> كل Worker يقرأ هذا الملف أولاً | مرجع الأدوار والصلاحيات

---

## نظام العمل
```
General (Claude.ai Project)
    ↓ قرارات كبيرة + استراتيجية
    ↓ يعطي Worker موافقة + تعليمات
    ↓
Worker (محادثة مستقلة)
    ↓ ينفذ مهمة واحدة محددة
    ↓ يقرأ CLAUDE.md أولاً
    ↓ يتوقف ويرجع لـ General عند أي قرار كبير
```

---

## Workers الحاليون

### 1. Deploy Worker
- **دوره:** نشر التطبيق على GitHub Pages فقط
- **يلمس:** ملفات الإعداد، .gitignore، GitHub Actions
- **لا يلمس:** الكود الأساسي، UI، منطق الأعمال
- **يتوقف إذا:** احتاج تغيير Stack أو بنية المشروع

### 2. Database Worker
- **دوره:** إدارة Supabase وقاعدة البيانات فقط
- **يلمس:** supabase-config.js، SQL queries، RLS policies
- **لا يلمس:** UI، app.js (إلا للـ DB calls المحددة)
- **يتوقف إذا:** احتاج تغيير هيكل التطبيق

### 3. UI Worker
- **دوره:** Phase 3 — تحسين الواجهة والتجربة البصرية فقط
- **يلمس:** style.css، HTML الشاشات، CSS animations
- **لا يلمس:** منطق الـ API calls، supabase-config.js
- **يتوقف إذا:** الميزة تحتاج backend جديد أو تغيير Stack

### 4. Claude Code
- **دوره:** التنفيذ التقني الفعلي — يكتب ويعدل الملفات
- **يلمس:** كل ما يأذن به General
- **لا يلمس:** أي شيء خارج تعليمات الجلسة
- **يتوقف إذا:** الطلب يخالف Stack الثابت

---

## قواعد Workers الثابتة
1. **اقرأ CLAUDE.md أولاً** — دائماً، بدون استثناء
2. **مهمة واحدة في جلسة واحدة** — لا تتجاوز نطاقك
3. **لا قرارات كبيرة بدون General** — أي شك = توقف وسؤال
4. **Diff Style** — عدّل ما يحتاج، لا تعد كتابة الملف كاملاً
5. **اختبر بعد كل تعديل** — لا تنهي الجلسة قبل التأكد

---

## أدوات كل Worker
| Worker | الأداة |
|--------|--------|
| Deploy | GitHub web editor أو Claude Code |
| Database | Supabase Dashboard + Claude Code |
| UI | VS Code + Live Server + Claude Code |
| General | Claude.ai Projects (هذه المحادثة) |

---

## السؤال الذهبي
**قبل أي ميزة:** هل تجعل الزبون يفتح التطبيق غداً؟
إذا الجواب لا — ارجع لـ General قبل البناء.

---

*آخر تحديث: يونيو 2026 | General 2*

---

## Fable 5 — صلاحيات "الحرية الموجّهة"

### مسموح (حرية إبداعية):
-يجوز سد الثغرات الوظيفية المنطقية داخل التدفق الحالي.

أمثلة:
- إضافة إعداد لصورة المتجر إذا كانت تظهر للعميل.
- إضافة حقل وصف إذا كان يُعرض لاحقاً.
- إضافة خطوة ناقصة تمنع إكمال المهمة.

لا يجوز:
- إعادة تصميم الشاشة.
- إعادة ترتيب العناصر الأساسية.
- تغيير Layout أو Navigation.
- استخدام العاجي (#EDE3CC) بذكاء حيث يخدم التصميم
- اقتراح حلول وتحسينات بصرية
- بناء الشاشات كاملة ضمن الـ Blueprint

### ممنوع (خطوط حمراء):
- كسر الهوية: الأولوية القصوى للأسود (#0B0A08) + الذهبي (#D2AF69) — دائماً يقودان
- ألوان صارخة أو خارج اللوحة (أبيض ساطع، نيون)
- اتخاذ قرار تدفق (flow) أو هيكلي جديد بدون عرضه على بوجمعة أولاً
- تجاوز الـ Blueprint كمرجع وحيد

### قاعدة ذهبية:
يبني ويقترح ويبدع — لكن القرارات الكبيرة تُعرض قبل التنفيذ.
الأخضر/النبيذي = شارات حالة وظيفية فقط، بشفافية منخفضة.

---

## أين وصلنا — يونيو 2026

### ✅ مكتمل ويعمل على الـ Live URL

**رحلة البائع (كاملة):**
- Splash → Onboarding → Role Selection → Seller Registration/Sign-In
- Editor Mode: إضافة/تعديل/حذف منتجات، رفع صور، Pin to Hero، Store Bio
- Show Mode: Hero Slider، Product Grid، Products Tab، About Tab

**رحلة الزبون — الشاشة الرئيسية (#s-browse):**
- Top Bar: WARDRO logo + Search + Notifications
- Hero Slider (3 شرائح تلقائية مع dots)
- Recommended For You — شبكة 3×3 من المنتجات الحقيقية
- Sport Collection — منتجات Sport من Supabase
- Top Stores — تمرير أفقي (صورة + اسم المتجر)
- Casual Collection — منتجات Casual من Supabase
- Bottom Nav ثابت (Home / Saved / Discover / Profile)
- Product Detail Sheet — يصعد عند الضغط على بطاقة
- Save Flow — حفظ في saved_items + modal تسجيل دخول للزبون
- Customer Session Persistence — يعود مباشرة للـ Browse

**قاعدة البيانات:**
- جداول: `sellers` / `products` / `saved_items`
- RLS: public SELECT على products وsellers | كل WRITE بـ auth.uid()
- `supabase-config.js` منشور على GitHub Pages (anon key فقط — آمن)

### 🔜 التالي (لم يُبنَ بعد)
- Saved Tab — يعرض saved_items الخاصة بالزبون
- Customer Registration Screen مستقلة
- صفحة Filter/Category
- AI Outfit — تكامل مع منتجات المتاجر الحقيقية

*آخر تحديث: يونيو 2026 | General 4 / Fable 5*
