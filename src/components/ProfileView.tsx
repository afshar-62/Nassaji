import React, { useState, useEffect } from 'react';
import {
  Menu,
  ArrowRight,
  Edit3,
  Globe,
  Phone,
  Smartphone,
  Send,
  CheckCircle2,
  Star,
  X,
  Check,
  Share2,
  Copy,
  Layers,
  AlertCircle,
  Video,
} from 'lucide-react';
import { AdItem, BusinessProfile } from '../types';
import { businessesService } from '../core/api/businesses.service';
import { profilesService, PublicProfile } from '../core/api/profiles.service';
import { ProfileEditModal } from './ProfileEditModal';
import { MiniMapWidget } from './MiniMapWidget';

interface ProfileViewProps {
  profileId: string;
  initialProfile?: BusinessProfile | null;
  ads: AdItem[];
  onBack: () => void;
  onSelectAd: (ad: AdItem) => void;
  onOpenDirectChat?: (ad: AdItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileId,
  initialProfile,
  ads,
  onBack,
  onSelectAd,
  onOpenDirectChat,
}) => {
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [legacyProfile, setLegacyProfile] = useState<BusinessProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Active Tab: 'about' (درباره ما) vs 'listings' (آگهی‌ها)
  const [activeTab, setActiveTab] = useState<'about' | 'listings'>('about');

  // Modals & Menu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Rating Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateScore, setRateScore] = useState(5);
  const [rateInteraction, setRateInteraction] = useState<'deal' | 'collaboration' | 'inquiry' | 'service_order'>('deal');
  const [rateRationale, setRateRationale] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);

  const fetchProfileData = async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      // 1. Try fetching from new Profiles API first
      const pProfile = await profilesService.fetchPublicProfile(profileId).catch(() => null);
      if (pProfile) {
        setPublicProfile(pProfile);
        setLoading(false);
        return;
      }

      // 2. Fallback to legacy businesses API
      const bProfile = await businessesService.fetchBusinessProfile(profileId);
      setLegacyProfile(bProfile);
    } catch (err: any) {
      if (err?.code === 'PROFILE_NOT_FOUND' || err?.code === 'BUSINESS_NOT_FOUND' || err?.message?.includes('404')) {
        setNotFound(true);
      } else {
        setError(err?.message || 'خطا در بارگذاری اطلاعات پروفایل');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const showToast = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2200);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} کپی شد`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayName,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy(window.location.href, 'لینک پروفایل');
    }
  };

  const handleRateSubmit = async () => {
    if (!publicProfile) return;
    setSubmittingRate(true);
    try {
      const res = await profilesService.rateProfile(
        publicProfile.id,
        rateScore,
        rateInteraction,
        rateRationale
      );
      setPublicProfile({
        ...publicProfile,
        rating: res.rating,
        ratingsCount: res.ratingsCount,
      });
      setRateSuccess(true);
      setTimeout(() => {
        setShowRateModal(false);
        setRateSuccess(false);
        setRateRationale('');
      }, 1500);
    } catch {
      // Graceful fallback
      setShowRateModal(false);
    } finally {
      setSubmittingRate(false);
    }
  };

  // Profile data derivations
  const displayName = publicProfile?.displayName || legacyProfile?.name || 'فروشگاه و کارگاه نساجی';
  const avatarUrl = publicProfile?.avatarUrl || legacyProfile?.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop';
  const headerUrl = publicProfile?.headerUrl || legacyProfile?.banner || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80';
  const workGroup = publicProfile?.workGroup || 'فروشگاه / منسوجات';
  const activityDomain = publicProfile?.activityDomain || legacyProfile?.activity || 'لوازم و پارچه';
  const isVerified = publicProfile?.isVerified ?? legacyProfile?.isVerified ?? true;
  const isOnline = legacyProfile?.isOnline ?? true;
  const rating = publicProfile?.rating || legacyProfile?.rating || 4.9;

  // Contact info
  const websiteUrl = publicProfile?.website?.url || legacyProfile?.contacts?.website || 'www.store.com';
  const phoneLandline = publicProfile?.contacts?.phone || legacyProfile?.contacts?.phone || '021-77277456';
  const mobilePhone = publicProfile?.contacts?.mobile || legacyProfile?.contacts?.mobile || '09121234567';
  const whatsappNumber = publicProfile?.contacts?.whatsapp || legacyProfile?.contacts?.whatsapp || '09121234567';
  const telegramHandle = publicProfile?.contacts?.telegram || legacyProfile?.contacts?.telegram || 'store_support';
  const instagramHandle = legacyProfile?.contacts?.instagram || 'store_official';

  // Bio lines matching the clean format in the user's image
  const defaultBioLines = [
    '۲۷ سال سابقه تولید و تامین انواع پارچه و خدمات منسوجات',
    'امکان خرید نقدی، چکی، اقساطی | ثبت سفارش از طریق سایت یا پیام‌رسان‌ها',
    'حمل و نقل سریع و ارسال به تمام نقاط ایران',
  ];
  const userBio = publicProfile?.bio || legacyProfile?.bio;
  const bioLines = userBio ? userBio.split('\n').filter(Boolean) : defaultBioLines;

  // Listings for this profile
  const profileListings = publicProfile?.listings?.length
    ? publicProfile.listings
    : ads.filter((a) => a.authorId === profileId || a.authorName === displayName);

  // 1. Loading State (Full Screen)
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-zinc-200 border-t-orange-600 animate-spin" />
        <p className="text-xs font-bold text-zinc-500">در حال دریافت اطلاعات پروفایل...</p>
      </div>
    );
  }

  // 2. 404 / Not Found State
  if (notFound || (!publicProfile && !legacyProfile)) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-['Vazirmatn',sans-serif]">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-black text-zinc-900">پروفایل یافت نشد</h2>
        <p className="text-xs text-zinc-500">پروفایل مورد نظر وجود ندارد یا غیرفعال شده است.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md hover:bg-orange-700 transition-colors"
        >
          بازگشت به صفحه قبل
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto font-['Vazirmatn',sans-serif] select-none text-right">
      {/* پیام بازخورد کپی شدن اطلاعات */}
      {copiedNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-zinc-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-in fade-in zoom-in-95">
          {copiedNotification}
        </div>
      )}

      {/* کانتینر مرکزی متناسب با موبایل و دسکتاپ */}
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20 relative">
        {/* ۱. بنر سراسری بالای صفحه (Cover Image) */}
        <div className="relative w-full h-56 sm:h-64 bg-zinc-100 overflow-hidden">
          <img
            src={headerUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />

          {/* گرادینت تیره ملایم بالا جهت وضوح آیکون‌ها */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* دکمه بازگشت در سمت چپ (فلش به سمت راست در زبان فارسی جهت بازگشت) */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-colors focus:outline-none z-10"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* دکمه منوی همبرگری در سمت راست (دقیقاً مطابق عکس ارسالی) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-colors focus:outline-none z-10"
            title="منوی گزینه‌ها"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* منوی بازشونده همبرگری */}
          {isMenuOpen && (
            <div className="absolute top-14 right-4 z-20 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-1.5 w-44 space-y-1 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleShare();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl text-right transition-colors"
              >
                <Share2 className="w-4 h-4 text-zinc-400" />
                <span>اشتراک‌گذاری</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowRateModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl text-right transition-colors"
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>ثبت امتیاز و ارزیابی</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleCopy(window.location.href, 'لینک صفحه');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl text-right transition-colors"
              >
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>کپی لینک پروفایل</span>
              </button>
            </div>
          )}
        </div>

        {/* ۲. بخش هم‌پوشانی آواتار گرد در سمت راست و دکمه «ویرایش پروفایل» در سمت چپ */}
        <div className="relative px-5 pt-3 flex items-start justify-between">
          {/* سمت چپ: دکمه و لینک «ویرایش پروفایل» با آیکون مداد دقیقاً طبق عکس ارسالی */}
          <div className="pt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors focus:outline-none"
            >
              <Edit3 className="w-4 h-4 stroke-[2.2]" />
              <span>ویرایش پروفایل</span>
            </button>
          </div>

          {/* سمت راست: آواتار گرد بزرگ که نصف آن روی بنر قرار می‌گیرد (مطابق عکس) */}
          <div className="relative -mt-14 shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* نشانگر آنلاین / آفلاین بودن کسب‌وکار روی تصویر لوگوی پروفایل */}
            <span
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs"
              title={isOnline ? 'آنلاین' : 'آفلاین'}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            {isVerified && (
              <span
                className="absolute bottom-0 left-0 bg-white rounded-full p-0.5 shadow-xs"
                title="تأیید هویت شده"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-white" />
              </span>
            )}
          </div>
        </div>

        {/* ۳. عنوان فروشگاه / کارگاه و زیرعنوان رسته کاری */}
        <div className="px-5 mt-1 space-y-1">
          <h1 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
            {displayName}
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            {workGroup} / {activityDomain}
          </p>

          {/* ۴. متن‌های معرفی چندخطی (تمیز و بدون کادربندی‌های اضافی) */}
          <div className="pt-2 space-y-1 text-xs sm:text-[13px] text-zinc-700 leading-relaxed font-normal">
            {bioLines.map((line, idx) => (
              <p key={idx} className="block">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* ۵. دو تب افقی سراسری: «درباره ما» و «آگهی‌ها» (دقیقاً مشابه عکس ارسالی) */}
        <div className="mt-5 border-b border-zinc-200">
          <div className="grid grid-cols-2 text-center text-sm font-black">
            {/* تب ۱: درباره ما */}
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2.5 transition-all focus:outline-none relative ${
                activeTab === 'about'
                  ? 'text-zinc-900 font-black'
                  : 'text-zinc-400 hover:text-zinc-600 font-bold'
              }`}
            >
              <span>درباره ما</span>
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>

            {/* تب ۲: آگهی‌ها */}
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-2.5 transition-all focus:outline-none relative ${
                activeTab === 'listings'
                  ? 'text-zinc-900 font-black'
                  : 'text-zinc-400 hover:text-zinc-600 font-bold'
              }`}
            >
              <span>آگهی‌ها</span>
              {activeTab === 'listings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
          </div>
        </div>

        {/* محتوای تب فعال */}
        {activeTab === 'about' ? (
          /* ۶. تب «درباره ما» شامل اطلاعات تماس و آیکون‌های شبکه اجتماعی */
          <div className="p-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm sm:text-base font-black text-zinc-900">
                اطلاعات تماس
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                {/* وب سایت */}
                <div className="flex items-center justify-between">
                  <a
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0088cc] hover:underline font-sans text-xs sm:text-sm tracking-wide"
                  >
                    {websiteUrl}
                  </a>
                  <span className="text-zinc-800 font-semibold">وب سایت</span>
                </div>

                {/* شماره تلفن ثابت */}
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${phoneLandline}`}
                    className="text-orange-600 hover:underline font-sans font-semibold tracking-wider"
                  >
                    {phoneLandline}
                  </a>
                  <span className="text-zinc-800 font-semibold">شماره تلفن</span>
                </div>

                {/* شماره موبایل */}
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${mobilePhone}`}
                    className="text-orange-600 hover:underline font-sans font-semibold tracking-wider"
                  >
                    {mobilePhone}
                  </a>
                  <span className="text-zinc-800 font-semibold">شماره موبایل</span>
                </div>
              </div>
            </div>

            {/* موقعیت مکانی کارگاه و ابزار مسیریابی جی‌پی‌اس */}
            <div className="pt-2">
              <MiniMapWidget
                title={displayName}
                addressText={legacyProfile?.location?.address || `${publicProfile?.city || 'تهران'}، بازار بزرگ، سرای فردوس، طبقه ۲`}
                lat={legacyProfile?.location?.lat || 35.6892}
                lng={legacyProfile?.location?.lng || 51.3890}
                areaName={legacyProfile?.location?.city || publicProfile?.city || 'تهران'}
              />
            </div>

            {/* آیکون‌های شبکه‌های اجتماعی در پایین صفحه (اینستاگرام، واتس‌اپ، تلگرام مطابق عکس) */}
            <div className="pt-6 flex items-center justify-center gap-4">
              {/* اینستاگرام (آیکون گرد گرادینت رنگی) */}
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="اینستاگرام"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* واتس‌اپ (آیکون گرد سبز) */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="واتس‌اپ"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>

              {/* تلگرام (آیکون گرد آبی) */}
              <a
                href={`https://t.me/${telegramHandle.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="تلگرام"
              >
                <Send className="w-5 h-5 -rotate-45" />
              </a>
            </div>
          </div>
        ) : (
          /* ۷. تب «آگهی‌ها»: گرید یکدست ۳ در ۳ مربع مشابه اکسپلور */
          <div className="pt-2 px-0.5">
            {profileListings.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3 text-zinc-400">
                <Layers className="w-10 h-10 mx-auto text-zinc-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-zinc-600">هنوز آگهی فعالی ثبت نشده است.</p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors"
                >
                  ویرایش و ثبت اطلاعات جدید
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                {profileListings.map((ad: any, idx: number) => {
                  const coverUrl = ad.images?.[0] || 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80';
                  const isMulti = ad.images?.length > 1;

                  return (
                    <button
                      key={ad.id || idx}
                      onClick={() => onSelectAd(ad)}
                      className="relative aspect-square overflow-hidden bg-zinc-100 group focus:outline-none select-none active:opacity-85"
                    >
                      <img
                        src={coverUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* آیکون ظریف چندتصویری در گوشه بالا چپ */}
                      {isMulti && (
                        <div className="absolute top-1.5 left-1.5 text-white drop-shadow-md pointer-events-none">
                          <Copy className="w-3.5 h-3.5 fill-white stroke-none" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* مودال ویرایش پروفایل */}
      {isEditModalOpen && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updated) => {
            fetchProfileData();
            setIsEditModalOpen(false);
            showToast('اطلاعات پروفایل با موفقیت به‌روزرسانی شد');
          }}
        />
      )}

      {/* مودال ثبت امتیاز و ارزیابی */}
      {showRateModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>ثبت امتیاز و ارزیابی کاری</span>
              </h3>
              <button
                onClick={() => setShowRateModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rateSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-800">امتیاز کاری شما با موفقیت ثبت شد.</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    نوع تعامل و همکاری کاری *
                  </label>
                  <select
                    value={rateInteraction}
                    onChange={(e) => setRateInteraction(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 outline-none bg-white"
                  >
                    <option value="deal">معامله و خرید کالا یا پارچه</option>
                    <option value="collaboration">همکاری صنعتی / پیمانکاری</option>
                    <option value="service_order">سفارش دوخت / رنگرزی / بافت</option>
                    <option value="inquiry">استعلام رسمی قیمت و مشخصات فنی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1.5">
                    امتیاز کیفی (از ۵ ستاره)
                  </label>
                  <div className="flex justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRateScore(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rateScore
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    توضیحات و بازخورد (اختیاری)
                  </label>
                  <textarea
                    rows={3}
                    value={rateRationale}
                    onChange={(e) => setRateRationale(e.target.value)}
                    placeholder="کیفیت منسوجات، دقت دوخت، تعهد زمان تحویل..."
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={submittingRate}
                  onClick={handleRateSubmit}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  {submittingRate ? 'در حال ثبت...' : 'تأیید و ثبت امتیاز'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
