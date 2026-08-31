# FINAL CHANGE REQUEST — BAGH MADRESEH EVENT UPDATE

## اصلاحات نهایی سایت تلویزیون باشگاه ثروت

> این سند فقط شامل تغییرات جدید است. مبنای اصلی توسعه همان فایل‌ها و ساختار قبلی پروژه است.

# 1. ساعت رویداد
قبلی: 14:00 تا 21:00  
جدید: 15:00 تا 22:00

هر جا استفاده شده اصلاح شود:
- Live activity schedule
- Countdown
- Idle screen
- Event config
- Staff-facing schedule

# 2. Positioning رویداد
فضای «باغ مدرسه» نوجوان/خانواده‌محور و تجربه‌محور است. UI در برخورد اول Teen / Family First باشد، نه Corporate First.

# 3. ترتیب بصری مخاطب‌ها در Home
1. دانش‌آموز / نوجوان
2. والد
3. تازه‌کنکوری
4. تست هوش مالی
5. مدرسه
6. سازمان

مدرسه و سازمان Secondary باشند.

# 4. ترتیب محصولات در نمایش عمومی
پیش‌فرض:
مسیر ثروت → Business School → +18

اگر مخاطب تازه‌کنکوری بود:
+18 = Primary Recommendation

# 5. Attract Screen
قلاب اصلی:
«هوش مالی‌ات چند از 100 است؟»

Rotating messages:
- اگر 100 میلیون داشتی، باهاش چی کار می‌کردی؟
- فکر می‌کنی راحت گول سود تضمینی رو می‌خوری؟
- تو بازار، خریدار بهتری هستی یا فروشنده؟
- 60 ثانیه وقت داری خودتو محک بزنی؟

CTA:
«شروع تست»

# 6. Context رویداد
یک Tag کوچک اضافه شود:
«باغ مدرسه × باشگاه ثروت»
یا
«باشگاه ثروت در باغ مدرسه»

# 7. Live Activities
در Idle / Attract پررنگ شود:
«مینی‌چالش بعدی: چالش 100 میلیون — 18:30»
یا Countdown.

# 8. Schedule پیشنهادی مینی‌فعالیت‌ها
15:30 چالش 100 میلیون
16:00 راز نوسان قیمت
16:30 فرصته یا کلاهبرداری؟
17:00 چالش 100 میلیون
17:30 راز نوسان قیمت
18:00 فرصته یا کلاهبرداری؟
18:30 چالش 100 میلیون
19:00 راز نوسان قیمت
19:30 فرصته یا کلاهبرداری؟
20:00 چالش 100 میلیون
20:30 راز نوسان قیمت
21:00 فرصته یا کلاهبرداری؟
21:30 چالش 100 میلیون

Config-based باشد، Hard-code نشود.

# 9. Home پیشنهادی
Hero:
«کدوم مسیر برای توئه؟»

Cards:
- دانش‌آموزم
- برای فرزندم اومدم
- تازه کنکور دادم
- هوش مالی‌ام رو محک می‌زنم
- از طرف مدرسه اومدم
- از طرف سازمان اومدم

# 10. مسیر نوجوان
Home → Student → Quiz / Interactive → Result → مسیر ثروت → Business School

مسیر ثروت = Entry Product  
Business School = Long-term Next Step

# 11. مسیر والد
اول:
«فرزندتون چه پایه‌ایه؟»

متوسطه اول/دوم:
مسیر ثروت + Business School

تازه‌کنکوری:
+18

# 12. مدارس و سازمان‌ها
حذف نشوند؛ فقط Secondary placement داشته باشند.
Routes قبلی حفظ شوند:
- /collaboration/schools
- /collaboration/organizations

# 13. لحن متن‌ها
کمتر:
- سرمایه‌گذاری حرفه‌ای
- ترید حرفه‌ای
- بازارهای مالی پیشرفته

بیشتر:
- تجربه
- هوش مالی
- تصمیم‌گیری
- شناخت پول
- بازار
- سرمایه‌گذاری
- کسب‌وکار
- چالش
- بازی

# 14. Event Config پیشنهادی
```json
{
  "event": {
    "name": "باغ مدرسه",
    "venue": "باغ کتاب تهران",
    "startTime": "15:00",
    "endTime": "22:00",
    "audiencePriority": [
      "student",
      "parent",
      "recent-konkur",
      "school",
      "organization"
    ]
  }
}
```

# 15. Product Display Priority
```json
{
  "defaultProductOrder": [
    "masir-servat-one-day",
    "business-school",
    "plus18"
  ],
  "recentKonkurProductOrder": [
    "plus18",
    "masir-servat-one-day",
    "business-school"
  ]
}
```

# 16. UI Priority
تلویزیون نباید شبیه کاتالوگ دوره باشد.

باید این حس را بدهد:
بازی کن → خودت را محک بزن → نتیجه بگیر → مسیر مناسب را ببین

# 17. بدون تغییر بنیادی
این بخش‌ها همان نسخه قبلی بمانند:
- Quiz engine
- Score logic
- Recommendation engine
- QR
- Auto reset
- Offline mode
- Analytics
- School flow
- Organization flow
- +18 data
- Business School data
- Masir Servat data
- Lead / QR logic

فقط Priority، Event Context و Schedule اصلاح می‌شود.

# 18. خروجی مورد انتظار از برنامه‌نویس برای Review
1. Attract
2. Home
3. Student flow
4. Quiz
5. Result
6. Masir Servat
7. Business School
8. +18
9. School
10. Organization
11. Live activity countdown
12. QR screen

بعد روی خود تلویزیون QA انجام می‌شود.

# FINAL NOTE
آخرین جهت‌گیری محصول:

«اول تجربه، بعد معرفی، بعد فروش.»

نه:
«اول دوره، بعد توضیح، بعد ثبت‌نام.»
