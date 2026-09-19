import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Filter,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  ChevronLeft,
  X,
  Compass,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { MAP_LOCATIONS, MOCK_PROFILES, MOCK_ADS } from '../data/mockData';
import { AdItem } from '../types';

interface BusinessMapProps {
  onSelectAuthor: (authorId: string) => void;
  onSelectAd: (ad: AdItem) => void;
  selectedCity: string;
}

export const BusinessMap: React.FC<BusinessMapProps> = ({
  onSelectAuthor,
  onSelectAd,
  selectedCity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('همه');
  const [selectedPinId, setSelectedPinId] = useState<string | null>('m1');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [showNavModal, setShowNavModal] = useState(false);
  const [userLocationCentered, setUserLocationCentered] = useState(false);

  const categories = ['همه', 'خدمات تولیدی', 'ماشین‌آلات صنعتی', 'پارچه و منسوجات', 'طراحی و الگو', 'خرج کار و ملزومات', 'چاپ و گلدوزی'];

  const filteredLocations = MAP_LOCATIONS.filter((loc) => {
    const matchSearch =
      !searchQuery ||
      loc.name.includes(searchQuery) ||
      loc.specialty.includes(searchQuery) ||
      loc.area.includes(searchQuery);
    const matchCategory =
      activeCategoryFilter === 'همه' || loc.category === activeCategoryFilter;
    return matchSearch && matchCategory;
  });

  const selectedLocation = MAP_LOCATIONS.find((l) => l.id === selectedPinId) || MAP_LOCATIONS[0];
  const selectedProfile = MOCK_PROFILES[selectedLocation.authorId] || MOCK_PROFILES['user-1'];

  const handleOpenRouting = () => {
    setShowNavModal(true);
  };

  const openApp = (appName: string) => {
    const { lat, lng } = selectedLocation;
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

  return (
    <div className="relative h-[calc(100vh-68px)] max-w-md mx-auto overflow-hidden flex flex-col bg-zinc-100">
      {/* 1. Header with City, Search Bar and Filter Button (هدر طبق وایرفریم صفحه ۳) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 space-y-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-zinc-200 pointer-events-auto flex items-center gap-2">
          {/* City label */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-bold shrink-0">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectedCity}</span>
          </div>

          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در کارگاه‌ها، راسته بازار..."
              className="w-full bg-zinc-100 text-xs rounded-xl pr-8 pl-3 py-2 focus:bg-white focus:outline-none border border-transparent focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'همه' ? 'خدمات تولیدی' : 'همه')}
            className={`p-2 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
              activeCategoryFilter !== 'همه'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
            }`}
            title="فیلتر دسته‌بندی"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal sub-filters row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto pt-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap shadow-sm border transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white/95 text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Styled Map Canvas Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map Grid / Styled Canvas simulation representing Tehran industrial districts */}
        <div
          className={`w-full h-full relative transition-all duration-300 ${
            mapLayer === 'satellite'
              ? 'bg-[#1b2a26] text-emerald-100'
              : 'bg-[#e5e3df] text-zinc-700'
          }`}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* SVG Map roads & geography overlay for high aesthetic realism */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#cbd5e1" strokeWidth="6" />
            <line x1="0" y1="50%" x2="100%" y2="52%" stroke="#fdba74" strokeWidth="8" />
            <line x1="0" y1="75%" x2="100%" y2="70%" stroke="#cbd5e1" strokeWidth="5" />
            <line x1="30%" y1="0" x2="32%" y2="100%" stroke="#fdba74" strokeWidth="7" />
            <line x1="60%" y1="0" x2="58%" y2="100%" stroke="#cbd5e1" strokeWidth="5" />
            <circle cx="50%" cy="50%" r="90" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
          </svg>

          {/* Tehran Landmark Labels */}
          <div className="absolute top-[22%] right-[15%] text-[10px] font-bold text-zinc-400 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs">
            خیابان جمهوری و ولیعصر
          </div>
          <div className="absolute top-[48%] right-[28%] text-[10px] font-bold text-zinc-400 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs">
            بازار بزرگ و سرای فردوس
          </div>
          <div className="absolute bottom-[28%] left-[20%] text-[10px] font-bold text-zinc-400 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs">
            بازار پارچه عبدل‌آباد
          </div>
          <div className="absolute bottom-[12%] left-[10%] text-[10px] font-bold text-zinc-400 bg-white/70 px-1.5 py-0.5 rounded shadow-2xs">
            شهرک صنعتی چهاردانگه
          </div>

          {/* User Location Pulse Marker */}
          <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative">
              <span className="absolute -inset-2 rounded-full bg-blue-400 animate-ping opacity-75" />
            </div>
          </div>

          {/* Interactive Red Business Pins (نشانگرهای قرمز نقشه طبق وایرفریم) */}
          {filteredLocations.map((loc, idx) => {
            const isSelected = loc.id === selectedPinId;
            // Place pins relative to visual map coords
            const topPositions = ['49%', '25%', '18%', '68%', '82%', '53%', '62%'];
            const rightPositions = ['34%', '22%', '28%', '75%', '84%', '30%', '16%'];

            return (
              <div
                key={loc.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200"
                style={{
                  top: topPositions[idx % topPositions.length],
                  right: rightPositions[idx % rightPositions.length],
                  transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                }}
                onClick={() => setSelectedPinId(loc.id)}
              >
                <div className="relative group">
                  {/* Pin Body */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${
                    isSelected ? 'bg-rose-600 text-white' : 'bg-red-500 text-white hover:bg-rose-700'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  {/* Pin Pointer triangle */}
                  <div className="w-2 h-2 bg-rose-600 rotate-45 mx-auto -mt-1 shadow-xs" />

                  {/* Pin tooltip label */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                    {loc.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Control Tools: Zoom In/Out, Layer Switcher */}
        <div className="absolute top-24 left-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-2xl shadow-md border border-zinc-200">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700"
            title="بزرگنمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-zinc-200" />
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-700"
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
            title="تغییر لایه نقشه (ماهواره / استاندارد)"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Floating Preview Card of Selected Business (باکس شناور اطلاعات کسب‌وکار طبق وایرفریم ۳) */}
        {selectedLocation && (
          <div className="absolute bottom-16 left-3 right-3 z-30 animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-zinc-200">
              <div className="flex items-start gap-3">
                {/* Photo (عکس کسب و کار طبق وایرفریم) */}
                <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                  <img
                    src={selectedProfile.logo}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedProfile.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 bg-white rounded-full absolute bottom-1 right-1" />
                  )}
                </div>

                {/* Details (نام کاربری / برند + حوزه فعالیت + تخصص) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-zinc-900 truncate">
                      {selectedLocation.name}
                    </h3>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-md border border-amber-200/50">
                      ★ {selectedLocation.rating}
                    </span>
                  </div>

                  {/* حوزه فعالیت */}
                  <p className="text-[11px] text-amber-700 font-semibold truncate mt-0.5">
                    {selectedLocation.category}
                  </p>

                  {/* تخصص */}
                  <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-tight">
                    تخصص: {selectedLocation.specialty}
                  </p>

                  <p className="text-[9px] text-zinc-400 mt-1 truncate">
                    محدوده: {selectedLocation.area}
                  </p>
                </div>
              </div>

              {/* Action Buttons: View Profile / View Ad */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectAuthor(selectedLocation.authorId)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>مشاهده پروفایل و آگهی‌ها</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleOpenRouting}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center gap-1"
                  title="مسیریابی"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>مسیریابی</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Map Controls (دکمه‌های نقشه طبق وایرفریم صفحه ۳) */}
        {/* دکمه لوکیشن کاربر (Center on my location) */}
        <button
          onClick={() => {
            setUserLocationCentered(true);
            setTimeout(() => setUserLocationCentered(false), 2000);
          }}
          className={`absolute bottom-3 right-3 z-20 w-11 h-11 rounded-2xl bg-white shadow-lg border border-zinc-200 flex items-center justify-center transition-all ${
            userLocationCentered ? 'text-blue-600 ring-2 ring-blue-500' : 'text-zinc-700 hover:bg-zinc-50'
          }`}
          title="موقعیت مکانی من"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* دکمه مسیریابی (Routing options) */}
        <button
          onClick={handleOpenRouting}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Navigation className="w-4 h-4 fill-white" />
          <span>مسیریابی هوشمند</span>
        </button>
      </div>

      {/* Navigation App Chooser Modal */}
      {showNavModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900">انتخاب برنامه مسیریاب</h3>
              <button
                onClick={() => setShowNavModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-500">
              مسیریابی به مقصد: {selectedLocation.name}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openApp('neshan')}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-bold flex flex-col items-center gap-1 text-zinc-800"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">ن</span>
                <span>نشان (Neshan)</span>
              </button>

              <button
                onClick={() => openApp('balad')}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-bold flex flex-col items-center gap-1 text-zinc-800"
              >
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">ب</span>
                <span>بلد (Balad)</span>
              </button>

              <button
                onClick={() => openApp('google')}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-red-500 hover:bg-red-50/50 text-xs font-bold flex flex-col items-center gap-1 text-zinc-800"
              >
                <span className="w-7 h-7 rounded-lg bg-red-500 text-white font-bold flex items-center justify-center text-xs">G</span>
                <span>Google Maps</span>
              </button>

              <button
                onClick={() => openApp('waze')}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-cyan-500 hover:bg-cyan-50/50 text-xs font-bold flex flex-col items-center gap-1 text-zinc-800"
              >
                <span className="w-7 h-7 rounded-lg bg-cyan-500 text-white font-bold flex items-center justify-center text-xs">W</span>
                <span>Waze</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
