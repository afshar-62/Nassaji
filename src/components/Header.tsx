import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Mail, Menu, X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { locationsService } from '../core/api/locations.service';

interface HeaderProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAi: () => void;
  onOpenMessages: () => void;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
}

const DEFAULT_TEXTILE_CITIES = [
  'تهران',
  'اصفهان',
  'کاشان',
  'تبریز',
  'یزد',
  'مشهد',
  'شیراز',
  'قزوین',
  'قم',
  'اراک',
];

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange,
  onOpenAi,
  onOpenMessages,
  onOpenSettings,
  onOpenBookmarks,
}) => {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>(DEFAULT_TEXTILE_CITIES);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingCities(true);

    locationsService
      .fetchBusinessLocations()
      .then((bizList) => {
        if (isMounted) {
          const fetchedCities = Array.from(new Set(bizList.map((b) => b.city).filter(Boolean)));
          const combined = Array.from(new Set([...fetchedCities, ...DEFAULT_TEXTILE_CITIES]));
          setAvailableCities(combined);
          setIsLoadingCities(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-3 py-2.5 shadow-xs">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* City Selector Button (as in sketch: آیکون لوکیشن + نام شهر) */}
          <button
            id="header-city-btn"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Search Bar with Search Icon */}
          <div className="relative flex-1">
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در آگهی‌ها، پارچه، چرخ، کارگاه..."
              className="w-full bg-zinc-100 hover:bg-zinc-100/80 focus:bg-white text-xs text-zinc-900 rounded-xl pr-8 pl-3 py-2 border border-transparent focus:border-amber-500 focus:outline-none transition-all placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* AI Assistant Button (Exact as drawn in sketch: Ai button) */}
          <button
            id="header-ai-btn"
            onClick={onOpenAi}
            className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-xs hover:shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            title="دستیار هوشمند نساجی"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="tracking-wide">Ai</span>
          </button>

          {/* Messages Icon Button */}
          <button
            id="header-mail-btn"
            onClick={onOpenMessages}
            className="relative p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors shrink-0"
            title="پیام‌ها و اعلانات"
          >
            <Mail className="w-5 h-5" />
            <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Hamburger Menu Button */}
          <button
            id="header-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0"
            title="منوی کاربری"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* City Picker Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-zinc-900">انتخاب شهر و استان</h3>
              </div>
              <button
                id="close-city-modal-btn"
                onClick={() => setIsCityModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 max-h-64 overflow-y-auto pr-1">
              {isLoadingCities ? (
                <div className="col-span-2 flex items-center justify-center py-6 text-zinc-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>در حال دریافت شهرهای فعال...</span>
                </div>
              ) : availableCities.length === 0 ? (
                <div className="col-span-2 text-center py-4 text-xs text-zinc-400">شهری یافت نشد</div>
              ) : (
                availableCities.map((cityName) => {
                  const isSelected = selectedCity === cityName;
                  return (
                    <button
                      key={cityName}
                      id={`city-option-${cityName}`}
                      onClick={() => {
                        onSelectCity(cityName);
                        setIsCityModalOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <span>{cityName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hamburger Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-start">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    ن
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-zinc-900">بازار نساجی ایران</h2>
                    <p className="text-[11px] text-zinc-400">مرجع جامع صنعت پوشاک</p>
                  </div>
                </div>
                <button
                  id="close-drawer-btn"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 mt-4">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center justify-between"
                >
                  <span>تنظیمات و پنل کاربری</span>
                  <span className="text-[10px] text-amber-600 font-normal">ورود / ویرایش</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenBookmarks();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center justify-between"
                >
                  <span>آگهی‌های نشان‌شده</span>
                  <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded-md text-zinc-600">ذخیره‌ها</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAi();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-amber-50 text-amber-700 transition-colors flex items-center justify-between"
                >
                  <span>مشاوره هوش مصنوعی نساجی</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-center">
              <p className="text-[10px] text-zinc-400">نسخه ۱.۰.۰ — طراحی بر اساس وایرفریم دستی</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
