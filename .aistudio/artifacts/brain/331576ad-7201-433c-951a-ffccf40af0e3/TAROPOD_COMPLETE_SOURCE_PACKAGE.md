# بسته جامع و نهایی کلیه سورس‌کدهای پروژه تاروپود (Taropod)

**تاریخ نسخه:** سپتامبر ۲۰۲۶  
**مرحله:** پایان مرحله اول پیاده‌سازی مدل کانونی (Stage 1 - Canonical Architecture & Compatibility Layer)  
**وضعیت بیلد:** کامپایل ۱۰۰٪ موفق، تایپ‌چک بدون خطا (`tsc --noEmit`)، اجرای موفق تمامی تست‌ها  

---

## ۱. محتویات بسته ZIP کامل سورس‌کدها

این بسته شامل **کل فایل‌های پروژه از ابتدا تا آخرین خط کدهای جدید** است و تنها به تغییرات اخیر محدود نمی‌شود:

1. **مستندات معماری و ممیزی فنی:**
   * `docs/TAROPOD_CANONICAL_MODEL.md` — سند جامع قرارداد ترمینولوژی کانونی، تعریف ۱۰گانه اشیاء بازار، ۱۴ نقش بازیگران، ۶ لایه خاستگاه داده و جدول تفصیلی لایه سازگاری امن.
   * `TAROPOD_ARCHITECTURE_AUDIT.md` — گزارش کامل ممیزی فنی و نقشه‌برداری معماری وضعیت موجود سامانه.

2. **مدل دامنه کانونی و لایه سازگاری امن (کدهای جدید):**
   * `server/modules/canonical/types.ts` — تعاریف رسمی و تایپ‌های کانونی (Actor, Profile, Role, MarketObject, Intent, State Separation, Provenance).
   * `server/modules/canonical/compatibility.adapter.ts` — کلاس مبدل سازگاری دوطرفه (`CanonicalCompatibilityAdapter`) با حفظ ۱۰۰٪ یکپارچگی دیتابیس موجود و قراردادهای API.
   * `src/canonical/index.ts` — ماژول دسترسی ایزومورفیک کلاینت و سرور به تعاریف کانونی.
   * `server/tests/canonical-compatibility.test.ts` — تست‌های خودکار صحت‌سنجی نگاشت دوطرفه و سازگاری با رکوردهای زنده دیتابیس PostgreSQL.

3. **هسته بک‌اند ماژولار Express:**
   * `server/modules/listings/` — مدیریت چرخه حیات آگهی‌ها (پیش‌نویس، انتشار، رسانه رابطه‌ای، موقعیت مکانی).
   * `server/modules/profiles/` — شناسنامه B2B فرد و کسب‌وکار، ثبت سوابق، اعتبارسنجی بیس‌لاین، گواهی‌ها و امتیازدهی تعاملی.
   * `server/modules/businesses/` — ساختار کارگاه‌ها، اسلاگ یکتا، مالکیت و اعضای چندنقشی.
   * `server/modules/taxonomy/` — درخت و سلسله‌مراتب دسته‌بندی‌های ۱۱گانه صنعت نساجی.
   * `server/modules/explore/` — جستجوی پیشرفته، فیلتر شهر/استان/دسته و فید عمومی.
   * `server/modules/locations/` — پایگاه داده جغرافیایی و توزیع مکانی کارگاه‌ها روی نقشه.
   * `server/modules/ai/` — سرویس مشاوره هوش مصنوعی نساجی با Google GenAI SDK.
   * `server/middleware/` — میدلورهای احراز هویت، انولوپ استاندارد پاسخ API و محدودکننده نرخ.

4. **فرانت‌اند React 19 + Tailwind CSS v4:**
   * `src/components/ColorPalettePickerModal.tsx` و `src/utils/themePalette.ts` — کالیته ۵ رنگ برندینگ نساجی با تغییر آنی متغیرهای CSS.
   * `src/components/DownloadSourceButton.tsx` — ابزار دانلود مستقیم و بدون واسطه فایل ZIP از حافظه مرورگر.
   * `src/components/ExploreMarket.tsx` و `src/components/HomeFeed.tsx` — فیدهای کشف بازار، استوری‌ها و کارت‌های B2B.
   * `src/components/CustomMediaPlayer.tsx` — پلیر ویدیوی چندنسبتی تخصصی منسوجات.
   * `src/components/ProfileView.tsx` — نمایش شناسنامه غنی B2B.

5. **پایگاه‌داده و زیرساخت:**
   * `src/db/schema.ts` — اسکیمای جامع رابطه‌ای Drizzle ORM برای PostgreSQL.
   * `drizzle/` — فایل‌های اسنپ‌شات و مایگریشن‌های ساختاری.
   * کلیه کانفیگ‌ها: `package.json`، `tsconfig.json`، `vite.config.ts`، `server.ts`، `.env.example`.

---

## ۲. روش‌های دریافت و استخراج فایل

1. **در داخل تب تنظیمات (Settings) اپلیکیشن:**
   * روی دکمه نارنجی «دانلود فوری ZIP سورس‌کد خالص» کلیک کنید تا فایل مستقیماً و بدون خروج از صفحه در مرورگر شما دانلود شود.
2. **در صفحه اختصاصی دانلود:**
   * با مراجعه به مسیر `/download`، امکان دانلود بسته کامل (همراه با عکس‌ها) یا بسته سبک خالص را دارید.
