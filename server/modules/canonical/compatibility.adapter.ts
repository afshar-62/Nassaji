/**
 * TAROPOD SAFE COMPATIBILITY ADAPTER
 * 
 * Bridges legacy data models (listings, businesses, activityType, commodityType)
 * with the new Taropod Canonical Domain Model without mutating database tables
 * or breaking existing API contracts.
 */

import {
  CanonicalListing,
  CanonicalMarketObject,
  CanonicalActor,
  MarketIntent,
  MarketObjectType,
  PublicationState,
  ActorRole,
  DataProvenance
} from './types.ts';

export class CanonicalCompatibilityAdapter {
  /**
   * Maps legacy activityType and commodityType to canonical MarketIntent & MarketObjectType
   */
  public static mapLegacyToCanonicalIntentAndType(
    activityType?: string | null,
    commodityType?: string | null
  ): { intent: MarketIntent; marketObjectType: MarketObjectType } {
    const act = (activityType || 'offer').toLowerCase().trim();
    const com = (commodityType || 'product').toLowerCase().trim();

    // 1. Determine Intent
    let intent: MarketIntent = 'OFFER';
    if (act === 'need' || act === 'demand') {
      intent = 'DEMAND';
    } else {
      intent = 'OFFER';
    }

    // 2. Determine Market Object Type
    let marketObjectType: MarketObjectType = 'PHYSICAL_PRODUCT';

    if (act === 'capacity' || com === 'capacity') {
      marketObjectType = 'CAPACITY';
    } else if (com === 'material') {
      marketObjectType = 'MATERIAL';
    } else if (com === 'machine' || com === 'equipment') {
      marketObjectType = 'EQUIPMENT';
    } else if (com === 'service') {
      marketObjectType = 'SERVICE';
    } else if (com === 'digital' || com === 'pattern' || com === 'cad') {
      marketObjectType = 'DIGITAL_PRODUCT';
    } else if (act === 'need' && (!com || com === 'product')) {
      marketObjectType = 'NEED';
    } else {
      marketObjectType = 'PHYSICAL_PRODUCT';
    }

    return { intent, marketObjectType };
  }

  /**
   * Reverse mapping: canonical intent & market object type back to legacy columns
   */
  public static mapCanonicalToLegacy(
    intent: MarketIntent,
    marketObjectType: MarketObjectType
  ): { activityType: 'offer' | 'need' | 'capacity'; commodityType: string } {
    if (intent === 'DEMAND') {
      let commodityType = 'product';
      if (marketObjectType === 'MATERIAL') commodityType = 'material';
      if (marketObjectType === 'EQUIPMENT') commodityType = 'machine';
      if (marketObjectType === 'SERVICE') commodityType = 'service';
      if (marketObjectType === 'CAPACITY') commodityType = 'capacity';
      return { activityType: 'need', commodityType };
    }

    // OFFER path
    if (marketObjectType === 'CAPACITY') {
      return { activityType: 'capacity', commodityType: 'capacity' };
    }
    if (marketObjectType === 'MATERIAL') {
      return { activityType: 'offer', commodityType: 'material' };
    }
    if (marketObjectType === 'EQUIPMENT') {
      return { activityType: 'offer', commodityType: 'machine' };
    }
    if (marketObjectType === 'SERVICE') {
      return { activityType: 'offer', commodityType: 'service' };
    }

    return { activityType: 'offer', commodityType: 'product' };
  }

  /**
   * Maps publication status from legacy to canonical PublicationState
   */
  public static mapLegacyPublicationStatus(status?: string | null): PublicationState {
    const s = (status || 'draft').toLowerCase().trim();
    switch (s) {
      case 'published':
        return 'PUBLISHED';
      case 'pending_payment':
        return 'PENDING_PAYMENT';
      case 'suspended':
        return 'SUSPENDED';
      case 'archived':
        return 'ARCHIVED';
      case 'expired':
        return 'EXPIRED';
      case 'draft':
      default:
        return 'DRAFT';
    }
  }

  /**
   * Transforms a legacy listing database record & related entities into a CanonicalListing
   */
  public static toCanonicalListing(
    legacyListing: {
      id: string;
      businessId: string;
      categorySlug: string;
      title: string;
      description: string;
      activityType?: string | null;
      commodityType?: string | null;
      priceType?: string | null;
      priceAmount?: string | number | null;
      currency?: string | null;
      unitOfMeasure?: string | null;
      minimumOrderQuantity?: number | null;
      status?: string | null;
      publishedAt?: Date | string | null;
      createdAt?: Date | string | null;
      updatedAt?: Date | string | null;
    },
    legacyBusiness?: {
      id: string;
      name: string;
      isVerified?: boolean | null;
      businessType?: string | null;
    } | null,
    locations: Array<{
      id?: string;
      title?: string | null;
      province?: string | null;
      city?: string | null;
      industrialPark?: string | null;
    }> = [],
    media: Array<{
      id?: string;
      url?: string | null;
      isCover?: boolean | null;
      altText?: string | null;
    }> = []
  ): CanonicalListing {
    const { intent, marketObjectType } = this.mapLegacyToCanonicalIntentAndType(
      legacyListing.activityType,
      legacyListing.commodityType
    );

    const publicationState = this.mapLegacyPublicationStatus(legacyListing.status);

    const marketObject: CanonicalMarketObject = {
      type: marketObjectType,
      intent: intent,
      title: legacyListing.title,
      description: legacyListing.description,
      categorySlug: legacyListing.categorySlug,
      attributes: [],
      provenance: 'EXPLICIT_USER',
      rawLegacyFields: {
        activityType: legacyListing.activityType,
        commodityType: legacyListing.commodityType
      }
    };

    // Determine default Actor Roles
    const roles: ActorRole[] = [];
    if (intent === 'OFFER') {
      if (marketObjectType === 'CAPACITY') roles.push('CAPACITY_PROVIDER', 'CONTRACTOR');
      else if (marketObjectType === 'MATERIAL') roles.push('SUPPLIER');
      else if (marketObjectType === 'SERVICE') roles.push('SERVICE_PROVIDER');
      else roles.push('PRODUCER', 'SELLER');
    } else {
      roles.push('BUYER');
    }

    const priceNum = legacyListing.priceAmount !== null && legacyListing.priceAmount !== undefined
      ? Number(legacyListing.priceAmount)
      : null;

    return {
      id: legacyListing.id,
      marketObject,
      publisherActor: {
        id: legacyBusiness?.id || legacyListing.businessId,
        type: 'BUSINESS',
        name: legacyBusiness?.name || 'کسب‌وکار نامشخص',
        roles,
        verified: Boolean(legacyBusiness?.isVerified)
      },
      commercialTerms: {
        priceType: (legacyListing.priceType as any) || 'negotiable',
        priceAmount: priceNum,
        currency: legacyListing.currency || 'IRR',
        unitOfMeasure: legacyListing.unitOfMeasure,
        minimumOrderQuantity: legacyListing.minimumOrderQuantity
      },
      publicationState,
      locations: locations.map(loc => ({
        id: loc.id,
        title: loc.title || 'کارگاه',
        province: loc.province || '',
        city: loc.city || '',
        industrialPark: loc.industrialPark,
        isApproximate: false
      })),
      media: media.map(m => ({
        id: m.id,
        url: m.url || '',
        isCover: Boolean(m.isCover),
        altText: m.altText
      })),
      publishedAt: legacyListing.publishedAt ? new Date(legacyListing.publishedAt).toISOString() : null,
      createdAt: legacyListing.createdAt ? new Date(legacyListing.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: legacyListing.updatedAt ? new Date(legacyListing.updatedAt).toISOString() : new Date().toISOString()
    };
  }

  /**
   * Transforms a Canonical listing or draft input back to legacy listing fields
   */
  public static toLegacyDraftPayload(canonical: {
    title: string;
    description: string;
    categorySlug: string;
    intent: MarketIntent;
    marketObjectType: MarketObjectType;
    priceType?: 'fixed' | 'negotiable' | 'per_unit';
    priceAmount?: number | null;
    unitOfMeasure?: string | null;
    minimumOrderQuantity?: number | null;
    city?: string;
    province?: string;
  }) {
    const { activityType, commodityType } = this.mapCanonicalToLegacy(
      canonical.intent,
      canonical.marketObjectType
    );

    return {
      title: canonical.title,
      description: canonical.description,
      categorySlug: canonical.categorySlug,
      activityType,
      commodityType,
      priceType: canonical.priceType || 'negotiable',
      priceAmount: canonical.priceAmount !== undefined ? canonical.priceAmount : null,
      unit: canonical.unitOfMeasure || 'تکه',
      minimumOrder: canonical.minimumOrderQuantity !== undefined && canonical.minimumOrderQuantity !== null
        ? String(canonical.minimumOrderQuantity)
        : undefined,
      city: canonical.city || 'تهران',
      province: canonical.province || 'تهران'
    };
  }

  /**
   * Maps User, Business, and Profile entities into a unified CanonicalActor
   */
  public static toCanonicalActor(params: {
    user?: { id: string; fullName?: string | null; role?: string | null } | null;
    business?: { id: string; name: string; isVerified?: boolean | null } | null;
    profile?: { id: string; slug: string; bio?: string | null; specialties?: string[] | null; profileType?: string | null } | null;
  }): CanonicalActor {
    const isBusiness = Boolean(params.business);
    const id = isBusiness ? params.business!.id : (params.user?.id || 'anonymous');
    const displayName = isBusiness ? params.business!.name : (params.user?.fullName || 'کاربر حقیقی');

    const roles: ActorRole[] = [];
    if (isBusiness) {
      roles.push('MANUFACTURER', 'SUPPLIER');
    } else {
      roles.push('SPECIALIST');
    }

    const profilesList = params.profile ? [{
      id: params.profile.id,
      slug: params.profile.slug,
      headline: params.profile.bio
    }] : [];

    return {
      id,
      type: isBusiness ? 'BUSINESS' : 'PERSON',
      displayName,
      roles,
      verified: Boolean(params.business?.isVerified),
      userRefId: params.user?.id,
      businessRefId: params.business?.id,
      profiles: profilesList
    };
  }
}
