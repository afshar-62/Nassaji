import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Tv,
} from 'lucide-react';

interface CustomMediaPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  authorName?: string;
  durationText?: string;
  quality?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
  compact?: boolean;
  autoPlay?: boolean;
  initialMuted?: boolean;
  className?: string;
}

export const CustomMediaPlayer: React.FC<CustomMediaPlayerProps> = ({
  src,
  poster,
  title,
  authorName,
  durationText,
  quality = '1080p FHD',
  aspectRatio = 'horizontal',
  compact = false,
  autoPlay = false,
  initialMuted = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(initialMuted);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeQuality, setActiveQuality] = useState<string>(quality);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  // Convert seconds to mm:ss format with Persian numerals
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '۰۰:۰۰';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mStr = m < 10 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    const western = `${mStr}:${sStr}`;
    return western.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (hasEnded) {
      videoRef.current.currentTime = 0;
      setHasEnded(false);
    }
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [hasEnded]);

  // Volume & Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.8);
      videoRef.current.volume = 0.8;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Seek on timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setHasEnded(false);
  };

  // Hover preview on timeline
  const handleMouseMoveTimeline = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverTime(ratio * duration);
    setHoverPosition(hoverX);
  };

  const handleMouseLeaveTimeline = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  // Skip time forward/backward
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Change speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  // Change quality badge
  const handleQualityChange = (q: string) => {
    setActiveQuality(q);
    setShowSettings(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or permitted
    }
  };

  // Picture in Picture
  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // PIP error
    }
  };

  // Controls auto-hide when playing
  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSettings(false);
      }, 2800);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  // Video event listeners
  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (autoPlay) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setControlsVisible(true);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Aspect ratio styling
  const aspectClass = aspectRatio === 'vertical'
    ? 'aspect-[4/5] max-h-[560px]'
    : aspectRatio === 'square'
      ? 'aspect-square max-h-[500px]'
      : 'aspect-[16/9]';

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) setControlsVisible(false);
      }}
      className={`relative w-full ${aspectClass} bg-black overflow-hidden select-none group font-['Vazirmatn',sans-serif] ${className}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={isMuted}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setHasEnded(false);
        }}
        onEnded={onEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Big Center Play / Replay Overlay Button */}
      {(!isPlaying || hasEnded) && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-orange-600/90 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl border border-white/20 focus:outline-none group/play"
          title={hasEnded ? 'پخش مجدد' : 'پخش ویدیو'}
        >
          {hasEnded ? (
            <RotateCcw className="w-7 h-7 text-white animate-spin-once" />
          ) : (
            <Play className="w-8 h-8 fill-white text-white translate-x-[-2px] group-hover/play:scale-105 transition-transform" />
          )}
        </button>
      )}

      {/* Top Overlay: Title, Quality Badge, Brand Watermark */}
      <div
        className={`absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
          controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-orange-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>تاروپود پلیر</span>
          </div>
          {title && (
            <span className="text-white text-xs font-bold truncate max-w-[180px] sm:max-w-xs drop-shadow-sm">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
            {activeQuality}
          </span>
          {durationText && (
            <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              {durationText}
            </span>
          )}
        </div>
      </div>

      {/* Settings Flyout (Quality & Speed) */}
      {showSettings && (
        <div className="absolute bottom-14 right-3 bg-zinc-900/95 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-white text-xs space-y-2.5 z-40 shadow-2xl min-w-[160px] animate-in fade-in zoom-in-95">
          <div>
            <div className="text-[10px] font-bold text-zinc-400 mb-1 px-1">سرعت پخش</div>
            <div className="grid grid-cols-4 gap-1">
              {[0.75, 1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-1.5 py-1 rounded text-[11px] font-bold text-center transition-colors ${
                    playbackSpeed === spd ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-2">
            <div className="text-[10px] font-bold text-zinc-400 mb-1 px-1">کیفیت ویدیو</div>
            <div className="flex flex-col gap-1">
              {['1080p FHD', '720p HD', '480p SD'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`px-2 py-1 rounded text-right text-[11px] font-bold flex items-center justify-between transition-colors ${
                    activeQuality === q ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span>{q}</span>
                  {activeQuality === q && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-30 ${
          controlsVisible || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar Timeline */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          onMouseMove={handleMouseMoveTimeline}
          onMouseLeave={handleMouseLeaveTimeline}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all mb-2.5 group/bar flex items-center"
        >
          {/* Progress Filled */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Knob */}
            <div className="absolute left-full -translate-x-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-orange-600 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono pointer-events-none transform -translate-x-1/2"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Right side (RTL Start): Play/Pause, 10s skip, Time Display */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
              title={isPlaying ? 'توقف موقت' : 'پخش'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white translate-x-[-1px]" />
              )}
            </button>

            {/* Skip -10s & +10s */}
            <button
              onClick={() => skipTime(-10)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors text-[10px] font-bold"
              title="۱۰ ثانیه عقب"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors text-[10px] font-bold"
              title="۱۰ ثانیه جلو"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current & Total Time */}
            <div className="text-[11px] font-medium text-white/90 mr-1 flex items-center gap-1 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">{duration ? formatTime(duration) : durationText || '۰۰:۰۰'}</span>
            </div>
          </div>

          {/* Left side (RTL End): Volume, Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-colors focus:outline-none"
                title={isMuted ? 'وصل صدا' : 'قطع صدا'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 accent-orange-500 bg-white/20 rounded-lg cursor-pointer hidden sm:block"
                title="میزان صدا"
              />
            </div>

            {/* Quality & Speed Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-7 h-7 rounded-lg text-white flex items-center justify-center transition-colors focus:outline-none ${
                showSettings ? 'bg-orange-600 text-white' : 'hover:bg-white/10 text-white/80'
              }`}
              title="تنظیمات پخش و کیفیت"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* PiP Button */}
            {!compact && (
              <button
                onClick={togglePip}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors hidden sm:flex focus:outline-none"
                title="تصویر در تصویر"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-colors focus:outline-none"
              title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
