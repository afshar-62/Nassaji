import { apiClient } from './client.ts';
import { BusinessProfile, LicenseItem } from '../../types.ts';

export interface RawBusinessProfileResponse {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  phone?: string | null;
  province: string;
  city: string;
  address?: string | null;
  registrationNumber?: string | null;
  licenseNumber?: string | null;
  profile: {
    description?: string | null;
    managerName?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    workshopAreaSqm?: number | null;
    activeMachinesCount?: number | null;
    personnelCount?: number | null;
    verifiedBadges: string[];
    whatsapp?: string | null;
    telegram?: string | null;
    website?: string | null;
    rating: number;
    reviewsCount: number;
  };
  contacts: {
    phone?: string | null;
    mobile?: string | null;
    whatsapp?: string | null;
    telegram?: string | null;
    website?: string | null;
  };
  location: {
    province: string;
    city: string;
    address: string;
  };
}

export const businessesService = {
  async fetchBusiness(id: string): Promise<any> {
    return apiClient<any>(`/businesses/${id}`);
  },

  async fetchBusinessProfile(id: string): Promise<BusinessProfile> {
    const raw = await apiClient<RawBusinessProfileResponse>(`/businesses/${id}/profile`);

    // Map badges to standard LicenseItem list
    const licenses: LicenseItem[] = (raw.profile.verifiedBadges || []).map((badge, idx) => ({
      id: `lic-${idx + 1}`,
      title: badge,
      issuer: 'اتحادیه صنف پوشاک و نساجی',
      iconName: idx % 2 === 0 ? 'Award' : 'ShieldCheck',
      verifiedDate: '۱۴۰۳/۰۶/۱۵',
    }));

    if (raw.licenseNumber) {
      licenses.unshift({
        id: 'lic-main',
        title: `پروانه بهره‌برداری شماره ${raw.licenseNumber}`,
        issuer: 'وزارت صمت و اتاق اصناف',
        iconName: 'FileCheck',
        verifiedDate: '۱۴۰۲/۱۱/۲۰',
      });
    }

    const workshopDetails = [
      raw.profile.workshopAreaSqm ? `متراژ کارگاه: ${raw.profile.workshopAreaSqm} متر مربع` : null,
      raw.profile.activeMachinesCount ? `تعداد ماشین‌آلات فعال: ${raw.profile.activeMachinesCount} دستگاه` : null,
      raw.profile.personnelCount ? `نیروی کار: ${raw.profile.personnelCount} نفر متخصص` : null,
    ].filter(Boolean).join(' • ');

    return {
      id: raw.id,
      name: raw.name,
      logo: raw.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      banner: raw.profile.coverUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
      activity: 'تولید، خدمات و بافندگی نساجی',
      specialty: workshopDetails || 'تولید و خدمات بافندگی و تکمیل منسوجات',
      rating: Number(raw.profile.rating) || 5.0,
      reviewsCount: raw.profile.reviewsCount || 0,
      followersCount: 142,
      isVerified: raw.isVerified,
      bio: raw.profile.description || `${raw.name}، فعال در زمینه تولید و زنجیره تامین نساجی در استان ${raw.province}`,
      fullDescription: `${raw.profile.description || ''}\n\nمشخصات فنی واحد:\n${workshopDetails || 'ثبت شده در سامانه جامع کسب‌وکارهای تاروپود'}`,
      licenses,
      contacts: {
        phone: raw.contacts.phone || undefined,
        mobile: raw.contacts.mobile || undefined,
        whatsapp: raw.contacts.whatsapp || undefined,
        telegram: raw.contacts.telegram || undefined,
        website: raw.contacts.website || undefined,
      },
      location: {
        lat: 35.6997,
        lng: 51.4085,
        address: raw.location.address,
        city: raw.location.city,
      },
      adIds: [],
    };
  },
};
