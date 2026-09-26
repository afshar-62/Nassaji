/**
 * TAROPOD CANONICAL DATA MODEL CONTRACT
 * 
 * Formal TypeScript definitions for Taropod's architectural domain:
 * ACTOR, PROFILE, ROLE, MARKET OBJECT, INTENT, ATTRIBUTE, STATE, RELATIONSHIP, PROVENANCE, LISTING
 */

// 1. ACTOR & ROLES
export type ActorType = 'PERSON' | 'BUSINESS' | 'ORGANIZATION';

export type ActorRole = 
  | 'PRODUCER'
  | 'MANUFACTURER'
  | 'SUPPLIER'
  | 'SELLER'
  | 'BUYER'
  | 'EMPLOYER'
  | 'JOB_SEEKER'
  | 'SERVICE_PROVIDER'
  | 'SPECIALIST'
  | 'CONTRACTOR'
  | 'IMPORTER'
  | 'EXPORTER'
  | 'DISTRIBUTOR'
  | 'CAPACITY_PROVIDER';

// 2. MARKET OBJECT & INTENT
export type MarketObjectType =
  | 'PHYSICAL_PRODUCT'
  | 'MATERIAL'
  | 'EQUIPMENT'
  | 'DIGITAL_PRODUCT'
  | 'SERVICE'
  | 'CAPACITY'
  | 'JOB'
  | 'NEED'
  | 'OPPORTUNITY'
  | 'PROJECT';

export type MarketIntent = 'OFFER' | 'DEMAND';

// 3. PROVENANCE (Audit and Data Origin Boundary)
export type DataProvenance =
  | 'EXPLICIT_USER'
  | 'USER_CONFIRMED_AI'
  | 'AI_EXTRACTED'
  | 'SYSTEM_GENERATED'
  | 'BEHAVIORAL'
  | 'EXTERNAL_REFERENCE';

// 4. DISTINCT LIFECYCLE & PHYSICAL STATES
export type PhysicalCondition =
  | 'BRAND_NEW'
  | 'LIKE_NEW'
  | 'USED'
  | 'NEEDS_REPAIR'
  | 'SCRAP_RECYCLED';

export type AvailabilityState =
  | 'READY_IN_STOCK'
  | 'IN_PRODUCTION'
  | 'PREORDER'
  | 'MADE_TO_ORDER'
  | 'SOLD_OUT'
  | 'CAPACITY_EXHAUSTED';

export type ProductionState =
  | 'RAW'
  | 'SEMI_FINISHED'
  | 'FINISHED';

export type PublicationState =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PUBLISHED'
  | 'SUSPENDED'
  | 'ARCHIVED'
  | 'EXPIRED';

// 5. ATTRIBUTES
export interface CanonicalAttribute<T = unknown> {
  key: string;
  labelFa: string;
  value: T;
  unit?: string;
  provenance: DataProvenance;
  confidence?: number; // 0.0 to 1.0 for AI-extracted attributes
}

// 6. RELATIONSHIPS
export type RelationshipType =
  | 'PRODUCES'
  | 'SUPPLIES'
  | 'BUYS'
  | 'NEEDS'
  | 'EMPLOYS'
  | 'PROVIDES'
  | 'COLLABORATES'
  | 'TRANSFORMS'
  | 'CONTAINS'
  | 'PART_OF';

export interface CanonicalRelationship {
  sourceActorId: string;
  targetId: string;
  type: RelationshipType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// 7. CANONICAL MARKET OBJECT
export interface CanonicalMarketObject {
  id?: string;
  type: MarketObjectType;
  intent: MarketIntent;
  title: string;
  description: string;
  categorySlug: string;
  condition?: PhysicalCondition;
  availability?: AvailabilityState;
  productionState?: ProductionState;
  attributes: CanonicalAttribute[];
  provenance: DataProvenance;
  rawLegacyFields?: Record<string, unknown>;
}

// 8. CANONICAL LISTING (Publication Projection)
export interface CanonicalListing {
  id: string;
  marketObject: CanonicalMarketObject;
  publisherActor: {
    id: string;
    type: ActorType;
    name: string;
    roles: ActorRole[];
    verified: boolean;
  };
  commercialTerms: {
    priceType: 'fixed' | 'negotiable' | 'per_unit' | 'quote_required';
    priceAmount: number | null;
    currency: string;
    unitOfMeasure?: string | null;
    minimumOrderQuantity?: number | null;
  };
  publicationState: PublicationState;
  locations: Array<{
    id?: string;
    title: string;
    province: string;
    city: string;
    industrialPark?: string | null;
    isApproximate: boolean;
  }>;
  media: Array<{
    id?: string;
    url: string;
    isCover: boolean;
    altText?: string | null;
  }>;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 9. CANONICAL ACTOR
export interface CanonicalActor {
  id: string;
  type: ActorType;
  displayName: string;
  roles: ActorRole[];
  verified: boolean;
  userRefId?: string;
  businessRefId?: string;
  profiles: Array<{
    id: string;
    slug: string;
    headline?: string | null;
  }>;
}
