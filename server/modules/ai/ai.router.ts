import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
شما دستیار هوش مصنوعی تخصصی بازارگاه B2B نساجی و پوشاک «تاروپود» (TAROPOD) هستید.
وظیفه شما راهنمایی دقیق، فنی و کارشناسی به تولیدکنندگان، بافندگان، خیاطان صنعتی و فعالان زنجیره تأمین نساجی است.
حوزه‌های تخصص شما:
- محاسبه و مشاوره گرماژ پارچه (GSM) بر اساس نوع کاربری (هودی، تیشرت، مانتو، پالتو، شلوار کتان و جین)
- نمره‌گذاری نخ (دنیر، متریک، انگلیسی، نمره تار و پود)
- ماشین‌آلات دوخت صنعتی (راسته دوز، زیگزال، میاندوز، الیک، فیوزینگ) و عیب‌یابی فنی
- پیشنهاد و نگارش متون حرفه‌ای و بازاری برای آگهی‌های ثبت‌شده در تاروپود
لحن شما مؤدبانه، بسیار متخصص و دقیق به زبان فارسی است.
`;

aiRouter.post('/consult', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.apiError(400, 'INVALID_PROMPT', 'متن سوال یا پرامپت الزامی است');
  }

  const client = getAiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt.trim(),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'پاسخی از مدل دریافت نشد.';
      return res.apiSuccess({ reply: replyText, provider: 'gemini-2.5-flash' });
    } catch (err: unknown) {
      console.error('[TAROPOD AI] Gemini call failed, using domain fallback:', err);
    }
  }

  // Domain fallback when key is not configured or network call fails
  const lower = prompt.toLowerCase();
  let fallbackReply = '';

  if (lower.includes('هودی') || lower.includes('اسلش') || lower.includes('گرماژ')) {
    fallbackReply = 'برای هودی و شلوار اسلش پاییزه و زمستانه، استانداردترین گزینه پارچه «دورس سه نخ تو کرکی یا خارخورده» با گرماژ بین ۳۲۰ تا ۳۸۰ گرم بر متر مربع است. اگر برای فصل بهار مد نظرتان است، «دورس دو نخ بدون کرک» با گرماژ ۲۴۰ تا ۲۸۰ گرم بازدهی بسیار مطلوبی دارد.';
  } else if (lower.includes('چرخ') || lower.includes('a4f') || lower.includes('راسته')) {
    fallbackReply = 'چرخ خیاطی جک A4F دارای موتور سرووی سرخود، سیستم سخنگوی فارسی و کارتل روغن بسته است. مزیت کلیدی آن نسبت به مدل‌های قدیمی، عدم لکه‌اندازی روغن بر روی پارچه‌های نازک (مانند حریر و کرپ) و سرقائمی‌زن تمام دیجیتال بدون صدا است.';
  } else if (lower.includes('آگهی') || lower.includes('مانتو') || lower.includes('متن')) {
    fallbackReply = 'پیشنهاد متن آگهی حرفه‌ای تاروپود:\n«پذیرش سفارشات دوخت مزدی مانتو اداری و فرم با خط دوخت صنعتی مجهز به سیستم پرس فیوزینگ و الیک کامپیوتری. ضمانت کنترل کیفی ۱۰۰٪ و تحویل سر موعد. جهت مشاوره فنی و دریافت کالیته نمونه تماس حاصل فرمایید.»';
  } else {
    fallbackReply = `پاسخ فنی تخصصی: در ارتباط با سوال شما پیرامون «${prompt}»، استاندارد پیشنهادی تاروپود برای تولید انبوه، بهره‌گیری از الیاف با ثبات نوری گرید ۴، نخ پلی‌استر پنبه شانه شده نمره ۳۰/۱ یا ۴۰/۲ و تست آبرفت پیش از برش پارچه است.`;
  }

  return res.apiSuccess({ reply: fallbackReply, provider: 'taropod-domain-engine' });
});
