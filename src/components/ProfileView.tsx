import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Share2,
  Award,
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Send,
  AlertTriangle,
  ChevronLeft,
  X,
  UserPlus,
  UserCheck,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Check,
  User,
  Truck,
  Clock,
  Calendar,
  FileCheck,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdItem, BusinessProfile } from '../types';
import { businessesService } from '../core/api/businesses.service';
import { profilesService, PublicProfile } from '../core/api/profiles.service';

interface ProfileViewProps {
  profileId: string;
  initialProfile?: BusinessProfile | null;
  ads: AdItem[];
  onBack: () => void;
  onSelectAd: (ad: AdItem) => void;
  onOpenDirectChat: (ad: AdItem) => void;
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Rating Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateScore, setRateScore] = useState(5);
  const [rateInteraction, setRateInteraction] = useState<'deal' | 'collaboration' | 'inquiry' | 'service_order'>('deal');
  const [rateRationale, setRateRationale] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

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

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRateSubmit = async () => {
    if (!publicProfile) return;
    setSubmittingRate(true);
    setRateError(null);
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
    } catch (err: any) {
      setRateError(err?.message || 'خطا در ثبت امتیاز');
    } finally {
      setSubmittingRate(false);
    }
  };

  // 1. Loading Skeleton
  if (loading) {
    return (
      <div className="pb-24 max-w-md mx-auto space-y-4 animate-pulse p-4">
        <div className="h-8 bg-zinc-200 rounded-xl w-1/3 mb-4" />
        <div className="h-36 bg-zinc-200 rounded-3xl" />
        <div className="h-20 bg-zinc-200 rounded-2xl" />
        <div className="h-32 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  // 2. 404 State
  if (notFound || (!publicProfile && !legacyProfile)) {
    return (
      <div className="pb-24 max-w-md mx-auto p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-black text-zinc-900">پروفایل یافت نشد</h2>
        <p className="text-xs text-zinc-500">پروفایل مورد نظر وجود ندارد یا غیرفعال شده است.</p>
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
        >
          بازگشت به صفحه قبل
        </button>
      </div>
    );
  }

  // Active profile info
  const isPublicSlice = !!publicProfile;
  const displayName = publicProfile?.displayName || legacyProfile?.name || 'پروفایل نساجی';
  const profileType = publicProfile?.profileType || 'ORGANIZATION';
  const isVerified = publicProfile?.isVerified ?? legacyProfile?.isVerified ?? false;
  const rating = publicProfile?.rating || legacyProfile?.rating || 5.0;
  const ratingsCount = publicProfile?.ratingsCount || legacyProfile?.reviewsCount || 0;
  const avatarUrl = publicProfile?.avatarUrl || legacyProfile?.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop';
  const headerUrl = publicProfile?.headerUrl || legacyProfile?.banner || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&fit=crop';
  const bio = publicProfile?.bio || legacyProfile?.bio;
  const workGroup = publicProfile?.workGroup || 'صنعت نساجی و منسوجات';
  const activityDomain = publicProfile?.activityDomain || legacyProfile?.activity || 'فعالیت تخصصی';
  const specialties = publicProfile?.specialties || (legacyProfile?.specialty ? [legacyProfile.specialty] : []);

  // Filter listings
  const profileListings = publicProfile?.listings?.length
    ? publicProfile.listings
    : ads.filter((a) => a.authorId === profileId || a.authorName === displayName);

  return (
    <div className="pb-24 max-w-md mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-3 py-2.5 border-b border-zinc-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-zinc-700 hover:text-zinc-900"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>بازگشت</span>
        </button>
        <span className="text-xs font-black text-zinc-900 truncate max-w-[200px]">
          {displayName}
        </span>
        <button
          onClick={handleCopyLink}
          className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
          title="اشتراک‌گذاری پروفایل"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 1. Header Banner & Avatar */}
      <div className="relative">
        <div className="h-32 sm:h-36 w-full overflow-hidden bg-zinc-900 relative">
          <img src={headerUrl} alt={displayName} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="px-4 -mt-10 flex items-end justify-between relative z-10">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -left-1 bg-amber-500 text-white rounded-full p-1 shadow-sm border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5 fill-white text-amber-600" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>ثبت امتیاز</span>
            </button>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs ${
                isFollowing
                  ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              }`}
            >
              {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isFollowing ? 'دنبال‌شده' : 'دنبال کردن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Identity & Classification Details */}
      <div className="px-4 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-zinc-900">{displayName}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  profileType === 'ORGANIZATION'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-purple-100 text-purple-900'
                }`}
              >
                {profileType === 'ORGANIZATION' ? 'سازمان / مجموعه صنعتی' : 'شخص حقیقی / متخصص'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-xl text-xs font-bold border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{Number(rating).toFixed(1)}</span>
              <span className="text-[10px] text-zinc-500">({ratingsCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600 font-medium">
            <span className="text-amber-800 font-bold">{workGroup}</span>
            <span>•</span>
            <span>{activityDomain}</span>
            {publicProfile?.yearsActive ? (
              <>
                <span>•</span>
                <span>{publicProfile.yearsActive} سال سابقه</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Specialties Badges */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 block">تخصص‌ها و قابلیت‌های فنی:</span>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s, idx) => (
              <span
                key={idx}
                className="bg-zinc-100 text-zinc-800 text-xs px-2.5 py-0.8 rounded-lg font-medium border border-zinc-200/80"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs space-y-1.5">
            <h3 className="text-xs font-bold text-zinc-800">معرفی و سوابق حرفه‌ای:</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">{bio}</p>
          </div>
        )}

        {/* 3. Professional Capacity & Working Conditions */}
        {publicProfile && (
          <div className="bg-gradient-to-br from-zinc-50 to-amber-50/40 p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2.5 text-xs">
            <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-700" />
              <span>ظرفیت تولیدی و شرایط همکاری</span>
            </h3>

            {publicProfile.capacitySummary && (
              <div className="text-zinc-700 bg-white p-2.5 rounded-xl border border-zinc-200/70">
                <span className="font-bold text-zinc-900 block mb-0.5">ظرفیت کاری:</span>
                <span>{publicProfile.capacitySummary}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {publicProfile.workingHours && (
                <div className="flex items-center gap-1.5 text-zinc-700">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>ساعات کاری: {publicProfile.workingHours}</span>
                </div>
              )}

              {publicProfile.workingDays?.length > 0 && (
                <div className="flex items-center gap-1.5 text-zinc-700">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>روزهای کاری: {publicProfile.workingDays.length} روز در هفته</span>
                </div>
              )}
            </div>

            {publicProfile.collaborationModes?.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-zinc-700 block mb-1">مدل‌های همکاری:</span>
                <div className="flex flex-wrap gap-1">
                  {publicProfile.collaborationModes.map((mode, i) => (
                    <span
                      key={i}
                      className="bg-amber-100/70 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-1 border-t border-zinc-200/60 text-[11px] font-medium text-zinc-700">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {publicProfile.shippingCapability ? 'ارسال بار به سراسر کشور' : 'فقط تحویل درب کارگاه'}
                </span>
              </div>
              {publicProfile.onsiteServiceCapability && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>امکان اعزام و خدمات در محل</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Direct Communication Channels */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold text-zinc-800 block">راه‌های ارتباط مستقیم و استعلام:</span>
          <div className="grid grid-cols-4 gap-2">
            {(publicProfile?.contacts?.phone || legacyProfile?.contacts?.phone) && (
              <a
                href={`tel:${publicProfile?.contacts?.phone || legacyProfile?.contacts?.phone}`}
                className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px]">تلفن ثابت</span>
              </a>
            )}

            {(publicProfile?.contacts?.mobile || legacyProfile?.contacts?.mobile) && (
              <a
                href={`tel:${publicProfile?.contacts?.mobile || legacyProfile?.contacts?.mobile}`}
                className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex flex-col items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px]">همراه</span>
              </a>
            )}

            {(publicProfile?.contacts?.whatsapp || legacyProfile?.contacts?.whatsapp) && (
              <a
                href={`https://wa.me/${publicProfile?.contacts?.whatsapp || legacyProfile?.contacts?.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex flex-col items-center gap-1 hover:bg-green-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px]">واتس‌اپ</span>
              </a>
            )}

            {(publicProfile?.contacts?.telegram || legacyProfile?.contacts?.telegram) && (
              <a
                href={`https://t.me/${(publicProfile?.contacts?.telegram || legacyProfile?.contacts?.telegram || '').replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold flex flex-col items-center gap-1 hover:bg-sky-100 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="text-[10px]">تلگرام</span>
              </a>
            )}
          </div>

          {(publicProfile?.website?.url || legacyProfile?.contacts?.website) && (
            <a
              href={publicProfile?.website?.url || legacyProfile?.contacts?.website}
              target="_blank"
              rel="noreferrer"
              className="w-full mt-2 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-500" />
                <span>وب‌سایت رسمی: {publicProfile?.website?.url || legacyProfile?.contacts?.website}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          )}
        </div>

        {/* 5. Operational Units & Locations (Clean anti-fake-coordinates) */}
        {publicProfile?.locations && publicProfile.locations.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>واحدهای کاری و موقعیت‌های استقرار</span>
            </h3>

            <div className="space-y-2">
              {publicProfile.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{loc.unitTitle}</span>
                    <div className="flex items-center gap-1.5">
                      {loc.isPrimary && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          واحد اصلی
                        </span>
                      )}
                      {loc.isApproximate && (
                        <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.2 rounded-full">
                          محدوده تقریبی
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    {loc.province}، {loc.city} {loc.area ? `(${loc.area})` : ''} - {loc.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Credentials & Verified Licenses */}
        {publicProfile?.credentials && publicProfile.credentials.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700" />
              <span>مدارک، پروانه‌ها و مجوزهای رسمی</span>
            </h3>

            <div className="space-y-2">
              {publicProfile.credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{cred.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            cred.isOfficiallyVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {cred.isOfficiallyVerified ? 'تأیید رسمی صنف' : 'خوداظهاری'}
                        </span>
                      </div>
                      {cred.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{cred.description}</p>
                      )}
                    </div>
                  </div>

                  {cred.fileUrl && (
                    <a
                      href={cred.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 shrink-0"
                    >
                      مشاهده سند
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Current Listings & Operational Offers (Distinction between Profile and Listings) */}
        <div className="space-y-2 pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-black text-zinc-900">
                پیشنهادات و آگهی‌های معاملاتی جاری ({profileListings.length})
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400">پیشنهادات فعال در پلتفرم</span>
          </div>

          <div className="space-y-2">
            {profileListings.map((ad: any) => (
              <div
                key={ad.id}
                onClick={() => onSelectAd(ad)}
                className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{ad.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span>{ad.category}</span>
                    {ad.city && (
                      <>
                        <span>•</span>
                        <span>{ad.city}</span>
                      </>
                    )}
                  </div>
                </div>

                <ChevronLeft className="w-4 h-4 text-zinc-400 shrink-0" />
              </div>
            ))}

            {profileListings.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl">
                در حال حاضر هیچ آگهی یا پیشنهاد معاملاتی فعالی ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RATING MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                {rateError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{rateError}</span>
                  </div>
                )}

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
                    توضیحات و بازخورد محرمانه (اختیاری)
                  </label>
                  <textarea
                    rows={3}
                    value={rateRationale}
                    onChange={(e) => setRateRationale(e.target.value)}
                    placeholder="کیفیت خدمات، تعهد به زمان تحویل یا توضیحات..."
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 outline-none resize-none"
                  />
                  <span className="text-[10px] text-zinc-400">
                    توضیحات شما محرمانه ذخیره شده و در صفحه عمومی نمایش داده نمی‌شود.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={submittingRate}
                  onClick={handleRateSubmit}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
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
