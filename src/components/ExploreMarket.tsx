import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, Play, Flame, TrendingUp, Check, Loader2 } from 'lucide-react';
import { AdItem } from '../types';
import { exploreService, ExploreItemDto } from '../core/api/explore.service';
import { taxonomyService, CategoryDto } from '../core/api/taxonomy.service';
import { locationsService } from '../core/api/locations.service';

interface ExploreMarketProps {
  onSelectAd: (ad: AdItem) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

type SubFilterKey = 'all' | 'featured' | 'urgent' | 'price' | 'newest' | 'rating';

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

export const ExploreMarket: React.FC<ExploreMarketProps> = ({
  onSelectAd,
  selectedCity,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('همه');
  const [activeSubFilter, setActiveSubFilter] = useState<SubFilterKey>('all');
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Live data states
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [items, setItems] = useState<ExploreItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-filter definitions matching Sketch 2 notes
  const subFilters: { id: SubFilterKey; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'همه آگهی‌ها' },
    { id: 'featured', label: 'برگزیده‌ها', icon: <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> },
    { id: 'urgent', label: 'فوری / تخفیف‌دار', icon: <Flame className="w-3 h-3 text-rose-500" /> },
    { id: 'newest', label: 'جدیدترین‌ها', icon: <TrendingUp className="w-3 h-3 text-blue-500" /> },
    { id: 'rating', label: 'اعتبار و امتیاز بالا', icon: <Star className="w-3 h-3 text-emerald-500" /> },
    { id: 'price', label: 'قیمت‌دار' },
  ];

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
          categoryId: selectedMainCategory === 'همه' ? undefined : selectedMainCategory,
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
            setError('خطا در بارگذاری نتایج بازارگاه');
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCity, selectedMainCategory]);

  // Sub-filter in-memory refining
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeSubFilter === 'featured') return item.listing.viewsCount > 5;
      if (activeSubFilter === 'urgent') return item.listing.priceType === 'urgent' || item.listing.priceType === 'fixed';
      if (activeSubFilter === 'rating') return item.business.rating >= 4.7;
      if (activeSubFilter === 'price') return (item.listing.priceAmount || 0) > 0;
      return true;
    });
  }, [items, activeSubFilter]);

  const handleSelectItem = (item: ExploreItemDto) => {
    const coverMedia = item.media.find((m) => m.isCover) || item.media[0];
    const imageUrls = item.media.length > 0
      ? item.media.map((m) => m.url)
      : ['https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80'];

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
      authorSpecialty: item.business.address || '',
      authorActivity: item.business.name,
      images: imageUrls,
      price: item.listing.priceAmount
        ? `${item.listing.priceAmount.toLocaleString('fa-IR')} تومان ${item.listing.unit ? `هر ${item.listing.unit}` : ''}`
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
    <div className="pb-24 max-w-md mx-auto space-y-3">
      {/* 1. Header with Search, City & Main Category (هدر طبق وایرفریم صفحه ۲) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-3 border-b border-zinc-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          {/* City button */}
          <button
            onClick={() => setIsCityOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectedCity}</span>
          </button>

          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در آگهی‌ها، پارچه، چرخ، کارگاه..."
              className="w-full bg-zinc-100 text-xs rounded-xl pr-8 pl-3 py-2 border border-transparent focus:border-amber-500 focus:bg-white focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Main Category Select Dropdown (دسته‌بندی اصلی - Live from Postgres) */}
          <div className="relative shrink-0">
            <select
              value={selectedMainCategory}
              onChange={(e) => setSelectedMainCategory(e.target.value)}
              className="appearance-none bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl px-3 py-2 pr-7 cursor-pointer focus:outline-none max-w-[110px] truncate"
            >
              <option value="همه">همه دسته‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.titleFa}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Sub-filters Horizontal Scroll (فیلترهای فرعی - اسکرول افقی طبق وایرفریم) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {subFilters.map((sub) => {
            const isActive = activeSubFilter === sub.id;
            return (
              <button
                key={sub.id}
                id={`subfilter-${sub.id}`}
                onClick={() => setActiveSubFilter(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200/60'
                }`}
              >
                {sub.icon}
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* City modal */}
      {isCityOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-xs">انتخاب شهر بازارگردی</h3>
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
                  selectedCity === 'همه شهرها' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-zinc-200'
                }`}
              >
                <span>همه شهرها</span>
                {selectedCity === 'همه شهرها' && <Check className="w-3 h-3 text-amber-600" />}
              </button>
              {cities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => {
                    onSelectCity(cityName);
                    setIsCityOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs border text-right flex items-center justify-between ${
                    selectedCity === cityName ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-zinc-200'
                  }`}
                >
                  <span>{cityName}</span>
                  {selectedCity === cityName && <Check className="w-3 h-3 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. 3-Column Instagram-Style Media Grid with Live PostgreSQL API */}
      <section className="px-3">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50 rounded-2xl border border-rose-200 p-6 text-rose-700 text-xs">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200 p-6 space-y-2">
            <p className="text-xs font-semibold text-zinc-700">هیچ آگهی با این مشخصات یافت نشد.</p>
            <p className="text-[11px] text-zinc-400">می‌توانید فیلترها را تغییر داده یا جستجوی جدیدی انجام دهید.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMainCategory('همه');
                setActiveSubFilter('all');
                onSelectCity('همه شهرها');
              }}
              className="mt-3 inline-block px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
            >
              پاک‌کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {filteredItems.map((item, idx) => {
              const coverUrl = item.media[0]?.url || 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80';
              return (
                <button
                  key={`${item.listing.id}-${idx}`}
                  id={`explore-item-${item.listing.id}`}
                  onClick={() => handleSelectItem(item)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 group border border-zinc-200/50 focus:outline-none hover:opacity-95 text-right"
                >
                  <img
                    src={coverUrl}
                    alt={item.listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Rating / Urgent Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{item.business.rating || 5.0}</span>
                  </div>

                  {/* Hover overlay with title and business preview */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-right">
                    <p className="text-[10px] font-bold line-clamp-2 leading-tight">
                      {item.listing.title}
                    </p>
                    <span className="text-[8px] text-zinc-300 mt-0.5">
                      {item.business.name} • {item.listing.city}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

