import React, { useState, useEffect } from 'react';
import { TabType, AdItem } from './types';
import { listingsService } from './core/api/listings.service';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { HomeFeed } from './components/HomeFeed';
import { ExploreMarket } from './components/ExploreMarket';
import { BusinessMap } from './components/BusinessMap';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AdDetailModal } from './components/AdDetailModal';
import { CreateAdModal } from './components/CreateAdModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { DirectChatModal } from './components/DirectChatModal';
import { MessagesInboxModal } from './components/MessagesInboxModal';
import { BookmarksModal } from './components/BookmarksModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedCity, setSelectedCity] = useState<string>('تهران');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Main ads state backed by live PostgreSQL listings API
  const [ads, setAds] = useState<AdItem[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState<boolean>(true);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['ad-1', 'ad-3']);

  // Fetch from /api/v1/listings on component mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingAds(true);
    setAdsError(null);

    listingsService
      .fetchListings()
      .then((items) => {
        if (isMounted) {
          setAds(items || []);
          setIsLoadingAds(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[TAROPOD Client] Failed loading live listings:', err);
          setAdsError('خطا در دریافت آگهی‌ها از سرور');
          setIsLoadingAds(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Modals & selected views state
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatAd, setChatAd] = useState<AdItem | null>(null);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Toggle bookmark handler
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Switch tab with handler for 'create' action
  const handleSelectTab = (tab: TabType) => {
    if (tab === 'create') {
      setIsCreateOpen(true);
    } else {
      setSelectedProfileId(null);
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add newly created ad via backend service
  const handleAddNewAd = async (newAd: AdItem) => {
    try {
      const created = await listingsService.createListing(newAd);
      setAds((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setSelectedAd(created);
    } catch {
      // Local fallback in case of network interruption
      setAds((prev) => [newAd, ...prev]);
      setIsCreateOpen(false);
      setSelectedAd(newAd);
    }
  };

  // Filter ads based on header search
  const filteredAds = ads.filter((ad) => {
    if (!searchQuery) return true;
    return (
      ad.title.includes(searchQuery) ||
      ad.description.includes(searchQuery) ||
      ad.category.includes(searchQuery) ||
      ad.authorName.includes(searchQuery)
    );
  });

  const bookmarkedAds = ads.filter((a) => bookmarkedIds.includes(a.id));

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-['Vazirmatn',sans-serif] selection:bg-amber-500 selection:text-white">
      {/* Top Header - Shown on Home and Explore */}
      {!selectedProfileId && currentTab !== 'map' && (
        <Header
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenMessages={() => setIsMessagesOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
        />
      )}

      {/* Main Views Router */}
      <main className="min-h-[calc(100vh-64px)]">
        {selectedProfileId ? (
          /* Live PostgreSQL Business Profile View */
          <ProfileView
            profileId={selectedProfileId}
            ads={ads}
            onBack={() => setSelectedProfileId(null)}
            onSelectAd={(ad) => setSelectedAd(ad)}
            onOpenDirectChat={(ad) => setChatAd(ad)}
          />
        ) : currentTab === 'home' ? (
          /* Sketch 1: Home Feed with 20 categories, 3-image billboard slider, 12 work grids, infinite ad feed */
          <HomeFeed
            ads={filteredAds}
            isLoading={isLoadingAds}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectAd={(ad) => setSelectedAd(ad)}
            onSelectAuthor={(authorId) => setSelectedProfileId(authorId)}
            onSelectCategory={(catName) => {
              setSearchQuery(catName);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        ) : currentTab === 'explore' ? (
          /* Sketch 2: Explore Grid with main categories, sub-filters, 3-column media grid */
          <ExploreMarket
            onSelectAd={(ad) => setSelectedAd(ad)}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        ) : currentTab === 'map' ? (
          /* Sketch 3: Interactive Business Map with pins, floating detail card, user location, routing apps */
          <BusinessMap
            onSelectAuthor={(authorId) => setSelectedProfileId(authorId)}
            onSelectAd={(ad) => setSelectedAd(ad)}
            selectedCity={selectedCity}
          />
        ) : (
          /* Sketch 6: Settings View with 6 top cards, identity verification, menu options, FAQs */
          <SettingsView
            onOpenMessages={() => setIsMessagesOpen(true)}
            onOpenBookmarks={() => setIsBookmarksOpen(true)}
            onOpenProfile={() => setSelectedProfileId('pars-dookht')}
            bookmarkedAdsCount={bookmarkedIds.length}
          />
        )}
      </main>

      {/* Bottom 5-Tab Navigation Bar */}
      <Navigation
        currentTab={selectedProfileId ? 'settings' : currentTab}
        onSelectTab={handleSelectTab}
        unreadCount={5}
      />

      {/* Modals */}
      {/* Sketch 4: Ad Detail Full Modal */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          isBookmarked={bookmarkedIds.includes(selectedAd.id)}
          onToggleBookmark={handleToggleBookmark}
          onSelectAuthor={(authorId) => {
            setSelectedAd(null);
            setSelectedProfileId(authorId);
          }}
          onOpenDirectChat={(ad) => setChatAd(ad)}
        />
      )}

      {/* Direct Buyer-Seller In-App Chat Modal */}
      {chatAd && (
        <DirectChatModal ad={chatAd} onClose={() => setChatAd(null)} />
      )}

      {/* Post New Ad Modal */}
      {isCreateOpen && (
        <CreateAdModal
          onClose={() => setIsCreateOpen(false)}
          onSubmitAd={handleAddNewAd}
        />
      )}

      {/* AI Textile Assistant Modal */}
      {isAiOpen && (
        <AiAssistantModal onClose={() => setIsAiOpen(false)} />
      )}

      {/* Messages Inbox Drawer/Modal with unread counter */}
      {isMessagesOpen && (
        <MessagesInboxModal
          onClose={() => setIsMessagesOpen(false)}
          onOpenChatWithAd={(ad) => setChatAd(ad)}
          sampleAds={ads}
        />
      )}

      {/* Bookmarked Ads Modal */}
      {isBookmarksOpen && (
        <BookmarksModal
          onClose={() => setIsBookmarksOpen(false)}
          bookmarkedAds={bookmarkedAds}
          onSelectAd={(ad) => setSelectedAd(ad)}
          onRemoveBookmark={handleToggleBookmark}
        />
      )}
    </div>
  );
}
