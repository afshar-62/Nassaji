import React from 'react';
import { Home, MapPin, PlusSquare, Compass, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 5,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'خانه', icon: Home },
    { id: 'map' as TabType, label: 'نقشه', icon: MapPin },
    { id: 'create' as TabType, label: 'ثبت آگهی', icon: PlusSquare, isAction: true },
    { id: 'explore' as TabType, label: 'بازارگردی', icon: Compass },
    { id: 'settings' as TabType, label: 'پروفایل / منو', icon: User, badge: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                id={`nav-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className="group flex flex-col items-center -mt-5 focus:outline-none transition-transform active:scale-95"
                title={tab.label}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-white group-hover:from-amber-700 group-hover:to-amber-600 transition-all">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-zinc-700 mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-600 font-bold scale-105'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1.5 -left-2 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
