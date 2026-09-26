import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Type,
  Layers,
  Home,
  Search,
  Plus,
  Bookmark,
  Share2,
  MapPin,
  MessageSquare,
  SlidersHorizontal,
  Bell,
  User,
  Check,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface DesignSystemCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ۱. کالیته پالت‌های رنگی سازمانی و مکمل
const COLOR_PALETTES = [
  {
    id: 'palette-terracotta',
    name: 'تاروپود اصیل (کهربایی و زعفرانی)',
    subtitle: 'پیشنهادی پیش‌فرض • تداعی‌گر نخ ریسی، رنگرزی سنتی و پویایی بازار',
    isRecommended: true,
    primary: { name: 'نارنجی کهربایی (رنگ اصلی)', hex: '#ea580c', tw: 'bg-orange-600', text: 'text-orange-600' },
    secondary: { name: 'طلایی زعفرانی (ثانویه)', hex: '#d97706', tw: 'bg-amber-600', text: 'text-amber-600' },
    accent: { name: 'فیروزه‌ای نساجی (مکمل و کنتراست)', hex: '#0f766e', tw: 'bg-teal-700', text: 'text-teal-700' },
    neutralDark: { name: 'دودی تیره (متون اصلی)', hex: '#18181b', tw: 'bg-zinc-900', text: 'text-zinc-900' },
    neutralLight: { name: 'عاجی استخوانی (پس‌زمینه نرم)', hex: '#f4f4f5', tw: 'bg-zinc-100', text: 'text-zinc-100' },
    description: 'کنتراست عالی WCAG AAA برای متون و دکمه‌ها، هویت متناسب با گرمای بافت و پوشاک.',
  },
  {
    id: 'palette-indigo-gold',
    name: 'سرمه‌ای صنعتی و طلایی کالیته',
    subtitle: 'رسمی و باوقار • مناسب پلتفرم‌های B2B، بازرگانی عمده و ماشین‌آلات',
    isRecommended: false,
    primary: { name: 'سرمه‌ای نفتی (رنگ اصلی)', hex: '#1e3a8a', tw: 'bg-blue-900', text: 'text-blue-900' },
    secondary: { name: 'آبی جین متالیک (ثانویه)', hex: '#0284c7', tw: 'bg-sky-600', text: 'text-sky-600' },
    accent: { name: 'طلایی متالیک (مکمل پروموشن)', hex: '#f59e0b', tw: 'bg-amber-500', text: 'text-amber-500' },
    neutralDark: { name: 'آنتراسیت صنعتی', hex: '#0f172a', tw: 'bg-slate-900', text: 'text-slate-900' },
    neutralLight: { name: 'نقره‌ای روشن', hex: '#f8fafc', tw: 'bg-slate-50', text: 'text-slate-50' },
    description: 'اعتمادآفرین و استوار برای قراردادهای تیراژ بالا و کارخانجات بزرگ صنعتی.',
  },
  {
    id: 'palette-crimson',
    name: 'زرشکی روناسی و یشمی سنتی',
    subtitle: 'فاخر و هنری • الهام‌گرفته از ترمه، فرش اصیل و پارچه‌های دست‌بافت',
    isRecommended: false,
    primary: { name: 'زرشکی روناسی (رنگ اصلی)', hex: '#991b1b', tw: 'bg-red-800', text: 'text-red-800' },
    secondary: { name: 'عقیقی گرم (ثانویه)', hex: '#c2410c', tw: 'bg-orange-700', text: 'text-orange-700' },
    accent: { name: 'یشمی تاروپود (مکمل هارمونی)', hex: '#065f46', tw: 'bg-emerald-800', text: 'text-emerald-800' },
    neutralDark: { name: 'آبنوسی فاخر', hex: '#1c1917', tw: 'bg-stone-900', text: 'text-stone-900' },
    neutralLight: { name: 'کتانی طبیعی', hex: '#f5f5f4', tw: 'bg-stone-100', text: 'text-stone-100' },
    description: 'انتخابی ویژه برای بازار طاقه‌فروشی، منسوجات لوکس و کالیته‌های فاخر.',
  },
];

// ۲. کاتالوگ سبک‌های آیکون
const ICON_STYLES = [
  {
    id: 'stroke',
    name: 'خطی مدرن (Stroke / Outline)',
    badge: 'سبک استاندارد فعلی',
    description: 'ضخامت ۱.۶ الی ۲ پیکسل، تر و تمیز، بدون پر کردن فضا، سبک مورد استفاده در اینستاگرام و پلتفرم‌های جهانی مدرن.',
    renderIcon: (IconComponent: React.ComponentType<{ className?: string }>) => (
      <IconComponent className="w-5 h-5 stroke-[1.8] text-zinc-800" />
    ),
  },
  {
    id: 'solid',
    name: 'توپر و سالید (Solid / Filled)',
    badge: 'کنتراست و وزن بالا',
    description: 'آیکون‌های توپر با بیشترین وزن بصری؛ مناسب برای حالت‌های فعال (Active State) و دکمه‌های فراخوان مهم.',
    renderIcon: (IconComponent: React.ComponentType<{ className?: string }>) => (
      <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center p-1">
        <IconComponent className="w-4 h-4 stroke-[2.2] fill-current" />
      </div>
    ),
  },
  {
    id: 'rounded',
    name: 'گوشه‌گرد نرم (Soft / Rounded)',
    badge: 'ارگونومیک و دوستانه',
    description: 'انحنای نرم در تقاطع خطوط و پایانه‌های گرد، حس خوشایند لمسی و راحتی کاربر در صفحات موبایل.',
    renderIcon: (IconComponent: React.ComponentType<{ className?: string }>) => (
      <div className="w-7 h-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200/60">
        <IconComponent className="w-4 h-4 stroke-[2]" />
      </div>
    ),
  },
  {
    id: 'sharp',
    name: 'هندسی و صنعتی (Sharp / Geometric)',
    badge: 'صنعتی و مهندسی',
    description: 'زاویه‌های صریح و دقیق، خطوط شفاف و بدون نرمی افراطی؛ متناسب با ماهیت قطعات مکانیکی و خطوط دوخت.',
    renderIcon: (IconComponent: React.ComponentType<{ className?: string }>) => (
      <div className="w-7 h-7 rounded-none bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-400">
        <IconComponent className="w-4 h-4 stroke-[2.4]" />
      </div>
    ),
  },
];

// ۳. کالیته فونت‌های وب فارسی
const PERSIAN_FONTS = [
  {
    id: 'vazirmatn',
    name: 'وزیرمتن (Vazirmatn)',
    designer: 'صابر راستی‌کردار',
    status: 'فونت فعال جاری سیستم',
    bestFor: 'بهترین انتخاب برای رابط‌های کاربری متراکم، کادرهای قیمت و متون ریز موبایلی',
    features: ['طراحی‌شده بر پایه هندسه دیجیتال و خوانایی در پیکسل‌های ریز', 'اعداد فارسی متناسب و هماهنگ با علائم ارز ریال و تومان', 'پشتیبانی بی‌نقص در همه مرورگرها و فریم‌ورک‌های وب'],
    sampleText: 'طاقه پارچه دورس ۳ نخ خارخورده ۱۰۰٪ پنبه سوپر • ۶۸۰,۰۰۰ تومان',
  },
  {
    id: 'iransans',
    name: 'ایران‌سنس (IRANSansX)',
    designer: 'مسلم ابراهیمی',
    status: 'استاندارد اپلیکیشن‌های معاملاتی و تجاری',
    bestFor: 'پلتفرم‌های بزرگ تجارت الکترونیک (دیوار، دیجی‌کالا، اسنپ)',
    features: ['کشش‌های حساب‌شده و تعادل در فاصله‌گذاری کلمات', 'شخصیت معتمد، آرام و استوار برای معاملات مالی', 'خوانایی عالی در تیترهای بولد و نام کارگاه‌ها'],
    sampleText: 'مجتمع تولیدی پارس دوخت تهران • سری‌دوزی و خط تولید کامپیوتری',
  },
  {
    id: 'iranyekan',
    name: 'ایران‌یکان (IRANYekanX)',
    designer: 'مسلم ابراهیمی',
    status: 'مدرن‌ترین تایپ‌فیس دیجیتال فارسی',
    bestFor: 'بیلبوردهای تبلیغاتی، ویترین‌های مدرن و استارتاپ‌های تکنولوژی نساجی',
    features: ['ترکیبی نوآورانه از ساختار مدرن یکان با نرمی فونت‌های متن', 'اعداد فوق‌العاده زیبا در جداول مشخصات و آمار بازدید', 'قدرت جلب توجه سریع در نگاه اول'],
    sampleText: 'چرخ خیاطی صنعتی تمام اتوماتیک سخنگو جک A5E مدل ۲۰۲۶',
  },
  {
    id: 'shabnam',
    name: 'شبنم (Shabnam)',
    designer: 'صابر راستی‌کردار',
    status: 'کلاسیک و زاویه‌دار',
    bestFor: 'متون طولانی قراردادها، مشخصات فنی الیاف و مقالات آموزشی',
    features: ['زاویه‌های دقیق و ساختار هندسی شفاف', 'کاهش خستگی چشم در متون بیش از ۳ پاراگراف', 'توزیع یکدست جوهر بصری'],
    sampleText: 'ثبت سفارش عمده و استعلام قیمت مواد اولیه ریسندگی و بافندگی',
  },
];

export const DesignSystemCatalogModal: React.FC<DesignSystemCatalogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'icons' | 'fonts'>('colors');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden font-['Vazirmatn',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150">
        
        {/* ۱. هدر مودال کاتالوگ */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">کاتالوگ و کالیته دیزاین سیستم تاروپود</h2>
              <p className="text-[11px] text-zinc-400">راهنمای هویت بصری، رنگ‌ها، آیکون‌ها و تایپوگرافی فارسی</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ۲. زبانه‌های سوئیچ کاتالوگ */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-3 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('colors')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'colors'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>کالیته رنگ‌ها (سازمانی و مکمل)</span>
          </button>

          <button
            onClick={() => setActiveTab('icons')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'icons'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>کاتالوگ آیکون‌ها (۴ سبک)</span>
          </button>

          <button
            onClick={() => setActiveTab('fonts')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'fonts'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>کالیته فونت‌های وب فارسی</span>
          </button>
        </div>

        {/* ۳. محتوای اسکرول‌خور کاتالوگ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right">
          
          {/* تب رنگ‌ها */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3 text-xs text-orange-950 leading-relaxed">
                <span className="font-bold">راهنمای انتخاب هویت رنگ: </span>
                برای سامانه صنعتی و معاملاتی تاروپود، سه پالت هارمونیک تعریف شده است. پالت اول (کهربایی و زعفرانی) هم‌اکنون به عنوان هویت اصلی فعال است.
              </div>

              {COLOR_PALETTES.map((pal) => (
                <div
                  key={pal.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-zinc-900">{pal.name}</h3>
                        {pal.isRecommended && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            پیشنهادی و فعال
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{pal.subtitle}</p>
                    </div>
                  </div>

                  {/* سوئیچ‌های رنگی */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[pal.primary, pal.secondary, pal.accent, pal.neutralDark, pal.neutralLight].map((colorItem) => (
                      <div
                        key={colorItem.hex}
                        onClick={() => handleCopy(colorItem.hex)}
                        className="p-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-white flex items-center justify-between cursor-pointer group transition-all"
                        title="کلیک برای کپی کد رنگ"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg shadow-inner shrink-0 border border-black/10"
                            style={{ backgroundColor: colorItem.hex }}
                          />
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-zinc-800 block leading-tight">
                              {colorItem.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                              {colorItem.hex}
                            </span>
                          </div>
                        </div>
                        {copiedCode === colorItem.hex ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                    💡 {pal.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* تب آیکون‌ها */}
          {activeTab === 'icons' && (
            <div className="space-y-4">
              <div className="bg-zinc-100 rounded-2xl p-3 text-xs text-zinc-700 leading-relaxed">
                آیکون‌های اصلی سامانه (خانه، جستجو، ثبت آگاهی، موقعیت، نشان، اشتراک و...) در ۴ سبک استاندارد زیر پیاده‌سازی شده‌اند.
              </div>

              {ICON_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-zinc-900">{style.name}</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{style.description}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {style.badge}
                    </span>
                  </div>

                  {/* ویترین پیش‌نمایش آیکون‌های متداول در این سبک */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                    {[
                      { label: 'خانه', Comp: Home },
                      { label: 'جستجو', Comp: Search },
                      { label: 'ثبت آگاهی', Comp: Plus },
                      { label: 'نشان', Comp: Bookmark },
                      { label: 'اشتراک', Comp: Share2 },
                      { label: 'موقعیت', Comp: MapPin },
                      { label: 'پیام‌ها', Comp: MessageSquare },
                      { label: 'فیلتر', Comp: SlidersHorizontal },
                    ].map(({ label, Comp }, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors"
                      >
                        {style.renderIcon(Comp)}
                        <span className="text-[10px] text-zinc-500 mt-1 font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* تب فونت‌ها */}
          {activeTab === 'fonts' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 leading-relaxed">
                <span className="font-bold">راهنمای انتخاب فونت: </span>
                برای وب و اپلیکیشن‌های فارسی، فونت باید دارای اعداد کاملاً فارسی و تناسب در متن‌های متراکم فنی باشد.
              </div>

              {PERSIAN_FONTS.map((font) => (
                <div
                  key={font.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-zinc-900">{font.name}</h3>
                        <span className="text-[10px] text-zinc-400">طراح: {font.designer}</span>
                      </div>
                      <p className="text-[11px] text-orange-600 font-medium mt-0.5">{font.status}</p>
                    </div>
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-lg">
                      استاندارد وب
                    </span>
                  </div>

                  {/* نمونه متن و ارقام */}
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                    <span className="text-[10px] text-zinc-400 block">پیش‌نمایش تایپوگرافی و ارقام قیمت:</span>
                    <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-relaxed">
                      {font.sampleText}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-600">
                    <span className="font-bold text-zinc-700">ویژگی‌های کلیدی:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-zinc-500">
                      {font.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ۴. فوتر مودال */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">سامانه جامع صنعت نساجی و پوشاک ایران</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
          >
            تأیید و بستن
          </button>
        </div>

      </div>
    </div>
  );
};
