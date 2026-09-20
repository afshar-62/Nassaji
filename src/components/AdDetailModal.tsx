import React, { useState } from 'react';
import {
  ArrowRight,
  Share2,
  Bookmark,
  Star,
  Phone,
  MessageSquare,
  Globe,
  ShoppingBag,
  Send,
  Volume2,
  VolumeX,
  AlertTriangle,
  MapPin,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  X,
} from 'lucide-react';
import { AdItem, CommentItem } from '../types';
import { MiniMapWidget } from './MiniMapWidget';
import { CustomMediaPlayer } from './CustomMediaPlayer';

interface AdDetailModalProps {
  ad: AdItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (adId: string) => void;
  onSelectAuthor: (authorId: string) => void;
  onOpenDirectChat: (ad: AdItem) => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  ad,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectAuthor,
  onOpenDirectChat,
}) => {
  if (!ad) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>(ad.hasVideo ? 'video' : 'image');
  const [showCallModal, setShowCallModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [userReaction, setUserReaction] = useState<'up' | 'down' | null>(null);

  // Comments state
  const [commentsList, setCommentsList] = useState<CommentItem[]>(ad.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      authorName: 'همکار گرامی (کاربر میهمان)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      rating: newCommentRating,
      text: newCommentText.trim(),
      date: 'لحظاتی پیش',
    };

    setCommentsList([newComment, ...commentsList]);
    setNewCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک این آگهی کپی شد!');
    }
  };

  const getAdUnitPricing = (): string => {
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

  const getAdQuantityMetrics = (): string => {
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

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col font-['Vazirmatn',sans-serif]">
      {/* ۱. نوار تیره بالای صفحه (دقیقاً مطابق نوار تیره Pelak 13 در تصویر با دکمه بازگشت) */}
      <header className="sticky top-0 z-40 bg-[#1f1f23] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-lg hover:bg-white/10 text-white transition-colors flex items-center gap-1.5 focus:outline-none"
            title="بازگشت به لیست"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.2]" />
            <span className="text-xs font-medium">بازگشت</span>
          </button>
        </div>

        <h2 className="text-sm font-bold tracking-wide text-zinc-100">
          تاروپود
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="اشتراک‌گذاری"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ۲. محتوای تمام‌صفحه آگهی (بدون هیچ باکس یا کادر شناور وسط صفحه) */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col pb-24">
        {/* هدر فروشنده/کارگاه: پروفایل در راست + برچسب دسته‌بندی و زمان در چپ (عین تصویر) */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-zinc-100">
          {/* راست: آواتار + نام کارگاه + زمینه تخصصی */}
          <div
            onClick={() => onSelectAuthor(ad.authorId)}
            className="flex items-center gap-2.5 cursor-pointer group text-right"
          >
            <div className="relative">
              <img
                src={ad.authorAvatar}
                alt={ad.authorName}
                className="w-11 h-11 rounded-full object-cover border border-zinc-200 group-hover:ring-2 ring-orange-500 transition-all"
              />
              {ad.authorVerified && (
                <CheckCircle2 className="w-4 h-4 text-orange-600 bg-white rounded-full absolute -bottom-0.5 -left-0.5 fill-orange-100" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 group-hover:text-orange-700 transition-colors leading-tight">
                {ad.authorName}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                {ad.authorSpecialty || ad.category}
              </p>
            </div>
          </div>

          {/* چپ: برچسب رسته + زمان انتشار */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-medium text-zinc-600 border border-zinc-300 rounded px-2.5 py-0.5 whitespace-nowrap bg-zinc-50">
              {ad.category}
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              {ad.createdAtText || '۳ ساعت پیش'}
            </span>
          </div>
        </div>

        {/* دکمه‌های سوئیچ بین ویدیو و عکس در صورتی که آگهی ویدیو داشته باشد */}
        {ad.hasVideo && (
          <div className="px-4 py-2 bg-zinc-100 flex items-center justify-between border-y border-zinc-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMediaTab('video')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mediaTab === 'video'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>ویدیو معرفی کارگاه</span>
                <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded">
                  {ad.videoDuration || '۰۳:۴۵'}
                </span>
              </button>
              <button
                onClick={() => setMediaTab('image')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mediaTab === 'image'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>تصاویر کاتالوگ ({ad.images.length})</span>
              </button>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium bg-zinc-200/80 px-2 py-0.5 rounded">
              کیفیت: {ad.videoQuality || '1080p FHD'}
            </span>
          </div>
        )}

        {/* بخش مدیا تمام‌عرض فول‌وید با نسبت ابعاد پویا (افقی، عمودی، مربعی) */}
        {(() => {
          const aspectClass = ad.aspectRatio === 'vertical'
            ? 'aspect-[4/5] max-h-[580px]'
            : ad.aspectRatio === 'horizontal'
              ? 'aspect-[16/9]'
              : 'aspect-square sm:aspect-16/10';

          return (
            <div className={`relative w-full ${aspectClass} bg-zinc-950 overflow-hidden flex items-center justify-center`}>
              {ad.hasVideo && mediaTab === 'video' && ad.videoUrl ? (
                <div className="w-full h-full relative bg-black flex items-center justify-center">
                  <CustomMediaPlayer
                    src={ad.videoUrl}
                    poster={ad.images[0]}
                    title={ad.title}
                    authorName={ad.authorName}
                    durationText={ad.videoDuration || '۰۳:۴۵'}
                    quality={ad.videoQuality || '1080p FHD'}
                    aspectRatio={ad.aspectRatio || 'horizontal'}
                    autoPlay={true}
                    initialMuted={isMuted}
                  />
                </div>
              ) : (
                <>
                  <img
                    src={ad.images[activeImageIdx] || ad.images[0]}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />

                  {/* بج تعداد عکس در بالا چپ */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    {activeImageIdx + 1}/{Math.max(ad.images.length, 1)}
                  </div>

                  {/* بج پرتره عمودی در صورت وجود */}
                  {ad.aspectRatio === 'vertical' && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                      کادر عمودی پرتره
                    </div>
                  )}

                  {/* فلش‌های اسلاید تصاویر */}
                  {ad.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIdx((prev) => (prev - 1 + ad.images.length) % ad.images.length)
                        }
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        title="تصویر قبلی"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIdx((prev) => (prev + 1) % ad.images.length)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                        title="تصویر بعدی"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* نوار اکشن زیر عکس: بوکمارک، لوکیشن، اشتراک | نقطه‌ها | دیس‌لایک و لایک (دقیقاً عین تصویر) */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-100 bg-white">
          {/* سمت چپ: دکمه‌های نشان کردن، موقعیت مکانی و اشتراک */}
          <div className="flex items-center gap-3 text-zinc-600">
            <button
              onClick={() => onToggleBookmark(ad.id)}
              className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
              title="نشان کردن"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-zinc-900 text-zinc-900' : 'stroke-[1.6]'}`} />
            </button>

            <button
              onClick={() => {
                alert(`موقعیت کارگاه/انبار: ${ad.province}، ${ad.city} ${ad.location?.areaName || ''}\n${ad.location?.addressText || ''}`);
              }}
              className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
              title="مشاهده موقعیت روی نقشه"
            >
              <MapPin className="w-5 h-5 stroke-[1.6]" />
            </button>

            <button
              onClick={handleShare}
              className="hover:text-zinc-900 transition-colors p-0.5 focus:outline-none"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-5 h-5 stroke-[1.6]" />
            </button>
          </div>

          {/* وسط: نقطه‌های اسلایدر */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <span
                key={dotIdx}
                className={`rounded-full transition-all ${
                  dotIdx === (activeImageIdx % 5)
                    ? 'w-2 h-2 bg-orange-600'
                    : 'w-1.5 h-1.5 bg-zinc-300'
                }`}
              />
            ))}
          </div>

          {/* سمت راست: دیس‌لایک و لایک */}
          <div className="flex items-center gap-3 text-zinc-600">
            <button
              onClick={() => setUserReaction((prev) => (prev === 'down' ? null : 'down'))}
              className={`hover:text-zinc-900 transition-colors p-0.5 focus:outline-none ${
                userReaction === 'down' ? 'text-zinc-900' : ''
              }`}
              title="نپسندیدم"
            >
              <ThumbsDown className={`w-5 h-5 ${userReaction === 'down' ? 'fill-zinc-900 text-zinc-900' : 'stroke-[1.6]'}`} />
            </button>

            <button
              onClick={() => setUserReaction((prev) => (prev === 'up' ? null : 'up'))}
              className={`hover:text-orange-600 transition-colors p-0.5 focus:outline-none ${
                userReaction === 'up' ? 'text-orange-600' : ''
              }`}
              title="پسندیدم"
            >
              <ThumbsUp className={`w-5 h-5 ${userReaction === 'up' ? 'fill-orange-600 text-orange-600' : 'stroke-[1.6]'}`} />
            </button>
          </div>
        </div>

        {/* عنوان و جدول مشخصات کلیدی (قیمت کل، قیمت هر متر/واحد، متراژ/حجم، موقعیت) */}
        <div className="px-4 pt-3.5 pb-3 bg-white">
          <h1 className="text-base sm:text-lg font-black text-zinc-900 text-right leading-snug mb-3">
            {ad.title}
          </h1>

          {/* جدول خط‌کشی شده مشخصات */}
          <div className="divide-y divide-zinc-200 border-t border-zinc-200 text-sm">
            {/* قیمت کل */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-zinc-500">قیمت کل</span>
              <span className="font-black text-zinc-900">
                {ad.price ? `${ad.price.toLocaleString('fa-IR')} تومان` : 'توافقی'}
              </span>
            </div>

            {/* قیمت هر متر یا واحد */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-zinc-500">قیمت هر متر / واحد</span>
              <span className="font-bold text-zinc-900">
                {getAdUnitPricing()}
              </span>
            </div>

            {/* متراژ / حجم */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-zinc-500">متراژ / حجم</span>
              <span className="font-bold text-zinc-900">
                {getAdQuantityMetrics()}
              </span>
            </div>

            {/* موقعیت */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-medium text-zinc-500">موقعیت</span>
              <span className="font-bold text-zinc-900">
                {ad.province}، {ad.city} {ad.location?.areaName ? `(${ad.location.areaName})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* دو دکمه اصلی نارنجی سازمانی پهلو به پهلو: چت و تماس */}
        <div className="px-4 py-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            {/* دکمه تماس (سمت راست) */}
            <button
              id="btn-ad-call"
              onClick={() => setShowCallModal(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none"
            >
              <span>تماس</span>
            </button>

            {/* دکمه چت (سمت چپ) */}
            <button
              id="btn-ad-chat"
              onClick={() => onOpenDirectChat(ad)}
              className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none"
            >
              <span>چت</span>
            </button>
          </div>
        </div>

        {/* توضیحات تکمیلی آگهی */}
        <div className="px-4 py-4 bg-white border-t border-zinc-100 space-y-2">
          <h3 className="text-xs font-bold text-zinc-900">توضیحات تکمیلی:</h3>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line text-right">
            {ad.description}
          </p>
        </div>

        {/* شبکه‌های اجتماعی و پیام‌رسان‌ها */}
        <div className="px-4 py-3 bg-zinc-50 border-y border-zinc-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium">
            <span>ارتباط سریع در شبکه‌های اجتماعی:</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ad.contact?.telegram && (
              <a
                href={`https://t.me/${ad.contact.telegram}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تلگرام</span>
              </a>
            )}
            {ad.contact?.whatsapp && (
              <a
                href={`https://wa.me/${ad.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتس‌اپ</span>
              </a>
            )}
            {ad.contact?.instagram && (
              <a
                href={`https://instagram.com/${ad.contact.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>اینستاگرام</span>
              </a>
            )}
            <a
              href={`sms:${ad.contact?.mobile}?body=سلام، در رابطه با آگهی «${ad.title}» پیام میدهم.`}
              className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>پیامک</span>
            </a>
          </div>
        </div>

        {/* موقعیت مکانی و مسیریابی هوشمند با جی‌پی‌اس */}
        {ad.location && (
          <div className="px-4 py-4 bg-white border-b border-zinc-100">
            <MiniMapWidget
              title={ad.title}
              addressText={ad.location.addressText || `${ad.province}، ${ad.city}`}
              lat={ad.location.lat}
              lng={ad.location.lng}
              areaName={ad.location.areaName}
            />
          </div>
        )}

        {/* نظرات و امتیازات */}
        <div className="px-4 py-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-orange-600" />
              <span>دیدگاه‌های همکاران صنعت ({commentsList.length})</span>
            </h4>
          </div>

          {/* فرم ثبت نظر */}
          <form onSubmit={handleAddComment} className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-600 font-medium">امتیاز به کیفیت و تعهد:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewCommentRating(star)}
                    className="p-0.5 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= newCommentRating
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-zinc-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="نظر یا تجربه کاری خود را با این تولیدکننده بنویسید..."
              rows={2}
              className="w-full bg-white text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-500"
            />

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              ثبت دیدگاه
            </button>
          </form>

          {/* لیست نظرات */}
          <div className="space-y-2">
            {commentsList.map((comm) => (
              <div key={comm.id} className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={comm.avatar} alt={comm.authorName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-bold text-zinc-800">{comm.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{comm.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed pr-8">{comm.text}</p>
                <div className="text-[10px] text-zinc-400 text-left">{comm.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* هشدارهای امنیتی و گزارش تخلف */}
        <div className="px-4 py-4 bg-white border-t border-zinc-100 space-y-3">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">توصیه امنیتی بازار نساجی:</span>
              معاملات طاقه‌ای و عمده را ترجیحاً به‌صورت حضوری یا با دریافت پیش‌فاکتور معتبر و نمونه کالیته تاییدشده انجام دهید.
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>گزارش تخلف یا محتوای نامناسب</span>
            </button>
          </div>
        </div>
      </div>

      {/* مودال تماس تلفنی و شماره‌ها */}
      {showCallModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900">اطلاعات تماس مستقیم</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${ad.contact?.mobile}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>تلفن همراه (مستقیم):</span>
                </div>
                <span dir="ltr">{ad.contact?.mobile}</span>
              </a>

              {ad.contact?.phone && (
                <a
                  href={`tel:${ad.contact.phone}`}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>تلفن ثابت کارگاه:</span>
                  </div>
                  <span dir="ltr">{ad.contact.phone}</span>
                </a>
              )}

              <a
                href={`sms:${ad.contact?.mobile}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>ارسال پیامک (SMS):</span>
                </div>
                <span dir="ltr">{ad.contact?.mobile}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* مودال گزارش تخلف */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>گزارش تخلف آگهی</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-800">گزارش شما با موفقیت ثبت شد.</p>
                <p className="text-[11px] text-zinc-500">تیم نظارت بازارگاه موضوع را بررسی خواهند کرد.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600">علت گزارش تخلف را مشخص نمایید:</p>
                <div className="space-y-1.5 text-xs text-zinc-700">
                  {['اطلاعات نادرست یا گمراه‌کننده', 'قیمت غیرواقعی یا بیعانه مشکوک', 'عدم پاسخگویی شماره تلفن', 'کالای ممنوعه یا غیراستاندارد'].map((r) => (
                    <label key={r} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reportReason === r}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-rose-600"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setReportSubmitted(true);
                    setTimeout(() => {
                      setShowReportModal(false);
                      setReportSubmitted(false);
                    }, 2000);
                  }}
                  disabled={!reportReason}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  ارسال گزارش
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
