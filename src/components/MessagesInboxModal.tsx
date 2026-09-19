import React from 'react';
import { X, Mail, ChevronLeft, MessageSquare } from 'lucide-react';
import { AdItem } from '../types';

interface MessagesInboxModalProps {
  onClose: () => void;
  onOpenChatWithAd: (ad: AdItem) => void;
  sampleAds: AdItem[];
}

export const MessagesInboxModal: React.FC<MessagesInboxModalProps> = ({
  onClose,
  onOpenChatWithAd,
  sampleAds,
}) => {
  const threads = [
    {
      id: 't1',
      ad: sampleAds[0],
      senderName: 'تولیدی صنعتی پارس دوخت',
      avatar: sampleAds[0]?.authorAvatar,
      lastMessage: 'سلام، کاتالوگ دوخت کاپشن زمستانه را بررسی فرمودید؟',
      unread: 2,
      time: '۱۰ دقیقه پیش',
    },
    {
      id: 't2',
      ad: sampleAds[1],
      senderName: 'نساجی اصفهان بافت',
      avatar: sampleAds[1]?.authorAvatar,
      lastMessage: 'طاقه‌های کرپ مازراتی رنگ طوسی آماده ارسال به باربری است.',
      unread: 3,
      time: '۱ ساعت پیش',
    },
    {
      id: 't3',
      ad: sampleAds[2],
      senderName: 'تجهیزات مدرن چرخ',
      avatar: sampleAds[2]?.authorAvatar,
      lastMessage: 'تکنسین نصب چرخ راسته دوز فردا ساعت ۱۰ به کارگاه شما اعزام می‌شود.',
      unread: 0,
      time: 'دیروز',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-600" />
            <h2 className="text-xs font-black text-zinc-900">پیام‌ها و گفتگوهای کاری (۵ پیام جدید)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:bg-zinc-200 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2">
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                onClose();
                if (t.ad) onOpenChatWithAd(t.ad);
              }}
              className="p-3 hover:bg-zinc-50 rounded-2xl cursor-pointer transition-colors flex items-center gap-3"
            >
              <div className="relative shrink-0">
                <img src={t.avatar} alt={t.senderName} className="w-11 h-11 rounded-full object-cover border" />
                {t.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                    {t.unread}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{t.senderName}</h4>
                  <span className="text-[10px] text-zinc-400">{t.time}</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">{t.lastMessage}</p>
                {t.ad && (
                  <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                    مربوط به: {t.ad.title}
                  </span>
                )}
              </div>

              <ChevronLeft className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
