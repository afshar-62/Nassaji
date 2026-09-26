import { pgTable, text, timestamp, uuid, integer, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table (Authenticated Persons)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system actor identifier
  mobile: text('mobile'),
  name: text('name').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Businesses table (Workshop, Plant, Trading Office, Commercial Firm)
export const businesses = pgTable('businesses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  registrationNumber: text('registration_number'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  city: text('city').notNull(),
  province: text('province').notNull(),
  address: text('address'),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Business Memberships table (N-to-N Link between Users & Businesses)
// Enforces: User != Business, and multi-user workshop operations
export const businessMemberships = pgTable('business_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull().default('owner'), // 'owner', 'manager', 'operator'
  isDefault: boolean('is_default').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Business Profiles table (Extended catalog, trust and presentation details)
export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull().unique(),
  description: text('description'),
  managerName: text('manager_name'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  workshopAreaSqm: integer('workshop_area_sqm'),
  activeMachinesCount: integer('active_machines_count'),
  personnelCount: integer('personnel_count'),
  verifiedBadges: text('verified_badges').array(),
  whatsapp: text('whatsapp'),
  telegram: text('telegram'),
  website: text('website'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00').notNull(),
  reviewsCount: integer('reviews_count').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Categories table (Textile Taxonomy)
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  slug: text('slug').notNull().unique(),
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en'),
  icon: text('icon'),
  description: text('description'),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Media table (Independent Entity for Media Assets)
export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
  uploadedById: uuid('uploaded_by_id').references(() => users.id),
  url: text('url').notNull(),
  storageKey: text('storage_key'),
  mimeType: text('mime_type').notNull().default('image/jpeg'),
  sizeBytes: integer('size_bytes'),
  altText: text('alt_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Locations table (Independent Entity for Coordinates & Places)
export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  province: text('province').notNull(),
  city: text('city').notNull(),
  district: text('district'),
  industrialPark: text('industrial_park'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  addressDetails: text('address_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Listings table (B2B Market Activity: Offers, Needs, Capacity, Products, Services)
// Lifecycle: 'draft' -> 'published' -> 'archived' | 'suspended'
export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  categorySlug: text('category_slug').notNull(), // Fast indexed denormalized reference
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  activityType: text('activity_type').notNull().default('offer'), // 'offer', 'need', 'capacity'
  commodityType: text('commodity_type').default('product'), // 'product', 'service', 'capacity', 'material', 'machine'
  
  priceType: text('price_type').notNull().default('negotiable'), // 'fixed', 'negotiable', 'per_unit'
  priceAmount: numeric('price_amount', { precision: 15, scale: 2 }),
  unit: text('unit').default('تکه'),
  minimumOrder: text('minimum_order'),
  
  city: text('city').notNull(),
  province: text('province').notNull(),
  
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived', 'suspended'
  viewsCount: integer('views_count').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 9. Listing Media Link Table
export const listingMedia = pgTable('listing_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  mediaId: uuid('media_id').references(() => media.id, { onDelete: 'cascade' }).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isCover: boolean('is_cover').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. Listing Locations Link Table
export const listingLocations = pgTable('listing_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }).notNull(),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 11. Profiles table (Persistent B2B Identity & Presence: PERSON or ORGANIZATION)
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  profileType: text('profile_type').notNull().default('PERSON'), // 'PERSON' | 'ORGANIZATION'
  status: text('status').notNull().default('INCOMPLETE'), // 'INCOMPLETE' | 'ACTIVE' | 'SUSPENDED'
  slug: text('slug').notNull().unique(),

  // Baseline Identity
  firstName: text('first_name'),
  lastName: text('last_name'),
  businessName: text('business_name'),
  workGroup: text('work_group').notNull(), // Classification category
  activityDomain: text('activity_domain').notNull(), // Activity domain / branch
  specialties: text('specialties').array().notNull(), // Multiple specialties supported

  // Visual Presence
  avatarUrl: text('avatar_url'),
  headerUrl: text('header_url'),

  // Professional Presence
  bio: text('bio'),
  yearsActive: integer('years_active'),

  // Products & Services (Stable catalog, not ephemeral listing stock)
  primaryProducts: text('primary_products').array(),
  secondaryProducts: text('secondary_products').array(),
  services: text('services').array(),

  // Capacity & Operating Context (Contextual baseline, not live order conditions)
  capacitySummary: text('capacity_summary'),
  workingHours: text('working_hours'),
  workingDays: text('working_days').array(),
  geographicScope: text('geographic_scope'),
  collaborationModes: text('collaboration_modes').array(),
  shippingCapability: boolean('shipping_capability').default(false).notNull(),
  onsiteServiceCapability: boolean('onsite_service_capability').default(false).notNull(),

  // Contacts & Links
  phone: text('phone'),
  mobile: text('mobile'),
  whatsapp: text('whatsapp'),
  telegram: text('telegram'),
  email: text('email'),
  websiteUrl: text('website_url'),
  websiteStatus: text('website_status').default('SUBMITTED').notNull(), // 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', etc.
  socialLinks: text('social_links'), // JSON metadata for Instagram, LinkedIn, etc.

  // Trust & Signals
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00').notNull(),
  ratingsCount: integer('ratings_count').default(0).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 12. Profile Credentials & Evidence
export const profileCredentials = pgTable('profile_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  issueDate: text('issue_date'),
  validityDate: text('validity_date'),
  fileUrl: text('file_url').notNull(),
  description: text('description'),
  isOfficiallyVerified: boolean('is_officially_verified').default(false).notNull(), // Strictly unverified unless external verified
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. Profile Locations & Units
export const profileLocations = pgTable('profile_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  unitTitle: text('unit_title').notNull(),
  unitType: text('unit_type').default('workshop').notNull(), // 'workshop', 'office', 'warehouse', 'showroom', 'distribution_center', 'service_center'
  country: text('country').default('ایران').notNull(),
  province: text('province').notNull(),
  city: text('city').notNull(),
  area: text('area'),
  address: text('address').notNull(),
  postalCode: text('postal_code'),
  phone: text('phone'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  isApproximate: boolean('is_approximate').default(false).notNull(),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 14. Profile Ratings (Meaningful Interactions Only)
export const profileRatings = pgTable('profile_ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  raterAccountId: uuid('rater_account_id').references(() => users.id).notNull(),
  score: integer('score').notNull(), // 1 to 5
  interactionType: text('interaction_type').notNull(), // 'deal', 'collaboration', 'inquiry', 'service_order'
  privateRationale: text('private_rationale'), // Never publicly exposed
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 15. Profile Audit Events (Observability & Governance)
export const profileAuditEvents = pgTable('profile_audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  actorId: uuid('actor_id').references(() => users.id).notNull(),
  eventType: text('event_type').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------- RELATIONS -----------------

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(businessMemberships),
  createdBusinesses: many(businesses),
  createdListings: many(listings),
  profiles: many(profiles),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  creator: one(users, {
    fields: [businesses.createdById],
    references: [users.id],
  }),
  profile: one(businessProfiles, {
    fields: [businesses.id],
    references: [businessProfiles.businessId],
  }),
  members: many(businessMemberships),
  listings: many(listings),
  media: many(media),
}));

export const businessMembershipsRelations = relations(businessMemberships, ({ one }) => ({
  user: one(users, {
    fields: [businessMemberships.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [businessMemberships.businessId],
    references: [businesses.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  business: one(businesses, {
    fields: [listings.businessId],
    references: [businesses.id],
  }),
  creator: one(users, {
    fields: [listings.createdById],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [listings.categoryId],
    references: [categories.id],
  }),
  mediaLinks: many(listingMedia),
  locationLinks: many(listingLocations),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, {
    fields: [listingMedia.listingId],
    references: [listings.id],
  }),
  media: one(media, {
    fields: [listingMedia.mediaId],
    references: [media.id],
  }),
}));

export const listingLocationsRelations = relations(listingLocations, ({ one }) => ({
  listing: one(listings, {
    fields: [listingLocations.listingId],
    references: [listings.id],
  }),
  location: one(locations, {
    fields: [listingLocations.locationId],
    references: [locations.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  account: one(users, {
    fields: [profiles.accountId],
    references: [users.id],
  }),
  credentials: many(profileCredentials),
  locations: many(profileLocations),
  ratings: many(profileRatings),
  auditEvents: many(profileAuditEvents),
}));

export const profileCredentialsRelations = relations(profileCredentials, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileCredentials.profileId],
    references: [profiles.id],
  }),
}));

export const profileLocationsRelations = relations(profileLocations, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileLocations.profileId],
    references: [profiles.id],
  }),
}));

export const profileRatingsRelations = relations(profileRatings, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileRatings.profileId],
    references: [profiles.id],
  }),
  rater: one(users, {
    fields: [profileRatings.raterAccountId],
    references: [users.id],
  }),
}));

export const profileAuditEventsRelations = relations(profileAuditEvents, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileAuditEvents.profileId],
    references: [profiles.id],
  }),
  actor: one(users, {
    fields: [profileAuditEvents.actorId],
    references: [users.id],
  }),
}));

// ==========================================
// 16. Publication Packages Table (Commercial Bundles)
// ==========================================
export const publicationPackages = pgTable('publication_packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: text('plan_id').notNull(),
  title: text('title').notNull(),
  totalCapacity: integer('total_capacity').notNull(),
  remainingCapacity: integer('remaining_capacity').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'EXHAUSTED', 'EXPIRED', 'SUSPENDED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 17. Package Entitlement Consumptions Table (Ledger)
// Enforces: Exactly 1 unit consumed per published listing
// ==========================================
export const packageEntitlementConsumptions = pgTable('package_entitlement_consumptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  packageId: uuid('package_id').references(() => publicationPackages.id, { onDelete: 'cascade' }).notNull(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  consumedByAccountId: uuid('consumed_by_account_id').references(() => users.id).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }).defaultNow().notNull(),
  unitsConsumed: integer('units_consumed').default(1).notNull(),
});

// ==========================================
// 18. Listing Payment Transactions Table (Financial Boundary)
// Separates monetary transaction from package entitlement
// ==========================================
export const listingPaymentTransactions = pgTable('listing_payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }).notNull(),
  payerAccountId: uuid('payer_account_id').references(() => users.id).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }), // Nullable pending pricing policy definition
  currency: text('currency').default('TOMAN'),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'
  paymentGatewayProvider: text('payment_gateway_provider'), // Extension point
  transactionReference: text('transaction_reference'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});


