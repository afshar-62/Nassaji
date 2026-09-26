export interface PaletteOption {
  id: string;
  name: string;
  subtitle: string;
  philosophy: string;
  impact: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgLight: string;
  isRecommended?: boolean;
  recommendationBadge?: string;
  tag: string;
}

export const TAROPOD_PALETTES: PaletteOption[] = [
  {
    id: 'palette-1',
    name: 'کالیته ۱: پویایی خط تولید و دوک بافندگی',
    subtitle: 'نارنجی آجری صنعتی و کبالت متوازن',
    philosophy: 'الهام‌گرفته از قرقره‌های نخ، رنگ قطعات چرخ‌های خیاطی سنگین جک و زوجی و گرمای محیط کارگاهی.',
    impact: 'بالاترین نرخ تبدیل در معاملات سریع، پویایی و ترغیب به ثبت آگهی و تماس تجاری.',
    primaryColor: '#ea580c',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    bgLight: '#fff7ed',
    isRecommended: true,
    recommendationBadge: 'پیشنهاد کارشناسی اول (بیشترین هماهنگی با مارکت‌پلیس)',
    tag: 'Industrial Terra',
  },
  {
    id: 'palette-2',
    name: 'کالیته ۲: ایندیگو سنتی و مس کارگاهی',
    subtitle: 'سرمه‌ای نیل نساجی و مسی متالیک',
    philosophy: 'ریشه‌دارترین رنگ نساجی جهان (نیل و دنیم) در کنار رنگ دندانه‌های فلزی زیپ و قطعات مسی دستگاه‌های بافندگی.',
    impact: 'ایجاد بالاترین حس اطمینان مالی و رسمیت برای قراردادهای تناژ بالا، واردات دستگاه و مبادلات هلدینگی.',
    primaryColor: '#0f2c59',
    secondaryColor: '#e06d26',
    accentColor: '#38bdf8',
    bgLight: '#f1f5f9',
    isRecommended: true,
    recommendationBadge: 'پیشنهاد رسمی و شرکتی (اعتبار هلدینگی و کلان)',
    tag: 'Textile Indigo',
  },
  {
    id: 'palette-3',
    name: 'کالیته ۳: مزارع پنبه و الیاف طبیعی',
    subtitle: 'سبز جنگلی الیاف و سفالین خاکی',
    philosophy: 'ریشه در غوزه‌های پنبه، مزارع کتان و رنگرزی گیاهی دوستدار محیط‌زیست (Eco-Textile).',
    impact: 'آرامش بصری فوق‌العاده برای ساعت‌های طولانی وبگردی، حس شفافیت، صداقت و سلامت زنجیره تأمین.',
    primaryColor: '#166534',
    secondaryColor: '#c2410c',
    accentColor: '#84cc16',
    bgLight: '#f0fdf4',
    tag: 'Bio-Fiber Olive',
  },
  {
    id: 'palette-4',
    name: 'کالیته ۴: روناس سنتی و فولاد بافندگی',
    subtitle: 'زرشکی روناسی و فیروزه‌ای متضاد',
    philosophy: 'یادآور ریشه‌های روناس و رنگرزی سنتی قالی و ترمه در کنار صلابت فولاد دستگاه‌های ژاکارد.',
    impact: 'شکوه و اصالت تاریخی؛ القای کیفیت ممتاز (High-End) مناسب پارچه‌های فاستونی، مجلسی و گران‌بها.',
    primaryColor: '#991b1b',
    secondaryColor: '#0d9488',
    accentColor: '#f59e0b',
    bgLight: '#fef2f2',
    tag: 'Madder Crimson',
  },
  {
    id: 'palette-5',
    name: 'کالیته ۵: کبالت دیجیتال و کهربای تاروپود',
    subtitle: 'آبی کبالت مهندسی و زرد کهربایی نخ',
    philosophy: 'تجسم واژه «تار و پود»؛ تار به رنگ آبی پیونددهنده دیجیتال و پود به رنگ زرد پرانرژی الیاف و منسوجات.',
    impact: 'تم مدرن و ساختاریافته B2B جهانی به همراه برجستگی استثنایی دکمه‌های اقدام (Call To Action).',
    primaryColor: '#1d4ed8',
    secondaryColor: '#d97706',
    accentColor: '#ea580c',
    bgLight: '#eff6ff',
    tag: 'Tech Cobalt',
  },
];

const STORAGE_KEY = 'taropod_active_palette';

export function getStoredPalette(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'palette-1';
  } catch {
    return 'palette-1';
  }
}

export function applyPaletteToDom(paletteId: string): void {
  try {
    document.documentElement.setAttribute('data-palette', paletteId);
    localStorage.setItem(STORAGE_KEY, paletteId);
  } catch (e) {
    console.error('Failed to set palette:', e);
  }
}
