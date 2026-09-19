import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { aiService } from '../core/api/ai.service';

interface AiAssistantModalProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'سلام و درود! من دستیار هوش مصنوعی تخصصی بازارگاه نساجی هستم. در زمینه انتخاب و شناسایی پارچه، محاسبه گرماژ (GSM)، نمره نخ، تنظیمات چرخ‌های خیاطی صنعتی، یا نگارش متن حرفه‌ای آگهی در چه موردی می‌تونم کمکتون کنم؟',
      time: 'همین الان',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'محاسبه گرماژ پارچه مناسب هودی و اسلش',
    'تفاوت چرخ راسته دوز A4F با سری‌های معمولی',
    'متن آگهی برای خدمات دوخت مزدی مانتو اداری',
    'بهترین نخ برای دوخت شلوار جین و کتان',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: 'الان',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await aiService.consult(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.reply,
          time: 'همین الان',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'در حال حاضر ارتباط با موتور هوش مصنوعی با اختلال مواجه شد. لطفاً سوال خود را مجدداً ارسال نمایید.',
          time: 'همین الان',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-md h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-black flex items-center gap-1">
                <span>دستیار هوشمند نساجی (AI)</span>
                <span className="text-[9px] bg-amber-400 text-zinc-900 font-bold px-1.5 py-0.2 rounded">
                  Gemini
                </span>
              </h2>
              <p className="text-[10px] text-amber-100/80">مشاور تخصصی متریال، الگو و ماشین‌آلات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="bg-amber-50/50 p-2 border-b border-amber-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 text-[11px] text-zinc-700 font-medium whitespace-nowrap shrink-0 shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages chat area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50/60 no-scrollbar">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 max-w-[88%] ${
                  isAi ? 'ml-auto flex-row' : 'mr-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? 'bg-white text-zinc-800 shadow-2xs border border-zinc-200/80 rounded-tr-none'
                        : 'bg-zinc-900 text-white rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 block px-1 text-left">
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>هوش مصنوعی در حال بررسی کاتالوگ‌های تخصصی نساجی...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-zinc-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="سوال خود در حوزه نساجی، چرخ یا دوخت را بپرسید..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-500 bg-zinc-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
