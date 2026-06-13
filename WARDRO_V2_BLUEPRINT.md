# WARDRO V2 BLUEPRINT
> ⚠️ وثيقة حية — تُحدَّث عند كل مرحلة جديدة
> آخر تحديث: يونيو 2026 | General 4

---

## 1. الشاشات المصممة

### رحلة مشتركة (الكل يراها)

**Splash / Loading**
- لوغو WR ذهبي داخل دائرة مع نجمة
- شريط تحميل ذهبي + نسبة مئوية
- "أول انطباع يدوم" بالعربية
- أنيميشن بسيط — تجربة premium

**Onboarding (3 شاشات — المرة الأولى فقط)**
1. The Wardrobe Dilemma — "60% Of Wardrobes Are Forgotten"
2. Deep Intelligence — "ذكاء يفهم كل تفصيلة" (طولك، بنيتك، ذوقك، ميزانيتك)
3. The Premium Match — "تنسيقات كاملة لتناسب ذوقك بدقة" (98% Match)
- أزرار: Next → Continue → Start Experience

**Role Selection — "Choose Your Journey"**
- بطاقتان: Customer Mode / Seller Mode
- أيقونات ذهبية (شخص + متجر)
- وصف قصير لكل وضع
- "You can change your role later"

---

### رحلة البائع (5 شاشات مصممة)

**1. Seller Registration**
- Store Name + Email + Password + Confirm Password
- زر "Create Store" ذهبي
- "Already have an account? Sign In"
- رسالة أمان: "Your data is secure with us"
- أيقونات أسفل: AI-Powered / Grow Sales / Style Made Easy
- Auth: Email + Password عبر Supabase (Google لاحقاً)

**2. Welcome + Choose Mode**
- "Welcome, [اسم البائع]!"
- "What would you like to do today?"
- بطاقتان:
  - EDITOR MODE — "Build your customer experience" → Start Editing
  - SHOW MODE — "See what your customers see" → Preview Store
- رسالة إرشادية: "Add your first item to start building your catalog"
- شعار أسفل: "بأناقة، تَبيعُ أكثر."

**3. Editor Mode — Empty State**
- عنوان: "Store Editor — Make your store stand out"
- زر Preview Store أعلى اليمين
- قسم Main Hero Slider (فارغ + زر إضافة)
- قسم Featured Products (فارغ + أزرار Add Product)
- رسالة إرشادية: "أضف قطعك الأفضل هنا"
- ملاحظة: على الموبايل — الأقسام كـ tabs أو أيقونات أسفل (لا sidebar)

**4. Editor Mode — Add Product**
- Product Name + Price (DZD) + Size (S/M/L/XL/XXL) + Color + Category + Description
- رفع صورة المنتج (مع اقتراح خلفيات جاهزة)
- أو Upload QR Code (للنقاش لاحقاً)
- Preview مباشر على اليمين
- أزرار: Cancel / Done
- ملاحظة: الفئة التي يختارها البائع = المكان الذي تظهر فيه القطعة عند الزبون

**5. Show Mode — Customer View**
- صفحة المتجر كما يراها الزبون
- اسم المتجر + تقييم + متابعين
- Hero Slider + Featured Products
- شريط علوي أو سفلي واضح: "أنت في وضع المعاينة" + زر "ارجع للتحرير"
- ملاحظة: nav bar الزبون لا يظهر — فقط زر العودة للـ Editor

---

### رحلة الزبون (لم تُصمم بعد — الرحلة موثقة فقط)

**Customer Registration / Login**
- Email + Password عبر Supabase
- تصميم يُنجز عند الوصول لهذه المرحلة

**Browse — الشاشة الرئيسية**
- Hero Slider أعلى (أفقي) — يعرض متاجر البائعين
- أقسام بعناوين — كل قسم يتمرر أفقياً:
  - عنوان فئة (مثل SPORT) → 3-4 قطع أفقياً
  - عنوان "أهم المتاجر" → متاجر أفقياً
  - عنوان "تخفيضات" → قطع بخصم أفقياً
- التمرير العام عمودي — الأقسام الداخلية أفقية
- نمط Netflix للملابس
- اللغة: مكس عربي/إنجليزي ذكي — عناوين إنجليزية للفخامة + عربية للسهولة

**تفاصيل القطعة**
- عند الضغط على بطاقة → شاشة بـ blur/glassmorphism
- تفاصيل كاملة + زر Save

**صفحة المتجر**
- عند الضغط على اسم متجر → صفحة المتجر وسلعه

**فلتر**
- صفحة خاصة مستقلة (ليست dropdown)
- أسئلة: نوع القطعة، الميزانية، الفئة، وغيرها
- التفاصيل تُحدد عند الوصول لهذه المرحلة

**AI Outfit**
- تنسيق ذكي من منتجات المتاجر
- Claude API موجود ويعمل من Alpha 0.08
- التكامل مع Browse يُحدد لاحقاً

---

## 2. القرارات المتفق عليها

### الترتيب والتدفق
- Splash → Onboarding (أول مرة فقط) → Role Selection → Auth → الرحلة حسب الدور
- Role Selection يأتي قبل Registration (لأن حقول التسجيل تختلف)
- لا Customer Setup screen قبل Browse — حُذفت
- Browse = أول شاشة للزبون العائد
- البائع يرى Show Mode عند فتح التطبيق (المرة الثانية+)

### البناء
- البائع يُبنى أولاً — بدونه لا منتجات ولا Browse
- Auth بـ Email أولاً — Google لاحقاً
- كل شاشة تُبنى بجودة عالية — التجربة تسوّق نفسها
- لا نبني الحد الأدنى لنبيع — نبني شيئاً يستحق الاستخدام

### التصميم والهوية
- أسود + ذهبي — فخامة هادئة
- الصور يجب أن تكون حقيقية وعالية الجودة — تعكس هوية التطبيق
- حل الصور: خلفيات جاهزة في التطبيق للبائع يصور عليها قطعه
- Editor Mode على الموبايل: tabs/أيقونات أسفل (لا sidebar)
- Show Mode: شريط واضح "أنت في وضع المعاينة" + زر العودة
- الفئات متطابقة بين البائع والزبون

### الوثائق والعمل
- الوثائق = مسودات حية — لا شيء نهائي
- كل مرحلة تُناقش عند وصولها
- نقاش أولاً — كتابة ثانياً — كود ثالثاً
- Workers (Claude Code) لا تتجاوز صلاحياتها

---

## 3. ما لم يُقرر بعد

- [ ] تصميمات رحلة الزبون (Browse, تفاصيل القطعة, إلخ)
- [ ] Customer Journey من الخطوة 06+ (فيها "طوام كبيرة" بكلام بوجمعة)
- [ ] Filters — محتوى الصفحة وأسئلتها بالتفصيل
- [ ] AI Outfit — كيف يتكامل مع Browse
- [ ] نظام الفئات بالتفصيل (ما هي الفئات؟ كم واحدة؟)
- [ ] QR Code في Add Product — هل يبقى أم يُحذف
- [ ] Hero Slider — بيانات من Supabase أم يدوي
- [ ] Customer Auth — نفس شاشة البائع أم مختلفة
- [ ] الـ Onboarding — هل يراه البائع أم الزبون فقط

---

## 4. ترتيب البناء

### المرحلة 1: البائع يسجل ويضيف قطعه
```
Role Selection → Seller Registration → Auth (Supabase Email)
→ Welcome/Choose Mode → Editor Mode → Add Product
```
النتيجة: بائع حقيقي عنده حساب ومنتجات في Supabase

### المرحلة 2: الزبون يرى المنتجات
```
Role Selection → Customer Login → Browse (منتجات حقيقية من Supabase)
→ تفاصيل القطعة → صفحة المتجر
```
النتيجة: زبون يتصفح منتجات حقيقية

### المرحلة 3: الذكاء يعمل
```
AI Outfit من منتجات المتاجر الحقيقية
```
النتيجة: التجربة الكاملة — تصفح + تنسيق ذكي

### المرحلة 4: التجربة الكاملة
```
Show Mode + Hero Slider + فلتر + تخفيضات
```
النتيجة: تطبيق جاهز للعرض والاستخدام الحقيقي

---

## 5. الهوية البصرية (من DNA)

### الألوان
--bg: #0B0A08          /* خلفية */
--gold: #D2AF69        /* الذهبي الأساسي */
--goldD: #8A7040       /* ذهبي داكن */
--goldL: #EDD080       /* ذهبي فاتح */
--ivory: #EDE3CC       /* عاجي دافئ — حقول الإدخال، نصوص مهمة، تباين فاخر */
--cream: #EDE3CC       /* كريمي */
--txt: #D8CFBA         /* النص */
--card: #1C1915        /* البطاقات */
> الهوية: أسود + ذهبي + عاجي (ثلاثية نظيفة). الأخضر/النبيذي وظيفيان فقط لشارات الحالة بشفافية منخفضة — لا كألوان هوية.> Dark Mode أولاً (الهوية الأساسية). Light mode يُضاف لاحقاً كطبقة بعد اكتمال الهيكل — لا نبنيه الآن.
### الخطوط
- **Fraunces** — serif — للعناوين والعلامة التجارية
- **Tajawal** — sans-serif — للنص العربي والمحتوى

### المبادئ
- "بسيط في الواجهة، معقد في الخوارزمية"
- "الزبون لا يرى الذكاء — يشعر بالنتيجة"
- Glassmorphism خفيف على البطاقات
- أنيميشن ناعم (spring + expo easing)

---

## 6. Stack التقني

| التقنية | الاستخدام |
|---------|-----------|
| HTML + CSS + Vanilla JS | الواجهة — ملف واحد أو ملفات منفصلة |
| Supabase (eu-central-1) | قاعدة البيانات + Auth |
| Claude API (Sonnet) | AI Outfit + تحليل الصور |
| GitHub Pages | الاستضافة |

### جداول Supabase الموجودة
- `sellers` — بيانات البائعين
- `products` — المنتجات

### القيود الثابتة
- لا React، لا Next.js، لا إعادة بناء من الصفر
- لا Terminal — كل التنفيذ عبر Claude Code أو Cowork

---

## 7. الأدوات والأدوار

| الأداة | الدور | متى |
|--------|-------|-----|
| Claude General | استراتيجية + قرارات + توثيق | نقاشات، تخطيط، blueprints |
| Claude Code | كتابة وتعديل الكود | بعد اتفاق على ما يُبنى |
| Gemini | إرشاد بصري خطوة بخطوة | إعدادات، تنفيذ بالصور |
| ChatGPT | رأي ثانٍ | قرارات كبيرة |
| Cowork | رفع ملفات على GitHub | بعد اكتمال الكود |

---

## 8. روابط المشروع

- **GitHub Repo:** https://github.com/hawwadmowissa-art/wardro-alpha-0.95
- **التطبيق الحي:** https://hawwadmowissa-art.github.io/wardro-alpha-0.95/
- **Supabase:** Wardro project — eu-central-1 (Frankfurt) — FREE plan

---

## 9. الأخطاء التي لا تتكرر

1. **لا تسرع في الوثائق** — نقاش أولاً، كتابة ثانياً
2. **لا Customer Setup قبل Browse** — حُذفت لأسباب صحيحة
3. **لا تعامل الوثائق كدستور** — كلها مسودات حية
4. **لا تأخذ قرارات بدون بوجمعة** — كل قرار يمر عبره

---
## 10. Visual Authority

Purpose:
Ensure visual consistency across Wardro V2.

Priority Order:

1. WARDRO_V2_BLUEPRINT

   * Defines product flow and functional behavior.

2. Approved Visual References

   * Includes approved Store Tour images and future approved UI references.
   * Defines layout, spacing, visual hierarchy, component placement, and overall presentation.

3. AGENTS.md

   * Defines implementation behavior and creative freedom.

Rules:

* When a visual reference exists, its layout should be reproduced as closely as possible.
* Do not redesign or reinterpret approved screens.
* Do not move major UI elements unless explicitly requested.
* Visual improvements are allowed only inside the same structure.

Allowed:

* Better spacing
* Better typography
* Better shadows
* Better responsiveness
* Better micro-interactions

Not Allowed:

* New navigation systems
* Layout restructuring
* Replacing Sidebar with Tabs
* Repositioning major components

Goal:
Match approved visual references first.
Improve second.

*WARDRO V2 BLUEPRINT | يونيو 2026 | General 4 + بوجمعة*
