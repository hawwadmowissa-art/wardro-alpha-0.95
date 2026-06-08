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
