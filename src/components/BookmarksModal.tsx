import React from 'react';
import { X, Bookmark, Trash2, ChevronLeft } from 'lucide-react';
import { AdItem } from '../types';

interface BookmarksModalProps {
  onClose: () => void;
  bookmarkedAds: AdItem[];
  onSelectAd: (ad: AdItem) => void;
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  onClose,
  bookmarkedAds,
  onSelectAd,
  onRemoveBookmark,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600 fill-amber-500" />
            <h2 className="text-xs font-black text-zinc-900">آگهی‌های نشان‌شده و ذخیره شده</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:bg-zinc-200 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {bookmarkedAds.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              هنوز آگهی را نشان نکرده‌اید.
            </div>
          ) : (
            bookmarkedAds.map((ad) => (
              <div
                key={ad.id}
                onClick={() => {
                  onClose();
                  onSelectAd(ad);
                }}
                className="p-2 rounded-2xl border border-zinc-200 hover:border-amber-400 bg-white hover:bg-zinc-50 cursor-pointer flex items-center gap-2.5 transition-all"
              >
                <img
                  src={ad.images[0]}
                  alt={ad.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{ad.title}</h4>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{ad.price || 'توافقی'}</p>
                  <span className="text-[9px] text-zinc-400">{ad.city} • {ad.category}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(ad.id);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                  title="حذف از نشان‌شده‌ها"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
