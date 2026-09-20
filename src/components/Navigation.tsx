import React from 'react';
import { Home, Compass, Plus, MapPin, User } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 3,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] select-none">
      <div className="max-w-md mx-auto h-16 px-2 grid grid-cols-5 items-center">
        {/* ۱. خانه */}
        <button
          id="nav-btn-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all group ${
            currentTab === 'home' ? 'text-orange-600' : 'text-zinc-500 hover:text-zinc-800'
          }`}
          title="خانه"
        >
          <Home
            className={`w-5 h-5 transition-transform group-active:scale-90 ${
              currentTab === 'home' ? 'stroke-[2.4] scale-105' : 'stroke-[1.6]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 transition-all ${
              currentTab === 'home' ? 'font-bold text-orange-600' : 'font-medium text-zinc-500'
            }`}
          >
            خانه
          </span>
        </button>

        {/* ۲. کاوش بازار */}
        <button
          id="nav-btn-explore"
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all group ${
            currentTab === 'explore' ? 'text-orange-600' : 'text-zinc-500 hover:text-zinc-800'
          }`}
          title="بازار و جستجو"
        >
          <Compass
            className={`w-5 h-5 transition-transform group-active:scale-90 ${
              currentTab === 'explore' ? 'stroke-[2.4] scale-105' : 'stroke-[1.6]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 transition-all ${
              currentTab === 'explore' ? 'font-bold text-orange-600' : 'font-medium text-zinc-500'
            }`}
          >
            بازار
          </span>
        </button>

        {/* ۳. دکمه مرکزی ثبت آگهی (کاملاً در مرکز هندسی صفحه با استایل ارگونومیک) */}
        <div className="flex flex-col items-center justify-center h-full relative">
          <button
            id="nav-btn-create"
            onClick={() => onSelectTab('create')}
            className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30 border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none"
            title="ثبت رایگان آگهی"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
          <span
            className={`text-[10px] mt-0.5 font-bold transition-all ${
              currentTab === 'create' ? 'text-orange-600' : 'text-zinc-600'
            }`}
          >
            ثبت آگهی
          </span>
        </div>

        {/* ۴. نقشه اصناف نساجی */}
        <button
          id="nav-btn-map"
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all group ${
            currentTab === 'map' ? 'text-orange-600' : 'text-zinc-500 hover:text-zinc-800'
          }`}
          title="نقشه اصناف"
        >
          <MapPin
            className={`w-5 h-5 transition-transform group-active:scale-90 ${
              currentTab === 'map' ? 'stroke-[2.4] scale-105' : 'stroke-[1.6]'
            }`}
          />
          <span
            className={`text-[10px] mt-1 transition-all ${
              currentTab === 'map' ? 'font-bold text-orange-600' : 'font-medium text-zinc-500'
            }`}
          >
            نقشه
          </span>
        </button>

        {/* ۵. پروفایل و تنظیمات */}
        <button
          id="nav-btn-settings"
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all relative group ${
            currentTab === 'settings' ? 'text-orange-600' : 'text-zinc-500 hover:text-zinc-800'
          }`}
          title="پروفایل کاربری"
        >
          <div className="relative">
            <User
              className={`w-5 h-5 transition-transform group-active:scale-90 ${
                currentTab === 'settings' ? 'stroke-[2.4] scale-105' : 'stroke-[1.6]'
              }`}
            />
            {unreadCount > 0 && currentTab !== 'settings' && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-0.5 bg-orange-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                {unreadCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-1 transition-all ${
              currentTab === 'settings' ? 'font-bold text-orange-600' : 'font-medium text-zinc-500'
            }`}
          >
            پروفایل
          </span>
        </button>
      </div>
    </nav>
  );
};
