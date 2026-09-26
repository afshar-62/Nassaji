import React from 'react';
import { Palette, Check, Sparkles, X, ArrowLeft } from 'lucide-react';
import { TAROPOD_PALETTES, PaletteOption } from '../utils/themePalette';

interface ColorPalettePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePaletteId: string;
  onSelectPalette: (id: string) => void;
}

export const ColorPalettePickerModal: React.FC<ColorPalettePickerModalProps> = ({
  isOpen,
  onClose,
  activePaletteId,
  onSelectPalette,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">انتخاب و تست زنده کالیته رنگی تاروپود</h2>
              <p className="text-[11px] text-zinc-400">۵ پالت تخصصی بر پایه هویت و روانشناسی صنعت نساجی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & List of 5 Palettes */}
        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-3.5 divide-y divide-zinc-100">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-bold block mb-0.5 flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              تست بی‌درنگ روی تمامی صفحات و دکمه‌ها:
            </span>
            با انتخاب هر کالیته، کل رنگ‌آمیزی پلتفرم (دکمه‌های تماس، ثبت آگهی، نشان‌ها، هدر و استوری‌ها) در همان لحظه تغییر می‌کند تا بتوانید به صورت بصری و زنده آن را ارزیابی فرمایید.
          </div>

          <div className="pt-2 space-y-3">
            {TAROPOD_PALETTES.map((palette: PaletteOption) => {
              const isSelected = activePaletteId === palette.id;

              return (
                <div
                  key={palette.id}
                  onClick={() => onSelectPalette(palette.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative text-right ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50/80 shadow-md ring-2 ring-zinc-900/10'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/40'
                  }`}
                >
                  {/* Badge & Active Check */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-zinc-900">{palette.name}</span>
                      {palette.recommendationBadge && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          {palette.recommendationBadge}
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-zinc-900 text-white'
                          : 'border border-zinc-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 font-semibold mb-2.5">
                    {palette.subtitle}
                  </p>

                  {/* Color Swatch Visual Preview */}
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-zinc-200/80 mb-2.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className="w-7 h-7 rounded-lg shadow-xs shrink-0 flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: palette.primaryColor }}
                        title="رنگ اصلی برند"
                      />
                      <div className="text-[10px] text-zinc-600 leading-tight">
                        <span className="block font-bold text-zinc-800">اصلی</span>
                        <span className="font-mono text-zinc-400">{palette.primaryColor}</span>
                      </div>
                    </div>

                    <div className="w-px h-6 bg-zinc-200" />

                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className="w-7 h-7 rounded-lg shadow-xs shrink-0 flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: palette.secondaryColor }}
                        title="مکمل دکمه‌ها و تعامل"
                      />
                      <div className="text-[10px] text-zinc-600 leading-tight">
                        <span className="block font-bold text-zinc-800">مکمل دکمه</span>
                        <span className="font-mono text-zinc-400">{palette.secondaryColor}</span>
                      </div>
                    </div>

                    <div className="w-px h-6 bg-zinc-200" />

                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className="w-7 h-7 rounded-lg shadow-xs shrink-0"
                        style={{ backgroundColor: palette.accentColor }}
                        title="رنگ تأکید ثانویه"
                      />
                      <div className="text-[10px] text-zinc-600 leading-tight">
                        <span className="block font-bold text-zinc-800">تأکیدی</span>
                        <span className="font-mono text-zinc-400">{palette.accentColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Philosophy & Impact */}
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="text-zinc-700">
                      <span className="font-bold text-zinc-900">فلسفه نساجی: </span>
                      {palette.philosophy}
                    </p>
                    <p className="text-zinc-500">
                      <span className="font-bold text-zinc-700">اثرگذاری: </span>
                      {palette.impact}
                    </p>
                  </div>

                  {/* Button state indicator */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      کد شناسایی: {palette.tag}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPalette(palette.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>درحال استفاده</span>
                        </>
                      ) : (
                        <>
                          <span>اعمال این کالیته</span>
                          <ArrowLeft className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            می‌توانید پنجره را ببندید و در بخش‌های مختلف برنامه تم را مشاهده کنید.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            مشاهده در اپلیکیشن
          </button>
        </div>
      </div>
    </div>
  );
};
