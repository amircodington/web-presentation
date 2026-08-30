# 04 — QUIZ & RECOMMENDATION LOGIC
## Financial IQ / Financial Personality Test — MVP Spec

> هدف تست: Engagement + Segmentation + Recommendation
> این تست ابزار تشخیص تخصصی یا روان‌شناختی نیست.

---

# 1. Quiz Length

MVP:
- 6 سوال
- 4 گزینه
- 45–90 ثانیه

---

# 2. Questions Data Structure

```json
{
  "id": "q1",
  "text": "اگر ناگهان 20 میلیون تومان پول اضافه به دستت برسد، اولین کارت چیست؟",
  "answers": [
    {"id": "a1", "text": "خرجش می‌کنم.", "score": 1},
    {"id": "a2", "text": "نگهش می‌دارم.", "score": 2},
    {"id": "a3", "text": "بخشی را خرج و بخشی را پس‌انداز می‌کنم.", "score": 3},
    {"id": "a4", "text": "بررسی می‌کنم چطور می‌توانم آن را رشد بدهم.", "score": 4}
  ]
}
```

---

# 3. MVP Questions

## Q1 — پول اضافه
اگر ناگهان 20 میلیون تومان پول اضافه به دستت برسد، اولین کارت چیست؟

1. خرجش می‌کنم.
2. نگهش می‌دارم.
3. بخشی را خرج و بخشی را پس‌انداز می‌کنم.
4. بررسی می‌کنم چطور می‌توانم آن را رشد بدهم.

## Q2 — خرید
وقتی می‌خواهی چیزی نسبتاً گران بخری...

1. اگر دوستش داشته باشم می‌خرم.
2. قیمت چند جا را چک می‌کنم.
3. اول بررسی می‌کنم واقعاً به آن نیاز دارم یا نه.
4. علاوه بر نیاز، هزینه فرصت آن پول را هم در نظر می‌گیرم.

## Q3 — افزایش درآمد
اگر درآمدت بیشتر شود، احتمالاً چه اتفاقی می‌افتد؟

1. مخارجم هم بیشتر می‌شود.
2. بیشتر پس‌انداز می‌کنم.
3. برای پولم برنامه مشخص می‌سازم.
4. بخشی را برای سرمایه‌گذاری کنار می‌گذارم.

## Q4 — سرمایه‌گذاری
در مورد سرمایه‌گذاری کدام جمله بیشتر شبیه توست؟

1. هنوز چیز زیادی نمی‌دانم.
2. شنیده‌ام ولی شروع نکرده‌ام.
3. چند بازار را می‌شناسم.
4. قبل از تصمیم، ریسک و بازده را مقایسه می‌کنم.

## Q5 — هیجان بازار
اگر قیمت یک دارایی به‌شدت بالا برود...

1. سریع می‌خرم که جا نمانم.
2. از بقیه می‌پرسم چه کار کنم.
3. صبر می‌کنم و اطلاعات جمع می‌کنم.
4. علت رشد، ریسک و ارزش آن را بررسی می‌کنم.

## Q6 — برنامه مالی
برای پولت برنامه ماهانه داری؟

1. نه.
2. بیشتر ذهنی.
3. تا حدی.
4. بله، درآمد، هزینه، پس‌انداز و سرمایه‌گذاری را جدا می‌کنم.

---

# 4. Scoring

Each answer:
1–4

For 6 questions:

```text
min = 6
max = 24
```

Normalize:

```js
const normalized = Math.round(
  ((rawScore - 6) / (24 - 6)) * 100
)
```

Clamp 0–100.

---

# 5. Result Bands

```js
if (score <= 30) result = "starter"
else if (score <= 55) result = "growing"
else if (score <= 80) result = "decision-maker"
else result = "strategist"
```

---

# 6. Result Content

## starter
Title:
`شروع مسیر`

Text:
`تو تازه وارد دنیای تصمیم‌های مالی شدی. با چند مهارت پایه می‌تونی خیلی سریع جلو بیفتی.`

## growing
Title:
`پول‌بلد در حال رشد`

Text:
`بعضی تصمیم‌های مالی رو خوب می‌گیری، اما هنوز چند نقطه مهم برای رشد داری.`

## decision-maker
Title:
`تصمیم‌گیر مالی`

Text:
`قبل از تصمیم فکر می‌کنی و نگاه مالی خوبی داری. مرحله بعد، ساختن یک چارچوب جدی‌تره.`

## strategist
Title:
`استراتژیست مالی`

Text:
`نگاهت به پول، ریسک و تصمیم‌گیری از خیلی‌ها جلوتره. وقت عمیق‌تر شدن در سرمایه‌گذاری و کسب‌وکاره.`

---

# 7. Recommendation Rules — MVP

Pseudo:

```js
function recommend({ audience, ageGroup, score }) {
  if (audience === "school") {
    return ["school-program"];
  }

  if (audience === "organization") {
    return ["organization-program"];
  }

  if (audience === "parent") {
    if (ageGroup === "8-11") return ["kids-financial-literacy"];
    if (ageGroup === "12-14") return ["teen-financial-literacy"];
    if (ageGroup === "15-17") return ["business-school"];
    if (ageGroup === "18+") return ["plus18"];
  }

  if (audience === "student") {
    return ["business-school", "workshops"];
  }

  if (audience === "young-adult") {
    if (score <= 55) return ["plus18", "beginner-workshop"];
    return ["plus18", "investment-workshop"];
  }

  return ["plus18", "business-school"];
}
```

---

# 8. Optional Dimension Scoring — V2

بعداً می‌توان هر سوال را به Dimension وصل کرد:

```text
budgeting
decision-making
investment
risk
discipline
financial-awareness
```

Result:
```json
{
  "overall": 72,
  "dimensions": {
    "budgeting": 65,
    "decisionMaking": 80,
    "investment": 55,
    "risk": 75
  }
}
```

این برای نتیجه جذاب‌تر مفید است ولی برای MVP ضروری نیست.

---

# 9. Analytics Payload

On completion:

```json
{
  "event": "test_completed",
  "sessionId": "...",
  "audience": "young-adult",
  "ageGroup": "18-24",
  "rawScore": 19,
  "score": 72,
  "resultType": "decision-maker",
  "recommendedProducts": ["plus18", "investment-workshop"]
}
```

---

# 10. Disclaimer

در صفحه نتیجه یا Footer کوچک:

```text
این تست صرفاً برای تجربه آموزشی و پیشنهاد مسیر مناسب طراحی شده و ارزیابی تخصصی مالی یا روان‌شناختی نیست.
```

# END
