# Mohey4ADS (MVP)

أداة MVP لنشر الإعلانات آلياً — النسخة الأولى تدعم Telegram (نشر في قنوات/مجموعات) عبر Bot API.

ميزات هذه النسخة:
- واجهة ويب بسيطة لرفع ملف CSV أو JSON يحتوي على الإعلانات
- دعم تنسيق CSV: title,description,price,images,location,account,schedule
- نشر إلى Telegram باستخدام BOT token (TELEGRAM_BOT_TOKEN)
- سجل نشر (logs/posts.log) بصيغة JSON (كل سطر سجل خاص بعملية نشر)
- نقاط توسعة جاهزة (Puppeteer module يمكن إضافته لاحقاً للنشر إلى منصات بدون API)
- Dockerfile لتشغيل موحد

بدء التشغيل محلياً:
1. انسخ .env.example إلى .env وعبّئ القيم (خصوصاً TELEGRAM_BOT_TOKEN و TELEGRAM_DEFAULT_CHAT_ID)
2. تثبيت الحزم:
   npm install
3. تشغيل الخادم:
   npm start
4. افتح المتصفح: http://localhost:3000

تشغيل داخل Docker (مبسّط):
1. docker build -t mohey4ads .
2. docker run -p 3000:3000 --env-file .env -v ./logs:/app/logs mohey4ads

ملاحظات هامة:
- لا ترفع أي مفاتيح أو كلمات مرور للمستودع. احتفظ بها في .env محلياً أو GitHub Secrets عند التشغيل في CI.
- مسؤولية الالتزام بسياسات كل منصة تقع على عاتقك.

توسعات مستقبلية مقترحة:
- دعم Facebook/Instagram/X عبر Puppeteer أو عبر API إن أمكن
- دعم رفع الصور المحلية وإرسالها إلى Telegram
- جدولة نشر وفق حقل schedule
- دعم تجاوز الكابتشا وبروكسيات

