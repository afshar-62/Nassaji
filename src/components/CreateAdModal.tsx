import React, { useState, useMemo } from 'react';
import { X, Upload, Check, MapPin, Tag, Plus, Globe } from 'lucide-react';
import { AdItem } from '../types';
import { TOP_CATEGORIES } from '../data/mockData';
import {
  SUPPORTED_COUNTRIES,
  IRAN_PROVINCES,
  getCitiesByProvince,
} from '../data/locationsData';

interface CreateAdModalProps {
  onClose: () => void;
  onSubmitAd: (newAd: AdItem) => void;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ onClose, onSubmitAd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(TOP_CATEGORIES[0].title);
  const [country, setCountry] = useState('ایران');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [price, setPrice] = useState('');
  const [mobile, setMobile] = useState('');
  const [phone, setPhone] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80',
  ]);

  // شهرهای استان انتخاب شده
  const availableCities = useMemo(() => {
    return getCitiesByProvince(province);
  }, [province]);

  const handleProvinceChange = (newProvinceName: string) => {
    setProvince(newProvinceName);
    const citiesOfProv = getCitiesByProvince(newProvinceName);
    if (citiesOfProv.length > 0) {
      setCity(citiesOfProv[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !mobile.trim()) {
      alert('لطفاً عنوان، توضیحات و شماره تماس را وارد فرمایید.');
      return;
    }

    const newAd: AdItem = {
      id: `ad-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      city: city,
      province: province,
      category: category,
      authorId: 'user-1',
      authorName: 'تولیدی صنعتی پارس دوخت (شما)',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      authorRating: 5.0,
      authorVerified: true,
      authorSpecialty: 'تولید و خدمات نساجی',
      authorActivity: category,
      images: images,
      createdAtText: 'لحظاتی پیش',
      likesCount: 1,
      commentsCount: 0,
      price: price || 'توافقی',
      isUrgent: isUrgent,
      isFeatured: true,
      contact: {
        mobile: mobile,
        phone: phone || mobile,
        smsNumber: mobile,
        whatsapp: mobile,
      },
      location: {
        lat: 35.6892,
        lng: 51.3890,
        areaName: city,
        addressText: `${city}، بازار بزرگ نساجی`,
      },
      comments: [],
    };

    onSubmitAd(newAd);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-600" />
            <h2 className="text-xs font-black text-zinc-900">ثبت آگهی جدید در بازار نساجی</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs no-scrollbar">
          {/* Photo upload mock */}
          <div>
            <label className="font-bold text-zinc-800 block mb-1.5">تصاویر آگهی (حداقل یک تصویر):</label>
            <div className="flex items-center gap-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-zinc-300 relative shrink-0">
                <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div
                onClick={() => {
                  const sampleImgs = [
                    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
                  ];
                  const pick = sampleImgs[Math.floor(Math.random() * sampleImgs.length)];
                  setImages([...images, pick]);
                }}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-amber-500 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer text-zinc-400 hover:text-amber-600 transition-colors"
              >
                <Upload className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">افزودن عکس</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-zinc-800 block mb-1">عنوان آگهی (حداکثر ۵۰ کاراکتر):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: فروش عمده پارچه کرپ طاقه‌ای / دوخت مزدی شلوار"
              maxLength={50}
              className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-bold text-zinc-800 block mb-1">دسته‌بندی تخصصی نساجی:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold"
            >
              {TOP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Hierarchical Location (Country > Province > City) */}
          <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>موقعیت مکانی واحد صنفی یا کارگاه:</span>
              </span>
              <span className="text-[10px] text-zinc-500">
                {country} / {province} / {city}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Country */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">کشور:</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} disabled={!c.isDefault}>
                      {c.flagEmoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">استان:</label>
                <select
                  value={province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full p-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold"
                >
                  {IRAN_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name}>
                      استان {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">شهر:</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold"
                >
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.isIndustrialHub ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="font-bold text-zinc-800 block mb-1">قیمت یا نحوه همکاری:</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثلاً توافقی بر اساس تیراژ / متری ۳۵,۰۰۰ تومان"
              className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-zinc-800 block mb-1">شماره همراه مستقیم:</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="09121112233"
                dir="ltr"
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500 text-left"
                required
              />
            </div>
            <div>
              <label className="font-bold text-zinc-800 block mb-1">تلفن ثابت کارگاه (اختیاری):</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02155667788"
                dir="ltr"
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-zinc-800 block mb-1">توضیحات تکمیلی:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح دهید: ظرفیت تولید روزانه، مشخصات فنی پارچه، نوع نخ، شرایط تحویل و..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Urgent checkbox */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span className="font-bold text-amber-900">نشان «فوری / تخفیف ویژه» روی آگهی فعال شود</span>
          </label>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold py-3 rounded-2xl shadow-md text-xs transition-all"
          >
            ثبت و انتشار آگهی در بازار
          </button>
        </form>
      </div>
    </div>
  );
};
