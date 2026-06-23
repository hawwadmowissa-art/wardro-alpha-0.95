# WARDRO Handoff — 2026-06-12
> للـ Fable 5 في الجلسة القادمة — اقرأ هذا أولاً

---

## ما تم بناؤه في هذه الجلسة

### DB Migration (Supabase — project: koprvpdmdktyorzymeud / eu-central-1)
- `products.description text` — أضيف
- `sellers.profile_image text` — أضيف
- Storage bucket `product-images` — أنشئ (public read / authenticated write / 5MB / images only)
- Storage RLS: `product_images_public_read` (SELECT to public) + `product_images_auth_insert` (INSERT to authenticated)

### الملفات المعدّلة
| الملف | ما تغيّر |
|-------|---------|
| `index.html` | حُذف `#s-add-product` كشاشة مستقلة — أصبح modal داخل `#s-editor`. أضيفت: Store Profile section، Quick Add row (3 tiles)، Add Product bottom-sheet modal |
| `app.js` | تصحيح INSERT fields (`size→sizes[]`, `category→type`, `image_url→image`). Multi-select sizes (`_apSizes[]`). دوال جديدة: `openAddProduct`, `closeAddProduct`, `apModalBackdropClose`, `previewStoreProfile`. `loadEditorProducts` يجلب الآن `profile_image` من sellers. `triggerStagger('s-editor')` يُنعش المنتجات واسم المتجر عند كل فتح |
| `style.css` | حُذفت styles القديمة لـ Add Product كشاشة. أضيفت: `.ap-modal` (bottom-sheet مع animation)، `.ed-profile-*` (Store Profile)، `.ed-quick-row` / `.ed-quick-tile` (Quick Add) |
| `CLAUDE.md` | حُدّث قسم "ما تم إنجازه" والمرحلة الحالية |

---

## ما لم يُختبر بعد
- [ ] Store Profile upload → Storage → sellers.profile_image (end-to-end)
- [ ] Add Product modal: فتح/إغلاق + backdrop dismiss
- [ ] saveProduct INSERT بالـ fields الصحيحة فعلياً في Supabase
- [ ] Image upload للمنتج → Storage path `products/{user.id}/{timestamp}.ext`
- [ ] Multi-select sizes — يُرسل كـ text[] array صحيح
- [ ] loadEditorProducts: يُحمّل profile_image ويرسمه في الـ circle
- [ ] Quick Add tiles تفتح الـ modal
- [ ] Reset الـ modal بعد save ناجح (حقول + image zone + sizes)

---

## القرارات التقنية المهمة

**Bucket واحد `product-images` لكل شيء** — المنتجات تحت `products/{user.id}/` والصور الشخصية تحت `store-profiles/{user.id}.ext`. قرار مقصود لتبسيط الـ RLS.

**RLS على products** — policy واحدة `FOR ALL` بـ `USING (auth.uid() = seller_id)`. في PostgreSQL، ALL policy بدون WITH CHECK يستخدم USING كـ WITH CHECK تلقائياً — INSERT محمي.

**Add Product = modal لا screen** — `display:flex` + CSS class `ap-modal--open` تتحكم في الـ animation. double rAF لضمان transition تشتغل بعد `display:flex`.

**Profile image reset** — عند كل فتح لـ `#s-editor` عبر `triggerStagger`، تُعاد جلب بيانات sellers من Supabase (لا نعتمد على localStorage وحده).

**DOMContentLoaded listener للـ size/cat buttons** — يشتغل مرة واحدة عند تحميل الصفحة لأن الـ modal موجود في DOM من البداية (لا يُنشأ ديناميكياً).

---

## الخطوة الموالية

**اختبار يدوي للـ Editor Mode + Add Product** — يفتح التطبيق، يسجل دخول بائع، يذهب لـ Editor، يضغط "+ Add Product"، يملأ النموذج، يضغط Done، يتحقق من Supabase أن الصف أُضيف بـ fields صحيحة. ثم Show Mode للتأكد أن المنتج يظهر.

بعد التأكيد: **Show Mode polish** — ثم Customer Registration + Browse.

---

## ملاحظات / bugs محتملة

- `doSellerSignIn` (app.js) يستعلم بـ `.eq('user_id', ...)` لكن العمود الفعلي هو `id` — Auth تشتغل لأن الكود يرجع للـ email fallback، لكن store_name لا يُحمّل صح عند Sign In. **لا تلمسه الآن** — Auth تعمل end-to-end والمهمة الحالية هي Editor.
- `ap-img-zone` background image لا يُعاد ضبطه إذا أغلق المستخدم الـ modal بدون save — يبقى محتفظاً بالصورة. غير مؤثر الآن لكن يُصلح لاحقاً.
- `product-images` bucket: لا يوجد DELETE policy بعد — البائع لا يستطيع حذف صوره من Storage (لا يؤثر على الـ flow الحالي).

---

*جلسة 2026-06-12 | Fable 5 | بوجمعة*
