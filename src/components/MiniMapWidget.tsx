import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  ExternalLink,
  X,
  Compass,
} from 'lucide-react';

interface MiniMapWidgetProps {
  lat?: number;
  lng?: number;
  title: string;
  addressText: string;
  areaName?: string;
  onOpenFullMap?: () => void;
  className?: string;
}

export const MiniMapWidget: React.FC<MiniMapWidgetProps> = ({
  lat = 35.6892,
  lng = 51.3890,
  title,
  addressText,
  areaName,
  onOpenFullMap,
  className = '',
}) => {
  const [showNavModal, setShowNavModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openApp = (appName: 'neshan' | 'balad' | 'google' | 'waze') => {
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
    <div className={`rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs font-['Vazirmatn',sans-serif] ${className}`}>
      {/* هدر بخش لوکیشن */}
      <div className="p-3 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span>موقعیت مکانی و آدرس</span>
          {areaName && (
            <span className="text-[11px] font-medium text-zinc-500">({areaName})</span>
          )}
        </div>

        {onOpenFullMap && (
          <button
            onClick={onOpenFullMap}
            className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1 focus:outline-none"
          >
            <span>مشاهده روی نقشه بزرگ</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* شبیه‌ساز نقشه با جاده‌ها و پین قرمز کسب‌وکار */}
      <div className="relative w-full h-36 bg-[#e5e3df] overflow-hidden select-none">
        {/* خطوط و معابر نقشه */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="0" y1="65%" x2="100%" y2="68%" stroke="#fdba74" strokeWidth="7" />
          <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="68%" y1="0" x2="70%" y2="100%" stroke="#fdba74" strokeWidth="6" />
          <circle cx="50%" cy="50%" r="55" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* برچسب‌های خیابان */}
        <div className="absolute top-2 right-2 text-[9px] font-semibold text-zinc-600 bg-white/80 px-1.5 py-0.5 rounded shadow-2xs">
          محدوده بازار نساجی
        </div>

        {/* پین نارنجی شاخص کسب‌وکار */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
          <div className="bg-orange-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce duration-1000">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
          <div className="bg-zinc-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap -mt-1">
            {title}
          </div>
          {/* سایه پین روی نقشه */}
          <div className="w-3 h-1 bg-black/30 rounded-full blur-2xs mt-0.5" />
        </div>

        {/* دکمه بازکردن سریع در مسیریاب روی نقشه */}
        <button
          onClick={() => setShowNavModal(true)}
          className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-zinc-800 text-xs font-bold shadow-md border border-zinc-200 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-orange-600" />
          <span>مسیریابی</span>
        </button>
      </div>

      {/* کادر آدرس متنی و دکمه کپی */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
            {addressText}
          </p>
          <button
            onClick={handleCopyAddress}
            className="text-zinc-400 hover:text-zinc-700 p-1 shrink-0 transition-colors"
            title="کپی آدرس"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {copied && (
          <p className="text-[10px] text-emerald-600 font-bold text-right">
            آدرس در حافظه کپی شد.
          </p>
        )}

        {/* دکمه برجسته مسیریابی با جی‌پی‌اس (GPS) */}
        <button
          onClick={() => setShowNavModal(true)}
          className="w-full py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>مسیریابی هوشمند با جی‌پی‌اس (نشان / بلد / گوگل مپ / ویز)</span>
        </button>
      </div>

      {/* مودال انتخاب اپلیکیشن مسیریابی */}
      {showNavModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl space-y-3 border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>انتخاب برنامه مسیریاب</span>
              </h3>
              <button
                onClick={() => setShowNavModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 text-right leading-tight">
              مسیریابی مستقیم به مقصد: <strong className="text-zinc-800">{title}</strong>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => openApp('neshan')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">ن</span>
                <span>نشان (Neshan)</span>
              </button>

              <button
                onClick={() => openApp('balad')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">ب</span>
                <span>بلد (Balad)</span>
              </button>

              <button
                onClick={() => openApp('google')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-red-500 hover:bg-red-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">G</span>
                <span>Google Maps</span>
              </button>

              <button
                onClick={() => openApp('waze')}
                className="p-3 rounded-2xl border border-zinc-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-xs font-bold flex flex-col items-center gap-1.5 text-zinc-800 transition-all"
              >
                <span className="w-8 h-8 rounded-xl bg-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">W</span>
                <span>Waze</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
