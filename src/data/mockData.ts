import { BusinessProfile, BillboardBanner, CategoryItem } from '../types';
import { MOCK_PROFILES_20 } from './mockProfilesData';
import { MOCK_ADS_22 } from './mockAdsData';
import { MOCK_STORIES_10 } from './mockStoriesData';

export const TOP_CATEGORIES: CategoryItem[] = [
  { id: '1', title: 'تولید', icon: 'Factory' },
  { id: '2', title: 'نخ و الیاف', icon: 'Disc' },
  { id: '3', title: 'پارچه', icon: 'Layers' },
  { id: '4', title: 'الگو و برش', icon: 'Scissors' },
  { id: '5', title: 'آموزش', icon: 'GraduationCap' },
  { id: '6', title: 'چاپ پارچه', icon: 'Printer' },
  { id: '7', title: 'گلدوزی', icon: 'Sparkles' },
  { id: '8', title: 'چرخ خیاطی', icon: 'Cog' },
  { id: '9', title: 'ابزار و لوازم', icon: 'Wrench' },
  { id: '10', title: 'بسته‌بندی', icon: 'Package' },
  { id: '11', title: 'خرج‌کار', icon: 'Tag' },
  { id: '12', title: 'دکمه و زیپ', icon: 'Sliders' },
  { id: '13', title: 'ملزومات دوخت', icon: 'Needle' },
  { id: '14', title: 'اتو و تکمیل', icon: 'Flame' },
  { id: '15', title: 'خدمات برش', icon: 'Grid' },
  { id: '16', title: 'شستشو و رنگرزی', icon: 'Droplets' },
  { id: '17', title: 'طراح لباس', icon: 'Palette' },
  { id: '18', title: 'تریکو و بافت', icon: 'Boxes' },
  { id: '19', title: 'چرم و یراق', icon: 'ShieldCheck' },
  { id: '20', title: 'اکسسوری', icon: 'Shirt' },
];

export const WORK_CATEGORIES_12 = [
  { id: 'c1', title: 'مواد اولیه', sub: 'نخ و الیاف طبیعی و مصنوعی', icon: 'Layers', color: 'from-amber-500/10 to-amber-600/10 text-amber-700' },
  { id: 'c2', title: 'نخ و الیاف', sub: 'اسپان، پلی‌استر، پنبه و ویسکوز', icon: 'Disc', color: 'from-blue-500/10 to-blue-600/10 text-blue-700' },
  { id: 'c3', title: 'پارچه و منسوجات', sub: 'طاقه‌ای، کیلویی، فاستونی، کرپ', icon: 'Grid', color: 'from-emerald-500/10 to-emerald-600/10 text-emerald-700' },
  { id: 'c4', title: 'خرج کار و ملزومات', sub: 'دکمه، زیپ، لایی، مارک و اتیکت', icon: 'Tag', color: 'from-purple-500/10 to-purple-600/10 text-purple-700' },
  { id: 'c5', title: 'ماشین‌آلات صنعتی', sub: 'چرخ‌های راسته، میان‌دوز، سردوز', icon: 'Cog', color: 'from-cyan-500/10 to-cyan-600/10 text-cyan-700' },
  { id: 'c6', title: 'لوازم و تجهیزات', sub: 'قیچی برقی، اتو بخار، میز مکش', icon: 'Wrench', color: 'from-indigo-500/10 to-indigo-600/10 text-indigo-700' },
  { id: 'c7', title: 'چاپ و گلدوزی', sub: 'سابلیمیشن، سیلک، دیجیتال، ۱۰ کله', icon: 'Printer', color: 'from-orange-500/10 to-orange-600/10 text-orange-700' },
  { id: 'c8', title: 'بسته‌بندی و لیبل', sub: 'سلفون، کاور، جعبه و کارتن پوشاک', icon: 'Package', color: 'from-orange-500/10 to-orange-600/10 text-orange-700' },
  { id: 'c9', title: 'خدمات فنی و مهندسی', sub: 'تعمیرات تخصصی بردهای کامپیوتری', icon: 'Cpu', color: 'from-teal-500/10 to-teal-600/10 text-teal-700' },
  { id: 'c10', title: 'خدمات تولیدی', sub: 'مزدی‌دوزی تریکو، مانتو، کاپشن، شلوار', icon: 'Factory', color: 'from-violet-500/10 to-violet-600/10 text-violet-700' },
  { id: 'c11', title: 'طراحی و الگو', sub: 'گربر، جمینی، کلو تری‌دی و پلات', icon: 'Palette', color: 'from-fuchsia-500/10 to-fuchsia-600/10 text-fuchsia-700' },
  { id: 'c12', title: 'استوک / آماده‌به‌کار', sub: 'ضایعات پارچه، دستگاه دست دوم، مازاد', icon: 'Boxes', color: 'from-amber-600/10 to-red-500/10 text-red-700' },
];

export const BILLBOARD_BANNERS: BillboardBanner[] = [
  {
    id: 'b1',
    title: 'جشنواره بزرگ ماشین‌آلات دوخت صنعتی جک و زوژه',
    subtitle: 'تخفیف ویژه تولیدکنندگان پوشاک به همراه گارانتی ۳۶ ماهه طلایی و اقساط ۶ ماهه بدون کارمزد',
    badge: 'جشنواره فصلی',
    imageUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=1200&q=80',
    linkText: 'مشاهده شرایط اقساط',
    bgColor: 'from-zinc-900 via-neutral-900 to-amber-950',
  },
  {
    id: 'b2',
    title: 'تأمین مستقیم پارچه کرپ مازراتی و پرشیا از کارخانه',
    subtitle: 'عرض ۱۵۰ با تضمین ثبات رنگ، بدون پرزدهی، ویژه مزون‌ها و کارگاه‌های مانتو با ارسال رایگان نمونه کالیته',
    badge: 'فروش مستقیم',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    linkText: 'دریافت کالیته رنگ',
    bgColor: 'from-blue-950 via-slate-900 to-indigo-950',
  },
  {
    id: 'b3',
    title: 'خدمات برش تمام اتوماتیک CNC با پلاتر گربر',
    subtitle: 'بهینه‌ترین چیدمان الگو با کمترین میزان دورریز پارچه، تحویل سریع سفارشات سری‌دوزی تا روزانه ۵۰۰۰ دست',
    badge: 'خدمات ویژه',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    linkText: 'استعلام قیمت برش',
    bgColor: 'from-emerald-950 via-teal-950 to-zinc-900',
  },
];

// ۲۰ پروفایل غنی کسب‌وکار صنعت نساجی و پوشاک
export const MOCK_PROFILES: Record<string, BusinessProfile> = MOCK_PROFILES_20;

// ۲۲ آگهی استاندارد با ویدیو، نسبت ابعاد افقی و عمودی، کیفیت 1080p FHD
export const MOCK_ADS = MOCK_ADS_22;

// ۱۰ استوری فعال با ویدیو و تصویر در دسته‌بندی‌های مختلف
export const MOCK_STORIES = MOCK_STORIES_10;

export const CITIES_LIST = [
  { id: 'tehran', name: 'تهران', province: 'تهران' },
  { id: 'esfahan', name: 'اصفهان', province: 'اصفهان' },
  { id: 'tabriz', name: 'تبریز', province: 'آذربایجان شرقی' },
  { id: 'mashhad', name: 'مشهد', province: 'خراسان رضوی' },
  { id: 'yazd', name: 'یزد', province: 'یزد' },
  { id: 'karaj', name: 'کرج', province: 'البرز' },
  { id: 'qazvin', name: 'قزوین', province: 'قزوین' },
  { id: 'kashan', name: 'کاشان', province: 'اصفهان' },
  { id: 'delijan', name: 'دلیجان', province: 'مرکزی' },
  { id: 'shiraz', name: 'شیراز', province: 'فارس' },
  { id: 'qom', name: 'قم', province: 'قم' },
];

export const EXPLORE_GRID_ITEMS = MOCK_ADS_22;

export const MAP_LOCATIONS = [
  { id: 'm1', name: 'تولیدی پارس دوخت (مرکز تهران)', adId: 'ad-1', authorId: 'user-1', category: 'خدمات تولیدی', specialty: 'تولید و سری دوزی مانتو و کاپشن', lat: 35.6790, lng: 51.4180, area: 'بازار بزرگ، سرای فردوس', rating: 4.8 },
  { id: 'm2', name: 'بازرگانی نساجی اصفهان بافت', adId: 'ad-2', authorId: 'user-2', category: 'پارچه و منسوجات', specialty: 'تریکو یکرو و دورو پنبه، ویسکوز', lat: 32.6546, lng: 51.6680, area: 'میدان امام، سرای مخلص', rating: 4.6 },
  { id: 'm3', name: 'بازرگانی تجهیزات مدرن چرخ', adId: 'ad-3', authorId: 'user-3', category: 'ماشین‌آلات صنعتی', specialty: 'واردات چرخ خیاطی صنعتی جک و ژوکی', lat: 35.6965, lng: 51.4045, area: 'خیابان جمهوری، پاساژ کاوه', rating: 4.9 },
  { id: 'm4', name: 'بنکداری خرج‌کار مشیرخلوت', adId: 'ad-4', authorId: 'user-7', category: 'خرج کار و ملزومات', specialty: 'انواع زیپ فلزی YKK، دکمه و یراق', lat: 35.6740, lng: 51.4230, area: 'بازار بزرگ، سرای مشیرخلوت', rating: 4.6 },
  { id: 'm5', name: 'استودیو الگوسازان نوین فاطمی', adId: 'ad-5', authorId: 'user-4', category: 'طراحی و الگو', specialty: 'طراحی با نرم افزار جمینی و CLO 3D', lat: 35.7160, lng: 51.4060, area: 'خیابان فاطمی، مجتمع بهاران', rating: 4.7 },
  { id: 'm6', name: 'کارخانجات ریسندگی یزد ترمه', adId: 'ad-6', authorId: 'user-5', category: 'مواد اولیه', specialty: 'نخ‌های نمره ۲۰ تا ۴۰ شانه و کارد', lat: 31.8974, lng: 54.3569, area: 'شهرک صنعتی یزد، بلوار کاج', rating: 4.9 },
  { id: 'm7', name: 'مجتمع چاپ دیجیتال نقش جهان', adId: 'ad-7', authorId: 'user-6', category: 'چاپ و گلدوزی', specialty: 'چاپ دیجیتال مستقیم و سابلیمیشن', lat: 32.6680, lng: 51.7200, area: 'شهرک صنعتی جی اصفهان', rating: 4.8 },
  { id: 'm8', name: 'مرکز برش اتوماتیک CNC سهند', adId: 'ad-8', authorId: 'user-8', category: 'خدمات تولیدی', specialty: 'طاقه‌پهن‌کنی و برش لیزری کامپیوتری', lat: 38.0800, lng: 46.2919, area: 'شهرک صنعتی شهید سلیمی تبریز', rating: 4.8 },
  { id: 'm9', name: 'مهندسی تکنو سرویس دوخت', adId: 'ad-9', authorId: 'user-9', category: 'خدمات فنی و مهندسی', specialty: 'تعمیر تخصصی بردهای الکترونیکی چرخ', lat: 35.6820, lng: 51.4150, area: 'خیابان خیام جنوبی، کوچه مهدویان', rating: 4.9 },
  { id: 'm10', name: 'پارس دوخت (واحد شلوار چهاردانگه)', adId: 'ad-10', authorId: 'user-1', category: 'خدمات تولیدی', specialty: 'خط دوخت صنعتی شلوار جین و کتان', lat: 35.5890, lng: 51.3120, area: 'شهرک صنعتی چهاردانگه', rating: 4.8 },
  { id: 'm11', name: 'شوروم مرکزی مدرن چرخ', adId: 'ad-11', authorId: 'user-3', category: 'ماشین‌آلات صنعتی', specialty: 'میان‌دوز، سردوز و چرخ‌های تخصصی', lat: 35.6975, lng: 51.4030, area: 'خیابان جمهوری، پاساژ سینا', rating: 4.9 },
  { id: 'm12', name: 'صنایع بسته‌بندی پوشاک آریا', adId: 'ad-13', authorId: 'user-10', category: 'بسته‌بندی و لیبل', specialty: 'کاور اسپان‌باند لباس و سلفون چسب‌دار', lat: 35.8327, lng: 50.9915, area: 'کرج، شهرک صنعتی بهارستان', rating: 4.7 },
  { id: 'm13', name: 'نمایندگی نساجی بروجرد', adId: 'ad-14', authorId: 'user-11', category: 'پارچه و منسوجات', specialty: 'تترون، پوپلین و پارچه‌های پنبه‌ای', lat: 35.6940, lng: 51.4190, area: 'تهران، خیابان لاله‌زار', rating: 4.9 },
  { id: 'm14', name: 'ریسندگی تریکوبافی البرز نخ', adId: 'ad-15', authorId: 'user-12', category: 'نخ و الیاف', specialty: 'نخ‌های اسپان پلی‌استر پنبه', lat: 36.2688, lng: 50.0041, area: 'قزوین، شهرک صنعتی کاسپین', rating: 4.7 },
  { id: 'm15', name: 'گلدوزی کامپیوتری بارودان', adId: 'ad-16', authorId: 'user-13', category: 'چاپ و گلدوزی', specialty: 'گلدوزی ۲۰ کله تاجیما و بارودان ژاپن', lat: 35.6690, lng: 51.4160, area: 'تهران، میدان محمدیه، پاساژ سعادت', rating: 4.8 },
  { id: 'm16', name: 'تجهیزات اتو سیلتر گلوبندک', adId: 'ad-17', authorId: 'user-14', category: 'لوازم و تجهیزات', specialty: 'اتوبخار مخزن‌دار و میز مکش صنعتی', lat: 35.6760, lng: 51.4170, area: 'تهران، چهارراه گلوبندک', rating: 4.9 },
  { id: 'm17', name: 'کت و شلوار دست‌دوز رجال مشهد', adId: 'ad-18', authorId: 'user-15', category: 'خدمات تولیدی', specialty: 'مزدی‌دوزی سفارشی فاستونی جامعه و مطهری', lat: 36.3155, lng: 59.5480, area: 'مشهد، بلوار سجاد', rating: 4.8 },
  { id: 'm18', name: 'مرکز الیاف پلی‌استر دلیجان', adId: 'ad-19', authorId: 'user-16', category: 'مواد اولیه', specialty: 'الیاف هالو سیلیکونی کالای خواب', lat: 33.9904, lng: 50.6837, area: 'دلیجان، شهرک صنعتی بوعلی', rating: 4.6 },
  { id: 'm19', name: 'دکمه‌سازی صدفی زاگرس مشهد', adId: 'ad-20', authorId: 'user-17', category: 'خرج کار و ملزومات', specialty: 'دکمه‌های صدفی طبیعی رودخانه‌ای و چوب', lat: 36.2890, lng: 59.6100, area: 'مشهد، میدان ۱۷ شهریور', rating: 4.8 },
  { id: 'm20', name: 'رنگرزی و تکمیل حریر کویر کاشان', adId: 'ad-21', authorId: 'user-18', category: 'خدمات تولیدی', specialty: 'رنگرزی راکتیو و سانفورایز پارچه', lat: 33.9850, lng: 51.4100, area: 'کاشان، شهرک صنعتی راوند', rating: 4.7 },
  { id: 'm21', name: 'قطعات یدکی چرخ خیاطی سینا', adId: 'ad-3', authorId: 'user-19', category: 'لوازم و تجهیزات', specialty: 'تیغ‌های برش، کمپلت و سوزن اشمیتس', lat: 35.6970, lng: 51.4050, area: 'تهران، جمهوری، پاساژ سینا', rating: 4.9 },
  { id: 'm22', name: 'تولیدی پوشاک جین آرارات تبریز', adId: 'ad-22', authorId: 'user-20', category: 'خدمات تولیدی', specialty: 'دوخت شلوار جین و سنگ‌شویی مدرن', lat: 38.0400, lng: 46.2200, area: 'تبریز، جاده آذرشهر', rating: 4.8 },
];
