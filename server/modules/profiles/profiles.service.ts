import {
  IProfilesRepository,
  ProfileRecord,
  ProfileCredentialRecord,
  ProfileLocationRecord,
} from './profiles.repository.port.ts';
import { postgresProfilesRepository } from './profiles.repository.postgres.ts';
import {
  CreateProfileDTO,
  UpdateProfileDTO,
  PublicProfileDTO,
  OwnerProfileDTO,
  BaselineValidationResult,
  RateProfileDTO,
  ProfileType,
  ProfileCredentialDTO,
  ProfileLocationDTO,
} from './profiles.dto.ts';

export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ProfilesService {
  constructor(private repo: IProfilesRepository = postgresProfilesRepository) {}

  validateBaseline(
    data: {
      profileType?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      businessName?: string | null;
      workGroup?: string | null;
      activityDomain?: string | null;
      specialties?: string[] | null;
    },
    profileType: ProfileType = 'PERSON'
  ): BaselineValidationResult {
    const missingFields: string[] = [];
    const type = (data.profileType as ProfileType) || profileType || 'PERSON';

    // Work group is required
    if (!data.workGroup || data.workGroup.trim() === '') {
      missingFields.push('workGroup (گروه کاری)');
    }

    // Activity domain is required
    if (!data.activityDomain || data.activityDomain.trim() === '') {
      missingFields.push('activityDomain (شاخه / حوزه فعالیت)');
    }

    // At least one specialty is required
    const validSpecialties = (data.specialties || []).filter(
      (s) => typeof s === 'string' && s.trim() !== ''
    );
    if (validSpecialties.length === 0) {
      missingFields.push('specialties (حداقل یک تخصص)');
    }

    // Type-specific validation
    if (type === 'PERSON') {
      const hasPersonName =
        !!data.firstName?.trim() && !!data.lastName?.trim();
      const hasBusinessName = !!data.businessName?.trim();

      if (!hasPersonName && !hasBusinessName) {
        missingFields.push(
          'identity (نام و نام خانوادگی یا نام تجاری/عنوان فعالیت شخص)'
        );
      }
    } else if (type === 'ORGANIZATION') {
      if (!data.businessName || data.businessName.trim() === '') {
        missingFields.push('businessName (نام رسمی شرکت / مجموعه / کارگاه)');
      }
    }

    const isComplete = missingFields.length === 0;
    const summaryMessage = isComplete
      ? 'اطلاعات پایه هویت حرفه‌ای تکمیل است.'
      : `نواقص هویت حرفه‌ای: ${missingFields.join('، ')}`;

    return {
      isComplete,
      profileType: type,
      missingFields,
      summaryMessage,
    };
  }

  private generateSlug(data: CreateProfileDTO): string {
    const baseSource =
      data.profileType === 'ORGANIZATION'
        ? data.businessName || 'org'
        : data.businessName ||
          `${data.firstName || ''}-${data.lastName || ''}`.trim() ||
          'user';

    const normalized = baseSource
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return normalized ? `${normalized}-${randomSuffix}` : `profile-${randomSuffix}`;
  }

  async getPublicProfile(idOrSlug: string): Promise<PublicProfileDTO> {
    // Check by ID first, then by slug
    let record: ProfileRecord | null = null;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    if (isUuid) {
      record = await this.repo.findById(idOrSlug);
    }
    if (!record) {
      record = await this.repo.findBySlug(idOrSlug);
    }

    if (!record) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل مورد نظر یافت نشد.', 404);
    }

    const [credentials, locations, listings] = await Promise.all([
      this.repo.getCredentials(record.id),
      this.repo.getLocations(record.id),
      this.repo.getListingsForProfile(record.accountId),
    ]);

    return this.toPublicDTO(record, credentials, locations, listings);
  }

  async getOwnerProfile(accountId: string): Promise<OwnerProfileDTO | null> {
    // Find owner's primary or personal profile
    const personal = await this.repo.findPersonalProfileByAccountId(accountId);
    let record = personal;

    if (!record) {
      const allProfiles = await this.repo.findByAccountId(accountId);
      if (allProfiles.length > 0) {
        record = allProfiles[0];
      }
    }

    if (!record) {
      return null;
    }

    const [credentials, locations, listings] = await Promise.all([
      this.repo.getCredentials(record.id),
      this.repo.getLocations(record.id),
      this.repo.getListingsForProfile(record.accountId),
    ]);

    return this.toOwnerDTO(record, credentials, locations, listings);
  }

  async createProfile(
    accountId: string,
    data: CreateProfileDTO
  ): Promise<OwnerProfileDTO> {
    const profileType: ProfileType = data.profileType || 'PERSON';

    // Enforce rule: "هر Account در MVP حداکثر یک PERSONAL Profile دارد."
    if (profileType === 'PERSON') {
      const existingPersonal = await this.repo.findPersonalProfileByAccountId(accountId);
      if (existingPersonal) {
        throw new DomainError(
          'ACCOUNT_ALREADY_HAS_PERSONAL_PROFILE',
          'هر حساب کاربری در نسخه MVP حداکثر می‌تواند یک پروفایل فردی (PERSON) داشته باشد.',
          409
        );
      }
    }

    // Validate baseline status
    const baseline = this.validateBaseline(data, profileType);
    const initialStatus = baseline.isComplete ? 'ACTIVE' : 'INCOMPLETE';

    const slug = data.slug ? data.slug.trim().toLowerCase() : this.generateSlug(data);

    // Check slug uniqueness
    const existingWithSlug = await this.repo.findBySlug(slug);
    if (existingWithSlug) {
      throw new DomainError('DUPLICATE_SLUG', 'شناسه یکتا (اسلاگ) انتخابی قبلاً ثبت شده است.', 409);
    }

    const created = await this.repo.create(accountId, {
      ...data,
      profileType,
      slug,
      status: initialStatus,
    });

    await this.repo.recordAuditEvent(
      created.id,
      accountId,
      'profile_created',
      JSON.stringify({ profileType, initialStatus, slug })
    );

    const [credentials, locations, listings] = await Promise.all([
      this.repo.getCredentials(created.id),
      this.repo.getLocations(created.id),
      this.repo.getListingsForProfile(created.accountId),
    ]);

    return this.toOwnerDTO(created, credentials, locations, listings);
  }

  async updateOwnerProfile(
    accountId: string,
    data: UpdateProfileDTO
  ): Promise<OwnerProfileDTO> {
    const existing = await this.getOwnerProfile(accountId);
    if (!existing) {
      throw new DomainError(
        'PROFILE_NOT_FOUND',
        'پروفایلی برای این حساب کاربری یافت نشد. لطفاً ابتدا پروفایل ایجاد کنید.',
        404
      );
    }

    // Merge data for baseline check
    const mergedForBaseline = {
      profileType: data.profileType || existing.profileType,
      firstName: data.firstName !== undefined ? data.firstName : existing.firstName,
      lastName: data.lastName !== undefined ? data.lastName : existing.lastName,
      businessName: data.businessName !== undefined ? data.businessName : existing.businessName,
      workGroup: data.workGroup !== undefined ? data.workGroup : existing.workGroup,
      activityDomain: data.activityDomain !== undefined ? data.activityDomain : existing.activityDomain,
      specialties: data.specialties !== undefined ? data.specialties : existing.specialties,
    };

    const baseline = this.validateBaseline(
      mergedForBaseline,
      mergedForBaseline.profileType as ProfileType
    );

    // Lifecycle status transition rule
    let targetStatus = data.status || existing.status;
    if (data.status === 'ACTIVE' && !baseline.isComplete) {
      throw new DomainError(
        'BASELINE_VALIDATION_FAILED',
        `برای فعال‌سازی پروفایل، تکمیل اطلاعات الزامی است: ${baseline.missingFields.join('، ')}`,
        422
      );
    } else if (baseline.isComplete && existing.status === 'INCOMPLETE' && !data.status) {
      targetStatus = 'ACTIVE';
    }

    const updated = await this.repo.update(existing.id, {
      ...data,
      status: targetStatus,
    });

    await this.repo.recordAuditEvent(
      existing.id,
      accountId,
      'profile_updated',
      JSON.stringify({ updatedFields: Object.keys(data), targetStatus })
    );

    const [credentials, locations, listings] = await Promise.all([
      this.repo.getCredentials(existing.id),
      this.repo.getLocations(existing.id),
      this.repo.getListingsForProfile(existing.accountId),
    ]);

    return this.toOwnerDTO(updated, credentials, locations, listings);
  }

  async addCredential(
    accountId: string,
    credential: ProfileCredentialDTO
  ): Promise<ProfileCredentialRecord> {
    const profile = await this.getOwnerProfile(accountId);
    if (!profile) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل یافت نشد.', 404);
    }

    if (!credential.title || credential.title.trim() === '') {
      throw new DomainError('VALIDATION_ERROR', 'عنوان مدرک الزامی است.', 422);
    }
    if (!credential.fileUrl || credential.fileUrl.trim() === '') {
      throw new DomainError('VALIDATION_ERROR', 'فایل مدرک الزامی است.', 422);
    }

    const created = await this.repo.addCredential(profile.id, credential);
    await this.repo.recordAuditEvent(
      profile.id,
      accountId,
      'credential_added',
      JSON.stringify({ title: credential.title })
    );

    return created;
  }

  async removeCredential(accountId: string, credentialId: string): Promise<boolean> {
    const profile = await this.getOwnerProfile(accountId);
    if (!profile) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل یافت نشد.', 404);
    }

    const ok = await this.repo.removeCredential(credentialId, profile.id);
    if (ok) {
      await this.repo.recordAuditEvent(
        profile.id,
        accountId,
        'credential_removed',
        JSON.stringify({ credentialId })
      );
    }
    return ok;
  }

  async addLocation(
    accountId: string,
    location: ProfileLocationDTO
  ): Promise<ProfileLocationRecord> {
    const profile = await this.getOwnerProfile(accountId);
    if (!profile) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل یافت نشد.', 404);
    }

    if (!location.unitTitle || location.unitTitle.trim() === '') {
      throw new DomainError('VALIDATION_ERROR', 'عنوان واحد کاری الزامی است.', 422);
    }
    if (!location.province || !location.city || !location.address) {
      throw new DomainError('VALIDATION_ERROR', 'استان، شهر و نشانی واحد الزامی است.', 422);
    }

    const created = await this.repo.addLocation(profile.id, location);
    await this.repo.recordAuditEvent(
      profile.id,
      accountId,
      'location_added',
      JSON.stringify({ unitTitle: location.unitTitle, city: location.city })
    );

    return created;
  }

  async removeLocation(accountId: string, locationId: string): Promise<boolean> {
    const profile = await this.getOwnerProfile(accountId);
    if (!profile) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل یافت نشد.', 404);
    }

    const ok = await this.repo.removeLocation(locationId, profile.id);
    if (ok) {
      await this.repo.recordAuditEvent(
        profile.id,
        accountId,
        'location_removed',
        JSON.stringify({ locationId })
      );
    }
    return ok;
  }

  async rateProfile(
    profileId: string,
    raterAccountId: string,
    dto: RateProfileDTO
  ): Promise<{ rating: number; ratingsCount: number }> {
    const profile = await this.repo.findById(profileId);
    if (!profile) {
      throw new DomainError('PROFILE_NOT_FOUND', 'پروفایل مورد نظر یافت نشد.', 404);
    }

    // Ownership check: Self-rating is strictly forbidden
    if (profile.accountId === raterAccountId) {
      throw new DomainError(
        'SELF_RATING_NOT_ALLOWED',
        'ثبت امتیاز برای پروفایل خود مجاز نیست.',
        400
      );
    }

    // Meaningful interaction check
    const allowedInteractions = ['deal', 'collaboration', 'inquiry', 'service_order'];
    if (!dto.interactionType || !allowedInteractions.includes(dto.interactionType)) {
      throw new DomainError(
        'INVALID_INTERACTION_FOR_RATING',
        'مشاهده صرف پروفایل تعامل معنادار محسوب نمی‌شود. ثبت امتیاز نیازمند تعامل کاری است.',
        400
      );
    }

    const score = Number(dto.score);
    if (isNaN(score) || score < 1 || score > 5) {
      throw new DomainError('INVALID_SCORE', 'امتیاز باید عددی بین ۱ تا ۵ باشد.', 422);
    }

    // Check if rater already rated
    const existing = await this.repo.getExistingRating(profileId, raterAccountId);
    if (existing) {
      throw new DomainError(
        'ALREADY_RATED',
        'شما قبلاً برای این پروفایل امتیاز ثبت کرده‌اید.',
        409
      );
    }

    await this.repo.recordRating(profileId, raterAccountId, {
      score,
      interactionType: dto.interactionType,
      privateRationale: dto.privateRationale,
    });

    const agg = await this.repo.updateRatingAggregate(profileId);

    await this.repo.recordAuditEvent(
      profileId,
      raterAccountId,
      'rating_submitted',
      JSON.stringify({ interactionType: dto.interactionType, score })
    );

    return {
      rating: parseFloat(agg.rating),
      ratingsCount: agg.ratingsCount,
    };
  }

  async recordInteractionEvent(
    profileId: string,
    actorId: string,
    eventType: string,
    metadata?: string
  ): Promise<void> {
    await this.repo.recordAuditEvent(profileId, actorId, eventType, metadata);
  }

  private toPublicDTO(
    record: ProfileRecord,
    credentials: ProfileCredentialRecord[],
    locations: ProfileLocationRecord[],
    listings: any[]
  ): PublicProfileDTO {
    const isPerson = record.profileType === 'PERSON';
    const displayName = isPerson
      ? `${record.firstName || ''} ${record.lastName || ''}`.trim() ||
        record.businessName ||
        'کاربر متخصص تاروپود'
      : record.businessName || 'مجموعه صنعتی نساجی';

    let socialLinks: Record<string, string> = {};
    if (record.socialLinks) {
      try {
        socialLinks = JSON.parse(record.socialLinks);
      } catch {
        socialLinks = {};
      }
    }

    return {
      id: record.id,
      slug: record.slug,
      profileType: record.profileType,
      status: record.status,
      displayName,
      firstName: record.firstName,
      lastName: record.lastName,
      businessName: record.businessName,
      workGroup: record.workGroup,
      activityDomain: record.activityDomain,
      specialties: record.specialties || [],
      avatarUrl: record.avatarUrl,
      headerUrl: record.headerUrl,
      bio: record.bio,
      yearsActive: record.yearsActive,
      primaryProducts: record.primaryProducts || [],
      secondaryProducts: record.secondaryProducts || [],
      services: record.services || [],
      capacitySummary: record.capacitySummary,
      workingHours: record.workingHours,
      workingDays: record.workingDays || [],
      geographicScope: record.geographicScope,
      collaborationModes: record.collaborationModes || [],
      shippingCapability: record.shippingCapability,
      onsiteServiceCapability: record.onsiteServiceCapability,
      contacts: {
        phone: record.phone,
        mobile: record.mobile,
        whatsapp: record.whatsapp,
        telegram: record.telegram,
        email: record.email,
      },
      website: {
        url: record.websiteUrl,
        status: (record.websiteStatus as any) || 'SUBMITTED',
      },
      socialLinks,
      rating: parseFloat(record.rating) || 5.0,
      ratingsCount: record.ratingsCount || 0,
      isVerified: record.isVerified,
      credentials: credentials.map((c) => ({
        id: c.id,
        title: c.title,
        issueDate: c.issueDate,
        validityDate: c.validityDate,
        fileUrl: c.fileUrl,
        description: c.description,
        isOfficiallyVerified: c.isOfficiallyVerified,
      })),
      locations: locations.map((loc) => ({
        id: loc.id,
        unitTitle: loc.unitTitle,
        unitType: loc.unitType as any,
        country: loc.country,
        province: loc.province,
        city: loc.city,
        area: loc.area,
        address: loc.address,
        postalCode: loc.postalCode,
        phone: loc.phone,
        latitude: loc.latitude ? parseFloat(loc.latitude) : null,
        longitude: loc.longitude ? parseFloat(loc.longitude) : null,
        isApproximate: loc.isApproximate,
        isPrimary: loc.isPrimary,
      })),
      listingsCount: listings.length,
      listings,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private toOwnerDTO(
    record: ProfileRecord,
    credentials: ProfileCredentialRecord[],
    locations: ProfileLocationRecord[],
    listings: any[]
  ): OwnerProfileDTO {
    const publicData = this.toPublicDTO(record, credentials, locations, listings);
    const baseline = this.validateBaseline(
      {
        profileType: record.profileType,
        firstName: record.firstName,
        lastName: record.lastName,
        businessName: record.businessName,
        workGroup: record.workGroup,
        activityDomain: record.activityDomain,
        specialties: record.specialties,
      },
      record.profileType
    );

    return {
      ...publicData,
      accountId: record.accountId,
      baseline,
      isOwner: true,
    };
  }
}

export const profilesService = new ProfilesService();
