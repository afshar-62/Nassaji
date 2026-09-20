import React, { useState } from 'react';
import { ProfileEditModal } from './ProfileEditModal.tsx';
import {
  Wallet,
  Mail,
  Headphones,
  BarChart3,
  Flame,
  Image as ImageIcon,
  ShieldCheck,
  HelpCircle,
  FileText,
  Bookmark,
  Scale,
  Send,
  BookOpen,
  LogOut,
  ChevronLeft,
  X,
  CheckCircle2,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Download,
  Package,
} from 'lucide-react';
import { AdItem } from '../types';

interface SettingsViewProps {
  onOpenMessages: () => void;
  onOpenBookmarks: () => void;
  onOpenProfile: () => void;
  bookmarkedAdsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenMessages,
  onOpenBookmarks,
  onOpenProfile,
  bookmarkedAdsCount,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(1500000);
  const [addAmount, setAddAmount] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);

  // Identity verification state
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="pb-24 max-w-md mx-auto space-y-4 px-3 pt-2">
      {/* User Header Summary Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-900 to-amber-950 rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border-2 border-amber-500/60 overflow-hidden flex items-center justify-center text-amber-300 font-bold text-lg">
            پ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm">کارگاه تخصصی برش و دوخت پارس</h2>
              <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-500/20" />
            </div>
            <p className="text-[11px] text-zinc-300 mt-0.5">مهندس احمد احمدی • هویت حرفه‌ای فعال</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="text-xs font-bold text-amber-300 hover:text-white px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1"
          >
            <span>ویرایش هویت</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="text-[11px] font-medium text-zinc-300 hover:text-white px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-1"
          >
            <span>مشاهده ویترین</span>
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 1. Six Quick Access Cards (۶ بخش بالای صفحه طبق وایرفریم صفحه ۶) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-900 px-1">خدمات و پنل‌های سریع</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* ۱. کیف پول */}
          <button
            onClick={() => setActiveModal('wallet')}
            className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-800">کیف پول</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {(walletBalance / 10).toLocaleString('fa-IR')} تومان
            </span>
          </button>

          {/* ۲. پیام‌ها با نشانگر ۵ */}
          <button
            onClick={onOpenMessages}
            className="relative p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
              {/* نشانگر ۵ طبق وایرفریم دست‌نویس */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
                ۵
              </span>
            </div>
            <span className="text-xs font-bold text-zinc-800">پیام‌ها</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">۵ پیام جدید</span>
          </button>

          {/* ۳. پشتیبانی */}
          <button
            onClick={() => setActiveModal('support')}
            className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-800">پشتیبانی</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">۲۴ ساعته آنلاین</span>
          </button>

          {/* ۴. گزارش و آمار */}
          <button
            onClick={() => setActiveModal('analytics')}
            className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-800">گزارش و آمار</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">بازدید آگهی‌ها</span>
          </button>

          {/* ۵. رزرو استوری */}
          <button
            onClick={() => setActiveModal('story')}
            className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-800">رزرو استوری</span>
            <span className="text-[10px] text-orange-600 font-semibold mt-0.5">ویترین ۲۴ ساعته</span>
          </button>

          {/* ۶. رزرو بنر تبلیغاتی */}
          <button
            onClick={() => setActiveModal('banner')}
            className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-zinc-800">رزرو بنر</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">بیلبرد صفحه اول</span>
          </button>
        </div>
      </section>

      {/* 2. Highlight Banner: "احراز هویت" (بخش احراز هویت با برچسب و دکمه آپلود مدارک طبق وایرفریم ۶) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-amber-950">احراز هویت و اعتبار سنجی</h4>
                <span className="bg-amber-200/80 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                  سطح ۲ معتبر
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed mt-1">
                با بارگذاری پروانه کسب و مدارک کارگاهی، تیک تایید طلایی دریافت کرده و رتبه آگهی‌هایتان در اکسپلور ارتقا می‌یابد.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>مدیریت هویت حرفه‌ای و ارسال مدارک صنفی</span>
        </button>
      </div>

      {/* 3. Menu List Options (گزینه‌های منو طبق وایرفریم صفحه ۶) */}
      <section className="bg-white rounded-2xl border border-zinc-200 shadow-2xs divide-y divide-zinc-100 overflow-hidden">
        {/* ۱. سوالات متداول */}
        <button
          onClick={() => setActiveModal('faq')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">سوالات متداول (FAQ)</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>

        {/* ۲. قوانین و مقررات */}
        <button
          onClick={() => setActiveModal('terms')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">قوانین و مقررات فعالیت در بازارگاه</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>

        {/* ۳. آگهی‌های منتخب / نشان‌شده */}
        <button
          onClick={onOpenBookmarks}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-zinc-800">آگهی‌های نشان‌شده</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-600 font-bold">
              {bookmarkedAdsCount} مورد
            </span>
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </div>
        </button>

        {/* ۴. خط‌مشی عمومی */}
        <button
          onClick={() => setActiveModal('policy')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <Scale className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">خط‌مشی عمومی و حریم خصوصی</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>

        {/* ۵. انتقادات و پیشنهادات */}
        <button
          onClick={() => setActiveModal('feedback')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <Send className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">انتقادات و پیشنهادات</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>

        {/* ۶. وبلاگ و دانستنی‌های نساجی */}
        <button
          onClick={() => setActiveModal('blog')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50 transition-colors text-right"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-800">وبلاگ و دانستنی‌های صنعت نساجی</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>

        {/* ۷. خروج از سیستم */}
        <button
          onClick={() => {
            if (confirm('آیا مطمئنید که می‌خواهید از حساب کاربری خارج شوید؟')) {
              alert('از حساب خود خارج شدید.');
            }
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50 transition-colors text-right text-rose-600"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold">خروج از سیستم</span>
          </div>
        </button>
      </section>

      {/* 4. بخش ویژه: دریافت فایل ZIP سورس‌کد */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-300/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            <h3 className="text-xs font-black text-amber-950">دریافت فایل ZIP کدهای سورس پروژه</h3>
          </div>
          <a
            href="/download"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
          >
            <span>صفحه مجزا</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        <p className="text-[11px] text-amber-900/80 leading-relaxed">
          برای بررسی و اجرای مستقیم کدها روی سیستم خود، می‌توانید فایل‌های ZIP آماده‌شده را مستقیماً دانلود کنید:
        </p>

        <div className="space-y-2">
          {/* دکمه دانلود سورس پروفایل */}
          <a
            href="/api/v1/download/profile-module.zip"
            download="taropod-profile-module.zip"
            className="w-full p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>دانلود ZIP کدهای ماژول پروفایل و هویت (Profile Slice)</span>
            </div>
            <span className="text-[10px] bg-amber-700/60 px-2 py-0.5 rounded text-amber-100">۴۵ کیلوبایت</span>
          </a>

          {/* دکمه دانلود سورس کل پروژه */}
          <a
            href="/api/v1/download/full-source.zip"
            download="taropod-full-source.zip"
            className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>دانلود ZIP کل سورس پروژه (Full Project Monolith)</span>
            </div>
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">۲۲۵ کیلوبایت</span>
          </a>
        </div>
      </section>

      {/* Modals for each settings action */}
      {/* Wallet Modal */}
      {activeModal === 'wallet' && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xs font-black">کیف پول دیجیتال نساجی</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-200">
              <span className="text-[11px] text-emerald-800">موجودی قابل استفاده:</span>
              <div className="text-xl font-black text-emerald-950 mt-1">
                {(walletBalance / 10).toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">افزایش موجودی (تومان):</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="مثلاً ۵۰۰,۰۰۰"
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  const val = Number(addAmount) * 10;
                  if (val > 0) {
                    setWalletBalance((b) => b + val);
                    setAddAmount('');
                    alert('موجودی کیف پول با موفقیت افزایش یافت.');
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                شارژ آنلاین از طریق درگاه بانکی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {activeModal === 'verify' && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-amber-700">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-xs font-black">احراز هویت و بارگذاری مدارک</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {verificationSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-zinc-800">مدارک شما با موفقیت ارسال شد</h4>
                <p className="text-[11px] text-zinc-500">
                  کارشناسان اصناف نساجی طی حداکثر ۲۴ ساعت کاری مدارک را بررسی و نشان تایید را فعال می‌کنند.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  جهت دریافت نشان تاییدیه اتحادیه و صنف، تصویر جواز کسب، کارت ملی صاحب امتیاز و عکس کارگاه را ارسال فرمایید.
                </p>

                <div className="border-2 border-dashed border-zinc-200 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-700 block">انتخاب فایل مدارک</span>
                  <span className="text-[10px] text-zinc-400">فرمت‌های JPG، PNG یا PDF تا سقف ۱۰ مگابایت</span>
                </div>

                <button
                  onClick={() => setVerificationSubmitted(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  ارسال مدارک برای بررسی صنف
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {activeModal === 'analytics' && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-amber-700">
                <BarChart3 className="w-5 h-5" />
                <h3 className="text-xs font-black">آمار و عملکرد آگهی‌های شما</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                <span className="text-[10px] text-zinc-400">کل بازدیدها:</span>
                <p className="text-base font-black text-zinc-900 mt-0.5">۳,۴۸۰</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                <span className="text-[10px] text-zinc-400">تماس و پیام‌ها:</span>
                <p className="text-base font-black text-amber-600 mt-0.5">۱۴۲</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>بازدید آگهی‌های دوخت مزدی شما نسبت به ماه گذشته ۲۸٪ رشد داشته است.</span>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-black">سوالات متداول (FAQ)</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-zinc-50 p-2.5 rounded-xl">
                <p className="font-bold text-zinc-900 mb-1">چگونه آگهی ثبت کنم؟</p>
                <p className="text-zinc-600 leading-relaxed">از دکمه «ثبت آگهی» در منوی پایین برنامه استفاده کرده و تصاویر و شرایط همکاری را درج کنید.</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-xl">
                <p className="font-bold text-zinc-900 mb-1">تیک تایید صنف چیست؟</p>
                <p className="text-zinc-600 leading-relaxed">این تیک نشان می‌دهد مدارک جواز کسب یا کارگاهی شما توسط کارشناسان نساجی استعلام شده است.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-black">انتقادات و پیشنهادات</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackDone ? (
              <div className="text-center py-4 text-xs font-bold text-emerald-600">
                پیام شما با تشکر دریافت شد.
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="پیشنهاد شما برای بهبود سامانه..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200"
                />
                <button
                  onClick={() => {
                    setFeedbackDone(true);
                    setTimeout(() => {
                      setActiveModal(null);
                      setFeedbackDone(false);
                      setFeedbackText('');
                    }, 1500);
                  }}
                  disabled={!feedbackText.trim()}
                  className="w-full bg-zinc-900 text-white text-xs font-bold py-2.5 rounded-xl"
                >
                  ارسال بازخورد
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile & Identity Edit Modal (Vertical Slice v0.1) */}
      <ProfileEditModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
