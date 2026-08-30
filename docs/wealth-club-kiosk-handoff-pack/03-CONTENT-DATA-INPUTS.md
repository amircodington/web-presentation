# 03 — CONTENT & DATA INPUTS REQUIRED FROM WEALTH CLUB
## چه چیزهایی باشگاه ثروت باید به تیم توسعه تحویل دهد؟

> این سند را می‌توانید به‌عنوان Checklist داخلی استفاده کنید.
> هر موردی که هنوز نهایی نشده، با `TBD` تحویل توسعه‌دهنده داده شود تا ساخت سیستم متوقف نشود.

---

# 1. Brand Assets

## Required
- [ ] لوگوی اصلی PNG شفاف
- [ ] لوگوی SVG
- [ ] نسخه سفید لوگو
- [ ] نسخه تیره لوگو
- [ ] رنگ اصلی برند HEX
- [ ] رنگ ثانویه HEX
- [ ] فونت فارسی
- [ ] فونت انگلیسی در صورت نیاز
- [ ] Brand guideline اگر موجود است

## File naming

```text
logo-primary.svg
logo-white.svg
logo-dark.svg
brand.json
```

---

# 2. General Club Information

```yaml
brand_name_fa: باشگاه ثروت
brand_name_en: Wealth Club
short_description_fa: TBD
website: TBD
instagram: TBD
telegram_or_bale: TBD
phone: TBD
whatsapp: TBD
address: TBD
```

---

# 3. +18 Course Data

باشگاه باید این موارد را نهایی کند:

```yaml
id: plus18
title: دوره +18
short_title: +18
hero_title: TBD
hero_subtitle: TBD
target_age: TBD
target_audience: TBD
duration: TBD
sessions_count: TBD
session_duration: TBD
delivery_mode: حضوری / آنلاین / ترکیبی
start_date: TBD
location: TBD
price_regular: TBD
price_festival: TBD
festival_bonus: TBD
capacity: TBD
registration_url: TBD
payment_url: TBD
contact_phone: TBD
```

## Course benefits
حداکثر 5 مورد:

```yaml
benefits:
  - TBD
  - TBD
  - TBD
  - TBD
  - TBD
```

## Topics
حداکثر 8 موضوع:

```yaml
topics:
  - مدیریت پول
  - بودجه‌بندی
  - تورم
  - ریسک
  - سرمایه‌گذاری
  - بازارهای مالی
  - تصمیم‌گیری مالی
  - TBD
```

## Media
- [ ] عکس Hero
- [ ] ویدیوی 15–30 ثانیه‌ای
- [ ] 3 عکس کلاس
- [ ] 1 تصویر مدرس/مدرسین (اختیاری)

---

# 4. Business School Data

```yaml
id: business-school
title: Business School
title_fa: مدرسه کسب‌وکار
hero_title: از یک ایده تا یک کسب‌وکار واقعی
hero_subtitle: TBD
target_age: TBD
duration: TBD
sessions_count: TBD
delivery_mode: TBD
start_date: TBD
location: TBD
price_regular: TBD
price_festival: TBD
capacity: TBD
registration_url: TBD
```

## Journey Steps
نمونه:

```yaml
journey:
  - ایده
  - شناخت مشتری
  - مدل کسب‌وکار
  - پول و اقتصاد
  - بازاریابی
  - فروش
  - ارائه و اجرا
```

## Outcomes
حداکثر 5 مورد:

```yaml
outcomes:
  - TBD
  - TBD
  - TBD
  - TBD
  - TBD
```

---

# 5. Workshops Data

برای هر ورکشاپ یک Record:

```yaml
id: ws-001
title: TBD
short_description: TBD
target_age: TBD
audience: TBD
date: TBD
start_time: TBD
duration: TBD
teacher: TBD
location: TBD
price_regular: TBD
price_festival: TBD
capacity: TBD
registration_url: TBD
active: true
```

حداقل 3 ورکشاپ پیشنهادی آماده باشد.

---

# 6. School / B2B Data

## باشگاه باید مشخص کند

- [ ] دقیقاً چه خدماتی به مدرسه می‌فروشد؟
- [ ] حداقل تعداد دانش‌آموز برای اجرا
- [ ] محدوده سنی
- [ ] حضوری / آنلاین
- [ ] تهران / شهرستان
- [ ] مدل قیمت‌گذاری
- [ ] امکان اجرای سفارشی
- [ ] پروپوزال PDF
- [ ] شماره تماس B2B
- [ ] فرد مسئول B2B
- [ ] فرم درخواست همکاری

## Suggested Services

```yaml
school_services:
  - کارگاه تک‌جلسه‌ای سواد مالی
  - دوره چندجلسه‌ای
  - Business School
  - رویداد دانش‌آموزی
  - مسابقه / چالش مالی
  - برنامه اختصاصی مدرسه
```

---

# 7. Organization / B2B-B2G Data

## Required

```yaml
organization_contact_person: TBD
organization_phone: TBD
organization_email: TBD
proposal_url: TBD
meeting_request_url: TBD
```

## Service list

```yaml
services:
  - آموزش سواد مالی کارکنان
  - آموزش فرزندان کارکنان
  - برنامه نوجوانان و جوانان
  - طراحی رویداد
  - برنامه‌های ترویجی
  - پروژه‌های سفارشی
```

## Proof / Credibility
فقط داده واقعی:

- تعداد دوره‌های برگزارشده: TBD
- تعداد شرکت‌کنندگان: TBD
- سازمان‌های همکار: TBD
- شهرها / مناطق اجرا: TBD
- رضایت مخاطب: TBD

---

# 8. Festival Offer

یک Offer اصلی بهتر از 5 Offer مختلف است.

```yaml
offer_active: true
offer_title: پیشنهاد ویژه جشنواره باغ کتاب
offer_description: TBD
original_price: TBD
festival_price: TBD
discount_percent: TBD
bonus: TBD
valid_until: TBD
promo_code: TBD
```

## تصمیم‌های لازم
- [ ] تخفیف واقعی چیست؟
- [ ] تا چه تاریخی معتبر است؟
- [ ] برای کدام دوره‌هاست؟
- [ ] قابل ترکیب با تخفیف دیگر هست یا نه؟
- [ ] آیا رزرو با بیعانه داریم؟
- [ ] آیا ظرفیت محدود نمایش می‌دهیم؟

---

# 9. Lead Capture

## Required Fields Decision

پیشنهاد:
```yaml
required:
  - first_name
  - mobile
```

Optional:
```yaml
optional:
  - age_group
  - audience_type
  - product_interest
```

## Consent text
باشگاه باید متن نهایی تایید ارتباط را بدهد.

مثال:
```text
با ثبت شماره، موافقم اطلاعات دوره‌ها و برنامه‌های باشگاه ثروت برای من ارسال شود.
```

---

# 10. QR Destinations

این لینک‌ها باید از سمت باشگاه ارائه شوند:

```yaml
qr_general: TBD
qr_plus18: TBD
qr_business_school: TBD
qr_workshops: TBD
qr_school: TBD
qr_organization: TBD
qr_test_result: TBD
```

---

# 11. Contact Information

برای نمایش در حالت fallback:

```yaml
phone: TBD
mobile: TBD
website: TBD
instagram: TBD
bale: TBD
telegram: TBD
whatsapp: TBD
```

---

# 12. Testimonials — Optional

اگر استفاده می‌شود فقط واقعی:

```yaml
testimonials:
  - name: TBD
    role: دانش‌آموز / والد / مدیر مدرسه
    text: TBD
    permission: true
```

---

# 13. Media Checklist

## Photos
- [ ] محیط کلاس
- [ ] نوجوانان
- [ ] جوانان
- [ ] ورکشاپ
- [ ] مدرس
- [ ] فعالیت گروهی
- [ ] رویداد

## Videos
- [ ] 15s brand loop
- [ ] 15–30s +18
- [ ] 15–30s Business School
- [ ] Short workshop loop

## Export
Preferred:
- Images: WebP
- Video: MP4 H.264
- 1080p max unless needed

---

# 14. Content Length Limits

برای Touchscreen:

```text
Hero title: 6–10 words
Subtitle: 12–20 words
Card title: 2–5 words
Card description: 8–16 words
Button: 2–4 words
Course description: max 40–60 words
```

---

# 15. Data Ownership Table

| Data | Owner |
|---|---|
| Brand assets | باشگاه ثروت |
| Course info | باشگاه ثروت |
| Prices | باشگاه ثروت |
| Dates | باشگاه ثروت |
| Offer | باشگاه ثروت |
| QR destinations | باشگاه ثروت |
| UI implementation | Developer |
| Quiz engine | Developer |
| Quiz content | مشترک |
| Recommendation rules | مشترک |
| Analytics | Developer |
| Offline behavior | Developer |
| Lead API | Developer / Backend |
| B2B copy | باشگاه ثروت |

---

# 16. Minimum Data Needed To Start Coding

Developer does NOT need all final content.

برای شروع همین‌ها کافی است:

```yaml
logo: placeholder
primary_color: placeholder
plus18_title: دوره +18
business_school_title: Business School
workshops_count: 3 placeholder
quiz_questions: 6
qr_links: placeholder
```

پس توسعه نباید منتظر نهایی شدن قیمت و محتوا بماند.

---

# 17. Final Pre-Event Content Freeze

حداقل 24 ساعت قبل از اجرا:

- [ ] قیمت‌ها نهایی
- [ ] تاریخ‌ها نهایی
- [ ] QR تست شده
- [ ] آفر نهایی
- [ ] شماره تماس نهایی
- [ ] ورکشاپ‌ها نهایی
- [ ] لوگو/تصاویر نهایی
- [ ] متن B2B نهایی
- [ ] لینک ثبت‌نام نهایی

# END
