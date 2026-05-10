# Mohey4ADS (MVP) — Facebook & Instagram

هذه النسخة من Mohey4ADS تستهدف النشر عبر Facebook وInstagram باستخدام Facebook Graph API (موصى به).

المتطلبات البيئية (املأ ملف .env محلياً):
- FB_PAGE_ID: معرف صفحة الفيسبوك الخاصة بك
- FB_PAGE_ACCESS_TOKEN: Page access token بصلاحية النشر
- IG_BUSINESS_ACCOUNT_ID: معرف حساب إنستغرام الأعمال المرتبط بالصفحة

تشغيل محلياً:
1. انسخ .env.example إلى .env واملأ القيم (FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID)
2. تثبيت الحزم:
   npm install
3. تشغيل الخادم:
   npm start
4. افتح المتصفح: http://localhost:3000
5. ارفع sample.csv أو sample.json من صفحة الويب ثم اضغط "نشر" أو "نشر الكل".

ملاحظات حول Facebook/Instagram Graph API:
- لنشر على Instagram عبر API يجب أن يكون حسابك Instagram Business مرتبطًا بصفحة Facebook.
- عمليات النشر للـInstagram تتطلب تحميل صورة (public URL) ثم استدعاء endpoint النشر.
- إن أردت نشر نص فقط على Facebook سيستخدم system endpoint /{page_id}/feed.

الجدولة:
- يدعم الحقل schedule تنسيقات ISO datetime (مثال: 2026-05-12T10:00:00Z) لجدولة لمرة واحدة.
- يدعم أيضًا تعابير cron (مثال: "0 9 * * *") للمهام المتكررة باستخدام node-cron.

سجلات النشر:
- يتم تخزين سجل كل محاولة نشر في logs/posts.log كسطر JSON منفصل يحتوي على حالة النجاح/الفشل وسبب الفشل إن وجد.

نقاط توسعة مستقبلية:
- دعم Puppeteer للنشر عبر واجهة الويب (إذا احتجت بديل API)
- دعم رفع صور محليًا (multipart upload) وتحويلها إلى URLs عامة
- تحسين واجهة المستخدم وعرض نتائج النشر في الوقت الحقيقي

ملاحظة أمان:
- لا ترفع أي مفاتيح أو كلمات مرور إلى المستودع. احتفظ بها في .env محليًا أو في GitHub Secrets عند الاستخدام في CI.
