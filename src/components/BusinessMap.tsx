import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  X,
  Compass,
  Building2,
  CheckCircle2,
  Phone,
  Store,
  Factory,
  Scissors,
  Sparkles,
  Share2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { MAP_LOCATIONS, MOCK_PROFILES, MOCK_ADS } from '../data/mockData';
import { AdItem } from '../types';
import { locationsService, BusinessLocationDto } from '../core/api/locations.service';
import { LocationHierarchyPickerModal } from './LocationHierarchyPickerModal';

interface BusinessMapProps {
  onSelectAuthor: (authorId: string) => void;
  onSelectAd: (ad: AdItem) => void;
  selectedCity: string;
}

// رسته‌های دائمی کسب‌وکارهای نساجی و پوشاک روی نقشه (مطابق ردیف افقی تصویر ارسالی)
const BUSINESS_MAP_CATEGORIES = [
  { id: 'all', label: 'همه کارگاه‌ها' },
  { id: 'bafandegi', label: 'کارخانجات بافندگی' },
  { id: 'rangrazi', label: 'رنگرزی و تکمیل' },
  { id: 'tagheh', label: 'طاقه‌فروشی و بنکداری' },
  { id: 'towlidi', label: 'تولیدی پوشاک' },
  { id: 'mazdi', label: 'مزدی‌دوزی و برش' },
  { id: 'charkh', label: 'ماشین‌آلات و چرخ' },
  { id: 'kharjkar', label: 'خرج کار و یراق' },
  { id: 'chap', label: 'چاپ و گلدوزی' },
];

// دیتابیس کسب‌وکارهای دائمی ثبت‌شده در نقشه بازار نساجی
interface PermanentBusinessPin {
  id: string;
  name: string;
  category: string;
  categoryType: string;
  specialty: string;
  country: string;
  province: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isOpenNow: boolean;
  workingHours: string;
  avatarUrl: string;
  coverUrl: string;
  lat: number;
  lng: number;
  authorId: string;
  adId?: string;
  topPercent: string;
  rightPercent: string;
}

const PERMANENT_TEXTILE_BUSINESSES: PermanentBusinessPin[] = [
  {
    id: 'pb-1',
    name: 'مجتمع تولیدی پارس دوخت تهران',
    category: 'تولیدی پوشاک و سری‌دوزی',
    categoryType: 'towlidi',
    specialty: 'سری‌دوزی کت و شلوار، کاپشن و مانتو با خط تولید کامپیوتری',
    country: 'ایران',
    province: 'تهران',
    city: 'تهران',
    area: 'بازار بزرگ - سرای فردوس',
    address: 'تهران، خیابان خیام، روبه‌روی مترو بازار، سرای فردوس، طبقه دوم، پلاک ۱۸',
    phone: '02155667788',
    rating: 4.9,
    reviewsCount: 142,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۸:۰۰ الی ۱۹:۳۰',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80',
    lat: 35.6790,
    lng: 51.4180,
    authorId: 'user-1',
    adId: 'ad-1',
    topPercent: '48%',
    rightPercent: '38%',
  },
  {
    id: 'pb-2',
    name: 'بازرگانی نساجی اصفهان بافت (کیانی)',
    category: 'طاقه‌فروشی و بنکداری',
    categoryType: 'tagheh',
    specialty: 'تأمین عمده انواع پارچه تریکو یکرو و دورو پنبه، ویسکوز و ملانژ',
    country: 'ایران',
    province: 'تهران',
    city: 'تهران',
    area: 'بازار عبدل‌آباد',
    address: 'تهران، عبدل‌آباد، خیابان احسانی، بین کوچه ۱۲ و ۱۴، پلاک ۸۵',
    phone: '02155889900',
    rating: 4.7,
    reviewsCount: 89,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۹:۰۰ الی ۲۱:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80',
    lat: 35.6320,
    lng: 51.3650,
    authorId: 'user-2',
    adId: 'ad-2',
    topPercent: '68%',
    rightPercent: '65%',
  },
  {
    id: 'pb-3',
    name: 'ماشین‌آلات صنعتی مدرن چرخ',
    category: 'ماشین‌آلات و چرخ',
    categoryType: 'charkh',
    specialty: 'واردات و خدمات فنی چرخ‌های خیاطی صنعتی جک، ژوکی، راسته و زیگزال',
    country: 'ایران',
    province: 'تهران',
    city: 'تهران',
    area: 'خیابان جمهوری',
    address: 'تهران، خیابان جمهوری، تقاطع ابوریحان، پاساژ کاوه، طبقه همکف، پلاک ۴',
    phone: '02166408899',
    rating: 4.9,
    reviewsCount: 110,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۹:۰۰ الی ۱۹:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80',
    lat: 35.6965,
    lng: 51.4045,
    authorId: 'user-3',
    adId: 'ad-3',
    topPercent: '28%',
    rightPercent: '30%',
  },
  {
    id: 'pb-4',
    name: 'صنایع بافندگی و رنگرزی کاشان بافت',
    category: 'کارخانجات بافندگی',
    categoryType: 'bafandegi',
    specialty: 'بافت و رنگرزی راکتیو انواع نخ‌های پنبه، پلی‌استر و الیاف طبیعی',
    country: 'ایران',
    province: 'اصفهان',
    city: 'کاشان',
    area: 'شهرک صنعتی راوند',
    address: 'کاشان، شهرک صنعتی راوند، بلوار حکمت، خیابان یازدهم، مجتمع نساجی کاشان',
    phone: '03155443322',
    rating: 4.8,
    reviewsCount: 76,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۷:۳۰ الی ۱۸:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
    lat: 34.0200,
    lng: 51.3500,
    authorId: 'user-1',
    topPercent: '54%',
    rightPercent: '22%',
  },
  {
    id: 'pb-5',
    name: 'استودیو طراحی الگو و مد نوین',
    category: 'طراحی و الگو',
    categoryType: 'mazdi',
    specialty: 'طراحی الگو با نرم‌افزارهای Clo 3D و جمینی و چیدمان پلاتر اتوماتیک',
    country: 'ایران',
    province: 'تهران',
    city: 'تهران',
    area: 'خیابان فاطمی',
    address: 'تهران، میدان فاطمی، جنب کوچه بهرام، پلاک ۴۴، واحد ۶',
    phone: '02188992211',
    rating: 4.7,
    reviewsCount: 64,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۹:۰۰ الی ۱۸:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
    lat: 35.7160,
    lng: 51.4060,
    authorId: 'user-4',
    adId: 'ad-5',
    topPercent: '18%',
    rightPercent: '46%',
  },
  {
    id: 'pb-6',
    name: 'چاپ پارچه و سیلک ری و خاوران',
    category: 'چاپ و گلدوزی',
    categoryType: 'chap',
    specialty: 'چاپ دیجیتال صنعتی طاقه‌ای و رول به رول با ثبات شستشوی ۵',
    country: 'ایران',
    province: 'تهران',
    city: 'شهرری',
    area: 'شهرری - جاده خاوران',
    address: 'شهرری، جاده قدیم خاوران، شهرک صنعتی نساجی و چاپ، سالن ۴',
    phone: '02133445566',
    rating: 4.7,
    reviewsCount: 52,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۸:۰۰ الی ۱۷:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
    lat: 35.6450,
    lng: 51.4850,
    authorId: 'user-1',
    adId: 'ad-6',
    topPercent: '72%',
    rightPercent: '18%',
  },
  {
    id: 'pb-7',
    name: 'بازرگانی زیپ، دکمه و یراق مشیرخلوت',
    category: 'خرج کار و یراق',
    categoryType: 'kharjkar',
    specialty: 'بزرگترین بورس زیپ‌های فلزی و استخوانی، مارک فلزی و دکمه‌های مجلسی',
    country: 'ایران',
    province: 'تهران',
    city: 'تهران',
    area: 'بازار بزرگ - مشیرخلوت',
    address: 'تهران، بازار بزرگ تهران، سرای مشیرخلوت، طبقه زیرهمکف، پلاک ۷',
    phone: '02155622334',
    rating: 4.8,
    reviewsCount: 95,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۸:۳۰ الی ۱۸:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80',
    lat: 35.6740,
    lng: 51.4230,
    authorId: 'user-1',
    adId: 'ad-4',
    topPercent: '42%',
    rightPercent: '26%',
  },
  {
    id: 'pb-8',
    name: 'تولیدی تریکو صنعتی چهاردانگه',
    category: 'تولیدی پوشاک',
    categoryType: 'towlidi',
    specialty: 'خط دوخت صنعتی پوشاک هودی، تیشرت و شلوار اسلش با پارچه‌های دورس',
    country: 'ایران',
    province: 'تهران',
    city: 'اسلامشهر',
    area: 'شهرک صنعتی چهاردانگه',
    address: 'اسلامشهر، شهرک صنعتی چهاردانگه، خیابان ۲۱، پلاک ۳۲',
    phone: '02155255440',
    rating: 4.8,
    reviewsCount: 68,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۸:۰۰ الی ۱۸:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80',
    lat: 35.5450,
    lng: 51.2330,
    authorId: 'user-1',
    adId: 'ad-1',
    topPercent: '62%',
    rightPercent: '48%',
  },
  {
    id: 'pb-9',
    name: 'رنگرزی و تکمیل پارچه صفاهان',
    category: 'رنگرزی و تکمیل',
    categoryType: 'rangrazi',
    specialty: 'رنگرزی تخصصی نخ پنبه و پارچه تاری‌پودی با رنگ‌های راکتیو بدون رنگدهی',
    country: 'ایران',
    province: 'اصفهان',
    city: 'اصفهان',
    area: 'شهرک صنعتی جی',
    address: 'اصفهان، شهرک صنعتی جی، خیابان یکم، پلاک ۴۴',
    phone: '03135544331',
    rating: 4.8,
    reviewsCount: 67,
    isVerified: true,
    isOpenNow: true,
    workingHours: '۷:۰۰ الی ۱۵:۰۰',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80',
    lat: 32.6546,
    lng: 51.6680,
    authorId: 'user-2',
    adId: 'ad-2',
    topPercent: '38%',
    rightPercent: '60%',
  },
];

export const BusinessMap: React.FC<BusinessMapProps> = ({
  onSelectAuthor,
  onSelectAd,
  selectedCity: propSelectedCity,
}) => {
  // جستجو و فیلترها با پشتیبانی کامل سلسله‌مراتبی (کشور > استان > شهر)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('کسب‌وکارهای نساجی');
  const [activeCountry, setActiveCountry] = useState('ایران');
  const [activeProvince, setActiveProvince] = useState<string>('تهران');
  const [activeCity, setActiveCity] = useState(propSelectedCity || 'تهران');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // وضعیت نقشه و کارت متناسب (Compact & Balanced Bottom Card)
  const [selectedPinId, setSelectedPinId] = useState<string>('pb-1');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [showNavModal, setShowNavModal] = useState(false);
  const [isUserLocating, setIsUserLocating] = useState(false);
  const [isCardDismissed, setIsCardDismissed] = useState(false);

  // لیست کسب‌وکارهای فیلترشده بر اساس جستجو، رسته و موقعیت مکانی
  const filteredBusinesses = useMemo(() => {
    return PERMANENT_TEXTILE_BUSINESSES.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTag =
        selectedTag === 'all' || b.categoryType === selectedTag;

      // فیلتر شهر/استان: اگر شهر خاصی فیلتر شده باشد
      let matchLocation = true;
      if (activeCity && activeCity !== 'کل ایران') {
        if (activeCity.startsWith('همه شهرهای')) {
          matchLocation = b.province === activeProvince;
        } else {
          matchLocation = b.city === activeCity || b.province === activeCity;
        }
      }

      // در صورتی که پینی در این شهر نباشد، برای جلوگیری از خالی شدن نقشه فیلتر تگ و جستجو ملاک است
      return matchSearch && matchTag;
    });
  }, [searchQuery, selectedTag, activeCity, activeProvince]);

  // کسب‌وکار انتخاب‌شده در کارت پایین نقشه
  const activeBusiness = useMemo(() => {
    return (
      filteredBusinesses.find((b) => b.id === selectedPinId) ||
      filteredBusinesses[0] ||
      PERMANENT_TEXTILE_BUSINESSES[0]
    );
  }, [selectedPinId, filteredBusinesses]);

  const openRoutingApp = (appName: 'neshan' | 'balad' | 'google' | 'waze') => {
    if (!activeBusiness) return;
    const { lat, lng } = activeBusiness;
    let url = '';
    if (appName === 'neshan') {
      url = `https://neshan.org/maps/@${lat},${lng},16z`;
    } else if (appName === 'balad') {
      url = `https://balad.ir/location?latitude=${lat}&longitude=${lng}`;
    } else if (appName === 'waze') {
      url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    window.open(url, '_blank');
    setShowNavModal(false);
  };

  const handleOpenAdOrProfile = () => {
    if (activeBusiness.adId) {
      const targetAd = MOCK_ADS.find((a) => a.id === activeBusiness.adId);
      if (targetAd) {
        onSelectAd(targetAd);
        return;
      }
    }
    onSelectAuthor(activeBusiness.authorId);
  };

  return (
    <div className="fixed inset-0 z-30 bg-zinc-100 overflow-hidden font-['Vazirmatn',sans-serif] select-none text-right">
      {/* ۱. نوار ابزار بالای نقشه (کاملاً منطبق بر سبک عکس ارسالی ۱۷۸۹۸۸۱۱۱۰۵۳۷) */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-3 pt-2 pb-2 space-y-2 shadow-xs">
        {/* ردیف اول: جستجو و انتخاب شهر */}
        <div className="flex items-center gap-2">
          {/* دکمه انتخاب سلسله‌مراتبی کشور/استان/شهر با موقعیت پین در چپ */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shrink-0 transition-colors shadow-2xs"
            title="انتخاب کشور، استان و شهر"
          >
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="max-w-[85px] truncate">{activeCity || activeProvince || 'تهران'}</span>
          </button>

          {/* کادر جستجو با آیکون ذره‌بین در راست */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در کارخانه‌ها، کارگاه‌ها و راسته بازار..."
              className="w-full bg-zinc-100/90 text-xs rounded-xl pr-8 pl-3 py-2 text-zinc-800 placeholder-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-300 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ردیف دوم: تگ فعال با ضربدر و دکمه کادردار «فیلتر» (عین عکس ارسالی) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* تگ دسته فعال با امکان حذف سریع */}
          <div className="flex items-center gap-1.5">
            {activeCategoryFilter && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-xs font-medium shadow-2xs">
                <span>{activeCategoryFilter}</span>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('');
                    setSelectedTag('all');
                  }}
                  className="text-zinc-400 hover:text-zinc-700 focus:outline-none"
                  title="حذف فیلتر"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* دکمه کادردار فیلتر با تم نارنجی سازمانی */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 text-xs font-bold transition-colors focus:outline-none shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>فیلتر</span>
          </button>
        </div>

        {/* ردیف سوم: زیردسته‌های افقی تخصصی نساجی */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {BUSINESS_MAP_CATEGORIES.map((cat) => {
            const isActive = selectedTag === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedTag(cat.id)}
                className={`text-xs font-bold whitespace-nowrap transition-colors focus:outline-none shrink-0 ${
                  isActive
                    ? 'text-orange-600 border-b-2 border-orange-600 pb-0.5'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ۲. پهنه نقشه تمام‌صفحه تعاملی (Full Screen Interactive Map Canvas) */}
      <div className="w-full h-full relative overflow-hidden">
        {/* پس‌زمینه و خطوط شبیه‌ساز نقشه جغرافیایی مراکز نساجی */}
        <div
          className={`w-full h-full relative transition-all duration-300 select-none ${
            mapLayer === 'satellite'
              ? 'bg-[#152320] text-emerald-100'
              : 'bg-[#ebe8e4] text-zinc-700'
          }`}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* خطوط معابر، خیابان‌ها و شریان‌های صنعتی */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" xmlns="http://www.w3.org/2000/svg">
            {/* بزرگراه‌ها و شریان‌های اصلی */}
            <line x1="0" y1="28%" x2="100%" y2="30%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="12" />
            <line x1="0" y1="28%" x2="100%" y2="30%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#fdba74'} strokeWidth="8" />

            <line x1="0" y1="52%" x2="100%" y2="50%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="14" />
            <line x1="0" y1="52%" x2="100%" y2="50%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#cbd5e1'} strokeWidth="8" />

            <line x1="0" y1="74%" x2="100%" y2="72%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="10" />
            <line x1="0" y1="74%" x2="100%" y2="72%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#fdba74'} strokeWidth="6" />

            {/* محورهای عمودی */}
            <line x1="28%" y1="0" x2="30%" y2="100%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="12" />
            <line x1="28%" y1="0" x2="30%" y2="100%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#cbd5e1'} strokeWidth="7" />

            <line x1="48%" y1="0" x2="46%" y2="100%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="16" />
            <line x1="48%" y1="0" x2="46%" y2="100%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#fdba74'} strokeWidth="10" />

            <line x1="72%" y1="0" x2="70%" y2="100%" stroke={mapLayer === 'satellite' ? '#2d4a3e' : '#f8fafc'} strokeWidth="10" />
            <line x1="72%" y1="0" x2="70%" y2="100%" stroke={mapLayer === 'satellite' ? '#1e382b' : '#cbd5e1'} strokeWidth="6" />

            {/* میادین و مراکز صنعتی */}
            <circle cx="48%" cy="51%" r="95" fill="none" stroke={mapLayer === 'satellite' ? '#3b6e50' : '#94a3b8'} strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="30%" cy="29%" r="70" fill="none" stroke={mapLayer === 'satellite' ? '#3b6e50' : '#94a3b8'} strokeWidth="2" strokeDasharray="5 3" />
          </svg>

          {/* نام راسته‌ها و مراکز شناخته‌شده بازار نساجی روی نقشه */}
          <div className="absolute top-[24%] right-[22%] text-[10px] font-bold text-zinc-500 bg-white/80 backdrop-blur-2xs px-2 py-0.5 rounded shadow-2xs">
            راسته چرخ خیاطی و ماشین‌آلات جمهوری
          </div>
          <div className="absolute top-[44%] right-[32%] text-[10px] font-bold text-zinc-500 bg-white/80 backdrop-blur-2xs px-2 py-0.5 rounded shadow-2xs">
            بازار بزرگ، سرای فردوس و مشیرخلوت
          </div>
          <div className="absolute bottom-[34%] left-[24%] text-[10px] font-bold text-zinc-500 bg-white/80 backdrop-blur-2xs px-2 py-0.5 rounded shadow-2xs">
            بازار طاقه‌فروشی عبدل‌آباد
          </div>
          <div className="absolute bottom-[18%] left-[10%] text-[10px] font-bold text-zinc-500 bg-white/80 backdrop-blur-2xs px-2 py-0.5 rounded shadow-2xs">
            شهرک صنعتی نساجی و دوخت خاوران
          </div>

          {/* پالس موقعیت مکانی من (User GPS location indicator) */}
          <div className="absolute top-[49%] left-[47%] -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg relative">
              <span className="absolute -inset-2.5 rounded-full bg-blue-400 animate-ping opacity-70" />
            </div>
          </div>

          {/* ۳. پین‌های دائمی کسب‌وکارهای معتبر نساجی (Google Maps Business Style) */}
          {filteredBusinesses.map((biz) => {
            const isSelected = biz.id === selectedPinId;

            return (
              <div
                key={biz.id}
                id={`business-pin-${biz.id}`}
                onClick={() => {
                  setSelectedPinId(biz.id);
                  setIsCardDismissed(false);
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-300"
                style={{
                  top: biz.topPercent,
                  right: biz.rightPercent,
                  transform: isSelected ? 'scale(1.2) translate(-40%, -100%)' : 'scale(1) translate(-50%, -100%)',
                }}
              >
                <div className="relative group flex flex-col items-center">
                  {/* نشانگر پین گوگل مپی با عکس یا آیکون کسب‌وکار */}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center shadow-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-orange-600 border-white ring-3 ring-orange-600/30'
                        : 'bg-white border-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <img
                      src={biz.avatarUrl}
                      alt={biz.name}
                      className="w-full h-full rounded-full object-cover p-0.5"
                    />
                    {/* بج وضعیت سبز اکنون باز است */}
                    {biz.isOpenNow && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  {/* نوک مثلثی پین به سمت مختصات */}
                  <div
                    className={`w-2.5 h-2.5 rotate-45 -mt-1 shadow-xs ${
                      isSelected ? 'bg-orange-600' : 'bg-white border-r border-b border-orange-600'
                    }`}
                  />

                  {/* برچسب نام کسب‌وکار در زیر پین (Permanent Business Pill) */}
                  <div
                    className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-xl scale-105'
                        : 'bg-white/95 text-zinc-800 border border-zinc-200'
                    }`}
                  >
                    <span>{biz.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ۴. ابزارهای شناور کنترل نقشه (Zoom In/Out, Switch Layer, Locate Me) */}
        <div className="absolute top-36 left-3 z-30 flex flex-col gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-zinc-200">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors"
            title="بزرگنمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-zinc-200" />
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors"
            title="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-zinc-200" />
          <button
            onClick={() => setMapLayer((l) => (l === 'standard' ? 'satellite' : 'standard'))}
            className={`p-2 rounded-xl transition-colors ${
              mapLayer === 'satellite' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
            title="تغییر لایه نقشه"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* دکمه مرکز کردن روی موقعیت من (GPS Compass) */}
        <button
          onClick={() => {
            setIsUserLocating(true);
            setTimeout(() => setIsUserLocating(false), 2000);
          }}
          className={`absolute bottom-52 left-3 z-30 w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200 flex items-center justify-center transition-all ${
            isUserLocating ? 'text-blue-600 ring-2 ring-blue-500 scale-105' : 'text-zinc-700 hover:bg-zinc-50'
          }`}
          title="موقعیت مکانی من"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* ۵. کارت شناور متناسب پایین نقشه (Sleek & Balanced Business Card - Google Maps Style) */}
        {activeBusiness && !isCardDismissed && (
          <div className="absolute bottom-16 left-3 right-3 z-40 max-w-sm sm:max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-200">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200/90 p-3 space-y-2">
              {/* ردیف بالا: عکس بندانگشتی، نام، تیک وریفای، رتبه، و دکمه ضربدر بستن */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 shadow-2xs">
                  <img
                    src={activeBusiness.coverUrl}
                    alt={activeBusiness.name}
                    className="w-full h-full object-cover"
                  />
                  {activeBusiness.isVerified && (
                    <span className="absolute bottom-0.5 right-0.5 bg-white rounded-full p-0.5 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-white" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-xs sm:text-sm font-black text-zinc-900 truncate">
                      {activeBusiness.name}
                    </h2>
                    <button
                      onClick={() => setIsCardDismissed(true)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
                      title="بستن کارت و مشاهده کامل نقشه"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-0.5">
                    <span className="text-orange-600 font-bold truncate">{activeBusiness.category}</span>
                    <span>•</span>
                    <span className="truncate">{activeBusiness.city}، {activeBusiness.area}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold shrink-0">★ {activeBusiness.rating}</span>
                  </div>
                </div>
              </div>

              {/* ردیف دکمه‌های عملیاتی فشرده و متناسب */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100">
                <button
                  onClick={handleOpenAdOrProfile}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>مشاهده اطلاعات و آگهی‌ها</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowNavModal(true)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold py-1.5 px-2.5 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                  title="مسیریابی"
                >
                  <Navigation className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                  <span>مسیریابی</span>
                </button>

                <a
                  href={`tel:${activeBusiness.phone}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-xl transition-colors flex items-center justify-center border border-emerald-200/60 shrink-0"
                  title="تماس"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* کپسول شناور مینیمال برای بازگشایی کارت در صورت بسته بودن */}
        {activeBusiness && isCardDismissed && (
          <button
            onClick={() => setIsCardDismissed(false)}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 hover:bg-zinc-900 transition-all border border-zinc-700/50"
          >
            <Store className="w-3.5 h-3.5 text-orange-400" />
            <span className="truncate max-w-[170px]">{activeBusiness.name}</span>
            <span className="text-[10px] text-zinc-400">| نمایش جزئیات</span>
          </button>
        )}
      </div>

      {/* مودال مسیریابی با اپلیکیشن‌های GPS */}
      {showNavModal && activeBusiness && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl space-y-3 border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>مسیریابی با برنامه دلخواه</span>
              </h3>
              <button
                onClick={() => setShowNavModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-600 text-right leading-tight">
              مقصد: <strong className="text-zinc-900">{activeBusiness.name}</strong>
              <br />
              <span className="text-[10px] text-zinc-400">{activeBusiness.address}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => openRoutingApp('neshan')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">ن</span>
                <span>نشان (Neshan)</span>
              </button>

              <button
                onClick={() => openRoutingApp('balad')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">ب</span>
                <span>بلد (Balad)</span>
              </button>

              <button
                onClick={() => openRoutingApp('google')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-red-500 hover:bg-red-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">G</span>
                <span>Google Maps</span>
              </button>

              <button
                onClick={() => openRoutingApp('waze')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">W</span>
                <span>Waze</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال انتخاب سلسله‌مراتبی کشور، استان و شهر (کامل برای ۳۱ استان و تمامی شهرهای ایران) */}
      <LocationHierarchyPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCountry={activeCountry}
        selectedProvince={activeProvince}
        selectedCity={activeCity}
        onSelectLocation={(country, province, city) => {
          setActiveCountry(country);
          setActiveProvince(province);
          setActiveCity(city);
        }}
      />

      {/* مودال فیلترهای نقشه */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl space-y-3 border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900">فیلتر مراکز نساجی و دوخت</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[
                'همه کارگاه‌ها و کارخانجات',
                'کارخانجات بافندگی و ریسندگی',
                'رنگرزی و تکمیل پارچه',
                'بنکداری و طاقه‌فروشی بازار',
                'کارگاه‌های دوخت و سری‌دوزی',
                'واردات و فروش ماشین‌آلات دوخت',
                'بورس خرج کار، زیپ و دکمه',
              ].map((filterName) => (
                <button
                  key={filterName}
                  onClick={() => {
                    setActiveCategoryFilter(filterName === 'همه کارگاه‌ها و کارخانجات' ? '' : filterName);
                    setIsFilterModalOpen(false);
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between border border-zinc-100 hover:bg-zinc-50 text-zinc-700"
                >
                  <span>{filterName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
