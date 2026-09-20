import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
} from 'lucide-react';

export interface StorySlide {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  durationSeconds: number; // 60s for video, 7s for image
  authorName: string;
  authorAvatar: string;
  authorSpecialty: string;
  timeAgo: string;
  linkText: string;
  linkUrl: string;
}

interface StoryViewerModalProps {
  initialStoryIndex?: number;
  onClose: () => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const SAMPLE_STORIES: StorySlide[] = [
  {
    id: 'story-1',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-sewing-machine-needle-in-operation-42356-large.mp4',
    durationSeconds: 15,
    authorName: 'تولیدی صنعتی پارس دوخت',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'خدمات تولیدی و کاپشن‌دوزی',
    timeAgo: '۲۰ دقیقه پیش',
    linkText: 'مشاهده آگهی خط دوخت کاپشن',
    linkUrl: 'ad-1',
  },
  {
    id: 'story-2',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 7,
    authorName: 'بازرگانی اصفهان بافت',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'پارچه و منسوجات تریکو',
    timeAgo: '۴۵ دقیقه پیش',
    linkText: 'دریافت کالیته رنگ دورس ۳ نخ',
    linkUrl: 'ad-2',
  },
  {
    id: 'story-3',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-rapidly-stitching-fabric-42358-large.mp4',
    durationSeconds: 20,
    authorName: 'مدرن چرخ جمهوری',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'ماشین‌آلات صنعتی جک',
    timeAgo: '۱ ساعت پیش',
    linkText: 'خرید اقساطی چرخ جک A5E',
    linkUrl: 'ad-3',
  },
  {
    id: 'story-4',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 7,
    authorName: 'الگوسازان نوین فاطمی',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'طراحی الگو و CLO 3D',
    timeAgo: '۲ ساعت پیش',
    linkText: 'سفارش شبیه‌سازی ۳ بعدی',
    linkUrl: 'ad-5',
  },
  {
    id: 'story-5',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-a-measuring-tape-42354-large.mp4',
    durationSeconds: 15,
    authorName: 'چاپ دیجیتال نقش جهان',
    authorAvatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'چاپ و سابلیمیشن پارچه',
    timeAgo: '۳ ساعت پیش',
    linkText: 'استعلام قیمت چاپ کیوسرا',
    linkUrl: 'ad-7',
  },
  {
    id: 'story-6',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-factory-worker-checking-textile-yarn-43217-large.mp4',
    durationSeconds: 25,
    authorName: 'ریسندگی یزد ترمه',
    authorAvatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'نخ و الیاف طبیعی پنبه',
    timeAgo: '۴ ساعت پیش',
    linkText: 'سفارش تناژ نخ ۳۰ پنبه',
    linkUrl: 'ad-6',
  },
  {
    id: 'story-7',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 7,
    authorName: 'خرج‌کار مشیرخلوت',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'زیپ دندانه برنجی YKK',
    timeAgo: '۵ ساعت پیش',
    linkText: 'مشاهده قیمت عمده زیپ',
    linkUrl: 'ad-4',
  },
  {
    id: 'story-8',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 7,
    authorName: 'مرکز برش CNC سهند تبریز',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'برش اتوماتیک کامپیوتری',
    timeAgo: '۶ ساعت پیش',
    linkText: 'رزرو تایم برش تیراژ بالا',
    linkUrl: 'ad-8',
  },
  {
    id: 'story-9',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 7,
    authorName: 'بسته‌بندی و کاور آریا کرج',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'کاور اسپان‌باند پوشاک',
    timeAgo: '۷ ساعت پیش',
    linkText: 'سفارش کاور با چاپ آرم',
    linkUrl: 'ad-13',
  },
  {
    id: 'story-10',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-sewing-machine-needle-in-operation-42356-large.mp4',
    durationSeconds: 18,
    authorName: 'جین آرارات تبریز',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorSpecialty: 'شلوار جین و سنگ‌شویی مدرن',
    timeAgo: '۸ ساعت پیش',
    linkText: 'استعلام دوخت شلوار جین',
    linkUrl: 'ad-22',
  },
];

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  initialStoryIndex = 0,
  onClose,
  onSelectAuthor,
}) => {
  const [currentIdx, setCurrentIdx] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyToast, setShowReplyToast] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0); // visual drag feedback
  const [swipeNotice, setSwipeNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  // Gesture tracking refs
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSwipingRef = useRef<boolean>(false);

  const currentStory = SAMPLE_STORIES[currentIdx] || SAMPLE_STORIES[0];

  const handleNext = () => {
    if (currentIdx < SAMPLE_STORIES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      setSwipeOffset(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      setSwipeOffset(0);
    } else {
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      setSwipeOffset(0);
    }
  };

  // Reset timers on slide change
  useEffect(() => {
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();

    if (currentStory.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIdx, currentStory.type]);

  // Main animation frame timer
  useEffect(() => {
    if (isPaused) {
      if (currentStory.type === 'video' && videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    if (currentStory.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    const durationMs = currentStory.durationSeconds * 1000;
    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedBeforePauseRef.current = elapsed;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        handleNext();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, currentIdx, currentStory.durationSeconds, currentStory.type]);

  // =========================================================================
  // GESTURE ENGINE (Touch & Mouse: Tap L/R, Hold to Pause, Swipe Across Screen)
  // =========================================================================

  const startGesture = (clientX: number, clientY: number) => {
    isPointerDownRef.current = true;
    touchStartXRef.current = clientX;
    touchStartYRef.current = clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;

    // After 180ms of holding still, pause story and video (Instagram hold behavior)
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current && !isSwipingRef.current) {
        setIsPaused(true);
      }
    }, 180);
  };

  const moveGesture = (clientX: number, clientY: number) => {
    if (!isPointerDownRef.current) return;

    const deltaX = clientX - touchStartXRef.current;
    const deltaY = clientY - touchStartYRef.current;

    // If moving horizontally more than 15px, user is swiping across the screen!
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwipingRef.current = true;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      setIsPaused(true); // pause while swiping
      setSwipeOffset(deltaX); // visual follow
    }
  };

  const endGesture = (clientX: number, targetRectWidth: number) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const deltaX = clientX - touchStartXRef.current;
    const holdDuration = Date.now() - touchStartTimeRef.current;

    // 1. SWIPE GESTURE: Dragged horizontally across screen (> 45px)
    if (isSwipingRef.current || Math.abs(deltaX) > 45) {
      setSwipeOffset(0);
      setIsPaused(false);

      if (deltaX < -45) {
        // Swiped Left -> Go to NEXT story
        showNotification('استوری بعدی');
        handleNext();
      } else if (deltaX > 45) {
        // Swiped Right -> Go to PREVIOUS story
        showNotification('استوری قبلی');
        handlePrev();
      }
      return;
    }

    // 2. TAP GESTURE: Quick tap without drag (< 220ms and small displacement)
    if (holdDuration < 220 && Math.abs(deltaX) <= 15) {
      setIsPaused(false);
      setSwipeOffset(0);

      // Tap on right side -> Next slide
      // Tap on left side -> Previous slide
      const relativeX = clientX;
      if (relativeX > targetRectWidth * 0.45) {
        handleNext();
      } else {
        handlePrev();
      }
      return;
    }

    // 3. RELEASE AFTER HOLD: User held finger down (paused), now released -> resume
    setIsPaused(false);
    setSwipeOffset(0);
  };

  const showNotification = (msg: string) => {
    setSwipeNotice(msg);
    setTimeout(() => setSwipeNotice(null), 1200);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setShowReplyToast(true);
    setReplyMessage('');
    setTimeout(() => setShowReplyToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-['Vazirmatn',sans-serif] select-none touch-none">
      {/* Toast reply feedback */}
      {showReplyToast && (
        <div className="absolute top-20 z-60 bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
          ✓ پیام شما به {currentStory.authorName} ارسال شد
        </div>
      )}

      {/* Swipe feedback notice */}
      {swipeNotice && (
        <div className="absolute top-20 z-60 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 animate-in fade-in zoom-in-95">
          {swipeNotice}
        </div>
      )}

      {/* Container - Mobile Full Screen, Desktop Centered Phone Screen */}
      <div
        id="story-gesture-container"
        className="relative w-full h-full sm:max-w-md sm:max-h-[92vh] sm:rounded-3xl sm:border sm:border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col justify-between"
        style={{
          transform: swipeOffset ? `translateX(${swipeOffset * 0.25}px)` : undefined,
          transition: isPointerDownRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        // Touch Handlers
        onTouchStart={(e) => {
          const t = e.touches[0];
          startGesture(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          moveGesture(t.clientX, t.clientY);
        }}
        onTouchEnd={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const t = e.changedTouches[0];
          endGesture(t.clientX - rect.left, rect.width);
        }}
        // Mouse Handlers (for desktop browser testing)
        onMouseDown={(e) => {
          startGesture(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          moveGesture(e.clientX, e.clientY);
        }}
        onMouseUp={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          endGesture(e.clientX - rect.left, rect.width);
        }}
        onMouseLeave={() => {
          if (isPointerDownRef.current) {
            isPointerDownRef.current = false;
            setIsPaused(false);
            setSwipeOffset(0);
          }
        }}
      >
        {/* ۱. خطوط پیشرفت چندگانه در بالاترین قسمت (Progress Segments) */}
        <div
          className={`absolute top-0 left-0 right-0 z-40 px-3 pt-3 flex items-center gap-1.5 transition-opacity duration-150 ${
            isPaused ? 'opacity-30' : 'opacity-100'
          }`}
        >
          {SAMPLE_STORIES.map((story, idx) => {
            let fillWidth = 0;
            if (idx < currentIdx) fillWidth = 100;
            else if (idx === currentIdx) fillWidth = progress;

            return (
              <div
                key={story.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* ۲. هدر بالای استوری (دکمه ضربدر در چپ + پروفایل کارگاه در راست) */}
        <div
          className={`absolute top-6 left-0 right-0 z-40 px-3 flex items-center justify-between text-white transition-opacity duration-150 ${
            isPaused ? 'opacity-30' : 'opacity-100'
          }`}
        >
          {/* دکمه بستن و صدا */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-colors focus:outline-none"
              title="بستن استوری"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            {currentStory.type === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-colors focus:outline-none"
                title={isMuted ? 'وصل صدا' : 'قطع صدا'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* نام و آواتار تولیدکننده */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectAuthor) {
                onClose();
                onSelectAuthor('user-1');
              }
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md">
                  {currentStory.authorName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 fill-white" />
              </div>
              <span className="text-[10px] text-zinc-300 font-light drop-shadow">
                {currentStory.timeAgo}
              </span>
            </div>

            <img
              src={currentStory.authorAvatar}
              alt={currentStory.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* ۳. محتوای مدیا (عکس یا ویدیوی ۶۰ ثانیه‌ای تست) */}
        <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center bg-black pointer-events-none">
          {currentStory.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              muted={isMuted}
              playsInline
              autoPlay
              loop={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.authorName}
              className="w-full h-full object-cover"
            />
          )}

          {/* بج ویدیوی ۶۰ ثانیه‌ای */}
          {currentStory.type === 'video' && (
            <div className="absolute top-16 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
              ویدیوی ۶۰ ثانیه‌ای خط تولید
            </div>
          )}

          {/* نشانگر توقف هنگام نگه‌داشتن انگشت (Pause Indicator) */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none animate-in fade-in duration-100">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl">
                <Pause className="w-7 h-7 fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* ۴. استیکر لینک اینترنتی مطابق تصویر ارسالی (# WWW.FELLANBESAR.COM) */}
        <div
          className={`absolute bottom-20 left-0 right-0 z-30 px-6 flex items-center justify-center pointer-events-auto transition-opacity duration-150 ${
            isPaused ? 'opacity-20' : 'opacity-100'
          }`}
        >
          <a
            href={currentStory.linkUrl}
            target="_blank"
            rel="noreferrer"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white hover:bg-zinc-50 active:scale-98 transition-all py-2.5 px-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 border border-zinc-200/80"
          >
            <span className="text-pink-600 font-black text-base tracking-tighter">
              ⌗
            </span>
            <span className="text-[#3b82f6] hover:text-[#1d4ed8] font-black text-xs sm:text-sm tracking-wider uppercase font-sans">
              {currentStory.linkText}
            </span>
          </a>
        </div>

        {/* ۵. نوار پایین اینستاگرام (دکمه اشتراک در چپ + کادر ارسال پیام در راست) */}
        <div
          className={`absolute bottom-3 left-0 right-0 z-30 px-3 flex items-center gap-2.5 transition-opacity duration-150 ${
            isPaused ? 'opacity-20' : 'opacity-100'
          }`}
        >
          {/* دکمه شیر/موشک کاغذی */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `استوری ${currentStory.authorName}`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                alert('لینک استوری کپی شد!');
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all shrink-0 focus:outline-none"
            title="اشتراک‌گذاری"
          >
            <Send className="w-5 h-5 -rotate-45 stroke-[1.8]" />
          </button>

          {/* کادر ارسال پیام */}
          <form
            onSubmit={handleSendReply}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex-1"
          >
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="ارسال پیام"
              className="w-full bg-transparent border border-white/80 focus:border-white text-white placeholder-white/80 text-xs px-4 py-2.5 rounded-full outline-none text-right transition-colors"
            />
          </form>
        </div>

        {/* دکمه‌های ناوبری جانبی برای کار با ماوس در دسکتاپ */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center transition-colors"
          title="استوری قبلی"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center transition-colors"
          title="استوری بعدی"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
