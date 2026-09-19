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
  GraduationCap,
  Printer,
  Cog,
  Wrench,
  Package,
  Tag,
  Sliders,
  Flame,
  Grid,
  Droplets,
  Palette,
  Boxes,
  ShieldCheck,
  Shirt,
  Cpu,
  Factory,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AdItem } from '../types';
import { BILLBOARD_BANNERS } from '../data/mockData';
import { taxonomyService, CategoryDto, CategoryTreeDto } from '../core/api/taxonomy.service';

interface HomeFeedProps {
  ads: AdItem[];
  isLoading?: boolean;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSelectAd: (ad: AdItem) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

// Icon helper mapping for dynamic icon names
const getCategoryIcon = (iconName?: string | null) => {
  switch (iconName) {
    case 'Factory': return <Factory className="w-5 h-5" />;
    case 'Disc': return <Disc className="w-5 h-5" />;
    case 'Layers': return <Layers className="w-5 h-5" />;
    case 'Scissors': return <Scissors className="w-5 h-5" />;
    case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
    case 'Printer': return <Printer className="w-5 h-5" />;
    case 'Cog': return <Cog className="w-5 h-5" />;
    case 'Wrench': return <Wrench className="w-5 h-5" />;
    case 'Package': return <Package className="w-5 h-5" />;
    case 'Tag': return <Tag className="w-5 h-5" />;
    case 'Sliders': return <Sliders className="w-5 h-5" />;
    case 'Flame': return <Flame className="w-5 h-5" />;
    case 'Grid': return <Grid className="w-5 h-5" />;
    case 'Droplets': return <Droplets className="w-5 h-5" />;
    case 'Palette': return <Palette className="w-5 h-5" />;
    case 'Boxes': return <Boxes className="w-5 h-5" />;
    case 'Cpu': return <Cpu className="w-5 h-5" />;
    case 'Shirt': return <Shirt className="w-5 h-5" />;
    case 'Settings': return <Cog className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

const CATEGORY_COLORS = [
  'from-amber-500/10 to-amber-600/10 text-amber-700',
  'from-blue-500/10 to-blue-600/10 text-blue-700',
  'from-emerald-500/10 to-emerald-600/10 text-emerald-700',
  'from-purple-500/10 to-purple-600/10 text-purple-700',
  'from-cyan-500/10 to-cyan-600/10 text-cyan-700',
  'from-indigo-500/10 to-indigo-600/10 text-indigo-700',
  'from-rose-500/10 to-rose-600/10 text-rose-700',
  'from-orange-500/10 to-orange-600/10 text-orange-700',
  'from-teal-500/10 to-teal-600/10 text-teal-700',
  'from-violet-500/10 to-violet-600/10 text-violet-700',
  'from-fuchsia-500/10 to-fuchsia-600/10 text-fuchsia-700',
  'from-amber-600/10 to-red-500/10 text-red-700',
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
  // Billboard 4-second auto-rotation state (Exact from sketch note: تعویض خودکار هر ۴ ثانیه + دستی)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMutedMap, setIsMutedMap] = useState<Record<string, boolean>>({});
  const [activeImageIndexMap, setActiveImageIndexMap] = useState<Record<string, number>>({});
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Live taxonomy state from PostgreSQL API
  const [categoryTree, setCategoryTree] = useState<CategoryTreeDto[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryDto[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingCategories(true);

    Promise.all([
      taxonomyService.fetchCategoryTree(),
      taxonomyService.fetchCategories({ active: true }),
    ])
      .then(([tree, flat]) => {
        if (isMounted) {
          setCategoryTree(tree || []);
          setFlatCategories(flat || []);
          setIsLoadingCategories(false);
        }
      })
      .catch((err) => {
        console.error('[TAROPOD] Failed to load categories:', err);
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BILLBOARD_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMutedMap((prev) => ({ ...prev, [adId]: !prev[adId] }));
  };

  const handleNextImage = (adId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexMap((prev) => ({
      ...prev,
      [adId]: ((prev[adId] || 0) + 1) % total,
    }));
  };

  const handlePrevImage = (adId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndexMap((prev) => ({
      ...prev,
      [adId]: ((prev[adId] || 0) - 1 + total) % total,
    }));
  };

  const handleShare = (ad: AdItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `${ad.title} - در سامانه تخصصی نساجی`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback('لینک آگهی کپی شد!');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  // Quick categories: all root categories plus their top subcategories
  const quickCategories = flatCategories.length > 0 ? flatCategories.slice(0, 18) : [];
  // Specialized work categories: root or high-level groupings with descriptions
  const workCategories = categoryTree.length > 0
    ? categoryTree
    : flatCategories.filter((c) => !c.parentId);

  return (
    <div className="pb-24 max-w-md mx-auto space-y-4">
      {shareFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs px-4 py-2 rounded-xl shadow-lg animate-fade-in">
          {shareFeedback}
        </div>
      )}

      {/* 1. Top Categories with Horizontal Scroll - Live API driven */}
      <section className="pt-2 px-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <h2 className="text-xs font-bold text-zinc-800">دسته‌بندی‌های سریع</h2>
          <span className="text-[11px] text-zinc-400">اسکرول کنید ‹</span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar px-3 pb-1">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
                <div className="w-13 h-13 rounded-2xl bg-zinc-200" />
                <div className="w-12 h-2.5 bg-zinc-200 rounded" />
              </div>
            ))
          ) : quickCategories.length === 0 ? (
            <div className="text-xs text-zinc-400 py-2 px-3">هیچ دسته‌بندی فعالی یافت نشد</div>
          ) : (
            quickCategories.map((cat) => (
              <button
                key={cat.id}
                id={`top-cat-${cat.id}`}
                onClick={() => onSelectCategory(cat.titleFa)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div className="w-13 h-13 rounded-2xl bg-white border border-zinc-200/80 group-hover:border-amber-500 group-hover:bg-amber-50/50 shadow-xs flex items-center justify-center text-zinc-700 group-hover:text-amber-600 transition-all">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-[11px] font-medium text-zinc-600 group-hover:text-amber-700 whitespace-nowrap">
                  {cat.titleFa}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      {/* 2. Billboard / Banner Carousel (۳ تصویر با تعویض خودکار هر ۴ ثانیه + کنترل دستی) */}
      <section className="px-3">
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200 bg-zinc-900 aspect-16/8 sm:aspect-16/7 group">
          {BILLBOARD_BANNERS.map((banner, index) => {
            const isActive = index === currentBannerIndex;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${banner.bgColor} opacity-90`} />
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/90 text-zinc-900 text-[10px] font-bold mb-1.5 shadow-xs">
                      {banner.badge}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black line-clamp-2 leading-snug">
                      {banner.title}
                    </h3>
                    <p className="text-[11px] text-zinc-200/90 line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                      {banner.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 group-hover:underline">
                      <span>{banner.linkText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {index + 1} از {BILLBOARD_BANNERS.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dots controller */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {BILLBOARD_BANNERS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentBannerIndex(dotIdx)}
                className={`transition-all rounded-full ${
                  dotIdx === currentBannerIndex
                    ? 'w-4 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                }`}
                title={`بنر ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Work Categories Grid with Icons - Live API driven */}
      <section className="px-3">
        <div className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>دسته‌بندی‌های تخصصی بازار نساجی</span>
            </h2>
            <span className="text-[11px] text-zinc-400">
              {isLoadingCategories ? 'در حال بارگذاری...' : `${workCategories.length} شاخه اصلی`}
            </span>
          </div>

          {isLoadingCategories ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 rounded-xl border border-zinc-100 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 mb-1.5" />
                  <div className="h-3 w-16 bg-zinc-200 rounded mb-1" />
                  <div className="h-2 w-12 bg-zinc-200 rounded" />
                </div>
              ))}
            </div>
          ) : workCategories.length === 0 ? (
            <div className="text-xs text-zinc-500 py-4 text-center">دسته‌بندی تخصصی ثبت نشده است</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {workCategories.map((cat, idx) => {
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                const subTitle = (cat as CategoryTreeDto).children?.length
                  ? (cat as CategoryTreeDto).children.map((c) => c.titleFa).slice(0, 3).join('، ')
                  : cat.description || cat.titleEn || '';

                return (
                  <button
                    key={cat.id}
                    id={`work-cat-${cat.id}`}
                    onClick={() => onSelectCategory(cat.titleFa)}
                    className="flex flex-col items-center text-center p-2.5 rounded-xl border border-zinc-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform`}>
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-800 line-clamp-1 group-hover:text-amber-700">
                      {cat.titleFa}
                    </span>
                    <span className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5" title={subTitle}>
                      {subTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Infinite Feed of Ads (فید آگهی‌ها - اسکرول بی‌نهایت طبق طرح دست‌نویس) */}

      {/* 4. Infinite Feed of Ads (فید آگهی‌ها - اسکرول بی‌نهایت طبق طرح دست‌نویس) */}
      <section className="px-3 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
            <span>تازه‌ترین آگهی‌ها و سفارشات</span>
          </h2>
          <span className="text-[11px] text-zinc-400">به‌روزرسانی لحظه‌ای</span>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-zinc-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-36 bg-zinc-200 rounded-md" />
                    <div className="h-2.5 w-24 bg-zinc-200 rounded-md" />
                  </div>
                  <div className="w-12 h-6 bg-zinc-200 rounded-xl" />
                </div>
                <div className="aspect-4/3 w-full bg-zinc-200 rounded-xl" />
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-4/5 bg-zinc-200 rounded-md" />
                  <div className="h-3 w-full bg-zinc-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-zinc-900">هیچ آگهی یافت نشد</h3>
              <p className="text-[11px] text-zinc-500">
                در حال حاضر موردی متناسب با فیلترهای انتخابی موجود نیست.
              </p>
            </div>
          </div>
        ) : (
          ads.map((ad) => {
          const isBookmarked = bookmarkedIds.includes(ad.id);
          const activeImgIdx = activeImageIndexMap[ad.id] || 0;
          const isMuted = isMutedMap[ad.id] ?? true;

          return (
            <article
              key={ad.id}
              id={`feed-ad-${ad.id}`}
              onClick={() => onSelectAd(ad)}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Header: Province/City, Category, Rating, Username & Avatar */}
              <div className="p-3 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAuthor(ad.authorId);
                    }}
                    className="relative group/avatar"
                  >
                    <img
                      src={ad.authorAvatar}
                      alt={ad.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 group-hover/avatar:ring-2 ring-amber-500 transition-all"
                    />
                    {ad.authorVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 bg-white rounded-full absolute -bottom-0.5 -left-0.5 fill-amber-100" />
                    )}
                  </div>
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAuthor(ad.authorId);
                      }}
                      className="text-xs font-bold text-zinc-900 hover:text-amber-600 transition-colors text-right flex items-center gap-1"
                    >
                      <span>{ad.authorName}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span>{ad.province}، {ad.city}</span>
                      <span>•</span>
                      <span className="text-zinc-500 font-medium">{ad.category}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Badge (مثلاً ۳.۵ ستاره طبق وایرفریم) */}
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-xl text-xs font-bold border border-amber-200/60">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{ad.authorRating}</span>
                </div>
              </div>

              {/* Media Container: Carousel of images & video indicator */}
              <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                <img
                  src={ad.images[activeImgIdx]}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />

                {/* Sound Mute/Unmute Toggle Button (Exact from sketch: دکمه قطع و وصل صدا) */}
                {ad.hasVideo && (
                  <button
                    onClick={(e) => toggleMute(ad.id, e)}
                    className="absolute bottom-3 left-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    title={isMuted ? 'وصل صدا' : 'قطع صدا'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}

                {/* Left/Right Arrows for multiple images */}
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(ad.id, ad.images.length, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(ad.id, ad.images.length, e)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full">
                      {ad.images.map((_, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            dotIdx === activeImgIdx ? 'bg-amber-400 w-3' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Urgent/Featured Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  {ad.isUrgent && (
                    <span className="bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      فوری
                    </span>
                  )}
                  {ad.isFeatured && (
                    <span className="bg-amber-500/90 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      ویژه
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row: Share, Bookmark, Time Ago (طبق فلش‌های وایرفریم) */}
              <div className="p-3 pb-1 flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(ad.id);
                    }}
                    className={`p-2 rounded-xl hover:bg-zinc-100 transition-colors ${
                      isBookmarked ? 'text-amber-600' : 'text-zinc-600'
                    }`}
                    title={isBookmarked ? 'نشان‌شده' : 'نشان‌کردن'}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleShare(ad, e)}
                    className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600"
                    title="اشتراک‌گذاری"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1 text-xs text-zinc-500 pr-1">
                    <MessageCircle className="w-4 h-4 text-zinc-400" />
                    <span>{ad.commentsCount} نظر</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ad.createdAtText}</span>
                </div>
              </div>

              {/* Title & Description Text (۲ خط ۵۰ کاراکتر عنوان + ۱۵۰ کاراکتر توضیحات) */}
              <div className="px-3 pb-3 space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-zinc-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
                  {ad.title}
                </h3>
                <p className="text-[11px] text-zinc-600 line-clamp-3 leading-relaxed">
                  {ad.description}
                </p>

                {ad.price && (
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-100 mt-2">
                    <span className="text-[11px] text-zinc-400">قیمت / شرایط:</span>
                    <span className="text-xs font-bold text-amber-700">{ad.price}</span>
                  </div>
                )}
              </div>
            </article>
          );
        }))}
      </section>
    </div>
  );
};
