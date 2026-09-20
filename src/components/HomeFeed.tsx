import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Star,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Disc,
  Scissors,
  Printer,
  Cog,
  Wrench,
  Package,
  Tag,
  Sliders,
  Flame,
  Droplets,
  Palette,
  Boxes,
  ShieldCheck,
  Shirt,
  Cpu,
  Factory,
  CheckCircle2,
  ExternalLink,
  Plus,
  Play,
  Home as HomeIcon,
  LayoutGrid,
  ClipboardCheck,
  PenTool,
  ShoppingBag,
  Trash2,
  Repeat,
  UserPlus,
  Scale,
  Truck,
  Building2,
  Eye,
  MapPin,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { AdItem } from '../types';
import { MOCK_STORIES } from '../data/mockData';
import { CustomMediaPlayer } from './CustomMediaPlayer';

import { StoryViewerModal } from './StoryViewerModal';

interface HomeFeedProps {
  ads: AdItem[];
  isLoading?: boolean;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSelectAd: (ad: AdItem) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

// 16 Authentic Categories for TAROPOD Textile & Apparel Platform (Frameless, Minimalist 4-Column Layout)
const MINIMAL_CATEGORIES = [
  { id: 'cat-fabric', title: 'پارچه و منسوجات', icon: Layers, query: 'پارچه' },
  { id: 'cat-yarn', title: 'نخ و الیاف', icon: Disc, query: 'نخ' },
  { id: 'cat-machinery', title: 'چرخ خیاطی و دوخت', icon: Cog, query: 'چرخ' },
  { id: 'cat-production', title: 'تولید و مزدی‌دوزی', icon: Shirt, query: 'دوخت' },
  { id: 'cat-materials', title: 'خرج‌کار و ملزومات', icon: Tag, query: 'خرج کار' },
  { id: 'cat-cutting', title: 'الگو و برش', icon: Scissors, query: 'برش' },
  { id: 'cat-print-embroidery', title: 'چاپ و گلدوزی', icon: Printer, query: 'چاپ' },
  { id: 'cat-tools', title: 'ابزار و لوازم دوخت', icon: Wrench, query: 'ابزار' },
  { id: 'cat-ironing', title: 'اتو و تکمیل', icon: Flame, query: 'اتو' },
  { id: 'cat-dyeing', title: 'رنگرزی و شستشو', icon: Droplets, query: 'رنگرزی' },
  { id: 'cat-design', title: 'طراحی لباس و مد', icon: Palette, query: 'طراحی' },
  { id: 'cat-knit', title: 'تریکو و بافت', icon: Boxes, query: 'بافت' },
  { id: 'cat-leather', title: 'چرم و یراق‌آلات', icon: ShieldCheck, query: 'چرم' },
  { id: 'cat-packaging', title: 'بسته‌بندی و کاور', icon: Package, query: 'بسته بندی' },
  { id: 'cat-repair', title: 'تعمیرات ماشین‌آلات', icon: Cpu, query: 'تعمیرات' },
  { id: 'cat-waste', title: 'ضایعات و مازاد', icon: Trash2, query: 'ضایعات' },
];

// 3 High-Impact Visual Billboards (Designed to look like authentic commercial banners like Farsh Gheytaran)
const BILLBOARD_SLIDES = [
  {
    id: 'slide-gheytaran',
    sponsor: 'فرش قیطران',
    targetUrl: 'https://gheytaran.com',
    bgGradient: 'from-[#2e0938] via-[#4a125b] to-[#25072e]',
    authorId: 'user-1',
    renderGraphic: () => (
      <div className="w-full h-full relative flex items-center justify-between px-5 sm:px-8 text-white select-none overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />

        {/* Left / Center Typography */}
        <div className="z-10 space-y-1 sm:space-y-1.5 max-w-[65%]">
          <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 block">در جهان</span>
          <div className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-wide">
            تولیدکننده فرش <span className="text-amber-300 font-black text-sm sm:text-base">۱۵۰۰ شانه</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none pt-0.5">
            اولین
          </div>
        </div>

        {/* Right Graphic: Brand Identity & 3D Podium */}
        <div className="z-10 flex flex-col items-center justify-center shrink-0">
          <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center mb-1">
            {/* Golden emblem logo */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 drop-shadow-md fill-current">
              <path d="M50 5 C60 20, 85 25, 90 45 C95 65, 80 85, 50 95 C20 85, 5 65, 10 45 C15 25, 40 20, 50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M50 20 C55 30, 70 35, 75 50 C80 65, 70 75, 50 82 C30 75, 20 65, 25 50 C30 35, 45 30, 50 20 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <span className="text-[10px] sm:text-xs font-black text-amber-200 tracking-wider">فرش قیطران</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-300/80 mt-0.5">مفهوم فرش ایرانی</span>
        </div>

        {/* Podium element at the base */}
        <div className="absolute -bottom-4 right-10 w-32 h-14 bg-gradient-to-t from-zinc-300 to-zinc-100 rounded-t-lg shadow-2xl opacity-90 transform -skew-x-12 hidden sm:block">
          <div className="absolute inset-x-0 top-0 h-1 bg-white" />
        </div>
      </div>
    ),
  },
  {
    id: 'slide-boroujerd',
    sponsor: 'نساجی بروجرد',
    targetUrl: 'https://boroujerdtextile.ir',
    bgGradient: 'from-[#07172c] via-[#0d2e54] to-[#081b33]',
    authorId: 'pars-dookht',
    renderGraphic: () => (
      <div className="w-full h-full relative flex items-center justify-between px-5 sm:px-8 text-white select-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl" />

        <div className="z-10 space-y-1 sm:space-y-1.5 max-w-[65%]">
          <span className="text-[10px] sm:text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-md inline-block">
            جشنواره بهاره تأمین مستقیم
          </span>
          <div className="text-white font-black text-sm sm:text-lg tracking-tight">
            پارچه‌های ۱۰۰٪ پنبه و ملحفه‌ای
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-300 font-medium">
            عرض ۲.۴۰ با ضمانت کتبی ثبات رنگ و شستشو • تحویل فوری کارخانه
          </p>
        </div>

        <div className="z-10 flex flex-col items-center justify-center shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center mb-1 text-cyan-300 shadow-inner">
            <Factory className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>
          <span className="text-xs sm:text-sm font-black text-cyan-200">نساجی بروجرد</span>
          <span className="text-[9px] text-zinc-300">۵۰ سال اصالت و کیفیت</span>
        </div>
      </div>
    ),
  },
  {
    id: 'slide-jack',
    sponsor: 'ماشین‌آلات صنعتی جک',
    targetUrl: 'https://jack-sewing.ir',
    bgGradient: 'from-[#2a1205] via-[#431407] to-[#1c0802]',
    authorId: 'user-1',
    renderGraphic: () => (
      <div className="w-full h-full relative flex items-center justify-between px-5 sm:px-8 text-white select-none overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-orange-500/20 rounded-full blur-2xl" />

        <div className="z-10 space-y-1 sm:space-y-1.5 max-w-[65%]">
          <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md inline-block">
            نسل جدید ماشین‌آلات ۲۰۲۶
          </span>
          <div className="text-white font-black text-sm sm:text-lg tracking-tight">
            چرخ‌های راسته و میان‌دوز کامپیوتری JACK
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-300 font-medium">
            گارانتی ۳۶ ماهه طلایی با موتور سرودایرکت بی‌صدا و سیستم مکش خودکار
          </p>
        </div>

        <div className="z-10 flex flex-col items-center justify-center shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/15 border border-orange-400/40 flex items-center justify-center mb-1 text-orange-300 shadow-inner">
            <Cog className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>
          <span className="text-xs sm:text-sm font-black text-orange-200">نمایندگی مرکزی جک</span>
          <span className="text-[9px] text-zinc-300">تجهیز خطوط تولید</span>
        </div>
      </div>
    ),
  },
];

export const HomeFeed: React.FC<HomeFeedProps> = ({
  ads,
  isLoading = false,
  bookmarkedIds,
  onToggleBookmark,
  onSelectAd,
  onSelectAuthor,
  onSelectCategory,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMutedMap, setIsMutedMap] = useState<Record<string, boolean>>({});
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [reactionsMap, setReactionsMap] = useState<Record<string, 'up' | 'down' | null>>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handleReaction = (adId: string, type: 'up' | 'down') => {
    setReactionsMap((prev) => ({
      ...prev,
      [adId]: prev[adId] === type ? null : type,
    }));
  };

  const getAdUnitPricing = (ad: AdItem): string => {
    if (!ad.price) return 'توافقی';
    const numPrice = typeof ad.price === 'number' ? ad.price : parseInt(String(ad.price).replace(/\D/g, ''), 10);
    if (isNaN(numPrice) || numPrice === 0) return 'استعلام قیمت روز';

    const cat = (ad.category || '').toLowerCase();
    if (cat.includes('پارچه')) {
      const perMeter = Math.round(numPrice / 50);
      return `${perMeter.toLocaleString('fa-IR')} تومان`;
    } else if (cat.includes('نخ') || cat.includes('الیاف') || cat.includes('ضایعات')) {
      const perKg = Math.round(numPrice / 80);
      return `${perKg.toLocaleString('fa-IR')} تومان`;
    } else if (cat.includes('دوخت') || cat.includes('تولید') || cat.includes('چاپ')) {
      const perPiece = Math.round(numPrice / 250);
      return `${perPiece.toLocaleString('fa-IR')} تومان`;
    } else {
      return `${numPrice.toLocaleString('fa-IR')} تومان`;
    }
  };

  const getAdQuantityMetrics = (ad: AdItem): string => {
    const cat = (ad.category || '').toLowerCase();
    if (cat.includes('پارچه')) {
      return 'طاقه ۵۰ متری (عرض ۱۵۰)';
    } else if (cat.includes('نخ') || cat.includes('الیاف')) {
      return 'کارتن ۲۵ کیلوگرمی';
    } else if (cat.includes('چرخ') || cat.includes('ماشین‌آلات')) {
      return '۱ دستگاه (تحویل فوری)';
    } else if (cat.includes('دوخت') || cat.includes('تولید')) {
      return 'حداقل تیراژ ۲۰۰ عدد';
    } else if (cat.includes('خرج') || cat.includes('ملزومات')) {
      return 'بسته ۱۰۰۰ عددی (عمده)';
    } else {
      return 'تحویل از انبار مرکزی';
    }
  };

  // Auto rotate billboard every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % BILLBOARD_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleBillboardClick = (slide: typeof BILLBOARD_SLIDES[0]) => {
    if (slide.authorId) {
      onSelectAuthor(slide.authorId);
    } else if (slide.targetUrl) {
      window.open(slide.targetUrl, '_blank');
    }
  };

  const handleShare = (ad: AdItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `${ad.title} - در سامانه تخصصی نساجی و پوشاک`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback('لینک آگهی کپی شد!');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto">
      {shareFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs px-4 py-2 rounded-xl shadow-lg animate-fade-in">
          {shareFeedback}
        </div>
      )}

      {/* ۱. نوار استوری‌ها (بالای بیلبورد - دقیقاً مطابق ساختار دایره‌ای با نشان + در عکس ارسالی) */}
      <section className="bg-white px-3 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          
          {/* دکمه ایجاد استوری با حلقه خط‌چین و علامت + قرمز */}
          <button
            onClick={() => setShowStoryModal(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-400/80 p-0.5 flex items-center justify-center bg-white group-hover:border-orange-500 transition-colors">
                <div className="w-full h-full rounded-full bg-zinc-50 flex items-center justify-center text-orange-600">
                  <Shirt className="w-6 h-6 stroke-[2]" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs">
                +
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-800">ایجاد استوری</span>
          </button>

          {/* استوری‌های برتر صنعت نساجی برگرفته از ۱۰ استوری فعال */}
          {MOCK_STORIES.map((st, index) => (
            <button
              key={st.id}
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none relative"
            >
              <div className={`w-14 h-14 rounded-full border-2 ${st.mediaType === 'video' ? 'border-orange-600 ring-2 ring-orange-100' : 'border-amber-500'} p-0.5 flex items-center justify-center bg-white group-hover:scale-105 transition-transform`}>
                <img
                  src={st.authorAvatar}
                  alt={st.authorName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {st.mediaType === 'video' && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-bold px-1 py-0.2 rounded-full border border-white shadow-xs flex items-center gap-0.5">
                  <Play className="w-2 h-2 fill-white" />
                  <span>{st.durationSeconds}s</span>
                </span>
              )}
              <span className="text-[11px] font-medium text-zinc-700 whitespace-nowrap max-w-[68px] truncate text-center">
                {st.authorName}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ۲. جایگاه بنر بیلبوردی (فول‌وید، چسبیده به کناره‌ها بدون حاشیه و قاب اضافی طبق درخواست و عکس) */}
      <section className="w-full relative">
        <div
          onClick={() => handleBillboardClick(BILLBOARD_SLIDES[currentSlideIndex])}
          className="w-full aspect-[2.1/1] sm:aspect-[2.3/1] overflow-hidden relative cursor-pointer select-none group bg-zinc-950"
        >
          {BILLBOARD_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-opacity duration-700 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {slide.renderGraphic()}
              </div>
            );
          })}

          {/* نقطه کنترل اسلاید (پجینیشن مینیمال در مرکز پایین بنر، عین عکس) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {BILLBOARD_SLIDES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(dotIdx);
                }}
                className={`transition-all rounded-full ${
                  dotIdx === currentSlideIndex
                    ? 'w-2 h-2 bg-orange-500'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                }`}
                title={`بنر ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ۳. شبکه دسته‌بندی‌های اصلی (۴ ستونه، کاملاً مینیمال، بدون قاب مربعی و رنگ پس‌زمینه، دقیقاً طبق عکس ارسالی) */}
      <section className="bg-white py-6 px-3 border-b border-zinc-100">
        <div className="grid grid-cols-4 gap-y-7 gap-x-2">
          {MINIMAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => onSelectCategory(cat.query)}
                className="flex flex-col items-center justify-center text-center group focus:outline-none transition-transform active:scale-95"
              >
                {/* آیکون خطی تک‌رنگ نارنجی سازمانی (بدون کادر، بدون پس‌زمینه مربعی) */}
                <div className="w-9 h-9 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 stroke-[1.8]" />
                </div>
                {/* عنوان تمیز زیر آیکون */}
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-800 text-center leading-tight mt-1.5 group-hover:text-orange-600 transition-colors">
                  {cat.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ۴. فید آگهی‌ها - ساختار مینیمال الهام گرفته از اینستاگرام و نمونه ارسالی */}
      <section className="bg-zinc-100/70 divide-y-8 divide-zinc-100">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-zinc-100">
          <h2 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-600" />
            <span>تازه‌ترین آگهی‌ها و سفارشات صنعت نساجی</span>
          </h2>
          <span className="text-[11px] text-zinc-400">به‌روزرسانی لحظه‌ای</span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-4 animate-pulse bg-white">
            {[1, 2].map((n) => (
              <div key={n} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-full bg-zinc-200" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-zinc-200 rounded-md" />
                      <div className="h-2.5 w-20 bg-zinc-200 rounded-md" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-zinc-200 rounded" />
                </div>
                <div className="aspect-4/3 w-full bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-zinc-900">هیچ آگهی در این دسته یافت نشد</h3>
              <p className="text-[11px] text-zinc-500">
                در حال حاضر موردی متناسب با فیلتر انتخابی موجود نیست.
              </p>
            </div>
          </div>
        ) : (
          ads.map((ad) => {
            const isBookmarked = bookmarkedIds.includes(ad.id);
            const activeImgIdx = activeImageIndexMap[ad.id] || 0;
            const currentReaction = reactionsMap[ad.id] || null;

            return (
              <article
                key={ad.id}
                id={`feed-ad-${ad.id}`}
                onClick={() => onSelectAd(ad)}
                className="bg-white cursor-pointer select-none"
              >
                {/* بخش اول: هدر بالای کارت (پروفایل کسب‌وکار در راست + برچسب دسته‌بندی و زمان در چپ، عین تصویر) */}
                <div className="px-4 py-3 flex items-center justify-between">
                  {/* سمت راست: آواتار گرد + نام کسب‌وکار + عنوان تخصص/فعالیت */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAuthor(ad.authorId);
                    }}
                    className="flex items-center gap-2.5 group/author text-right"
                  >
                    <div className="relative">
                      <img
                        src={ad.authorAvatar}
                        alt={ad.authorName}
                        className="w-11 h-11 rounded-full object-cover border border-zinc-200 group-hover/author:ring-2 ring-orange-500 transition-all"
                      />
                      {ad.authorVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 bg-white rounded-full absolute -bottom-0.5 -left-0.5 fill-orange-100" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-zinc-900 group-hover/author:text-orange-700 transition-colors leading-tight">
                        {ad.authorName}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        {ad.authorSpecialty || ad.category}
                      </p>
                    </div>
                  </div>

                  {/* سمت چپ: کادر باریک نوع آگهی/دسته‌بندی + زمان درج آگهی زیر آن */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-medium text-zinc-500 border border-zinc-300/90 rounded px-2.5 py-0.5 whitespace-nowrap bg-zinc-50/50">
                      {ad.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {ad.createdAtText || '۳ ساعت پیش'}
                    </span>
                  </div>
                </div>

                {/* بخش دوم: مدیا تمام‌عرض (پشتیبانی هوشمند از ویدیو/عکس با نسبت ابعاد عمودی، افقی یا مربعی) */}
                {(() => {
                  const aspectClass = ad.aspectRatio === 'vertical'
                    ? 'aspect-[4/5] max-h-[540px]'
                    : ad.aspectRatio === 'horizontal'
                      ? 'aspect-[16/9]'
                      : 'aspect-square';

                  return (
                    <div className={`relative w-full ${aspectClass} bg-zinc-950 overflow-hidden flex items-center justify-center`}>
                      {playingVideoId === ad.id && ad.hasVideo && ad.videoUrl ? (
                        <div
                          className="w-full h-full relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CustomMediaPlayer
                            src={ad.videoUrl}
                            poster={ad.images[0]}
                            title={ad.title}
                            authorName={ad.authorName}
                            durationText={ad.videoDuration || '۰۳:۴۵'}
                            quality={ad.videoQuality || '1080p FHD'}
                            aspectRatio={ad.aspectRatio || 'horizontal'}
                            autoPlay={true}
                            initialMuted={false}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingVideoId(null);
                            }}
                            className="absolute top-3 left-3 z-30 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md transition-all cursor-pointer"
                            title="بستن پخش ویدیو"
                          >
                            <span>✕</span>
                            <span>بستن پخش</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={ad.images[activeImgIdx] || ad.images[0]}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                          />

                          {/* بج تعداد عکس در بالا چپ */}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 pointer-events-none">
                            <span>{(activeImgIdx || 0) + 1}/{Math.max(ad.images.length, 1)}</span>
                          </div>

                          {/* بج نوع مدیا و کیفیت ۱۰۸۰p FHD در بالا راست */}
                          {ad.hasVideo ? (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
                              <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-white" />
                                <span>ویدیو {ad.videoDuration || '۰۳:۴۵'}</span>
                              </span>
                              <span className="bg-black/70 backdrop-blur-xs text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-white/10">
                                {ad.videoQuality || '1080p FHD'}
                              </span>
                            </div>
                          ) : (
                            ad.aspectRatio === 'vertical' && (
                              <div className="absolute top-3 right-3 bg-zinc-900/70 backdrop-blur-xs text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md pointer-events-none">
                                پرتره عمودی
                              </div>
                            )
                          )}

                          {/* دکمه پخش ویدیو در مرکز کارت برای پست‌های ویدیویی */}
                          {ad.hasVideo && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideoId(ad.id);
                              }}
                              className="absolute inset-0 flex items-center justify-center cursor-pointer group/play focus:outline-none"
                              title="پخش ویدیو با پلیر اختصاصی"
                            >
                              <div className="w-14 h-14 rounded-full bg-black/60 hover:bg-orange-600/90 backdrop-blur-xs border-2 border-white/40 text-white flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-all duration-200">
                                <Play className="w-7 h-7 fill-white translate-x-[-1.5px]" />
                              </div>
                            </button>
                          )}
                        </>
                      )}

                      {/* دکمه‌های اسلاید برای تصاویر چندگانه */}
                      {ad.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndexMap((prev) => ({
                                ...prev,
                                [ad.id]: ((prev[ad.id] || 0) - 1 + ad.images.length) % ad.images.length,
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndexMap((prev) => ({
                                ...prev,
                                [ad.id]: ((prev[ad.id] || 0) + 1) % ad.images.length,
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* بخش سوم: نوار اکشن زیر عکس (نشان، لوکیشن، اشتراک در چپ | نقطه‌های اسلاید در وسط | دیس‌لایک و لایک در راست) */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-100">
                  {/* دکمه‌های تعاملی سمت چپ: بوک‌مارک، لوکیشن، شیر */}
                  <div className="flex items-center gap-3 text-zinc-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ad.id);
                      }}
                      className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
                      title="نشان کردن"
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-zinc-900 text-zinc-900' : 'stroke-[1.6]'}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`موقعیت کارگاه/فروشگاه: ${ad.province}، ${ad.city} ${ad.location?.areaName || ''}`);
                      }}
                      className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
                      title="مشاهده موقعیت روی نقشه"
                    >
                      <MapPin className="w-5 h-5 stroke-[1.6]" />
                    </button>

                    <button
                      onClick={(e) => handleShare(ad, e)}
                      className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
                      title="اشتراک‌گذاری"
                    >
                      <Share2 className="w-5 h-5 stroke-[1.6]" />
                    </button>
                  </div>

                  {/* نقطه‌های وسط (اسلایدر عکس) */}
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`rounded-full transition-all ${
                          dotIdx === (activeImgIdx % 5)
                            ? 'w-2 h-2 bg-orange-600'
                            : 'w-1.5 h-1.5 bg-zinc-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* دکمه‌های سمت راست: دیس‌لایک و لایک */}
                  <div className="flex items-center gap-3 text-zinc-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(ad.id, 'down');
                      }}
                      className={`hover:text-zinc-900 transition-colors p-0.5 focus:outline-none ${
                        currentReaction === 'down' ? 'text-zinc-900' : ''
                      }`}
                      title="عدم علاقه"
                    >
                      <ThumbsDown className={`w-5 h-5 ${currentReaction === 'down' ? 'fill-zinc-900 text-zinc-900' : 'stroke-[1.6]'}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(ad.id, 'up');
                      }}
                      className={`hover:text-orange-600 transition-colors p-0.5 focus:outline-none ${
                        currentReaction === 'up' ? 'text-orange-600' : ''
                      }`}
                      title="پسندیدن"
                    >
                      <ThumbsUp className={`w-5 h-5 ${currentReaction === 'up' ? 'fill-orange-600 text-orange-600' : 'stroke-[1.6]'}`} />
                    </button>
                  </div>
                </div>

                {/* بخش چهارم: عنوان و جدول مشخصات کلیدی (قیمت کل، قیمت واحد، حجم/متراژ، موقعیت با خطوط جداکننده نازک) */}
                <div className="px-4 pt-3 pb-4">
                  {/* عنوان بزرگ آگهی */}
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 text-right leading-snug mb-3">
                    {ad.title}
                  </h3>

                  {/* جدول مشخصات قیمت و ویژگی‌ها در ردیف‌های خط‌کشی شده */}
                  <div className="divide-y divide-zinc-200 border-t border-zinc-200 text-xs sm:text-sm">
                    {/* ردیف ۱: قیمت کل */}
                    <div className="py-2.5 flex items-center justify-between text-zinc-800">
                      <span className="font-medium text-zinc-500">قیمت کل</span>
                      <span className="font-bold text-zinc-900">
                        {ad.price ? `${ad.price.toLocaleString('fa-IR')} تومان` : 'توافقی'}
                      </span>
                    </div>

                    {/* ردیف ۲: قیمت هر متر / هر کیلو / واحد */}
                    <div className="py-2.5 flex items-center justify-between text-zinc-800">
                      <span className="font-medium text-zinc-500">قیمت واحد</span>
                      <span className="font-bold text-zinc-900">
                        {getAdUnitPricing(ad)}
                      </span>
                    </div>

                    {/* ردیف ۳: حجم / متراژ / تیراژ */}
                    <div className="py-2.5 flex items-center justify-between text-zinc-800">
                      <span className="font-medium text-zinc-500">حجم / متراژ</span>
                      <span className="font-bold text-zinc-900">
                        {getAdQuantityMetrics(ad)}
                      </span>
                    </div>

                    {/* ردیف ۴: موقعیت جغرافیایی */}
                    <div className="py-2.5 flex items-center justify-between text-zinc-800">
                      <span className="font-medium text-zinc-500">موقعیت</span>
                      <span className="font-bold text-zinc-900">
                        {ad.province}، {ad.city} {ad.location?.areaName ? `(${ad.location.areaName})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* پخش‌کننده استوری تمام‌صفحه دقیقاً مطابق ویدیوی ۶۰ ثانیه‌ای و تصویر اینستاگرامی ارسالی */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          initialStoryIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onSelectAuthor={(authorId) => {
            setActiveStoryIndex(null);
            onSelectAuthor(authorId);
          }}
        />
      )}

      {/* مودال ایجاد استوری و بارگذاری ویدیو */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-5 space-y-4 text-center border border-zinc-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-zinc-900">ایجاد استوری و معرفی خط تولید</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                می‌توانید عکس یا ویدیوی تا ۶۰ ثانیه از کارگاه، نمونه کالیته و خط دوخت بارگذاری نمایید.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowStoryModal(false);
                  setActiveStoryIndex(0); // Open 60-second video story directly!
                }}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                مشاهده استوری ۶۰ ثانیه‌ای تست
              </button>

              <button
                onClick={() => setShowStoryModal(false)}
                className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
