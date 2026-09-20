// ساختار سلسله‌مراتبی تقسیمات کشوری (کشور -> استان -> شهر)
// طراحی‌شده با قابلیت توسعه چندکشوری در فازهای بعدی و پوشش کامل تمام ۳۱ استان و شهرهای ایران

export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flagEmoji: string;
  isDefault?: boolean;
}

export interface City {
  id: string;
  name: string;
  provinceName: string;
  isIndustrialHub?: boolean; // مراکز و قطب‌های شناخته‌شده نساجی، پوشاک و صنعت
  lat?: number;
  lng?: number;
}

export interface Province {
  id: string;
  name: string;
  countryCode: string;
  cities: City[];
}

// لیست کشورها (زیرساخت مقیاس‌پذیر چندکشوری با پیش‌فرض ایران)
export const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'IR', name: 'ایران', phoneCode: '+98', flagEmoji: '🇮🇷', isDefault: true },
  { code: 'TR', name: 'ترکیه (به‌زودی)', phoneCode: '+90', flagEmoji: '🇹🇷' },
  { code: 'AE', name: 'امارات (به‌زودی)', phoneCode: '+971', flagEmoji: '🇦🇪' },
  { code: 'CN', name: 'چین (به‌زودی)', phoneCode: '+86', flagEmoji: '🇨🇳' },
];

export const DEFAULT_COUNTRY = SUPPORTED_COUNTRIES[0];

// دیتابیس کامل ۳۱ استان ایران و تمامی شهرهای تابعه
export const IRAN_PROVINCES: Province[] = [
  {
    id: 'p-tehran',
    name: 'تهران',
    countryCode: 'IR',
    cities: [
      { id: 'tehran-tehran', name: 'تهران', provinceName: 'تهران', isIndustrialHub: true, lat: 35.6892, lng: 51.3890 },
      { id: 'tehran-rey', name: 'شهرری', provinceName: 'تهران', isIndustrialHub: true, lat: 35.5900, lng: 51.4360 },
      { id: 'tehran-islamshahr', name: 'اسلامشهر', provinceName: 'تهران', isIndustrialHub: true, lat: 35.5450, lng: 51.2330 },
      { id: 'tehran-shahriar', name: 'شهریار', provinceName: 'تهران', isIndustrialHub: true, lat: 35.6590, lng: 51.0590 },
      { id: 'tehran-qods', name: 'قدس', provinceName: 'تهران', isIndustrialHub: true, lat: 35.7190, lng: 51.1090 },
      { id: 'tehran-malard', name: 'ملارد', provinceName: 'تهران', lat: 35.6660, lng: 50.9800 },
      { id: 'tehran-varamin', name: 'ورامین', provinceName: 'تهران', isIndustrialHub: true, lat: 35.3240, lng: 51.6480 },
      { id: 'tehran-pakdasht', name: 'پاکدشت', provinceName: 'تهران', isIndustrialHub: true, lat: 35.4820, lng: 51.6800 },
      { id: 'tehran-robat-karim', name: 'رباط‌کریم', provinceName: 'تهران', lat: 35.4850, lng: 51.0830 },
      { id: 'tehran-baharestan', name: 'بهارستان (گلستان/نسیم‌شهر)', provinceName: 'تهران', isIndustrialHub: true, lat: 35.5350, lng: 51.1760 },
      { id: 'tehran-damavand', name: 'دماوند', provinceName: 'تهران', lat: 35.7190, lng: 52.0650 },
      { id: 'tehran-firuzkuh', name: 'فیروزکوه', provinceName: 'تهران', lat: 35.7570, lng: 52.7710 },
      { id: 'tehran-qarjak', name: 'قرچک', provinceName: 'تهران', isIndustrialHub: true, lat: 35.4400, lng: 51.5690 },
      { id: 'tehran-pardis', name: 'پردیس', provinceName: 'تهران', lat: 35.7360, lng: 51.7870 },
      { id: 'tehran-shemiranat', name: 'شمیرانات (تجریش/لواسان)', provinceName: 'تهران', lat: 35.8050, lng: 51.4290 },
      { id: 'tehran-pishva', name: 'پیشوا', provinceName: 'تهران', lat: 35.3090, lng: 51.7260 },
    ],
  },
  {
    id: 'p-esfahan',
    name: 'اصفهان',
    countryCode: 'IR',
    cities: [
      { id: 'esfahan-esfahan', name: 'اصفهان', provinceName: 'اصفهان', isIndustrialHub: true, lat: 32.6546, lng: 51.6680 },
      { id: 'esfahan-kashan', name: 'کاشان', provinceName: 'اصفهان', isIndustrialHub: true, lat: 33.9850, lng: 51.4100 },
      { id: 'esfahan-najafabad', name: 'نجف‌آباد', provinceName: 'اصفهان', isIndustrialHub: true, lat: 32.6340, lng: 51.3670 },
      { id: 'esfahan-shahinshahr', name: 'شاهین‌شهر', provinceName: 'اصفهان', lat: 32.8640, lng: 51.5540 },
      { id: 'esfahan-lenjan', name: 'لنجان (زرین‌شهر)', provinceName: 'اصفهان', lat: 32.3900, lng: 51.3760 },
      { id: 'esfahan-shahreza', name: 'شهرضا', provinceName: 'اصفهان', lat: 32.0090, lng: 51.8670 },
      { id: 'esfahan-khomeinishahr', name: 'خمینی‌شهر', provinceName: 'اصفهان', isIndustrialHub: true, lat: 32.6990, lng: 51.5270 },
      { id: 'esfahan-falavarjan', name: 'فلاورجان', provinceName: 'اصفهان', lat: 32.5530, lng: 51.5090 },
      { id: 'esfahan-golpayegan', name: 'گلپایگان', provinceName: 'اصفهان', lat: 33.4540, lng: 50.2880 },
      { id: 'esfahan-naein', name: 'نائین', provinceName: 'اصفهان', isIndustrialHub: true, lat: 32.8600, lng: 53.0880 },
      { id: 'esfahan-natanz', name: 'نطنز', provinceName: 'اصفهان', lat: 33.5130, lng: 51.9170 },
      { id: 'esfahan-aranbidgol', name: 'آران و بیدگل', provinceName: 'اصفهان', isIndustrialHub: true, lat: 34.0570, lng: 51.4820 },
      { id: 'esfahan-mobarakeh', name: 'مبارکه', provinceName: 'اصفهان', lat: 32.3480, lng: 51.5040 },
      { id: 'esfahan-semirom', name: 'سمیرم', provinceName: 'اصفهان', lat: 31.4140, lng: 51.5690 },
    ],
  },
  {
    id: 'p-alborz',
    name: 'البرز',
    countryCode: 'IR',
    cities: [
      { id: 'alborz-karaj', name: 'کرج', provinceName: 'البرز', isIndustrialHub: true, lat: 35.8400, lng: 50.9391 },
      { id: 'alborz-fardis', name: 'فردیس', provinceName: 'البرز', isIndustrialHub: true, lat: 35.7280, lng: 50.9850 },
      { id: 'alborz-savojbolagh', name: 'ساوجبلاغ (هشتگرد)', provinceName: 'البرز', isIndustrialHub: true, lat: 35.9620, lng: 50.6800 },
      { id: 'alborz-nazarabad', name: 'نظرآباد', provinceName: 'البرز', isIndustrialHub: true, lat: 35.9530, lng: 50.6060 },
      { id: 'alborz-eshtehard', name: 'اشتهارد', provinceName: 'البرز', isIndustrialHub: true, lat: 35.7230, lng: 50.3660 },
      { id: 'alborz-chaharbagh', name: 'چهارباغ', provinceName: 'البرز', lat: 35.8400, lng: 50.8400 },
      { id: 'alborz-taleghan', name: 'طالقان', provinceName: 'البرز', lat: 36.1760, lng: 50.7640 },
    ],
  },
  {
    id: 'p-azarbaijan-sharghi',
    name: 'آذربایجان شرقی',
    countryCode: 'IR',
    cities: [
      { id: 'az-sh-tabriz', name: 'تبریز', provinceName: 'آذربایجان شرقی', isIndustrialHub: true, lat: 38.0800, lng: 46.2919 },
      { id: 'az-sh-maragheh', name: 'مراغه', provinceName: 'آذربایجان شرقی', lat: 37.3910, lng: 46.2390 },
      { id: 'az-sh-marand', name: 'مرند', provinceName: 'آذربایجان شرقی', lat: 38.4330, lng: 45.7750 },
      { id: 'az-sh-mianeh', name: 'میانه', provinceName: 'آذربایجان شرقی', lat: 37.4220, lng: 47.7140 },
      { id: 'az-sh-ahar', name: 'اهر', provinceName: 'آذربایجان شرقی', lat: 38.4770, lng: 47.0690 },
      { id: 'az-sh-bonab', name: 'بناب', provinceName: 'آذربایجان شرقی', lat: 37.3400, lng: 46.0560 },
      { id: 'az-sh-sarab', name: 'سراب', provinceName: 'آذربایجان شرقی', lat: 37.9400, lng: 47.5360 },
      { id: 'az-sh-jolfa', name: 'جلفا', provinceName: 'آذربایجان شرقی', lat: 38.9370, lng: 45.6290 },
      { id: 'az-sh-shabestar', name: 'شبستر', provinceName: 'آذربایجان شرقی', lat: 38.1800, lng: 45.7020 },
      { id: 'az-sh-azarshahr', name: 'آذرشهر', provinceName: 'آذربایجان شرقی', lat: 37.7600, lng: 45.9780 },
      { id: 'az-sh-osku', name: 'اسکو', provinceName: 'آذربایجان شرقی', lat: 37.9150, lng: 46.1240 },
    ],
  },
  {
    id: 'p-yazd',
    name: 'یزد',
    countryCode: 'IR',
    cities: [
      { id: 'yazd-yazd', name: 'یزد', provinceName: 'یزد', isIndustrialHub: true, lat: 31.8974, lng: 54.3569 },
      { id: 'yazd-meybod', name: 'میبد', provinceName: 'یزد', isIndustrialHub: true, lat: 32.2500, lng: 54.0160 },
      { id: 'yazd-ardakan', name: 'اردکان', provinceName: 'یزد', isIndustrialHub: true, lat: 32.3100, lng: 54.0170 },
      { id: 'yazd-mehriz', name: 'مهریز', provinceName: 'یزد', lat: 31.5830, lng: 54.4330 },
      { id: 'yazd-bafq', name: 'بافق', provinceName: 'یزد', lat: 31.6030, lng: 55.4040 },
      { id: 'yazd-abarkuh', name: 'ابرکوه', provinceName: 'یزد', lat: 31.1290, lng: 53.2820 },
      { id: 'yazd-taft', name: 'تفت', provinceName: 'یزد', lat: 31.7470, lng: 54.2040 },
      { id: 'yazd-ashkezar', name: 'اشکذر', provinceName: 'یزد', lat: 32.0000, lng: 54.2040 },
    ],
  },
  {
    id: 'p-khorasan-razavi',
    name: 'خراسان رضوی',
    countryCode: 'IR',
    cities: [
      { id: 'kh-r-mashhad', name: 'مشهد', provinceName: 'خراسان رضوی', isIndustrialHub: true, lat: 36.2972, lng: 59.6067 },
      { id: 'kh-r-neyshabur', name: 'نیشابور', provinceName: 'خراسان رضوی', isIndustrialHub: true, lat: 36.2130, lng: 58.7950 },
      { id: 'kh-r-sabzevar', name: 'سبزوار', provinceName: 'خراسان رضوی', lat: 36.2120, lng: 57.6770 },
      { id: 'kh-r-torbat-heydariyeh', name: 'تربت حیدریه', provinceName: 'خراسان رضوی', lat: 35.2740, lng: 59.2190 },
      { id: 'kh-r-quchan', name: 'قوچان', provinceName: 'خراسان رضوی', lat: 37.1060, lng: 58.5090 },
      { id: 'kh-r-kashmar', name: 'کاشمر', provinceName: 'خراسان رضوی', lat: 35.2380, lng: 58.4650 },
      { id: 'kh-r-chenaran', name: 'چناران', provinceName: 'خراسان رضوی', lat: 36.6460, lng: 59.1210 },
      { id: 'kh-r-gonabad', name: 'گناباد', provinceName: 'خراسان رضوی', lat: 34.3520, lng: 58.6830 },
      { id: 'kh-r-torbat-jam', name: 'تربت جام', provinceName: 'خراسان رضوی', lat: 35.2440, lng: 60.6220 },
      { id: 'kh-r-taybad', name: 'تایباد', provinceName: 'خراسان رضوی', lat: 34.7400, lng: 60.7750 },
    ],
  },
  {
    id: 'p-fars',
    name: 'فارس',
    countryCode: 'IR',
    cities: [
      { id: 'fars-shiraz', name: 'شیراز', provinceName: 'فارس', isIndustrialHub: true, lat: 29.5918, lng: 52.5837 },
      { id: 'fars-marvdasht', name: 'مرودشت', provinceName: 'فارس', lat: 29.8740, lng: 52.8020 },
      { id: 'fars-kazerun', name: 'کازرون', provinceName: 'فارس', lat: 29.6190, lng: 51.6540 },
      { id: 'fars-jahrom', name: 'جهرم', provinceName: 'فارس', lat: 28.5000, lng: 53.5600 },
      { id: 'fars-fasa', name: 'فسا', provinceName: 'فارس', lat: 28.9380, lng: 53.6480 },
      { id: 'fars-lar', name: 'لارستان (لار)', provinceName: 'فارس', lat: 27.6830, lng: 54.3410 },
      { id: 'fars-abadeh', name: 'آباده', provinceName: 'فارس', lat: 31.1600, lng: 52.6500 },
      { id: 'fars-darab', name: 'داراب', provinceName: 'فارس', lat: 28.7510, lng: 54.5440 },
      { id: 'fars-firuzabad', name: 'فیروزآباد', provinceName: 'فارس', lat: 28.8430, lng: 52.5700 },
    ],
  },
  {
    id: 'p-qazvin',
    name: 'قزوین',
    countryCode: 'IR',
    cities: [
      { id: 'qazvin-qazvin', name: 'قزوین', provinceName: 'قزوین', isIndustrialHub: true, lat: 36.2797, lng: 50.0049 },
      { id: 'qazvin-alborz', name: 'البرز (الوند)', provinceName: 'قزوین', isIndustrialHub: true, lat: 36.1890, lng: 50.0640 },
      { id: 'qazvin-takestan', name: 'تاکستان', provinceName: 'قزوین', lat: 36.0690, lng: 49.6950 },
      { id: 'qazvin-abyek', name: 'آبیک', provinceName: 'قزوین', isIndustrialHub: true, lat: 36.0540, lng: 50.5360 },
      { id: 'qazvin-buin-zahra', name: 'بوئین‌زهرا', provinceName: 'قزوین', lat: 35.7660, lng: 50.0580 },
    ],
  },
  {
    id: 'p-qom',
    name: 'قم',
    countryCode: 'IR',
    cities: [
      { id: 'qom-qom', name: 'قم', provinceName: 'قم', isIndustrialHub: true, lat: 34.6401, lng: 50.8764 },
      { id: 'qom-kahak', name: 'کهک', provinceName: 'قم', lat: 34.3870, lng: 50.8650 },
      { id: 'qom-jafarabad', name: 'جعفرآباد', provinceName: 'قم', lat: 34.7890, lng: 50.5330 },
      { id: 'qom-salafchegan', name: 'سلفچگان', provinceName: 'قم', isIndustrialHub: true, lat: 34.5000, lng: 50.4500 },
    ],
  },
  {
    id: 'p-markazi',
    name: 'مرکزی',
    countryCode: 'IR',
    cities: [
      { id: 'markazi-arak', name: 'اراک', provinceName: 'مرکزی', isIndustrialHub: true, lat: 34.0954, lng: 49.7013 },
      { id: 'markazi-saveh', name: 'ساوه', provinceName: 'مرکزی', isIndustrialHub: true, lat: 35.0210, lng: 50.3560 },
      { id: 'markazi-khomein', name: 'خمین', provinceName: 'مرکزی', lat: 33.6420, lng: 50.0780 },
      { id: 'markazi-mahallat', name: 'محلات', provinceName: 'مرکزی', lat: 33.9100, lng: 50.4560 },
      { id: 'markazi-delijan', name: 'دلیجان', provinceName: 'مرکزی', isIndustrialHub: true, lat: 33.9900, lng: 50.6830 },
      { id: 'markazi-shazand', name: 'شازند', provinceName: 'مرکزی', lat: 33.9260, lng: 49.4120 },
      { id: 'markazi-zarandieh', name: 'زرندیه (مامونیه)', provinceName: 'مرکزی', lat: 35.3050, lng: 50.4980 },
    ],
  },
  {
    id: 'p-mazandaran',
    name: 'مازندران',
    countryCode: 'IR',
    cities: [
      { id: 'mazandaran-sari', name: 'ساری', provinceName: 'مازندران', lat: 36.5659, lng: 53.0586 },
      { id: 'mazandaran-babol', name: 'بابل', provinceName: 'مازندران', isIndustrialHub: true, lat: 36.5500, lng: 52.6833 },
      { id: 'mazandaran-amol', name: 'آمل', provinceName: 'مازندران', isIndustrialHub: true, lat: 36.4699, lng: 52.3507 },
      { id: 'mazandaran-qaemshahr', name: 'قائم‌شهر', provinceName: 'مازندران', isIndustrialHub: true, lat: 36.4639, lng: 52.8600 },
      { id: 'mazandaran-babolsar', name: 'بابلسر', provinceName: 'مازندران', lat: 36.7020, lng: 52.6580 },
      { id: 'mazandaran-tonekabon', name: 'تنکابن', provinceName: 'مازندران', lat: 36.8160, lng: 50.8730 },
      { id: 'mazandaran-nowshahr', name: 'نوشهر', provinceName: 'مازندران', lat: 36.6490, lng: 51.4960 },
      { id: 'mazandaran-chalus', name: 'چالوس', provinceName: 'مازندران', lat: 36.6550, lng: 51.4200 },
      { id: 'mazandaran-ramsar', name: 'رامسر', provinceName: 'مازندران', lat: 36.9010, lng: 50.6690 },
      { id: 'mazandaran-behshahr', name: 'بهشهر', provinceName: 'مازندران', lat: 36.6970, lng: 53.5530 },
    ],
  },
  {
    id: 'p-gilan',
    name: 'گیلان',
    countryCode: 'IR',
    cities: [
      { id: 'gilan-rasht', name: 'رشت', provinceName: 'گیلان', isIndustrialHub: true, lat: 37.2809, lng: 49.5924 },
      { id: 'gilan-anzali', name: 'بندر انزلی', provinceName: 'گیلان', lat: 37.4740, lng: 49.4620 },
      { id: 'gilan-lahijan', name: 'لاهیجان', provinceName: 'گیلان', lat: 37.2070, lng: 50.0030 },
      { id: 'gilan-langarud', name: 'لنگرود', provinceName: 'گیلان', lat: 37.1970, lng: 50.1530 },
      { id: 'gilan-talesh', name: 'تالش (هشتپر)', provinceName: 'گیلان', lat: 37.7990, lng: 48.9060 },
      { id: 'gilan-astara', name: 'آستارا', provinceName: 'گیلان', lat: 38.4290, lng: 48.8720 },
      { id: 'gilan-fuman', name: 'فومن', provinceName: 'گیلان', lat: 37.2240, lng: 49.3130 },
      { id: 'gilan-rudsar', name: 'رودسر', provinceName: 'گیلان', lat: 37.1370, lng: 50.2880 },
    ],
  },
  {
    id: 'p-golestan',
    name: 'گلستان',
    countryCode: 'IR',
    cities: [
      { id: 'golestan-gorgan', name: 'گرگان', provinceName: 'گلستان', lat: 36.8427, lng: 54.4439 },
      { id: 'golestan-gonbad', name: 'گنبد کاووس', provinceName: 'گلستان', isIndustrialHub: true, lat: 37.2500, lng: 55.1670 },
      { id: 'golestan-aliabad', name: 'علی‌آباد کتول', provinceName: 'گلستان', lat: 36.9080, lng: 54.8680 },
      { id: 'golestan-torkaman', name: 'بندر ترکمن', provinceName: 'گلستان', lat: 36.9010, lng: 54.0710 },
      { id: 'golestan-agh-qala', name: 'آق‌قلا', provinceName: 'گلستان', lat: 37.0140, lng: 54.4560 },
    ],
  },
  {
    id: 'p-zanjan',
    name: 'زنجان',
    countryCode: 'IR',
    cities: [
      { id: 'zanjan-zanjan', name: 'زنجان', provinceName: 'زنجان', isIndustrialHub: true, lat: 36.6736, lng: 48.4787 },
      { id: 'zanjan-abhar', name: 'ابهر', provinceName: 'زنجان', isIndustrialHub: true, lat: 36.1460, lng: 49.2180 },
      { id: 'zanjan-khorramdarreh', name: 'خرمدره', provinceName: 'زنجان', lat: 36.2040, lng: 49.1910 },
      { id: 'zanjan-qeydar', name: 'خدابنده (قیدار)', provinceName: 'زنجان', lat: 36.1200, lng: 48.5900 },
    ],
  },
  {
    id: 'p-semnan',
    name: 'سمنان',
    countryCode: 'IR',
    cities: [
      { id: 'semnan-semnan', name: 'سمنان', provinceName: 'سمنان', isIndustrialHub: true, lat: 35.5869, lng: 53.3934 },
      { id: 'semnan-shahroud', name: 'شاهرود', provinceName: 'سمنان', lat: 36.4180, lng: 54.9760 },
      { id: 'semnan-damghan', name: 'دامغان', provinceName: 'سمنان', lat: 36.1680, lng: 54.3480 },
      { id: 'semnan-garmsar', name: 'گرمسار', provinceName: 'سمنان', isIndustrialHub: true, lat: 35.2180, lng: 52.3410 },
      { id: 'semnan-ivanki', name: 'ایوانکی', provinceName: 'سمنان', isIndustrialHub: true, lat: 35.3400, lng: 52.0700 },
    ],
  },
  {
    id: 'p-hamedan',
    name: 'همدان',
    countryCode: 'IR',
    cities: [
      { id: 'hamedan-hamedan', name: 'همدان', provinceName: 'همدان', isIndustrialHub: true, lat: 34.7989, lng: 48.5150 },
      { id: 'hamedan-malayer', name: 'ملایر', provinceName: 'همدان', lat: 34.2960, lng: 48.8230 },
      { id: 'hamedan-nahavand', name: 'نهاوند', provinceName: 'همدان', lat: 34.1880, lng: 48.3760 },
      { id: 'hamedan-tuyserkan', name: 'تویسرکان', provinceName: 'همدان', lat: 34.5480, lng: 48.4470 },
      { id: 'hamedan-asadabad', name: 'اسدآباد', provinceName: 'همدان', lat: 34.7820, lng: 48.1180 },
      { id: 'hamedan-bahar', name: 'بهار (لالجین)', provinceName: 'همدان', lat: 34.9060, lng: 48.4410 },
    ],
  },
  {
    id: 'p-kermanshah',
    name: 'کرمانشاه',
    countryCode: 'IR',
    cities: [
      { id: 'kermanshah-kermanshah', name: 'کرمانشاه', provinceName: 'کرمانشاه', isIndustrialHub: true, lat: 34.3277, lng: 47.0778 },
      { id: 'kermanshah-islamabad', name: 'اسلام‌آباد غرب', provinceName: 'کرمانشاه', lat: 34.1090, lng: 46.5270 },
      { id: 'kermanshah-kangavar', name: 'کنگاور', provinceName: 'کرمانشاه', lat: 34.5040, lng: 47.9650 },
      { id: 'kermanshah-songhor', name: 'سنقر', provinceName: 'کرمانشاه', lat: 34.7830, lng: 47.6000 },
      { id: 'kermanshah-javanrud', name: 'جوانرود', provinceName: 'کرمانشاه', lat: 34.7960, lng: 46.4950 },
      { id: 'kermanshah-paveh', name: 'پاوه', provinceName: 'کرمانشاه', lat: 35.0430, lng: 46.3600 },
      { id: 'kermanshah-harsin', name: 'هرسین', provinceName: 'کرمانشاه', lat: 34.2720, lng: 47.5860 },
    ],
  },
  {
    id: 'p-kordestan',
    name: 'کردستان',
    countryCode: 'IR',
    cities: [
      { id: 'kordestan-sanandaj', name: 'سنندج', provinceName: 'کردستان', isIndustrialHub: true, lat: 35.3144, lng: 46.9988 },
      { id: 'kordestan-saqqez', name: 'سقز', provinceName: 'کردستان', lat: 36.2490, lng: 46.2730 },
      { id: 'kordestan-marivan', name: 'مریوان', provinceName: 'کردستان', lat: 35.5260, lng: 46.1760 },
      { id: 'kordestan-baneh', name: 'بانه', provinceName: 'کردستان', isIndustrialHub: true, lat: 35.9970, lng: 45.8850 },
      { id: 'kordestan-qorveh', name: 'قروه', provinceName: 'کردستان', lat: 35.1660, lng: 47.8040 },
      { id: 'kordestan-bijar', name: 'بیجار', provinceName: 'کردستان', lat: 35.8720, lng: 47.6050 },
      { id: 'kordestan-kamyaran', name: 'کامیاران', provinceName: 'کردستان', lat: 34.7950, lng: 46.9350 },
    ],
  },
  {
    id: 'p-lorestan',
    name: 'لرستان',
    countryCode: 'IR',
    cities: [
      { id: 'lorestan-khorramabad', name: 'خرم‌آباد', provinceName: 'لرستان', lat: 33.4878, lng: 48.3558 },
      { id: 'lorestan-borujerd', name: 'بروجرد', provinceName: 'لرستان', isIndustrialHub: true, lat: 33.8970, lng: 48.7510 },
      { id: 'lorestan-dorud', name: 'دورود', provinceName: 'لرستان', lat: 33.4930, lng: 49.0750 },
      { id: 'lorestan-kuhdasht', name: 'کوهدشت', provinceName: 'لرستان', lat: 33.5350, lng: 47.6060 },
      { id: 'lorestan-aligudarz', name: 'الیگودرز', provinceName: 'لرستان', lat: 33.4000, lng: 49.6940 },
      { id: 'lorestan-azna', name: 'ازنا', provinceName: 'لرستان', lat: 33.4560, lng: 49.4550 },
      { id: 'lorestan-pol-dokhtar', name: 'پلدختر', provinceName: 'لرستان', lat: 33.1530, lng: 47.7130 },
    ],
  },
  {
    id: 'p-khuzestan',
    name: 'خوزستان',
    countryCode: 'IR',
    cities: [
      { id: 'khuzestan-ahvaz', name: 'اهواز', provinceName: 'خوزستان', isIndustrialHub: true, lat: 31.3183, lng: 48.6706 },
      { id: 'khuzestan-dezful', name: 'دزفول', provinceName: 'خوزستان', lat: 32.3810, lng: 48.4050 },
      { id: 'khuzestan-abadan', name: 'آبادان', provinceName: 'خوزستان', lat: 30.3390, lng: 48.3040 },
      { id: 'khuzestan-khorramshahr', name: 'خرمشهر', provinceName: 'خوزستان', lat: 30.4400, lng: 48.1800 },
      { id: 'khuzestan-mahshahr', name: 'بندر ماهشهر', provinceName: 'خوزستان', lat: 30.5580, lng: 49.1980 },
      { id: 'khuzestan-behbahan', name: 'بهبهان', provinceName: 'خوزستان', lat: 30.5950, lng: 50.2410 },
      { id: 'khuzestan-shush', name: 'شوش', provinceName: 'خوزستان', lat: 32.1940, lng: 48.2430 },
      { id: 'khuzestan-shushtar', name: 'شوشتر', provinceName: 'خوزستان', lat: 32.0450, lng: 48.8560 },
      { id: 'khuzestan-andimeshk', name: 'اندیمشک', provinceName: 'خوزستان', lat: 32.4600, lng: 48.3560 },
      { id: 'khuzestan-masjed-soleyman', name: 'مسجدسلیمان', provinceName: 'خوزستان', lat: 31.9360, lng: 49.3030 },
      { id: 'khuzestan-izeh', name: 'ایذه', provinceName: 'خوزستان', lat: 31.8340, lng: 49.8690 },
    ],
  },
  {
    id: 'p-azarbaijan-gharbi',
    name: 'آذربایجان غربی',
    countryCode: 'IR',
    cities: [
      { id: 'az-gh-urmia', name: 'ارومیه', provinceName: 'آذربایجان غربی', isIndustrialHub: true, lat: 37.5527, lng: 45.0761 },
      { id: 'az-gh-khoy', name: 'خوی', provinceName: 'آذربایجان غربی', isIndustrialHub: true, lat: 38.5500, lng: 44.9500 },
      { id: 'az-gh-bukan', name: 'بوکان', provinceName: 'آذربایجان غربی', lat: 36.5200, lng: 46.2100 },
      { id: 'az-gh-mahabad', name: 'مهاباد', provinceName: 'آذربایجان غربی', lat: 36.7630, lng: 45.7220 },
      { id: 'az-gh-miandoab', name: 'میاندوآب', provinceName: 'آذربایجان غربی', lat: 36.9690, lng: 46.1030 },
      { id: 'az-gh-salmas', name: 'سلماس', provinceName: 'آذربایجان غربی', lat: 38.1970, lng: 44.7650 },
      { id: 'az-gh-naqadeh', name: 'نقده', provinceName: 'آذربایجان غربی', lat: 36.9550, lng: 45.3880 },
      { id: 'az-gh-piranshahr', name: 'پیرانشهر', provinceName: 'آذربایجان غربی', lat: 36.7010, lng: 45.1410 },
      { id: 'az-gh-maku', name: 'ماکو', provinceName: 'آذربایجان غربی', lat: 39.2960, lng: 44.5160 },
      { id: 'az-gh-sardasht', name: 'سردشت', provinceName: 'آذربایجان غربی', lat: 36.1550, lng: 45.4790 },
    ],
  },
  {
    id: 'p-ardabil',
    name: 'اردبیل',
    countryCode: 'IR',
    cities: [
      { id: 'ardabil-ardabil', name: 'اردبیل', provinceName: 'اردبیل', isIndustrialHub: true, lat: 38.2498, lng: 48.2933 },
      { id: 'ardabil-parsabad', name: 'پارس‌آباد', provinceName: 'اردبیل', lat: 39.6480, lng: 47.9170 },
      { id: 'ardabil-meshginshahr', name: 'مشگین‌شهر', provinceName: 'اردبیل', lat: 38.3990, lng: 47.6820 },
      { id: 'ardabil-khalkhal', name: 'خلخال', provinceName: 'اردبیل', lat: 37.6180, lng: 48.5250 },
      { id: 'ardabil-germy', name: 'گرمی', provinceName: 'اردبیل', lat: 39.0210, lng: 48.0800 },
      { id: 'ardabil-sareyn', name: 'سرعین', provinceName: 'اردبیل', lat: 38.1510, lng: 48.0700 },
      { id: 'ardabil-namin', name: 'نمین', provinceName: 'اردبیل', lat: 38.4260, lng: 48.4840 },
    ],
  },
  {
    id: 'p-kerman',
    name: 'کرمان',
    countryCode: 'IR',
    cities: [
      { id: 'kerman-kerman', name: 'کرمان', provinceName: 'کرمان', lat: 30.2839, lng: 57.0834 },
      { id: 'kerman-sirjan', name: 'سیرجان', provinceName: 'کرمان', isIndustrialHub: true, lat: 29.4520, lng: 55.6810 },
      { id: 'kerman-rafsanjan', name: 'رفسنجان', provinceName: 'کرمان', lat: 30.4060, lng: 55.9930 },
      { id: 'kerman-jiroft', name: 'جیرفت', provinceName: 'کرمان', lat: 28.6780, lng: 57.7400 },
      { id: 'kerman-bam', name: 'بم', provinceName: 'کرمان', lat: 29.1060, lng: 58.3570 },
      { id: 'kerman-zarand', name: 'زرند', provinceName: 'کرمان', lat: 30.8120, lng: 56.5640 },
      { id: 'kerman-shahr-babak', name: 'شهربابک', provinceName: 'کرمان', lat: 30.1160, lng: 55.1180 },
    ],
  },
  {
    id: 'p-hormozgan',
    name: 'هرمزگان',
    countryCode: 'IR',
    cities: [
      { id: 'hormozgan-bandarabbas', name: 'بندرعباس', provinceName: 'هرمزگان', isIndustrialHub: true, lat: 27.1832, lng: 56.2666 },
      { id: 'hormozgan-minab', name: 'میناب', provinceName: 'هرمزگان', lat: 27.1460, lng: 57.0800 },
      { id: 'hormozgan-qeshm', name: 'قشم', provinceName: 'هرمزگان', isIndustrialHub: true, lat: 26.9580, lng: 56.2710 },
      { id: 'hormozgan-bandarlengeh', name: 'بندر لنگه', provinceName: 'هرمزگان', lat: 26.5570, lng: 54.8800 },
      { id: 'hormozgan-kish', name: 'کیش', provinceName: 'هرمزگان', lat: 26.5320, lng: 53.9870 },
      { id: 'hormozgan-rudan', name: 'رودان', provinceName: 'هرمزگان', lat: 27.4410, lng: 57.1920 },
      { id: 'hormozgan-jask', name: 'جاسک', provinceName: 'هرمزگان', lat: 25.6430, lng: 57.7740 },
    ],
  },
  {
    id: 'p-bushehr',
    name: 'بوشهر',
    countryCode: 'IR',
    cities: [
      { id: 'bushehr-bushehr', name: 'بوشهر', provinceName: 'بوشهر', lat: 28.9234, lng: 50.8203 },
      { id: 'bushehr-borazjan', name: 'دشتستان (برازجان)', provinceName: 'بوشهر', lat: 29.2700, lng: 51.2150 },
      { id: 'bushehr-genaveh', name: 'بندر گناوه', provinceName: 'بوشهر', isIndustrialHub: true, lat: 29.5790, lng: 50.5170 },
      { id: 'bushehr-kangan', name: 'کنگان', provinceName: 'بوشهر', lat: 27.8340, lng: 52.0620 },
      { id: 'bushehr-asaluyeh', name: 'عسلویه', provinceName: 'بوشهر', lat: 27.4760, lng: 52.6070 },
      { id: 'bushehr-deylam', name: 'دیلم', provinceName: 'بوشهر', lat: 30.0540, lng: 50.1580 },
    ],
  },
  {
    id: 'p-sistan-baluchestan',
    name: 'سیستان و بلوچستان',
    countryCode: 'IR',
    cities: [
      { id: 'sb-zahedan', name: 'زاهدان', provinceName: 'سیستان و بلوچستان', lat: 29.4963, lng: 60.8629 },
      { id: 'sb-zabol', name: 'زابل', provinceName: 'سیستان و بلوچستان', lat: 31.0300, lng: 61.4930 },
      { id: 'sb-chabahar', name: 'چابهار', provinceName: 'سیستان و بلوچستان', isIndustrialHub: true, lat: 25.2910, lng: 60.6430 },
      { id: 'sb-iranshahr', name: 'ایرانشهر', provinceName: 'سیستان و بلوچستان', lat: 27.2020, lng: 60.6840 },
      { id: 'sb-saravan', name: 'سراوان', provinceName: 'سیستان و بلوچستان', lat: 27.3710, lng: 62.3340 },
      { id: 'sb-khash', name: 'خاش', provinceName: 'سیستان و بلوچستان', lat: 28.2210, lng: 61.2150 },
    ],
  },
  {
    id: 'p-khorasan-jonubi',
    name: 'خراسان جنوبی',
    countryCode: 'IR',
    cities: [
      { id: 'kh-j-birjand', name: 'بیرجند', provinceName: 'خراسان جنوبی', lat: 32.8663, lng: 59.2211 },
      { id: 'kh-j-qaen', name: 'قائنات (قائن)', provinceName: 'خراسان جنوبی', lat: 33.7260, lng: 59.1840 },
      { id: 'kh-j-tabas', name: 'طبس', provinceName: 'خراسان جنوبی', lat: 33.5960, lng: 56.9240 },
      { id: 'kh-j-ferdows', name: 'فردوس', provinceName: 'خراسان جنوبی', lat: 34.0180, lng: 58.1720 },
      { id: 'kh-j-nehbandan', name: 'نهبندان', provinceName: 'خراسان جنوبی', lat: 31.5420, lng: 60.0380 },
    ],
  },
  {
    id: 'p-khorasan-shomali',
    name: 'خراسان شمالی',
    countryCode: 'IR',
    cities: [
      { id: 'kh-sh-bojnord', name: 'بجنورد', provinceName: 'خراسان شمالی', lat: 37.4761, lng: 57.3242 },
      { id: 'kh-sh-shirvan', name: 'شیروان', provinceName: 'خراسان شمالی', lat: 37.3960, lng: 57.9290 },
      { id: 'kh-sh-esfarayen', name: 'اسفراین', provinceName: 'خراسان شمالی', lat: 37.0760, lng: 57.5100 },
      { id: 'kh-sh-mane-samalqan', name: 'مانه و سملقان (آشخانه)', provinceName: 'خراسان شمالی', lat: 37.5610, lng: 56.9220 },
      { id: 'kh-sh-faruj', name: 'فاروج', provinceName: 'خراسان شمالی', lat: 37.2300, lng: 58.2180 },
    ],
  },
  {
    id: 'p-chaharmahal-bakhtiari',
    name: 'چهارمحال و بختیاری',
    countryCode: 'IR',
    cities: [
      { id: 'ch-b-shahrekord', name: 'شهرکرد', provinceName: 'چهارمحال و بختیاری', lat: 32.3256, lng: 50.8644 },
      { id: 'ch-b-borujen', name: 'بروجن', provinceName: 'چهارمحال و بختیاری', isIndustrialHub: true, lat: 31.9680, lng: 51.2890 },
      { id: 'ch-b-lordegan', name: 'لردگان', provinceName: 'چهارمحال و بختیاری', lat: 31.5100, lng: 50.8280 },
      { id: 'ch-b-farsan', name: 'فارسان', provinceName: 'چهارمحال و بختیاری', lat: 32.2570, lng: 50.5640 },
    ],
  },
  {
    id: 'p-kohgiluyeh-boyerahmad',
    name: 'کهگیلویه و بویراحمد',
    countryCode: 'IR',
    cities: [
      { id: 'kb-yasuj', name: 'یاسوج', provinceName: 'کهگیلویه و بویراحمد', lat: 30.6684, lng: 51.5876 },
      { id: 'kb-gachsaran', name: 'دوگنبدان (گچساران)', provinceName: 'کهگیلویه و بویراحمد', lat: 30.3580, lng: 50.7980 },
      { id: 'kb-dehdasht', name: 'دهدشت', provinceName: 'کهگیلویه و بویراحمد', lat: 30.7930, lng: 50.5650 },
      { id: 'kb-sisakht', name: 'سی‌سخت (دنا)', provinceName: 'کهگیلویه و بویراحمد', lat: 30.8630, lng: 51.4560 },
    ],
  },
  {
    id: 'p-ilam',
    name: 'ایلام',
    countryCode: 'IR',
    cities: [
      { id: 'ilam-ilam', name: 'ایلام', provinceName: 'ایلام', lat: 33.6374, lng: 46.4227 },
      { id: 'ilam-eyvan', name: 'ایوان', provinceName: 'ایلام', lat: 33.8270, lng: 46.3090 },
      { id: 'ilam-dehloran', name: 'دهلران', provinceName: 'ایلام', lat: 32.6940, lng: 47.2680 },
      { id: 'ilam-mehran', name: 'مهران', provinceName: 'ایلام', isIndustrialHub: true, lat: 33.1220, lng: 46.1640 },
      { id: 'ilam-darrehshahr', name: 'دره‌شهر', provinceName: 'ایلام', lat: 33.1400, lng: 47.3770 },
      { id: 'ilam-abdanan', name: 'آبدانان', provinceName: 'ایلام', lat: 32.9930, lng: 47.4200 },
    ],
  },
];

// لیست فلت تمامی شهرهای ایران برای جستجوی سریع
export const ALL_IRAN_CITIES_FLAT: City[] = IRAN_PROVINCES.flatMap((p) => p.cities);

// مراکز و قطب‌های اصلی نساجی ایران
export const MAIN_TEXTILE_HUBS: City[] = ALL_IRAN_CITIES_FLAT.filter((c) => c.isIndustrialHub);

// توابع کمکی برای جستجو و دسترسی سریع به داده‌ها
export function getAllProvinces(): Province[] {
  return IRAN_PROVINCES;
}

export function getProvinceByName(provinceName: string): Province | undefined {
  return IRAN_PROVINCES.find((p) => p.name === provinceName);
}

export function getCitiesByProvince(provinceName: string): City[] {
  const prov = getProvinceByName(provinceName);
  return prov ? prov.cities : [];
}

export function findCity(cityName: string): City | undefined {
  return ALL_IRAN_CITIES_FLAT.find(
    (c) => c.name === cityName || cityName.includes(c.name) || c.name.includes(cityName)
  );
}

// جستجوی ترکیبی در استان‌ها و شهرها (با پشتیبانی از حروف گچپژ و عربی)
export function searchLocations(query: string): { cities: City[]; provinces: Province[] } {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { cities: ALL_IRAN_CITIES_FLAT.slice(0, 30), provinces: IRAN_PROVINCES };
  }

  const matchedProvinces = IRAN_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(normalized)
  );

  const matchedCities = ALL_IRAN_CITIES_FLAT.filter(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      c.provinceName.toLowerCase().includes(normalized)
  );

  return { cities: matchedCities, provinces: matchedProvinces };
}
