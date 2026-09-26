export type TabType = 'home' | 'map' | 'create' | 'explore' | 'settings';

// ==========================================
// Listing Intent & Activity Concept
// ==========================================
export type ListingIntent = 'OFFER' | 'DEMAND';
export type ActivityType = 'offer' | 'need' | 'capacity';

export interface ListingDraft {
  id?: string;
  intent: ListingIntent;
  activityType: ActivityType;
  status: 'DRAFT' | 'PENDING_PAYMENT' | 'PUBLISHED' | 'ARCHIVED';
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// Monetization & Entitlement Architecture
// ==========================================
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PublicationSettlementMethod = 'SINGLE_PAYMENT' | 'PACKAGE_ENTITLEMENT';
export type PackageStatus = 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'SUSPENDED';

/**
 * Financial Transaction (Payment Boundary)
 */
export interface ListingPaymentTransaction {
  id: string;
  listingId: string;
  payerAccountId: string;
  amount: number | null; // Nullable if policy-driven or yet to be specified
  currency?: string; // e.g. 'TOMAN'
  status: PaymentStatus;
  paymentGatewayProvider?: string; // Configurable extension point
  transactionReference?: string;
  paidAt?: string;
  createdAt: string;
}

/**
 * Commercial Package Entitlement (Purchased Bundle)
 */
export interface PublicationPackage {
  id: string;
  accountId: string;
  planId: string;
  title: string;
  totalCapacity: number; // Total listings granted
  remainingCapacity: number; // Remaining listings available for consumption
  validFrom: string;
  validUntil: string;
  status: PackageStatus;
  createdAt: string;
}

/**
 * Consumption Event Ledger (Consumes exactly 1 entitlement on publish)
 */
export interface PackageEntitlementConsumption {
  id: string;
  packageId: string;
  listingId: string;
  consumedByAccountId: string;
  consumedAt: string;
  unitsConsumed: 1; // Exactly 1 unit per publication
}

/**
 * Publication Settlement State (Separates payment, package, and publication)
 */
export interface ListingPublicationSettlement {
  listingId: string;
  method: PublicationSettlementMethod;
  packageId?: string;
  paymentTransactionId?: string;
  isEntitlementConsumed: boolean;
  consumedAt?: string;
}

export interface AdItem {
  id: string;
  title: string;
  description: string;
  intent?: ListingIntent;
  activityType?: ActivityType;
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
  isOnline?: boolean;
  images: string[];
  hasVideo?: boolean;
  videoUrl?: string;
  aspectRatio?: 'vertical' | 'horizontal' | 'square';
  videoDuration?: string; // e.g. '03:45' (up to 10 min max)
  videoQuality?: string; // e.g. '1080p FHD'
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
  isOnline?: boolean;
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

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  aspectRatio: 'vertical' | 'horizontal';
  durationSeconds?: number;
  timeAgo: string;
  isVerified?: boolean;
  caption?: string;
  linkAdId?: string;
}

