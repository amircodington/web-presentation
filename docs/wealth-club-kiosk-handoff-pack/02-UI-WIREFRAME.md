# 02 — UI WIREFRAME
## Wealth Club Festival Touchscreen — Screen-by-Screen Specification

> این سند برای طراح UI و برنامه‌نویس است.
> هدف: مشخص کردن دقیق هر Screen، اجزا، CTA، Stateها و Transitionها.

---

# 1. اصول کلی UI

- زبان: فارسی
- Direction: RTL
- حالت اجرا: Kiosk / Full Screen
- Touch First
- حداقل اندازه دکمه اصلی: 80px ارتفاع روی نمایشگر بزرگ
- هیچ Interaction مهمی Hover-based نباشد
- هر Screen تا حد ممکن بدون Scroll
- متن کوتاه، تیتر بزرگ، CTA واضح
- حداکثر 1 CTA اصلی + 1 CTA ثانویه در هر Screen
- دکمه «شروع از اول» همیشه در گوشه بالا در دسترس باشد
- Logo کوچک و ثابت
- Progress در تست
- Auto reset after inactivity

---

# 2. Global Layout

```text
┌─────────────────────────────────────────────┐
│ Logo                              شروع از اول │
├─────────────────────────────────────────────┤
│                                             │
│              MAIN CONTENT                   │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│          Optional Bottom Navigation         │
└─────────────────────────────────────────────┘
```

Header نباید شلوغ باشد.

---

# 3. SCREEN — ATTRACT / IDLE

## Route
`/attract`

## هدف
جلب توجه رهگذر در کمتر از 5 ثانیه.

## Layout

```text
┌─────────────────────────────────────────────┐
│                 [LOGO]                      │
│                                             │
│       هوش مالی‌ات چند از 100 است؟          │
│                                             │
│        یک تست 60 ثانیه‌ای انجام بده         │
│                                             │
│           [ شروع تست 👆 ]                   │
│                                             │
│  پیام‌های متحرک / اعداد / سوال‌های کوتاه   │
└─────────────────────────────────────────────┘
```

## Rotating Messages
هر 5–8 ثانیه:

- «اگر امروز 100 میلیون داشتی، چه کار می‌کردی؟»
- «سرمایه‌گذاری بلدی یا فقط فکر می‌کنی بلدی؟»
- «پول درآوردن مهمه؛ نگه داشتنش چی؟»
- «60 ثانیه وقت داری خودتو محک بزنی؟»

## Interaction
هر Touch روی صفحه → `/home`

## Idle behavior
این صفحه خودش حالت idle است.

---

# 4. SCREEN — HOME / AUDIENCE SELECT

## Route
`/home`

## Hero
```text
برای چی اومدی؟
```

## Subtitle
```text
یکی رو انتخاب کن تا بهترین مسیر رو بهت نشون بدیم.
```

## Cards
2×3 grid:

```text
[ 👦 دانش‌آموزم ]
[ 🎓 دانشجو / جوانم ]

[ 👨‍👩‍👧 برای فرزندم اومدم ]
[ 🏫 از طرف مدرسه اومدم ]

[ 🏢 از طرف سازمان اومدم ]
[ 💰 فقط می‌خوام خودمو محک بزنم ]
```

## Transitions

- Student → `/audience/student`
- Young adult → `/audience/young-adult`
- Parent → `/audience/parent`
- School → `/collaboration/schools`
- Organization → `/collaboration/organizations`
- Test → `/financial-test/intro`

---

# 5. SCREEN — STUDENT INTRO

## Route
`/audience/student`

## Hero
```text
پول فقط خرج کردن نیست.
```

## Subtitle
```text
ببین چقدر برای تصمیم‌های مالی و کسب‌وکار آماده‌ای.
```

## CTAs
Primary:
`تست 60 ثانیه‌ای رو شروع می‌کنم`

Secondary:
`دوره‌های مخصوص من`

## Transition
Primary → Quiz with audience=student  
Secondary → `/courses/business-school`

---

# 6. SCREEN — YOUNG ADULT INTRO

## Route
`/audience/young-adult`

## Hero
```text
از اینجا به بعد، تصمیم‌های مالی واقعی شروع می‌شن.
```

## Cards
- مدیریت پول
- سرمایه‌گذاری
- درآمد
- کسب‌وکار

## CTAs
Primary:
`هوش مالی‌ام رو محک می‌زنم`

Secondary:
`دوره +18 رو ببین`

---

# 7. SCREEN — PARENT INTRO

## Route
`/audience/parent`

## Hero
```text
برای آینده مالی فرزندتون چه مهارتی مهم‌تره؟
```

## Step 1
انتخاب بازه سنی:

- 8–11
- 12–14
- 15–17
- 18+

## Step 2
بعد از انتخاب سن:
نمایش 2–3 پیشنهاد متناسب.

## CTA
`مسیر پیشنهادی رو ببین`

## Data
`child_age_group`

---

# 8. SCREEN — QUIZ INTRO

## Route
`/financial-test/intro`

## Hero
```text
هوش مالی‌ات رو در 60 ثانیه محک بزن
```

## Info
```text
6 سوال کوتاه
بدون جواب درست و غلط
در پایان امتیاز و مسیر پیشنهادی می‌گیری
```

## CTA
`شروع`

---

# 9. SCREEN — QUIZ QUESTION

## Route
`/financial-test/questions/:id`

## Layout

```text
┌─────────────────────────────────────────────┐
│  سوال 2 از 6        ███████░░░              │
│                                             │
│      وقتی می‌خوای چیزی گرون بخری...         │
│                                             │
│  [ اگر دوستش داشته باشم می‌خرم ]            │
│  [ قیمت چند جا رو چک می‌کنم ]               │
│  [ اول می‌بینم واقعاً لازم دارم یا نه ]      │
│  [ هزینه فرصت پول رو هم در نظر می‌گیرم ]     │
└─────────────────────────────────────────────┘
```

## UX Rules
- Answer selection immediately advances after 250–400ms
- Optional brief selected state
- Back button فقط تا سوال قبلی
- No Next button needed
- Progress bar always visible

---

# 10. SCREEN — QUIZ PROCESSING

## Route
`/financial-test/processing`

## Duration
1–2 sec intentional animation

## Text
```text
داریم الگوی تصمیم‌گیری مالی‌ات رو بررسی می‌کنیم...
```

## Animation
Score ring / coins / bars / abstract finance animation

---

# 11. SCREEN — QUIZ RESULT

## Route
`/financial-test/result`

## Layout

```text
┌─────────────────────────────────────────────┐
│             امتیاز هوش مالی تو              │
│                                             │
│                    72                       │
│                  از 100                     │
│                                             │
│              تصمیم‌گیر مالی                 │
│                                             │
│  نقطه قوت: بررسی قبل از تصمیم               │
│  جای رشد: ساختن مسیر سرمایه‌گذاری           │
│                                             │
│ [ مسیر پیشنهادی من ]   [ نتیجه روی موبایل ] │
└─────────────────────────────────────────────┘
```

## Components
- Score
- Personality title
- One strength
- One improvement
- Recommended product badge

## CTA
Primary → Recommendation
Secondary → QR result

---

# 12. SCREEN — RECOMMENDATION

## Route
`/financial-test/recommendation`

## Logic
Based on:
- audience
- age_group
- score
- optional answer profile

## Example
```text
مسیر پیشنهادی برای تو
```

Card:
```text
دوره +18
برای ساختن پایه‌های مدیریت پول، سرمایه‌گذاری و تصمیم‌گیری مالی
```

Secondary card:
```text
ورکشاپ آشنایی با سرمایه‌گذاری
```

## CTA
`جزئیات دوره`

---

# 13. SCREEN — +18 COURSE

## Route
`/courses/plus18`

## Fold 1
Hero:
```text
۱۸ سالت شده؛ برای تصمیم‌های مالی واقعی آماده‌ای؟
```

Sub:
```text
مهارت‌هایی که قبل از اولین درآمد، اولین سرمایه‌گذاری و اولین تصمیم مالی جدی باید بلد باشی.
```

CTA:
`شرایط ثبت‌نام`

## Fold 2 / Cards
حداکثر 4 کارت:
- مدیریت پول
- شناخت بازارهای مالی
- سرمایه‌گذاری
- تصمیم‌گیری و ریسک

## Fold 3
Course Info:
- گروه سنی
- مدت
- شیوه برگزاری
- تاریخ شروع
- قیمت

## CTA
Primary:
`ثبت‌نام / رزرو`

Secondary:
`QR روی موبایل`

---

# 14. SCREEN — BUSINESS SCHOOL

## Route
`/courses/business-school`

## Hero
```text
از یک ایده تا یک کسب‌وکار واقعی
```

## Timeline
```text
ایده → مشتری → مدل کسب‌وکار → پول → بازاریابی → فروش → اجرا
```

## Value Cards
- تجربه عملی
- کار تیمی
- حل مسئله
- ارائه و فروش
- تصمیم‌گیری

## CTA
`اطلاعات دوره`

---

# 15. SCREEN — WORKSHOPS

## Route
`/courses/workshops`

## Hero
```text
ورکشاپ‌های کوتاه، کاربردی و عملی
```

## Cards
حداکثر 3 کارت visible.

Each:
```text
عنوان
برای چه سنی؟
مدت
تاریخ
قیمت
[رزرو]
```

## Interaction
Tap → Workshop detail modal

---

# 16. SCREEN — WORKSHOP DETAIL

## Modal / Route
`/courses/workshops/:id`

## Fields
- عنوان
- توضیح 2 خط
- مدرس
- تاریخ
- ساعت
- مدت
- مخاطب
- قیمت
- ظرفیت
- CTA

---

# 17. SCREEN — SCHOOL COLLABORATION

## Route
`/collaboration/schools`

## Hero
```text
سواد مالی و کسب‌وکار را به مدرسه‌تان ببرید
```

## Offer cards
- کارگاه تک‌جلسه‌ای
- دوره چندجلسه‌ای
- رویداد دانش‌آموزی
- Business School
- برنامه اختصاصی

## Trust row
Optional:
- تعداد دانش‌آموزان آموزش‌دیده
- سابقه اجرا
- نمونه سازمان‌ها / مدارس
(فقط اگر دیتا واقعی داریم)

## CTA
`درخواست همکاری`

Secondary:
`QR اطلاعات همکاری`

---

# 18. SCREEN — ORGANIZATION COLLABORATION

## Route
`/collaboration/organizations`

## Hero
```text
برنامه‌های آموزشی باشگاه ثروت برای سازمان‌ها
```

## Audience chips
- کارکنان
- فرزندان کارکنان
- خانواده‌ها
- نوجوانان
- جوانان

## Services
- Financial Literacy Workshop
- Business Education
- Custom Program
- Large-scale Event

## CTA
`درخواست جلسه`

---

# 19. SCREEN — GOVERNMENT / B2G

## Route
`/collaboration/government`

## Hero
```text
طراحی و اجرای برنامه‌های ترویج سواد مالی در مقیاس عمومی
```

## Blocks
- طراحی برنامه
- تولید محتوا
- آموزش
- ارزیابی
- گزارش‌دهی
- اجرای رویداد

## CTA
`درخواست معرفی مجموعه`

---

# 20. SCREEN — FESTIVAL OFFER

## Route
`/festival-offer`

## Hero
```text
پیشنهاد ویژه جشنواره
```

## Display
- Offer label
- Original price
- Festival price
- Expiry
- Bonus

## CTA
`استفاده از پیشنهاد`

## Rule
این Screen باید با config خاموش/روشن شود.

---

# 21. SCREEN — QR

## Route
`/qr/:type`

## Hero
```text
ادامه رو روی موبایلت ببر
```

## Layout
QR very large.

## Under QR
```text
دوربین موبایلت رو باز کن و QR رو اسکن کن.
```

## Optional
Short URL

## Auto Reset
After 20–30 seconds

---

# 22. SCREEN — LEAD FORM

## Route
`/lead`

## Fields
Required:
- نام
- موبایل

Optional:
- سن / بازه سنی
- نوع مخاطب

## UI
Numeric keyboard for mobile number.

## Checkbox / Consent
```text
با ثبت شماره، موافقم اطلاعات دوره‌ها و برنامه‌های باشگاه ثروت برای من ارسال شود.
```

## CTA
`ثبت`

---

# 23. SCREEN — SUCCESS

## Route
`/success`

## Text
```text
عالیه 👌
اطلاعاتت ثبت شد.
```

Optional:
```text
همکاران باشگاه ثروت برای ادامه مسیر باهات در ارتباط خواهند بود.
```

## Auto Reset
8–10 sec → `/attract`

---

# 24. ERROR STATES

## Offline
```text
اینترنت قطع شده، ولی تجربه همچنان فعاله.
```

Lead local queue.

## Lead sync failed
```text
اطلاعات ذخیره شد و بعد از اتصال اینترنت ارسال می‌شود.
```

## QR config missing
Fallback:
`شماره تماس / آیدی / لینک کوتاه`

---

# 25. SESSION STATE

Store:
```json
{
  "sessionId": "",
  "audience": "",
  "ageGroup": "",
  "quizAnswers": [],
  "quizScore": null,
  "resultType": "",
  "recommendedProducts": [],
  "leadSubmitted": false,
  "startedAt": ""
}
```

Clear on Reset.

---

# 26. NAVIGATION RULES

- هر مسیر حداکثر در 4 Touch به CTA برسد.
- User should never get trapped.
- هر Screen:
  - Home/Reset icon
  - Back when relevant
- External links NEVER open on TV unless explicitly intended.
- Registration should generally move to phone via QR.

---

# 27. FINAL VISUAL CHECKLIST

- [ ] قابل خواندن از فاصله 2–3 متر
- [ ] دکمه‌ها با انگشت راحت لمس می‌شوند
- [ ] متن‌ها کوتاه
- [ ] Scroll حداقلی
- [ ] QR حداقل 280px
- [ ] CTA در پایین صفحه گم نمی‌شود
- [ ] RTL واقعی
- [ ] Persian numbers consistency decided
- [ ] Dark / bright room readability tested
- [ ] Full-screen tested on actual TV

---

# 28. Suggested Route Map

```text
/attract
/home

/audience/student
/audience/young-adult
/audience/parent

/financial-test/intro
/financial-test/questions/:id
/financial-test/processing
/financial-test/result
/financial-test/recommendation

/courses/plus18
/courses/business-school
/courses/workshops
/courses/workshops/:id

/collaboration/schools
/collaboration/organizations
/collaboration/government

/festival-offer
/lead
/qr/:type
/success
```

# END
