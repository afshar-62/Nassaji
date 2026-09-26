import React, { useState } from 'react';
import { X, Send, Phone, CheckCheck, Paperclip } from 'lucide-react';
import { AdItem } from '../types';

interface DirectChatModalProps {
  ad: AdItem;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({ ad, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'them',
      text: `سلام و درود، در رابطه با آگهی «${ad.title}» در خدمتتون هستیم. هر سوالی یا استعلام قیمتی دارید بفرمایید.`,
      time: '۱۰:۱۵',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: userText,
      time: 'همین الان',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Realistic seller auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'them',
          text: 'پیام شما دریافت شد. در اسرع وقت کاتالوگ و شرایط پرداخت را برایتان ارسال می‌کنیم یا در صورت تمایل می‌توانید با شماره مستقیم کارگاه تماس بگیرید.',
          time: 'همین الان',
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-md h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={ad.authorAvatar}
                alt={ad.authorName}
                className="w-9 h-9 rounded-full object-cover border border-zinc-700"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full border-2 border-zinc-900 absolute bottom-0 right-0 ${
                  ad.isOnline !== false ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={ad.isOnline !== false ? 'آنلاین' : 'آفلاین'}
              />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{ad.authorName}</h3>
              <p className="text-[10px] text-zinc-400">
                {ad.authorSpecialty || ad.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${ad.contact.mobile}`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="تماس تلفنی"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ad summary chip */}
        <div className="p-2 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900 truncate max-w-[240px]">
            آگهی: {ad.title}
          </span>
          <span className="text-[10px] text-zinc-500">{ad.price || 'توافقی'}</span>
        </div>

        {/* Messages body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-100/70 no-scrollbar">
          {messages.map((m) => {
            const isMe = m.sender === 'me';
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${
                  isMe ? 'mr-auto items-start' : 'ml-auto items-end'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-amber-600 text-white rounded-tl-none shadow-xs'
                      : 'bg-white text-zinc-800 rounded-tr-none shadow-2xs border border-zinc-200/70'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-zinc-400">
                  <span>{m.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-amber-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-zinc-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
