# Wealth Club Festival Touchscreen
## Product & Development Brief — Version 1.0

> **Project:** وب‌اپ تعاملی غرفه باشگاه ثروت در جشنواره باغ کتاب  
> **Primary device:** تلویزیون / نمایشگر لمسی استندی  
> **Primary mode:** Kiosk / Full Screen  
> **Language:** فارسی، RTL  
> **Primary goal:** جذب مخاطب، تعامل، تشخیص نیاز، لیدگیری و هدایت به خرید یا مذاکره  
> **Secondary goal:** معرفی حرفه‌ای برند، دوره‌ها و ظرفیت همکاری با مدارس، سازمان‌ها و نهادها

---

# 1. تعریف مسئله

این وب‌اپ نباید صرفاً یک سایت معرفی یا اسلایدشو تبلیغاتی باشد.

نمایشگر باید به یک **فروشنده و راهنمای تعاملی باشگاه ثروت** تبدیل شود که:

1. رهگذر را متوقف کند.
2. او را وارد یک تعامل کوتاه و جذاب کند.
3. نوع مخاطب و نیاز او را تشخیص دهد.
4. پیشنهاد مناسب را نمایش دهد.
5. اطلاعات تماس یا QR را به او بدهد.
6. او را به ثبت‌نام، رزرو، دریافت مشاوره یا درخواست همکاری هدایت کند.

---

# 2. KPIهای اصلی

موفقیت غرفه با این شاخص‌ها سنجیده شود:

- تعداد شروع تعامل با نمایشگر
- تعداد تکمیل تست / بازی
- تعداد لید ثبت‌شده
- تعداد اسکن QR
- تعداد بازدید صفحه هر محصول
- تعداد کلیک روی «ثبت‌نام / رزرو»
- تعداد درخواست همکاری مدارس
- تعداد درخواست همکاری سازمانی
- تعداد فروش یا رزرو در جشنواره
- نرخ تبدیل:
  - بازدیدکننده → تعامل
  - تعامل → لید
  - لید → ثبت‌نام / فروش

---

# 3. گروه‌های مخاطب

وب‌اپ باید حداقل این گروه‌ها را پوشش دهد:

## A. دانش‌آموز / نوجوان
نیازها:
- تجربه جذاب
- بازی و آزمون
- آموزش پول، کسب‌وکار و سرمایه‌گذاری
- Business School
- دوره‌ها و ورکشاپ‌های متناسب با سن

## B. دانشجو / جوان / +18
نیازها:
- مدیریت پول
- سرمایه‌گذاری
- شناخت بازارهای مالی
- درآمد و کسب‌وکار
- دوره +18
- ورکشاپ‌ها

## C. والدین
نیازها:
- مسیر آموزشی مناسب فرزند
- ارزش آموزشی دوره‌ها
- نتیجه قابل مشاهده
- امنیت و اعتبار مجموعه
- برنامه مناسب سن فرزند

## D. مدیر / مسئول مدرسه
نیازها:
- برگزاری کارگاه برای دانش‌آموزان
- همکاری آموزشی
- دوره‌های گروهی
- برنامه مناسب مدرسه
- دریافت پروپوزال / تماس

## E. مدیر سازمان / شرکت
نیازها:
- آموزش کارکنان
- برنامه‌های آموزشی خانواده کارکنان
- ورکشاپ‌های سازمانی
- همکاری B2B

## F. نهاد / مدیر دولتی
نیازها:
- پروژه‌های آموزش و ترویج سواد مالی
- برنامه‌های جمعی
- طرح‌های آموزشی نوجوانان، جوانان و خانواده‌ها
- همکاری B2G

---

# 4. اصل اصلی تجربه کاربری

مسیر اصلی:

```text
ATTRACT
↓
TOUCH
↓
IDENTIFY
↓
ENGAGE
↓
RECOMMEND
↓
CAPTURE LEAD
↓
CONVERT
```

معادل فارسی:

```text
جلب توجه
↓
لمس صفحه
↓
شناخت مخاطب
↓
تعامل
↓
پیشنهاد مناسب
↓
لیدگیری
↓
ثبت‌نام / خرید / درخواست همکاری
```

---

# 5. ساختار کلی صفحات

```text
/
├── attract
├── home
├── audience
│   ├── student
│   ├── young-adult
│   ├── parent
│   ├── school
│   └── organization
│
├── financial-test
│   ├── intro
│   ├── questions
│   ├── result
│   └── recommendation
│
├── courses
│   ├── plus18
│   ├── business-school
│   └── workshops
│
├── collaboration
│   ├── schools
│   ├── organizations
│   └── government
│
├── festival-offer
├── lead
├── qr
└── success
```

---

# 6. صفحه Attract / Idle

وقتی کسی با نمایشگر کار نمی‌کند، سایت وارد حالت ATTRACT شود.

## هدف
متوقف کردن رهگذران.

## رفتار
هر 5 تا 8 ثانیه یک پیام یا انیمیشن تغییر کند.

### نمونه پیام‌ها

- «هوش مالی‌ات چند از 100 است؟»
- «60 ثانیه وقت داری خودت را محک بزنی؟»
- «اگر امروز 100 میلیون تومان داشتی، با آن چه می‌کردی؟»
- «پول درآوردن مهم است؛ نگه داشتنش چطور؟»
- «سرمایه‌گذار خوبی هستی؟ امتحان کن.»
- «صفحه را لمس کن 👆»

## CTA اصلی

```text
شروع کن
```

یا:

```text
هوش مالی‌ام را محک می‌زنم
```

---

# 7. صفحه Home

صفحه Home بسیار ساده باشد.

## تیتر پیشنهادی

```text
برای چی اومدی؟
```

## گزینه‌ها

### 1.
```text
👦 دانش‌آموزم
```

### 2.
```text
🎓 دانشجو / جوانم
```

### 3.
```text
👨‍👩‍👧 برای فرزندم اومدم
```

### 4.
```text
🏫 از طرف مدرسه اومدم
```

### 5.
```text
🏢 از طرف سازمان / مجموعه اومدم
```

### 6. گزینه برجسته
```text
💰 فقط می‌خوام خودمو محک بزنم!
```

---

# 8. هسته اصلی غرفه: Financial Personality / Financial IQ Test

این تست قلاب اصلی تجربه است.

## مدت
حداکثر 60 تا 120 ثانیه.

## تعداد سؤال
6 تا 10 سؤال.

## نوع پاسخ
Button / Multiple Choice

تا حد امکان:
- بدون تایپ
- بدون اسکرول زیاد
- بدون فرم پیچیده

---

# 9. نسخه اولیه سؤال‌های تست

> این سؤال‌ها MVP هستند و بعداً می‌توان محتوایشان را نهایی کرد.

## Q1

```text
اگر ناگهان 20 میلیون تومان پول اضافه به دستت برسد، اولین کارت چیست؟
```

گزینه‌ها:

- خرجش می‌کنم.
- نگهش می‌دارم.
- بخشی را خرج و بخشی را پس‌انداز می‌کنم.
- بررسی می‌کنم چطور می‌توانم آن را رشد بدهم.

---

## Q2

```text
وقتی می‌خواهی چیزی نسبتاً گران بخری...
```

- اگر دوستش داشته باشم می‌خرم.
- قیمت چند جا را چک می‌کنم.
- اول بررسی می‌کنم واقعاً به آن نیاز دارم یا نه.
- علاوه بر نیاز، هزینه فرصت آن پول را هم در نظر می‌گیرم.

---

## Q3

```text
اگر درآمدت بیشتر شود، احتمالاً چه اتفاقی می‌افتد؟
```

- مخارجم هم بیشتر می‌شود.
- بیشتر پس‌انداز می‌کنم.
- برنامه مالی مشخص می‌سازم.
- بخشی را برای سرمایه‌گذاری اختصاص می‌دهم.

---

## Q4

```text
در مورد سرمایه‌گذاری کدام جمله بیشتر شبیه توست؟
```

- هنوز چیزی درباره‌اش نمی‌دانم.
- شنیده‌ام ولی شروع نکرده‌ام.
- چند بازار را می‌شناسم.
- قبل از تصمیم، ریسک و بازده را مقایسه می‌کنم.

---

## Q5

```text
اگر قیمت یک دارایی به‌شدت بالا برود...
```

- سریع می‌خرم که جا نمانم.
- از بقیه می‌پرسم چه کار کنم.
- صبر می‌کنم و اطلاعات جمع می‌کنم.
- علت رشد، ریسک و ارزش آن را بررسی می‌کنم.

---

## Q6

```text
برای پولت برنامه ماهانه داری؟
```

- نه.
- ذهنی.
- تا حدی.
- بله، درآمد، هزینه، پس‌انداز و سرمایه‌گذاری را جدا می‌کنم.

---

# 10. مدل ساده امتیازدهی

برای MVP:

```text
گزینه 1 = 1 امتیاز
گزینه 2 = 2 امتیاز
گزینه 3 = 3 امتیاز
گزینه 4 = 4 امتیاز
```

امتیاز نهایی تبدیل شود به 0 تا 100.

مثلاً برای 6 سؤال:

```text
min_score = 6
max_score = 24
```

Normalize:

```text
score_100 = ((score - min_score) / (max_score - min_score)) * 100
```

---

# 11. تیپ‌های نتیجه تست

## 0–30
### «شروع مسیر»

```text
تو تازه وارد دنیای تصمیم‌های مالی شدی.
خبر خوب اینه که با چند مهارت پایه می‌تونی خیلی سریع جلو بیفتی.
```

CTA:
- مشاهده مسیر پیشنهادی
- اسکن QR
- دریافت نتیجه کامل

---

## 31–55
### «پول‌بلد در حال رشد»

```text
بعضی تصمیم‌های مالی را خوب می‌گیری، اما هنوز چند نقطه مهم برای رشد داری.
```

CTA:
- دوره مناسب من
- ورکشاپ‌های پیشنهادی

---

## 56–80
### «تصمیم‌گیر مالی»

```text
نگاه مالی خوبی داری و قبل از تصمیم فکر می‌کنی.
مرحله بعد برای تو، ساختن یک چارچوب جدی‌تر برای سرمایه‌گذاری و رشد مالی است.
```

---

## 81–100
### «استراتژیست مالی»

```text
نوع نگاهت به پول، ریسک و تصمیم‌گیری از بسیاری از افراد جلوتر است.
حالا وقت عمیق‌تر شدن در سرمایه‌گذاری، کسب‌وکار و تصمیم‌های واقعی است.
```

---

# 12. سیستم Recommendation

نتیجه فقط Score نباشد.

بر اساس:
- سن
- نوع مخاطب
- نتیجه تست

پیشنهاد نمایش داده شود.

---

# 13. پیشنهاد محصول بر اساس مخاطب

## نوجوان

Primary:

```text
Business School
```

Secondary:

```text
ورکشاپ‌های نوجوان
```

---

## +18 / جوان

Primary:

```text
دوره +18
```

Secondary:

```text
ورکشاپ‌های سرمایه‌گذاری و مالی
```

---

## والد

Primary:

```text
مسیر آموزشی مناسب فرزند شما
```

CTA:

```text
سن فرزندم را انتخاب می‌کنم
```

---

## مدرسه

Primary:

```text
اجرای دوره و کارگاه در مدرسه شما
```

CTA:

```text
درخواست همکاری
```

---

## سازمان

Primary:

```text
برنامه‌های آموزشی اختصاصی سازمان‌ها
```

CTA:

```text
درخواست جلسه / همکاری
```

---

# 14. صفحه دوره +18

## Hero

```text
۱۸ سالت شده...
برای تصمیم‌های مالی واقعی آماده‌ای؟
```

Subheadline:

```text
مهارت‌هایی که قبل از اولین درآمد، اولین سرمایه‌گذاری و اولین تصمیم مالی جدی باید بلد باشی.
```

---

## Problem Cards

کارت‌های کوتاه:

```text
پولم را چطور مدیریت کنم؟
```

```text
سرمایه‌گذاری را از کجا شروع کنم؟
```

```text
طلا، بورس، ارز، صندوق یا بازارهای دیگر؟
```

```text
چطور در دام تصمیم‌های هیجانی نیفتم؟
```

---

## CTA

Primary:

```text
مشاهده شرایط ثبت‌نام
```

Secondary:

```text
QR ثبت‌نام را بگیر
```

---

# 15. صفحه Business School

## Hero

```text
از یک ایده تا یک کسب‌وکار واقعی
```

Subheadline:

```text
مسیر یادگیری کسب‌وکار برای نسل آینده
```

---

## Journey

```text
ایده
↓
شناخت مشتری
↓
مدل کسب‌وکار
↓
پول و اقتصاد
↓
بازاریابی
↓
فروش
↓
راه‌اندازی
```

می‌تواند به صورت Timeline یا کارت‌های افقی نمایش داده شود.

---

## CTA

```text
این مسیر برای من مناسبه؟
```

یا:

```text
اطلاعات Business School
```

---

# 16. صفحه Workshops

باید Dynamic باشد.

هر ورکشاپ به صورت Card:

```text
عنوان
موضوع
گروه سنی
تاریخ
مدت
قیمت
ظرفیت
```

CTA:

```text
رزرو
```

---

# 17. Festival Offer

یک صفحه / Modal مستقل داشته باشیم.

## هدف
ایجاد فوریت.

Template:

```text
پیشنهاد ویژه جشنواره
```

```text
فقط برای بازدیدکنندگان غرفه باشگاه ثروت
```

قابل تنظیم:

- درصد تخفیف
- مبلغ تخفیف
- هدیه ورکشاپ
- رزرو با بیعانه
- مشاوره رایگان
- کد جشنواره

CTA:

```text
استفاده از پیشنهاد
```

---

# 18. Lead Capture

## نکته مهم UX

ترجیحاً کاربر روی تلویزیون اطلاعات زیاد تایپ نکند.

دو روش:

### Method A — Minimal form on TV

فیلدها:

```text
نام
شماره موبایل
```

و انتخاب:

```text
برای خودم
برای فرزندم
مدرسه
سازمان
```

---

### Method B — Preferred

نمایش QR شخصی / عمومی:

```text
نتیجه کاملت رو روی موبایلت بگیر
```

کاربر QR را اسکن و فرم را روی گوشی خودش کامل می‌کند.

این روش:
- سریع‌تر است.
- صف ایجاد نمی‌کند.
- حریم خصوصی بهتری دارد.
- تایپ روی نمایشگر بزرگ را حذف می‌کند.

---

# 19. B2B — مدارس

صفحه مخصوص مدیران مدارس.

## Hero

```text
سواد مالی و کسب‌وکار را به مدرسه‌تان ببرید
```

## Offering

- کارگاه دانش‌آموزی
- دوره چندجلسه‌ای
- برنامه مناسبتی
- رویداد مالی
- Business School
- برنامه سفارشی

CTA:

```text
درخواست همکاری با مدرسه
```

Secondary:

```text
دریافت معرفی‌نامه / پروپوزال
```

---

# 20. B2B / B2G — سازمان‌ها

## Hero

```text
برنامه‌های آموزشی باشگاه ثروت برای سازمان‌ها
```

Audience examples:

- کارکنان
- فرزندان کارکنان
- نوجوانان
- جوانان
- خانواده‌ها
- جامعه هدف سازمان

CTA:

```text
درخواست جلسه
```

---

# 21. QR Strategy

QR فقط یک مدل نباشد.

حداقل:

```text
QR_GENERAL
QR_PLUS18
QR_BUSINESS_SCHOOL
QR_WORKSHOPS
QR_SCHOOL
QR_ORGANIZATION
QR_TEST_RESULT
```

هر QR باید Source داشته باشد.

مثلاً:

```text
?utm_source=bagheketab
&utm_medium=touchscreen
&utm_campaign=science_festival
&utm_content=plus18
```

---

# 22. Analytics Events

حداقل eventهای زیر Track شوند:

```text
app_open
attract_touch
home_view
audience_selected
test_started
test_question_answered
test_completed
test_result_viewed
course_viewed
plus18_viewed
business_school_viewed
workshop_viewed
festival_offer_viewed
qr_viewed
qr_scanned
lead_started
lead_submitted
school_interest
organization_interest
registration_clicked
session_reset
```

Optional properties:

```json
{
  "audience": "young-adult",
  "age_group": "18-24",
  "test_score": 72,
  "recommended_product": "plus18",
  "source": "festival_touchscreen"
}
```

---

# 23. Session Reset

چون نمایشگر عمومی است، Session باید Auto Reset شود.

## Rule

اگر کاربر:

```text
60–90 seconds
```

هیچ تعاملی نداشت:

1. اطلاعات Session پاک شود.
2. فرم نیمه‌کاره پاک شود.
3. به Attract Screen برگردد.

Button ثابت:

```text
شروع از اول
```

نیز وجود داشته باشد.

---

# 24. Privacy

اطلاعات کاربر قبلی نباید برای نفر بعدی باقی بماند.

بعد از:

```text
Success
```

حداکثر 10 ثانیه بعد:

```text
Reset Session
```

---

# 25. Technical Requirements

## Frontend

پیشنهاد:

```text
Next.js / React
TypeScript
Tailwind CSS
```

ولی Framework اجباری نیست.

---

## RTL

کل UI:

```css
direction: rtl;
```

و فارسی First-Class باشد.

---

# 26. Touch UX

دکمه‌ها بسیار بزرگ.

Minimum target:

```text
64px+
```

Preferred روی نمایشگر بزرگ:

```text
80–120px
```

نباید interaction وابسته به Hover باشد.

 ممنوع:

```text
hover-only menus
tiny links
small checkboxes
complex dropdowns
long forms
```

---

# 27. Screen Sizes

طراحی Responsive باشد.

Primary targets:

```text
1920×1080
1080×1920
```

یعنی هم Landscape و هم Portrait قابل استفاده باشد.

Layout نباید به Orientation خاص قفل شود.

---

# 28. Kiosk Mode

وب‌اپ باید مناسب Full Screen باشد.

موارد غیرضروری حذف شوند:

- Browser navigation
- external tabs
- accidental back
- selectable text در بخش‌های حساس
- long page scrolling

ترجیحاً هر Screen در Viewport جا شود.

---

# 29. Internet Failure / Offline First

این بخش برای جشنواره بسیار مهم است.

نباید فرض کنیم اینترنت باغ کتاب همیشه پایدار است.

حداقل:

```text
UI
Course content
Images
Quiz
Scoring
Recommendations
```

باید بدون اینترنت هم قابل اجرا باشد.

پیشنهاد:

```text
PWA
Service Worker
Local Cache
```

اگر Backend قطع شد:

Leadها موقتاً در:

```text
IndexedDB
```

ذخیره و بعداً Sync شوند.

---

# 30. Asset Optimization

به خاطر نمایشگر:

- تصاویر WebP / AVIF
- ویدیوها compressed
- preload محتوای اصلی
- avoid huge background videos
- fallback image for every video

---

# 31. Speed

Target:

```text
initial interactive < 2 sec
screen transition < 300 ms perceived
```

Experience نباید حس Web Page معمولی داشته باشد.

باید شبیه App باشد.

---

# 32. Visual Direction

ویژگی‌ها:

- مدرن
- نوجوانانه ولی نه کودکانه
- حرفه‌ای
- Financial / Business
- Touch-first
- Bold typography
- Large numbers
- Minimal text
- Strong visual hierarchy

نباید:

- پر از متن
- شبیه پاورپوینت
- شبیه سایت شرکتی سنتی
- پر از منو
باشد.

---

# 33. Components

حداقل Componentهای reusable:

```text
<AppShell />
<AttractScreen />
<AudienceCard />
<BigButton />
<QuestionCard />
<AnswerButton />
<ProgressBar />
<ScoreMeter />
<ResultCard />
<ProductCard />
<WorkshopCard />
<QRCodeCard />
<LeadForm />
<FestivalOffer />
<ResetButton />
<IdleTimer />
```

---

# 34. Content Architecture

محتوا Hard-code نشود.

پیشنهاد:

```text
/content
  courses.json
  workshops.json
  questions.json
  results.json
  offers.json
```

تا تیم بدون تغییر Logic بتواند محتوا را عوض کند.

---

# 35. نمونه Course Data

```json
{
  "id": "plus18",
  "title": "دوره +18",
  "tagline": "برای تصمیم‌های مالی واقعی آماده شو",
  "audiences": ["young-adult"],
  "active": true,
  "festivalOffer": true,
  "registrationUrl": ""
}
```

---

# 36. نمونه Workshop Data

```json
{
  "id": "ws-001",
  "title": "آشنایی با سرمایه‌گذاری",
  "age": "+18",
  "date": "",
  "duration": "",
  "price": "",
  "capacity": "",
  "registrationUrl": "",
  "active": true
}
```

---

# 37. MVP Priority

## P0 — حتماً قبل از جشنواره

- Attract Screen
- Home
- Audience selection
- Financial Test
- Result
- +18
- Business School
- Workshops
- QR
- Lead Capture
- School page
- Organization page
- Auto Reset
- Offline basic content

---

## P1 — بسیار مهم

- Festival Offer
- Analytics
- Dynamic Workshop data
- Recommendation Engine
- PWA
- Offline lead queue

---

## P2 — بعد از MVP

- Animated result
- Financial personality avatars
- Leaderboard
- SMS result
- Admin panel
- Gamification
- Prize / wheel
- advanced CRM integration

---

# 38. User Journey — جوان

```text
Attract
→ تست هوش مالی
→ 6 سؤال
→ امتیاز 68
→ نتیجه
→ پیشنهاد دوره +18
→ Festival Offer
→ QR
→ Landing Page mobile
→ Lead
→ Registration
```

---

# 39. User Journey — والد

```text
Attract
→ برای فرزندم
→ انتخاب سن
→ معرفی مسیر مناسب
→ Business School
→ مزایا
→ QR
→ دریافت اطلاعات
→ Lead
```

---

# 40. User Journey — مدیر مدرسه

```text
Home
→ مدرسه
→ خدمات مدارس
→ نمونه برنامه‌ها
→ QR همکاری
→ فرم کوتاه
→ درخواست تماس
```

---

# 41. User Journey — مدیر سازمان

```text
Home
→ سازمان
→ برنامه‌های سازمانی
→ گروه‌های هدف
→ درخواست جلسه
→ QR
→ Lead
```

---

# 42. صفحه Success

بعد از ثبت لید:

```text
عالیه 👌
اطلاعاتت ثبت شد.
```

در صورت نیاز:

```text
برای ادامه، این QR رو هم روی موبایلت داشته باش.
```

بعد از 8–10 ثانیه:

```text
Auto Reset
```

---

# 43. چیزی که نباید بسازیم

برای MVP فعلاً نسازیم:

- فروشگاه اینترنتی پیچیده
- Login / Account
- پنل کاربری
- پرداخت داخل تلویزیون
- فرم طولانی
- LMS
- Chatbot
- صفحات SEO
- Navigation پیچیده

هدف نمایشگر:

```text
ENGAGE → QUALIFY → LEAD → CONVERT
```

نه ساختن نسخه کامل سایت باشگاه.

---

# 44. Payment Strategy

پیشنهاد نمی‌شود اطلاعات بانکی روی تلویزیون عمومی وارد شود.

بهتر:

```text
ثبت‌نام
↓
QR
↓
موبایل شخصی کاربر
↓
Landing Page
↓
Payment
```

---

# 45. صفحه Admin ساده — Optional

اگر زمان بود یک صفحه مخفی:

```text
/admin-kiosk
```

با قابلیت:

- تغییر Festival Offer
- فعال / غیرفعال کردن دوره
- تغییر لینک QR
- تغییر ورکشاپ‌ها
- مشاهده تعداد Interaction
- Reset App

ولی برای MVP می‌توان از JSON / ENV استفاده کرد.

---

# 46. Definition of Done — MVP

نسخه MVP زمانی آماده است که:

- [ ] روی نمایشگر Full Screen اجرا شود.
- [ ] بدون موس و کیبورد قابل استفاده باشد.
- [ ] تمام CTAها Touch-friendly باشند.
- [ ] Home کمتر از 6 انتخاب اصلی داشته باشد.
- [ ] تست در کمتر از 2 دقیقه تکمیل شود.
- [ ] نتیجه تست نمایش داده شود.
- [ ] محصول مناسب پیشنهاد شود.
- [ ] +18 صفحه مستقل داشته باشد.
- [ ] Business School صفحه مستقل داشته باشد.
- [ ] Workshops قابل نمایش باشند.
- [ ] مدیر مدرسه مسیر مستقل داشته باشد.
- [ ] سازمان مسیر مستقل داشته باشد.
- [ ] QRها درست کار کنند.
- [ ] Session خودکار Reset شود.
- [ ] اطلاعات کاربر قبلی باقی نماند.
- [ ] محتوای اصلی در قطع اینترنت قابل مشاهده باشد.
- [ ] همه صفحات فارسی RTL باشند.

---

# 47. پیشنهاد اجرای پروژه

## Sprint 1 — Shell

ساخت:

```text
App Shell
Kiosk
Routing
RTL
Responsive
Idle Timer
Home
```

---

## Sprint 2 — Core Experience

ساخت:

```text
Financial Test
Scoring
Results
Recommendation
```

---

## Sprint 3 — Products

ساخت:

```text
+18
Business School
Workshops
Festival Offer
```

---

## Sprint 4 — Conversion

ساخت:

```text
QR
Lead Capture
Schools
Organizations
Success
Analytics
```

---

## Sprint 5 — Event Hardening

تست:

```text
Touch
Offline
Large Display
Reset
Performance
QR
Network Failure
```

---

# 48. کارهای محتوایی که تیم باشگاه ثروت باید تحویل برنامه‌نویس دهد

هنوز باید نهایی شوند:

- لوگو با کیفیت
- فونت برند
- رنگ‌های برند
- عکس / ویدیوی دوره +18
- توضیح نهایی +18
- Business School
- لیست ورکشاپ‌ها
- قیمت‌ها
- تاریخ‌ها
- آفر جشنواره
- URL ثبت‌نام هر محصول
- URL فرم لید
- اطلاعات تماس
- متن B2B مدارس
- متن B2B/B2G سازمان‌ها
- Privacy text کوتاه

---

# 49. تصمیم مهم محصول

**مرکز تجربه غرفه = تست تعاملی مالی**

نه Course Catalog.

محصولات بعد از Interaction معرفی شوند.

این ترتیب حفظ شود:

```text
اول تجربه
بعد پیشنهاد
بعد فروش
```

---

# 50. North Star

هر تصمیم طراحی را با این سؤال بسنجیم:

> «آیا این صفحه باعث می‌شود یک رهگذر در کمتر از 5 ثانیه بفهمد باید چه کاری انجام دهد؟»

اگر پاسخ «نه» است، صفحه باید ساده‌تر شود.

---

# END — V1

Next document recommended:

```text
02-UI-WIREFRAME.md
```

شامل:
- Wireframe دقیق هر Screen
- متن نهایی Buttonها
- Layout
- Stateها
- Transitionها

سپس:

```text
03-CONTENT.md
```

و بعد:

```text
04-QUIZ-LOGIC.md
```
