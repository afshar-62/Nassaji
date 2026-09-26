import React, { useState } from 'react';
import { Download, CheckCircle2, FileArchive, Loader2, ExternalLink } from 'lucide-react';

export const DownloadSourceButton: React.FC<{ className?: string; label?: string }> = ({
  className = '',
  label = 'دانلود فوری ZIP سورس‌کد (بدون خطای مرورگر)',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloading(true);
    setSuccess(false);

    try {
      // Fetch base64 text from /zip_base64.txt (which is served directly from public root)
      const res = await fetch('/zip_base64.txt');
      if (res.ok) {
        const b64 = await res.text();
        const byteCharacters = atob(b64.trim());
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/zip' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'taropod-full-source.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const directRes = await fetch('/taropod-full-source.zip');
        const blob = await directRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'taropod-full-source.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      // If blob fails, trigger silent iframe download without redirecting top window
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = '/taropod-full-source.zip';
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 5000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`w-full p-3 rounded-xl font-bold flex items-center justify-between transition-all cursor-pointer select-none shadow-md ${
        success
          ? 'bg-emerald-600 text-white'
          : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {downloading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
        ) : success ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        ) : (
          <FileArchive className="w-4 h-4 text-amber-200" />
        )}
        <span className="text-xs">
          {downloading ? 'در حال آماده‌سازی فایل در مرورگر...' : success ? 'دانلود با موفقیت آغاز شد!' : label}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded text-amber-100">
          ۲۸۰ کیلوبایت (کامل)
        </span>
        <Download className="w-4 h-4" />
      </div>
    </button>
  );
};
