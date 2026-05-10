# Mohey4ADS (MVP) — Facebook & Instagram

أداة MVP لنشر الإعلانات آلياً — هذه النسخة تدعم Facebook Pages وInstagram Business عبر Facebook Graph API.

ميزات هذه النسخة:
- واجهة ويب بسيطة لرفع ملف CSV أو JSON يحتوي على الإعلانات
- دعم تنسيق CSV: title,description,price,images,location,account,platform,schedule
  - platform: facebook أو instagram
  - account: FB_PAGE_ID (يمكن تركه فارغًا لاستخدام القيمة الافتراضية من .env)
- نشر إلى Facebook Page باستخدام Page Access Token
- نشر إلى Instagram Business (يتطلب IG_BUSINESS_ACCOUNT_ID المرتبط بالصفحة)
- تسجيل كل محاولة نشر في logs/posts.log (كل سطر JSON يمثل محاولة)
- دعم جدولة بسيطة: فحص كل دقيقة وتنفيذ المنشورات المجدولة
- نقاط توسعة: Puppeteer للنشر على منصات أخرى، دعم رفع صور محلياً، حل الكابتشا لاحقاً

متغيّرات البيئة المطلوبة (.env):
- FB_PAGE_ID — معرّف صفحة فيسبوك
- FB_PAGE_ACCESS_TOKEN — توكن صفحة يسمح بالنشر
- IG_BUSINESS_ACCOUNT_ID — معرّف حساب إنستغرام للأعمال المرتبط بالصفحة
- PORT — رقم البورت (اختياري)

كيفية التشغيل محلياً:
1. انسخ .env.example إلى .env واملأ القيم (خصوصاً FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID)
2. تثبيت الحزم:
   npm install
3. تشغيل الخادم:
   npm start
4. افتح المتصفح: http://localhost:3000
5. ارفع sample.csv أو sample.json من واجهة الويب ثم اضغط "نشر" أو انتظر الجدولة حسب الحقل schedule

ملاحظات هامة:
- لا ترفع أي مفاتيح أو كلمات مرور للمستودع. احتفظ بها في .env محلياً أو GitHub Secrets عند التشغيل في CI.
- لضمان قدرة البوت على النشر في فيسبوك/إنستغرام تأكد من إعداد التطبيق والأذونات وربط حساب إنستغرام الأعمال بالصفحة.
- مسؤولية الالتزام بسياسات فيسبوك وإنستغرام تقع على عاتقك.

توسعات مستقبلية:
- دعم تحميل الصور المحلية وإرسالها كـmultipart
- جدولة متقدمة وقسم "المهام" لعرض المنشورات المجدولة
- دعم Puppeteer كخيار احتياطي

