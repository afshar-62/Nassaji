import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  MapPin,
  ChevronLeft,
  Check,
  Globe2,
  Building2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  SUPPORTED_COUNTRIES,
  Country,
  IRAN_PROVINCES,
  Province,
  City,
  searchLocations,
  MAIN_TEXTILE_HUBS,
} from '../data/locationsData';

interface LocationHierarchyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  selectedProvince?: string;
  selectedCountry?: string;
  onSelectLocation: (location: {
    country: string;
    province: string;
    city: string;
  }) => void;
  title?: string;
}

export const LocationHierarchyPickerModal: React.FC<LocationHierarchyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  selectedProvince = '',
  selectedCountry = 'ایران',
  onSelectLocation,
  title = 'انتخاب استان و شهر',
}) => {
  // مرحله جاری: 'country' | 'provinces' | 'cities'
  const [currentStep, setCurrentStep] = useState<'provinces' | 'cities' | 'country'>('provinces');
  const [activeCountry, setActiveCountry] = useState<Country>(SUPPORTED_COUNTRIES[0]);
  const [activeProvince, setActiveProvince] = useState<Province | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // نتایج جستجوی مستقیم
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchLocations(searchQuery);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectProvince = (prov: Province) => {
    setActiveProvince(prov);
    setCurrentStep('cities');
  };

  const handleSelectCity = (cityName: string, provinceName: string) => {
    onSelectLocation({
      country: activeCountry.name,
      province: provinceName,
      city: cityName,
    });
    onClose();
  };

  const handleSelectAllProvince = (prov: Province) => {
    onSelectLocation({
      country: activeCountry.name,
      province: prov.name,
      city: `همه شهرهای ${prov.name}`,
    });
    onClose();
  };

  const handleSelectAllIran = () => {
    onSelectLocation({
      country: activeCountry.name,
      province: 'همه استان‌ها',
      city: 'کل ایران',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-['Vazirmatn',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-right">
        {/* هدر مودال و ناوبری سلسله‌مراتبی */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900">{title}</h3>
                {/* بردکرامب و ردپای انتخاب (کشور > استان > شهر) */}
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                  <span
                    onClick={() => setCurrentStep('country')}
                    className="cursor-pointer hover:text-amber-700 underline decoration-dotted"
                  >
                    {activeCountry.flagEmoji} {activeCountry.name}
                  </span>
                  {activeProvince && (
                    <>
                      <span>/</span>
                      <span
                        onClick={() => setCurrentStep('cities')}
                        className="cursor-pointer hover:text-amber-700 font-semibold"
                      >
                        استان {activeProvince.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* کادر جستجوی یکپارچه در تمامی ۳۱ استان و شهرهای ایران */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع نام شهر یا استان (مثلاً: شهرری، کاشان، تبریز، اصفهان...)"
              className="w-full bg-white text-xs rounded-xl pr-8 pl-8 py-2.5 border border-zinc-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/10 placeholder-zinc-400 text-zinc-800 transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* دکمه‌های پرکاربرد بالا: کل کشور ایران + بازگشت */}
          {!searchQuery && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                onClick={handleSelectAllIran}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/70 transition-colors border border-amber-200/60"
              >
                <RotateCcw className="w-3 h-3" />
                <span>کل شهرهای ایران</span>
              </button>

              {currentStep === 'cities' && (
                <button
                  onClick={() => setCurrentStep('provinces')}
                  className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-200/50"
                >
                  <span>بازگشت به لیست استان‌ها</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* بدنه محتوا: نتایج جستجو یا پیمایش مرحله‌ای */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* حالت اول: جستجوی فعال */}
          {searchQuery.trim() ? (
            <div className="space-y-3">
              {/* شهرهای پیدا شده */}
              {searchResults && searchResults.cities.length > 0 ? (
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">
                    شهرهای منطبق ({searchResults.cities.length} مورد):
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {searchResults.cities.map((city) => {
                      const isSelected = selectedCity === city.name;
                      return (
                        <button
                          key={city.id}
                          onClick={() => handleSelectCity(city.name, city.provinceName)}
                          className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold'
                              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate flex items-center gap-1">
                              <span>{city.name}</span>
                              {city.isIndustrialHub && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="قطب نساجی" />
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">
                              استان {city.provinceName}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mr-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* استان‌های منطبق */}
              {searchResults && searchResults.provinces.length > 0 ? (
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">
                    استان‌های منطبق:
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.provinces.map((prov) => (
                      <button
                        key={prov.id}
                        onClick={() => {
                          setActiveProvince(prov);
                          setCurrentStep('cities');
                          setSearchQuery('');
                        }}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 hover:border-amber-400 hover:bg-amber-50/40 text-right flex items-center justify-between text-xs font-bold text-zinc-800 transition-all"
                      >
                        <span>استان {prov.name} ({prov.cities.length} شهر)</span>
                        <ChevronLeft className="w-4 h-4 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {searchResults &&
                searchResults.cities.length === 0 &&
                searchResults.provinces.length === 0 && (
                  <div className="text-center py-8 text-zinc-400 text-xs">
                    شهری با نام «{searchQuery}» پیدا نشد.
                  </div>
                )}
            </div>
          ) : currentStep === 'country' ? (
            /* مرحله انتخاب کشور (زیرساخت مقیاس‌پذیر فازهای توسعه) */
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-700">انتخاب کشور بازار هدف:</h4>
              <div className="space-y-2">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    disabled={!c.isDefault}
                    onClick={() => {
                      setActiveCountry(c);
                      setCurrentStep('provinces');
                    }}
                    className={`w-full p-3 rounded-2xl border text-right flex items-center justify-between text-xs font-bold transition-all ${
                      c.isDefault
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 cursor-pointer shadow-2xs'
                        : 'border-zinc-200 opacity-60 bg-zinc-50 cursor-not-allowed text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.flagEmoji}</span>
                      <span>{c.name}</span>
                    </div>
                    {c.isDefault ? (
                      <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md">
                        فعال
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md">
                        فاز بعدی
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : currentStep === 'cities' && activeProvince ? (
            /* مرحله انتخاب شهرهای استان انتخاب‌شده */
            <div className="space-y-3">
              {/* گزینه انتخاب کل استان */}
              <button
                onClick={() => handleSelectAllProvince(activeProvince)}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span>همه شهرهای استان {activeProvince.name}</span>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                  انتخاب استانی
                </span>
              </button>

              <h4 className="text-[11px] font-bold text-zinc-400 px-1 pt-1">
                شهرهای استان {activeProvince.name} ({activeProvince.cities.length} شهر):
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {activeProvince.cities.map((city) => {
                  const isSelected = selectedCity === city.name;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city.name, activeProvince.name)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center gap-1">
                          <span>{city.name}</span>
                          {city.isIndustrialHub && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="قطب صنعتی و نساجی" />
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mr-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* مرحله انتخاب استان از بین تمامی ۳۱ استان کشور */
            <div className="space-y-3">
              {/* قطب‌های صنعتی و پربازدید نساجی */}
              <div>
                <h4 className="text-[11px] font-bold text-zinc-500 mb-2 px-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>مراکز و قطب‌های اصلی نساجی و پوشاک ایران:</span>
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {MAIN_TEXTILE_HUBS.slice(0, 8).map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => handleSelectCity(hub.name, hub.provinceName)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        selectedCity === hub.name
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {hub.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">
                  تمامی استان‌های ایران (۳۱ استان):
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {IRAN_PROVINCES.map((prov) => {
                    const isSelected = selectedProvince === prov.name;
                    return (
                      <button
                        key={prov.id}
                        onClick={() => handleSelectProvince(prov)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold'
                            : 'border-zinc-200 hover:border-amber-400 hover:bg-zinc-50 text-zinc-800'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">استان {prov.name}</span>
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
