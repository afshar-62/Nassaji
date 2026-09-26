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
  GraduationCap,
  Leaf,
} from 'lucide-react';
import { AdItem } from '../types';
import { MOCK_STORIES_10 } from '../data/mockStoriesData';
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
  onCreateListing?: () => void;
}

// 15 Industry Categories (Pure frameless 3D Isometric Icons, unified across all 15 categories)
const MINIMAL_CATEGORIES = [
  { id: 'cat-raw', title: 'مواد اولیه', image: '/assets/categories/raw_materials.jpg', query: 'مواد اولیه' },
  { id: 'cat-yarn', title: 'نخ و الیاف', image: '/assets/categories/yarns_fibers.jpg', query: 'نخ' },
  { id: 'cat-fabric', title: 'پارچه و منسوجات', image: '/assets/categories/fabrics.jpg', query: 'پارچه' },
  { id: 'cat-dyeing', title: 'چاپ و رنگرزی', image: '/assets/categories/dyeing_printing.jpg', query: 'چاپ' },
  { id: 'cat-leather', title: 'چرم و پوست', image: '/assets/categories/leather.jpg', query: 'چرم' },
  { id: 'cat-trims', title: 'خرج‌کار و ملزومات', image: '/assets/categories/trims.jpg', query: 'خرج کار' },
  { id: 'cat-machinery', title: 'ماشین‌آلات و قطعات', image: '/assets/categories/machinery.jpg', query: 'چرخ' },
  { id: 'cat-finished', title: 'پوشاک و محصولات', image: '/assets/categories/finished_apparel.jpg', query: 'محصول' },
  { id: 'cat-production', title: 'تولید و مزدی‌دوزی', image: '/assets/categories/production.jpg', query: 'دوخت' },
  { id: 'cat-repair', title: 'تعمیرات و مهندسی', image: '/assets/categories/repair.jpg', query: 'تعمیرات' },
  { id: 'cat-design', title: 'طراحی الگو و مد', image: '/assets/categories/pattern_design.jpg', query: 'طراحی' },
  { id: 'cat-logistics', title: 'تجارت و لجستیک', image: '/assets/categories/logistics.jpg', query: 'لجستیک' },
  { id: 'cat-education', title: 'آموزش و مهارت', image: '/assets/categories/education.jpg', query: 'آموزش' },
  { id: 'cat-jobs', title: 'استخدام و نیروی کار', image: '/assets/categories/jobs.jpg', query: 'استخدام' },
  { id: 'cat-waste', title: 'ضایعات و بازیافت', image: '/assets/categories/waste.jpg', query: 'ضایعات' },
];

// Authentic industry billboard banners with zero artificial text overlay
const BILLBOARD_SLIDES = [
  {
    id: 'slide-janome-jack',
    title: 'چرخ خیاطی صنعتی ژانومه و جک',
    sponsor: 'ماشین‌آلات صنعتی ژانومه / جک',
    imageUrl: '/src/assets/images/billboard_janome_sewing_1790066137802.jpg',
    targetUrl: 'https://janome.ir',
    authorId: 'user-3',
  },
  {
    id: 'slide-boroujerd',
    title: 'کارخانجات نساجی بروجرد',
    sponsor: 'نساجی بروجرد',
    imageUrl: '/src/assets/images/billboard_boroujerd_textile_1790066150701.jpg',
    targetUrl: 'https://boroujerdtextile.ir',
    authorId: 'user-2',
  },
  {
    id: 'slide-motahari',
    title: 'پارچه فاستونی و پشمی مطهری',
    sponsor: 'فاستونی مطهری',
    imageUrl: '/src/assets/images/billboard_motahari_fabric_1790066160974.jpg',
    targetUrl: 'https://motaharitex.ir',
    authorId: 'user-1',
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
  onCreateListing,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMutedMap, setIsMutedMap] = useState<Record<string, boolean>>({});
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Billboard Touch Swipe Handlers (Swipe left/right to change billboard)
  const [billboardTouchStart, setBillboardTouchStart] = useState<number | null>(null);
  const [billboardTouchEnd, setBillboardTouchEnd] = useState<number | null>(null);

  const handleBillboardTouchStart = (e: React.TouchEvent) => {
    setBillboardTouchEnd(null);
    setBillboardTouchStart(e.targetTouches[0].clientX);
  };

  const handleBillboardTouchMove = (e: React.TouchEvent) => {
    setBillboardTouchEnd(e.targetTouches[0].clientX);
  };

  const handleBillboardTouchEnd = () => {
    if (billboardTouchStart === null || billboardTouchEnd === null) return;
    const distance = billboardTouchStart - billboardTouchEnd;
    if (distance > 35) {
      // Swiped Left -> Next slide
      setCurrentSlideIndex((prev) => (prev + 1) % BILLBOARD_SLIDES.length);
    } else if (distance < -35) {
      // Swiped Right -> Previous slide
      setCurrentSlideIndex((prev) => (prev - 1 + BILLBOARD_SLIDES.length) % BILLBOARD_SLIDES.length);
    }
    setBillboardTouchStart(null);
    setBillboardTouchEnd(null);
  };

  // Ad Image Carousel Touch Swipe Handlers (Swipe left/right to change images)
  const [adTouchMap, setAdTouchMap] = useState<Record<string, { start: number | null; end: number | null; moved: boolean }>>({});

  const handleAdTouchStart = (adId: string, e: React.TouchEvent) => {
    setAdTouchMap((prev) => ({
      ...prev,
      [adId]: { start: e.targetTouches[0].clientX, end: null, moved: false },
    }));
  };

  const handleAdTouchMove = (adId: string, e: React.TouchEvent) => {
    setAdTouchMap((prev) => ({
      ...prev,
      [adId]: {
        start: prev[adId]?.start ?? null,
        end: e.targetTouches[0].clientX,
        moved: true,
      },
    }));
  };

  const handleAdTouchEnd = (ad: AdItem) => {
    const touch = adTouchMap[ad.id];
    if (touch && touch.start !== null && touch.end !== null && touch.moved) {
      const distance = touch.start - touch.end;
      if (Math.abs(distance) > 35) {
        if (distance > 35) {
          // Swipe left -> next image
          setActiveImageIndexMap((prev) => ({
            ...prev,
            [ad.id]: ((prev[ad.id] || 0) + 1) % Math.max(ad.images.length, 1),
          }));
        } else if (distance < -35) {
          // Swipe right -> prev image
          setActiveImageIndexMap((prev) => ({
            ...prev,
            [ad.id]: ((prev[ad.id] || 0) - 1 + ad.images.length) % Math.max(ad.images.length, 1),
          }));
        }
      }
    }
    setAdTouchMap((prev) => ({
      ...prev,
      [ad.id]: { start: null, end: null, moved: false },
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

      {/* ۱. نوار استوری‌ها (بدون دکمه ایجاد استوری - اولین استوری تاروپود رسمی و ثابت است) */}
      <section className="bg-white px-3 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {MOCK_STORIES_10.map((st, index) => {
            const isTaropodOfficial = st.id === 'story-taropod' || index === 0;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStoryIndex(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none relative"
              >
                <div
                  className={`w-14 h-14 rounded-full p-0.5 flex items-center justify-center bg-white group-hover:scale-105 transition-transform ${
                    isTaropodOfficial
                      ? 'border-2 border-amber-500 ring-2 ring-amber-200/80 shadow-xs'
                      : st.mediaType === 'video'
                      ? 'border-2 border-orange-600 ring-2 ring-orange-100'
                      : 'border-2 border-zinc-300'
                  }`}
                >
                  <img
                    src={st.authorAvatar}
                    alt={st.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-0.5 max-w-[74px]">
                  <span
                    className={`text-[11px] truncate text-center ${
                      isTaropodOfficial ? 'font-black text-amber-700' : 'font-medium text-zinc-700'
                    }`}
                  >
                    {st.authorName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ۲. جایگاه بنر بیلبوردی (تصویر واقعی تبلیغاتی صنعت، تمام‌صفحه بدون متن مصنوعی روی آن، دارای قابلیت سوایپ لمسی) */}
      <section className="w-full relative">
        <div
          onClick={() => handleBillboardClick(BILLBOARD_SLIDES[currentSlideIndex])}
          onTouchStart={handleBillboardTouchStart}
          onTouchMove={handleBillboardTouchMove}
          onTouchEnd={handleBillboardTouchEnd}
          className="w-full aspect-[2.1/1] sm:aspect-[2.3/1] overflow-hidden relative cursor-pointer select-none group bg-zinc-950"
        >
          {BILLBOARD_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            );
          })}

          {/* نقطه کنترل اسلاید (پجینیشن مینیمال در مرکز پایین بنر بیلبورد) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
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
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
                title={`بنر ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ۳. شبکه دسته‌بندی‌های اصلی (کاملاً بدون قاب، بدون کادر و حاشیه، یکدست با آیکون‌های کانسپت ارسالی) */}
      <section className="bg-white py-5 px-2 border-b border-zinc-100">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-5 gap-x-1">
          {MINIMAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              onClick={() => onSelectCategory(cat.query)}
              className="flex flex-col items-center justify-start text-center group focus:outline-none transition-transform active:scale-95"
            >
              {/* آیکون کاملاً بدون کادر و قاب، شناور روی صفحه */}
              <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* عنوان تمیز زیر آیکون */}
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-800 text-center leading-tight mt-1.5 group-hover:text-orange-600 transition-colors line-clamp-1">
                {cat.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ۴. فید آگهی‌ها - ساختار مینیمال الهام گرفته از اینستاگرام و نمونه ارسالی */}
      <section className="bg-zinc-100/70 divide-y-8 divide-zinc-100">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-zinc-100">
          <h2 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-600" />
            <span>تازه‌ترین آگهی‌ها و سفارشات صنعت نساجی</span>
          </h2>
          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-md">
            به‌روزرسانی لحظه‌ای
          </span>
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

            return (
              <article
                key={ad.id}
                id={`feed-ad-${ad.id}`}
                onClick={() => onSelectAd(ad)}
                className="bg-white cursor-pointer select-none"
              >
                {/* بخش اول: هدر بالای کارت (پروفایل کسب‌وکار + نشان آنلاین در راست + برچسب دسته‌بندی در چپ) */}
                <div className="px-4 py-3 flex items-center justify-between">
                  {/* سمت راست: آواتار گرد با نشان وضعیت آنلاین + نام کسب‌وکار + عنوان تخصص/فعالیت */}
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
                      {/* نشان دکمه‌ای استاندارد آنلاین / آفلاین روی تصویر لوگو */}
                      <span
                        className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 ring-1 shadow-xs ${
                          ad.isOnline !== false
                            ? 'bg-emerald-500 ring-emerald-500/20'
                            : 'bg-rose-500 ring-rose-500/20'
                        }`}
                        title={ad.isOnline !== false ? 'آنلاین' : 'آفلاین'}
                      />
                      {ad.authorVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 bg-white rounded-full absolute -top-0.5 -left-0.5 fill-orange-100" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-zinc-900 group-hover/author:text-orange-700 transition-colors leading-tight">
                          {ad.authorName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-zinc-400 font-medium">
                          {ad.authorSpecialty || ad.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* سمت چپ: کادر باریک نوع آگهی/دسته‌بندی */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-medium text-zinc-600 border border-zinc-300/90 rounded px-2.5 py-0.5 whitespace-nowrap bg-zinc-50/70">
                      {ad.category}
                    </span>
                  </div>
                </div>

                {/* بخش دوم: مدیا تمام‌عرض با قابلیت لمسی سوایپ و کلیک برای مشاهده در اندازه کامل */}
                {(() => {
                  const aspectClass = ad.aspectRatio === 'vertical'
                    ? 'aspect-[4/5] max-h-[540px]'
                    : ad.aspectRatio === 'horizontal'
                      ? 'aspect-[16/9]'
                      : 'aspect-square';

                  return (
                    <div
                      onTouchStart={(e) => handleAdTouchStart(ad.id, e)}
                      onTouchMove={(e) => handleAdTouchMove(ad.id, e)}
                      onTouchEnd={() => handleAdTouchEnd(ad)}
                      className={`relative w-full ${aspectClass} bg-zinc-950 overflow-hidden flex items-center justify-center`}
                    >
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
                          {ad.images.length > 1 && (
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 pointer-events-none">
                              <span>{(activeImgIdx || 0) + 1}/{Math.max(ad.images.length, 1)}</span>
                            </div>
                          )}

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
                    </div>
                  );
                })()}

                {/* بخش سوم: نوار اکشن زیر مدیا (زمان انتشار در راست | نقاط اسلاید در وسط | سیو و شیر در چپ) */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-100">
                  {/* سمت راست: زمان انتشار آگهی / تاریخ */}
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 stroke-[1.8]" />
                    <span className="text-[11px] font-medium text-zinc-500">
                      {ad.createdAtText || '۳ ساعت پیش'}
                    </span>
                  </div>

                  {/* نقطه‌های وسط (اسلایدر عکس با امکان سوایپ لمسی) */}
                  <div className="flex items-center gap-1.5">
                    {ad.images.slice(0, 5).map((_, dotIdx) => (
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

                  {/* دکمه‌های سمت چپ: نشان کردن (سیو) و اشتراک‌گذاری */}
                  <div className="flex items-center gap-3 text-zinc-500">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(ad.id);
                      }}
                      className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
                      title="نشان کردن (ذخیره)"
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-zinc-900 text-zinc-900' : 'stroke-[1.6]'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShare(ad, e)}
                      className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
                      title="اشتراک‌گذاری"
                    >
                      <Share2 className="w-5 h-5 stroke-[1.6]" />
                    </button>
                  </div>
                </div>

                {/* بخش چهارم: عنوان و جدول مشخصات کلیدی + دکمه رسمی مشاهده جزئیات آگهی */}
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

                  {/* دکمه رسمی و اختصاصی مشاهده جزئیات آگهی و اطلاعات تماس */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAd(ad);
                    }}
                    className="w-full mt-3 py-2.5 px-4 rounded-xl bg-zinc-50 hover:bg-orange-50 border border-zinc-200/90 hover:border-orange-300 text-zinc-800 hover:text-orange-700 text-xs font-bold flex items-center justify-between transition-all group/btn shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-600 group-hover/btn:scale-125 transition-transform" />
                      <span>مشاهده جزئیات کامل آگهی و اطلاعات تماس</span>
                    </span>
                    <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover/btn:text-orange-600 group-hover/btn:-translate-x-1 transition-all" />
                  </button>
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
