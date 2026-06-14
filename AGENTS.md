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

## Claude Code — صلاحيات "الحرية الموجّهة"

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

**شاشة Role Selection (#s-splash) — مُعاد تصميمها + تفاعلية:**
- WR diamond-frame emblem (SVG مخصص: إطار ماسي + دائرة ذهبية + "WR" بـ Georgia serif)
- "WARDRO" wordmark + "FASHION INTELLIGENCE" tagline
- "Choose Your Journey" / "تجربة مخصصة تلبي احتياجاتك"
- بطاقتان جنباً إلى جنب: Customer (توهج ذهبي مبدئي) + Seller (هادئة) — في RTL: Customer يميناً
- Trust Strip: 3 أيقونة (درع/نجمة/تاج) بحجم 26×26 + تسمية نصية
- **التوهج تفاعلي**: `.rs-card--active` تنتقل مع الضغط عبر `rsSelectCard()` (360ms ثم navigate)

**شاشة Welcome + Choose Mode (#s-welcome) — مُعاد تصميمها (tour6):**
- "W" monogram + "Welcome, [اسم البائع]" + "ماذا تريد أن تفعل اليوم؟"
- بطاقتان أفقيتان كبيرتان (glass + direction:ltr): أيقونة كبيرة يساراً + محتوى يميناً
- EDITOR MODE: أيقونة scroll+quill SVG — "أنشئ تجربة زبونك" / "→ Start Editing"
- SHOW MODE: أيقونة monitor+eye SVG — "شاهد ما يراه زبونك" / "→ Preview Store"
- حُذف: trust strip السفلي + sparkle watermark
- routing محفوظ: `navigateTo('s-editor')` / `navigateTo('s-show')`

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

**رحلة الزبون — شاشة Saved (#s-saved):**
- Top Bar: سهم رجوع + عنوان "Saved" في المنتصف
- قائمة عمودية من بطاقات المحفوظات (صورة + اسم + متجر + مقاس + توفر + سعر)
- قلب ذهبي ♥ أعلى يمين كل بطاقة لحذف العنصر فوراً مع أنيميشن سلايد
- Empty State: "ما حفظت حتى قطعة بعد" + زر للتصفح
- Bottom Nav مطابق لـ Browse مع "Saved" نشط
- Navigation: Browse Saved-tab → #s-saved | Back/Home → #s-browse

**قاعدة البيانات:**
- جداول: `sellers` / `products` / `saved_items`
- RLS: public SELECT على products وsellers | كل WRITE بـ auth.uid()
- `supabase-config.js` منشور على GitHub Pages (anon key فقط — آمن)

**رحلة الزبون — شاشة Discover (#s-discover):**
- Top Bar: "Discover" في المنتصف + أيقونة فلاتر
- نوع القطعة (مطلوب) — Dropdown: رسمي / كاجوال / رياضي / تقليدي
- الميزانية (مطلوب) — Dual range slider (0 → 20,000+ DZD) بـ fill ذهبي
- خيارات إضافية: 4 chips (المقاس / المناسبة / اللون / الفئة) — كل chip يفتح panel تحته
- زر "✦ أظهر النتائج": disabled (رمادي) حتى تُملأ الحقلان المطلوبان، يُفعّل بـ CSS class
- Bottom Nav: الرئيسية / المحفوظات / اكتشف (active) / الحساب

**رحلة الزبون — شاشة النتائج (#s-results):**
- Top Bar: سهم رجوع + "النتائج"
- شبكة منتجات 2-column (reuses br-prod-card) — Supabase query بدون AI
- Filter logic: type (required) + price range (required) + sizes (optional overlaps) + color (client-side match)
- Empty State: "ما لقيناش قطع تناسب هذا البحث" + زر تعديل البحث
- "✦ قطع تتناسق معها": section هيكلية (products من types أخرى) — AI logic يأتي لاحقاً
- Product Detail Sheet يعمل من النتائج (products مدموجة في _brProds)

**قاعدة البيانات — columns مؤكدة في products:**
- id, seller_id, name, type, color, color_name, price, sizes[], stock, image, description, hero, created_at

**Polish batch — يونيو 2026:**
- Product Detail Sheet: تخطيط عمودي (صورة فوق + تفاصيل أسفل) — بدل الأفقي المكسور
  - X إغلاق (أعلى-يسار) + قلب (أعلى-يمين) على الصورة — handle في أعلى الشيت
  - الترتيب: الاسم → السعر → المقاسات (دائرية) → اللون (swatches دائرية) → الوصف → الكمية → زر Save
- Top Stores: الضغط على متجر يفتح showMode الخاص به (openStoreView → loadGuestStoreProducts)
  - يُحمّل منتجات البائع من Supabase بدون auth (public read)
  - `_guestSellerId` يحمي loadShowMode للبائع من التأثر
- Splash screen: "Powered by El_djem3i" — 9px Tajawal، opacity 0.28، يظهر ثم يختفي مع أنيميشن
- Home hero slider: ارتفاع من 310px → 355px (+14.5%)

### 🔜 التالي (لم يُبنَ بعد)
- ⚠️ stock column تحتاج قرار: الـ default هو 0 وبائعين ما حددوا stock → كل المنتجات تظهر "نفدت الكمية" — يلزم إما تغيير الـ default لـ null أو إضافة حقل is_available
- Customer Registration Screen مستقلة
- AI Outfit — تكامل مع منتجات المتاجر الحقيقية وتوصيات "قطع تتناسق معها"
- إصلاح stock/availability (قرار schema مطلوب)

*آخر تحديث: يونيو 2026 | General 7 / Claude Code*
