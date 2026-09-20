import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Copy,
  Video,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { AdItem } from '../types';
import { exploreService, ExploreItemDto } from '../core/api/explore.service';
import { taxonomyService, CategoryDto } from '../core/api/taxonomy.service';
import { locationsService } from '../core/api/locations.service';

interface ExploreMarketProps {
  onSelectAd: (ad: AdItem) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const DEFAULT_CITIES = [
  'تهران',
  'اصفهان',
  'کاشان',
  'تبریز',
  'یزد',
  'مشهد',
  'شیراز',
  'قزوین',
];

// رسته‌ها و فیلترهای افقی تخصصی نساجی و پوشاک (مطابق ردیف افقی متن در عکس ارسالی)
const TEXTILE_NAV_TAGS = [
  { id: 'all', label: 'همه آگهی‌ها' },
  { id: 'taaghe', label: 'طاقه و طاقه‌فروشی' },
  { id: 'khordeh', label: 'خرده‌فروشی' },
  { id: 'mazdi', label: 'مزدی‌دوزی' },
  { id: 'sefaresh', label: 'سفارش دوخت' },
  { id: 'nakh', label: 'نخ و الیاف' },
  { id: 'charkh', label: 'ماشین‌آلات و چرخ' },
  { id: 'kharj-kar', label: 'خرج کار و یراق' },
  { id: 'chap', label: 'چاپ و تکمیل' },
  { id: 'zayeat', label: 'ضایعات نساجی' },
];

export const ExploreMarket: React.FC<ExploreMarketProps> = ({
  onSelectAd,
  selectedCity,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Live data states
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [items, setItems] = useState<ExploreItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch taxonomy categories and locations
  useEffect(() => {
    let isMounted = true;
    taxonomyService
      .fetchCategories({ active: true })
      .then((cats) => {
        if (isMounted) setCategories(cats || []);
      })
      .catch((err) => console.error('[Explore] Failed to load categories:', err));

    locationsService
      .fetchBusinessLocations()
      .then((bizList) => {
        if (isMounted) {
          const fetchedCities = Array.from(new Set(bizList.map((b) => b.city).filter(Boolean)));
          setCities(Array.from(new Set([...fetchedCities, ...DEFAULT_CITIES])));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch explore items based on active filters
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      exploreService
        .fetchExploreItems({
          search: searchQuery.trim() || undefined,
          city: selectedCity === 'همه شهرها' ? undefined : selectedCity,
          categoryId: selectedCategory === 'همه' ? undefined : selectedCategory,
        })
        .then((res) => {
          if (isMounted) {
            setItems(res.items || []);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('[Explore] Search failed:', err);
          if (isMounted) {
            setError('خطا در بارگذاری نتایج اکسپلور');
            setIsLoading(false);
          }
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCity, selectedCategory]);

  // Filter items by tag
  const filteredItems = useMemo(() => {
    if (selectedTag === 'all') return items;
    return items.filter((item) => {
      const text = `${item.listing.title} ${item.listing.description} ${item.category?.titleFa || ''}`.toLowerCase();
      if (selectedTag === 'taaghe') return text.includes('طاقه') || text.includes('عمده');
      if (selectedTag === 'khordeh') return text.includes('خرده') || text.includes('متری');
      if (selectedTag === 'mazdi') return text.includes('مزد') || text.includes('دوخت');
      if (selectedTag === 'sefaresh') return text.includes('سفارش') || text.includes('تیراژ');
      if (selectedTag === 'nakh') return text.includes('نخ') || text.includes('پنبه') || text.includes('الیاف');
      if (selectedTag === 'charkh') return text.includes('چرخ') || text.includes('ماشین') || text.includes('اتوماتیک');
      if (selectedTag === 'kharj-kar') return text.includes('دکمه') || text.includes('زیپ') || text.includes('خرج');
      if (selectedTag === 'chap') return text.includes('چاپ') || text.includes('رنگ') || text.includes('تکمیل');
      if (selectedTag === 'zayeat') return text.includes('ضایعات') || text.includes('دم قیچی');
      return true;
    });
  }, [items, selectedTag]);

  const handleSelectItem = (item: ExploreItemDto) => {
    const imageUrls = item.media.length > 0
      ? item.media.map((m) => m.url)
      : ['https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80'];

    const isVideo = Boolean(
      item.listing.hasVideo ||
      item.listing.videoUrl ||
      item.listing.activityType === 'video-showcase'
    );

    const adItem: AdItem = {
      id: item.listing.id,
      title: item.listing.title,
      description: item.listing.description,
      city: item.listing.city || item.business.city,
      province: item.listing.province || item.business.province,
      category: item.category?.titleFa || 'منسوجات و پوشاک',
      subCategory: item.listing.commodityType || item.listing.activityType,
      authorId: item.business.id,
      authorName: item.business.name,
      authorAvatar: item.business.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      authorRating: item.business.rating || 5.0,
      authorVerified: item.business.isVerified,
      authorSpecialty: item.business.address || item.category?.titleFa || 'تولیدکننده نساجی',
      authorActivity: item.business.name,
      images: imageUrls,
      hasVideo: isVideo,
      videoUrl: item.listing.videoUrl || (isVideo ? 'https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-working-on-a-garment-41581-large.mp4' : undefined),
      videoDuration: item.listing.videoDuration || '۰۳:۴۵',
      videoQuality: item.listing.videoQuality || '1080p FHD',
      aspectRatio: item.listing.aspectRatio || 'horizontal',
      price: item.listing.priceAmount
        ? `${item.listing.priceAmount.toLocaleString('fa-IR')} تومان`
        : 'توافقی',
      likesCount: item.listing.viewsCount || 1,
      commentsCount: item.business.reviewsCount || 0,
      isFeatured: item.listing.viewsCount > 10,
      createdAtText: 'به تازگی',
      contact: {
        mobile: item.business.phone || '۰۹۱۲۰۰۰۰۰۰۰',
        phone: item.business.phone || '۰۲۱۰۰۰۰۰۰۰۰',
        smsNumber: item.business.phone || '۰۹۱۲۰۰۰۰۰۰۰',
        website: undefined,
        instagram: undefined,
        telegram: undefined,
      },
      location: item.location
        ? {
            lat: item.location.latitude || 35.6892,
            lng: item.location.longitude || 51.3890,
            areaName: item.location.city || item.business.city || 'تهران',
            addressText: item.location.addressDetails || `${item.business.province || 'تهران'}، ${item.business.city || 'تهران'}`,
          }
        : {
            lat: 35.6892,
            lng: 51.3890,
            areaName: item.business.city || 'تهران',
            addressText: `${item.business.province || 'تهران'}، ${item.business.city || 'تهران'}`,
          },
      comments: [],
    };

    onSelectAd(adItem);
  };

  return (
    <div className="pb-24 max-w-md mx-auto bg-white min-h-screen font-['Vazirmatn',sans-serif]">
      {/* ۱. نوار جستجو و موقعیت شهر (دقیقاً مطابق بالای عکس ارسالی) */}
      <div className="sticky top-0 z-30 bg-white border-b border-zinc-100 px-3 pt-2.5 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          {/* دکمه انتخاب شهر با موقعیت پین در چپ */}
          <button
            onClick={() => setIsCityOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shrink-0 transition-colors"
            title="انتخاب شهر"
          >
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>{selectedCity}</span>
          </button>

          {/* کادر جستجو با آیکون ذره‌بین در راست */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو"
              className="w-full bg-zinc-100/90 text-xs rounded-xl pr-8 pl-3 py-2 text-zinc-800 placeholder-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-300 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ۲. ردیف دکمه فیلتر و بج دسته‌بندی فعال با ضربدر (دقیقاً عین عکس ارسالی) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* سمت چپ (در RTL راست): تگ دسته‌بندی فعال با ضربدر جهت حذف */}
          <div className="flex items-center gap-1.5">
            {selectedCategory && selectedCategory !== 'همه' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-xs font-medium">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('همه')}
                  className="text-zinc-400 hover:text-zinc-700 focus:outline-none"
                  title="حذف فیلتر دسته"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* سمت راست (در RTL چپ): دکمه کادردار «فیلتر» با تم نارنجی سازمانی */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 text-xs font-bold transition-colors focus:outline-none"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>فیلتر</span>
          </button>
        </div>

        {/* ۳. ردیف افقی متن‌های زیر دسته‌ها (با فونت نارنجی فعال و اسکرول افقی) */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {TEXTILE_NAV_TAGS.map((tag) => {
            const isActive = selectedTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`text-xs font-bold whitespace-nowrap transition-colors focus:outline-none shrink-0 ${
                  isActive
                    ? 'text-orange-600 border-b-2 border-orange-600 pb-0.5'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ۴. گرید ۳ ستونه کاملاً یکدست مربع در مربع تا انتها (بدون هیچ مربع بزرگ، بدون ستاره و امتیاز شلوغ) */}
      <section className="px-0.5 pt-0.5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4 text-xs text-orange-600 bg-orange-50 rounded-xl m-3">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-2 text-zinc-500">
            <p className="text-xs font-bold text-zinc-700">هیچ تصویری در این دسته‌بندی یافت نشد.</p>
            <button
              onClick={() => {
                setSelectedTag('all');
                setSelectedCategory('همه');
                setSearchQuery('');
              }}
              className="text-xs text-orange-600 font-bold underline mt-2 inline-block"
            >
              مشاهده همه تصاویر اکسپلور
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {filteredItems.map((item, idx) => {
              const coverUrl = item.media[0]?.url || 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80';
              const isMultiImage = item.media.length > 1;
              const isVideoItem = (idx % 4 === 0) || (item.listing.description || '').includes('ویدیو');

              return (
                <button
                  key={`${item.listing.id}-${idx}`}
                  id={`explore-square-${item.listing.id}`}
                  onClick={() => handleSelectItem(item)}
                  className="relative aspect-square overflow-hidden bg-zinc-100 group focus:outline-none active:opacity-85 select-none"
                >
                  <img
                    src={coverUrl}
                    alt={item.listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* آیکون ظریف سفید در گوشه بالا-چپ جهت نمایش چندتصویری یا ویدیو (دقیقاً مانند اینستاگرام و عکس ارسالی) */}
                  {isMultiImage && !isVideoItem && (
                    <div className="absolute top-1.5 left-1.5 text-white drop-shadow-md pointer-events-none">
                      <Copy className="w-3.5 h-3.5 fill-white stroke-none" />
                    </div>
                  )}

                  {isVideoItem && (
                    <div className="absolute top-1.5 left-1.5 text-white drop-shadow-md pointer-events-none">
                      <Video className="w-3.5 h-3.5 fill-white stroke-none" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* مودال انتخاب شهر */}
      {isCityOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-xs text-zinc-900">انتخاب شهر بازار نساجی</h3>
              <button
                onClick={() => setIsCityOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs font-bold"
              >
                بستن
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectCity('همه شهرها');
                  setIsCityOpen(false);
                }}
                className={`p-2 rounded-xl text-xs border text-right flex items-center justify-between ${
                  selectedCity === 'همه شهرها' ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold' : 'border-zinc-200'
                }`}
              >
                <span>همه شهرها</span>
                {selectedCity === 'همه شهرها' && <Check className="w-3 h-3 text-orange-600" />}
              </button>
              {cities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => {
                    onSelectCity(cityName);
                    setIsCityOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs border text-right flex items-center justify-between ${
                    selectedCity === cityName ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold' : 'border-zinc-200'
                  }`}
                >
                  <span>{cityName}</span>
                  {selectedCity === cityName && <Check className="w-3 h-3 text-orange-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال فیلترهای تکمیلی */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900">فیلتر رسته‌های نساجی</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {['پارچه و منسوجات', 'نخ، الیاف و دوک', 'ماشین‌آلات و ملزومات دوخت', 'تولید و مزدی‌دوزی', 'خرج کار و ملحقات'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsFilterModalOpen(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-orange-50 border border-orange-600 text-orange-700 font-bold'
                      : 'hover:bg-zinc-50 border border-zinc-100 text-zinc-700'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedCategory('همه');
                setIsFilterModalOpen(false);
              }}
              className="w-full py-2 text-center text-xs font-bold text-zinc-500 hover:text-zinc-800"
            >
              حذف همه فیلترها
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
