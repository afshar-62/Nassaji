import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  X,
  Plus,
  Building2,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PackageCheck,
  Info,
} from 'lucide-react';
import { AdItem, ListingIntent } from '../types';
import { entitlementService, EligibilityResult } from '../core/monetization/entitlement.service';

interface CreateAdModalProps {
  onClose: () => void;
  onSubmitAd?: (newAd: AdItem) => void;
  onStartNextStep?: (intent: ListingIntent) => void;
}

export const CreateAdModal: React.FC<CreateAdModalProps> = ({ onClose, onStartNextStep }) => {
  // Step 1: 'intro' | Step 2: 'intent_selection'
  const [currentStep, setCurrentStep] = useState<'intro' | 'intent_selection'>('intro');
  const [selectedIntent, setSelectedIntent] = useState<ListingIntent>('OFFER');
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [confirmedDraft, setConfirmedDraft] = useState<boolean>(false);

  // Initialize and check monetization eligibility on mount
  // Guarantees zero side-effects: no consumption occurs on form open (Section 9)
  useEffect(() => {
    entitlementService.onFormOpen('user-default-account');
    const res = entitlementService.checkPublicationEligibility('user-default-account');
    setEligibility(res);
  }, []);

  const handleProceedToIntents = () => {
    setCurrentStep('intent_selection');
  };

  const handleSelectIntent = (intent: ListingIntent) => {
    setSelectedIntent(intent);
    // Guarantees zero side-effects: drafting does NOT consume any package capacity (Section 10)
    entitlementService.onDraftIntentSelected(intent);
  };

  const handleConfirmIntent = () => {
    setConfirmedDraft(true);
    if (onStartNextStep) {
      onStartNextStep(selectedIntent);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* نوار بالایی / هدر ناوبری با دکمه بازگشت و بستن */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2">
            {currentStep === 'intent_selection' ? (
              <button
                id="create-listing-back-step-btn"
                onClick={() => setCurrentStep('intro')}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-xl hover:bg-zinc-200/70 transition-colors text-xs font-semibold focus:outline-none"
                title="گام قبل"
              >
                <ArrowRight className="w-4 h-4 text-zinc-700" />
                <span>گام قبل</span>
              </button>
            ) : (
              <button
                id="create-listing-back-home-btn"
                onClick={onClose}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-xl hover:bg-zinc-200/70 transition-colors text-xs font-semibold focus:outline-none"
                title="بازگشت به خانه"
              >
                <ArrowRight className="w-4 h-4 text-zinc-700" />
                <span>بازگشت به خانه</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full">
              {currentStep === 'intro' ? 'گام ۱: ورود به فرایند' : 'گام ۲: تعیین ماهیت آگاهی'}
            </span>
            <button
              id="create-listing-close-x"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* حالت اول: صفحه معرفی و تفکیک مفهومی آگاهی از شناسنامه */}
        {/* ==================================================== */}
        {currentStep === 'intro' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar text-right">
            {/* نشان هویت تجاری و عنوان اصلی */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center">
                <Plus className="w-6 h-6 stroke-[2.6]" />
              </div>
              <h1 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                ثبت آگاهی در زیرساخت تخصصی تاروپود
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                تاروپود یک زیرساخت دیجیتال B2B و بازارگاه تخصصی برای کل زنجیره ارزش صنعت نساجی، پوشاک و صنایع وابسته است. «آگاهی» ابزار رسمی شما برای اعلام نیازها، سفارشات، خدمات تخصصی و عرضه محصولات در این بازار بزرگ است.
              </p>
            </div>

            {/* اصل تفکیک بنیادین: شناسنامه (پروفایل) در برابر آگاهی (Listing) */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>تفکیک مفهومی: شناسنامه تجاری در برابر آگاهی</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] leading-relaxed">
                <div className="p-3 rounded-xl bg-white border border-zinc-200/70 space-y-1">
                  <span className="font-bold text-zinc-900 block">شناسنامه (پروفایل):</span>
                  <span className="text-zinc-500 block">
                    معرف هویت، پروانه، سوابق و ظرفیت‌های پایدار کسب‌وکار شما در تاروپود.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-orange-200/80 bg-orange-50/20 space-y-1">
                  <span className="font-bold text-orange-900 block">آگاهی (Listing):</span>
                  <span className="text-zinc-600 block">
                    اعلامیه مشخص و جاری برای عرضه، تقاضا، سفارش، مازاد تولید، خرید یا همکاری.
                  </span>
                </div>
              </div>
            </div>

            {/* نقشه راه ساختاریافته گام‌ها */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>مراحل ایجاد و انتشار آگاهی تجاری:</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 text-zinc-900">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    ۱
                  </span>
                  <span className="font-bold text-orange-950">ورود و تفکیک مفهومی آگاهی</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-zinc-600 font-bold">
                  <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    ۲
                  </span>
                  <span>انتخاب ماهیت آگاهی: عرضه / ارائه یا تقاضا / نیاز (گام بعدی)</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                    ۳
                  </span>
                  <span>اتصال رسته تخصصی و مشخصات فنی (مراحل بعد)</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                    ۴
                  </span>
                  <span>تسویه هزینه انتشار (تکی یا بسته) و انتشار نهایی</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* حالت دوم: لایه نخست تصمیم‌گیری ماهیت آگاهی (عرضه / تقاضا) */}
        {/* ==================================================== */}
        {currentStep === 'intent_selection' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar text-right">
            {/* عنوان لایه تصمیم‌گیری */}
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                چه چیزی می‌خواهید در بازار اعلام کنید؟
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                لطفاً ماهیت قصد تجاری خود را از میان دو گزینه زیر مشخص نمایید.
              </p>
            </div>

            {/* کارت‌های انتخاب اصلی: عرضه / ارائه در برابر تقاضا / نیاز */}
            <div className="space-y-3">
              {/* گزینه الف: عرضه / ارائه (OFFER) */}
              <div
                id="intent-card-offer"
                onClick={() => handleSelectIntent('OFFER')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-right flex items-start gap-3.5 relative ${
                  selectedIntent === 'OFFER'
                    ? 'border-orange-600 bg-orange-50/40 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedIntent === 'OFFER'
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-zinc-900">عرضه / ارائه</span>
                    {selectedIntent === 'OFFER' && (
                      <CheckCircle2 className="w-5 h-5 text-orange-600 fill-orange-50 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    برای زمانی که محصول، منسوجات، خدمت، تخصص، ماشین‌آلات، ظرفیت خالی کارگاه یا فرصت همکاری برای ارائه دارید.
                  </p>
                </div>
              </div>

              {/* گزینه ب: تقاضا / نیاز (DEMAND) */}
              <div
                id="intent-card-demand"
                onClick={() => handleSelectIntent('DEMAND')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-right flex items-start gap-3.5 relative ${
                  selectedIntent === 'DEMAND'
                    ? 'border-orange-600 bg-orange-50/40 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedIntent === 'DEMAND'
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.4]" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-zinc-900">تقاضا / نیاز</span>
                    {selectedIntent === 'DEMAND' && (
                      <CheckCircle2 className="w-5 h-5 text-orange-600 fill-orange-50 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    برای زمانی که محصول، ماده اولیه، خدمت، نیروی انسانی، تولید مزدی، تعمیرات یا همکاری نیاز دارید.
                  </p>
                </div>
              </div>
            </div>

            {/* کارت شفافیت معماری مالی و بسته‌های انتشار (Monetization & Entitlement Layer) */}
            {eligibility && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  {eligibility.settlementMethod === 'PACKAGE_ENTITLEMENT' ? (
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-zinc-600" />
                  )}
                  <span>وضعیت مجاز انتشار آگاهی در حساب کاربری</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 text-[11px] leading-relaxed space-y-1 text-zinc-600">
                  <p className="font-semibold text-zinc-900">{eligibility.policyNote}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px] text-zinc-500">
                    <span>روش تسویه پیش‌بینی‌شده:</span>
                    <span className="font-bold text-zinc-800">
                      {eligibility.settlementMethod === 'PACKAGE_ENTITLEMENT'
                        ? 'کسر ۱ اعتبار از بسته اشتراک'
                        : 'پرداخت تکی هنگام انتشار نهایی'}
                    </span>
                  </div>
                </div>

                {/* ضمانت ایمنی تراکنش (Section 9 & 10) */}
                <div className="flex items-start gap-2 text-[10px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/70 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ضمانت ایمنی تراکنش:</strong> انتخاب ماهیت آگاهی در این مرحله پیش‌نویس (Draft) بوده و هیچ‌گونه هزینه یا اعتباری از حساب یا بسته شما کسر نمی‌کند. کسر اعتبار یا پرداخت منحصراً پس از تأیید نهایی انتشار انجام می‌پذیرد.
                  </span>
                </div>
              </div>
            )}

            {/* بازخورد در صورت تایید ماهیت آگاهی */}
            {confirmedDraft && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    ماهیت «{selectedIntent === 'OFFER' ? 'عرضه / ارائه' : 'تقاضا / نیاز'}» با موفقیت به عنوان پیش‌نویس ثبت شد
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  معماری لایه نخست تصمیم‌گیری آماده است. درخت رسته‌ها و فیلدهای فنی در مرحله بعد متصل خواهند شد.
                </p>
              </div>
            )}
          </div>
        )}

        {/* دکمه‌های اقدام و انصراف / بازگشت */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {currentStep === 'intro' ? (
            <button
              id="create-listing-start-btn"
              onClick={handleProceedToIntents}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>شروع و تعیین ماهیت آگاهی (عرضه / تقاضا)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="create-listing-confirm-intent-btn"
              onClick={handleConfirmIntent}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>تأیید ماهیت «{selectedIntent === 'OFFER' ? 'عرضه' : 'تقاضا'}» و مرحله بعد</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            id="create-listing-cancel-btn"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors text-center"
          >
            انصراف و بازگشت به خانه
          </button>
        </div>
      </div>
    </div>
  );
};
