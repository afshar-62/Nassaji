export type TabType = 'home' | 'map' | 'create' | 'explore' | 'settings';

export interface AdItem {
  id: string;
  title: string;
  description: string;
  city: string;
  province: string;
  category: string;
  subCategory?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRating: number;
  authorVerified: boolean;
  authorSpecialty: string;
  authorActivity: string;
  images: string[];
  hasVideo?: boolean;
  videoUrl?: string;
  createdAtText: string;
  likesCount: number;
  commentsCount: number;
  price?: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
  contact: {
    mobile: string;
    phone: string;
    smsNumber: string;
    website?: string;
    basalamUrl?: string;
    telegram?: string;
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
  };
  location: {
    lat: number;
    lng: number;
    addressText: string;
    areaName: string;
  };
  comments: CommentItem[];
}

export interface CommentItem {
  id: string;
  authorName: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  logo: string;
  banner: string;
  activity: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  isVerified: boolean;
  bio: string;
  fullDescription: string;
  licenses: LicenseItem[];
  contacts: {
    twitter?: string;
    telegram?: string;
    whatsapp?: string;
    instagram?: string;
    phone?: string;
    mobile?: string;
    website?: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  adIds: string[];
}

export interface LicenseItem {
  id: string;
  title: string;
  issuer: string;
  iconName: string;
  verifiedDate: string;
}

export interface BillboardBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkText: string;
  bgColor: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  icon: string;
  count?: number;
}
