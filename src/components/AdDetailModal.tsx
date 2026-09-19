import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { AdItem, CommentItem } from '../types';

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
  const [showCallModal, setShowCallModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // New comment state
  const [commentsList, setCommentsList] = useState<CommentItem[]>(ad.comments);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-600 transition-colors"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-zinc-700">نمایش کامل آگهی</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBookmark(ad.id)}
              className={`p-1.5 rounded-full hover:bg-zinc-200 transition-colors ${
                isBookmarked ? 'text-amber-600' : 'text-zinc-600'
              }`}
              title="نشان‌کردن"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-600 transition-colors"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* 1. Header: Province & City, Category, Username, Avatar, Rating (طبق وایرفریم ۴) */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div
              onClick={() => {
                onClose();
                onSelectAuthor(ad.authorId);
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={ad.authorAvatar}
                  alt={ad.authorName}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-200 group-hover:ring-2 ring-amber-500"
                />
                {ad.authorVerified && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 bg-white rounded-full absolute -bottom-0.5 -left-0.5 fill-amber-100" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                  {ad.authorName}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                  <span>{ad.province}، {ad.city}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-medium">{ad.category}</span>
                </div>
              </div>
            </div>

            {/* Author Rating Badge */}
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200/80">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{ad.authorRating}</span>
            </div>
          </div>

          {/* 2. Media Slider: Photos & Videos with mute toggle, slider dots (طبق وایرفریم ۴) */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 shadow-xs">
            <img
              src={ad.images[activeImageIdx]}
              alt={ad.title}
              className="w-full h-full object-cover"
            />

            {/* Audio Mute/Unmute button */}
            {ad.hasVideo && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Arrows */}
            {ad.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev - 1 + ad.images.length) % ad.images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % ad.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Counter Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {ad.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeImageIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 3. Ad Title & Detailed Description */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-sm sm:text-base font-black text-zinc-900 leading-snug">
                {ad.title}
              </h1>
            </div>

            {ad.price && (
              <div className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-600">قیمت پیشنهادی:</span>
                <span className="text-sm font-black text-amber-700">{ad.price}</span>
              </div>
            )}

            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-700 mb-1.5">توضیحات تکمیلی آگهی:</h4>
              <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                {ad.description}
              </p>
            </div>
          </div>

          {/* 4. Action Buttons (دکمه‌های ارتباطی دقیقاً طبق وایرفریم صفحه ۴) */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-zinc-800">راه‌های ارتباط و خرید مستقیم:</h4>

            <div className="grid grid-cols-2 gap-2">
              {/* دکمه خرید آنلاین / وبسایت شخصی / باسلام */}
              <a
                href={ad.contact.website || ad.contact.basalamUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold p-2.5 rounded-xl transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>خرید آنلاین / وبسایت</span>
              </a>

              {/* دکمه چت داخلی مستقیم */}
              <button
                onClick={() => onOpenDirectChat(ad)}
                className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold p-2.5 rounded-xl transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>چت مستقیم داخلی</span>
              </button>
            </div>

            {/* دکمه تماس سریع (شامل تماس تلفنی مستقیم، SMS و تلفن ثابت) */}
            <button
              onClick={() => setShowCallModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold p-3 rounded-xl transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>تماس سریع (موبایل، پیامک، تلفن ثابت)</span>
            </button>

            {/* Social Media Row (لینکدین، اینستاگرام، تلگرام، واتس‌اپ طبق وایرفریم) */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                <span>شبکه‌های اجتماعی و پیام‌رسان‌ها:</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ad.contact.telegram && (
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
                {ad.contact.whatsapp && (
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
                {ad.contact.instagram && (
                  <a
                    href={`https://instagram.com/${ad.contact.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>اینستاگرام</span>
                  </a>
                )}
                <a
                  href={`sms:${ad.contact.mobile}?body=سلام، در رابطه با آگهی «${ad.title}» پیام میدهم.`}
                  className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>پیامک</span>
                </a>
              </div>
            </div>
          </div>

          {/* 5. Exact Location Map Preview & Routing (نقشه موقعیت مکانی و مسیریابی) */}
          <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>موقعیت مکانی و آدرس دقیق:</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${ad.location.lat},${ad.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>مسیریابی</span>
              </a>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-white p-2.5 rounded-xl border border-zinc-100">
              {ad.location.addressText}
            </p>
          </div>

          {/* 6. User Comments & Ratings Section (بخش نظرات و دیدگاه‌ها) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <span>دیدگاه‌ها و نظرات همکاران ({commentsList.length})</span>
              </h4>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600 font-medium">امتیاز شما به این کسب‌وکار:</span>
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
                className="w-full bg-white text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition-colors"
              >
                ثبت دیدگاه
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2">
              {commentsList.map((comm) => (
                <div key={comm.id} className="p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs space-y-1">
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

          {/* 7. Security Warnings & Report Abuse (بخش هشدارهای امنیتی طبق وایرفریم ۴) */}
          <div className="space-y-2 pt-2">
            {/* هشدار معامله حضوری */}
            <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">توصیه امنیتی بازار نساجی:</span>
                معاملات طاقه‌ای و عمده را ترجیحاً به‌صورت حضوری یا با دریافت پیش‌فاکتور رسمی و نمونه کالیته تاییدشده انجام دهید. از پرداخت بیعانه سنگین پیش از رویت کالا خودداری فرمایید.
              </div>
            </div>

            {/* دکمه گزارش تخلف (Report Abuse) */}
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
      </div>

      {/* Quick Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-900">اطلاعات تماس مستقیم</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 rounded-lg text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${ad.contact.mobile}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>تلفن همراه (مستقیم):</span>
                </div>
                <span dir="ltr">{ad.contact.mobile}</span>
              </a>

              <a
                href={`tel:${ad.contact.phone}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>تلفن ثابت کارگاه / دفتر:</span>
                </div>
                <span dir="ltr">{ad.contact.phone}</span>
              </a>

              <a
                href={`sms:${ad.contact.mobile}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>ارسال پیامک (SMS):</span>
                </div>
                <span dir="ltr">{ad.contact.mobile}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Report Abuse Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>گزارش تخلف آگهی</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-lg text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-800">گزارش شما با موفقیت ثبت شد.</p>
                <p className="text-[11px] text-zinc-500">تیم نظارت بازارگاه به سرعت موضوع را بررسی خواهند کرد.</p>
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
                        className="text-amber-600"
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
