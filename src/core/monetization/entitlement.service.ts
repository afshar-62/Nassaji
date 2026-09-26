import {
  PublicationPackage,
  PackageEntitlementConsumption,
  ListingPaymentTransaction,
  ListingPublicationSettlement,
  PublicationSettlementMethod,
  ListingIntent,
} from '../../types';

export interface EligibilityResult {
  canPublish: boolean;
  settlementMethod: PublicationSettlementMethod;
  activePackage: PublicationPackage | null;
  singlePaymentAvailable: boolean;
  policyNote: string;
}

/**
 * Taropod Monetization & Publication Entitlement Service
 *
 * Implements strict transaction safety rules:
 * 1. Form opening NEVER consumes package units or charges fees.
 * 2. Drafting / Intent selection NEVER consumes package units.
 * 3. Cancel / Discard NEVER consumes package units.
 * 4. Failed payment NEVER consumes package units.
 * 5. Package capacity decrements by EXACTLY 1 upon successful publication.
 */
class EntitlementService {
  // In-memory persistent stores for client-side / prototype mode
  private packagesStore: Map<string, PublicationPackage> = new Map();
  private consumptionsStore: PackageEntitlementConsumption[] = [];
  private paymentTransactionsStore: ListingPaymentTransaction[] = [];
  private settlementsStore: Map<string, ListingPublicationSettlement> = new Map();

  constructor() {
    this.seedDefaultState();
  }

  private seedDefaultState() {
    // Seed an initial business package account state for demonstration (without hardcoded prices)
    const seedPackageId = 'pkg-taropod-commercial-01';
    this.packagesStore.set(seedPackageId, {
      id: seedPackageId,
      accountId: 'user-default-account',
      planId: 'b2b-growth-tier',
      title: 'بسته اشتراک تجاری تاروپود',
      totalCapacity: 5,
      remainingCapacity: 5,
      validFrom: new Date(Date.now() - 7 * 86400000).toISOString(),
      validUntil: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    });
  }

  /**
   * Checks whether the user can publish via an active package or requires single-listing payment.
   * Does NOT consume any capacity or trigger any financial charges.
   */
  public checkPublicationEligibility(accountId: string = 'user-default-account'): EligibilityResult {
    const now = new Date();
    const activePackages = Array.from(this.packagesStore.values()).filter((pkg) => {
      const isOwner = pkg.accountId === accountId;
      const isActiveStatus = pkg.status === 'ACTIVE';
      const hasCapacity = pkg.remainingCapacity > 0;
      const isValidDate = new Date(pkg.validFrom) <= now && now <= new Date(pkg.validUntil);
      return isOwner && isActiveStatus && hasCapacity && isValidDate;
    });

    if (activePackages.length > 0) {
      const bestPackage = activePackages[0];
      return {
        canPublish: true,
        settlementMethod: 'PACKAGE_ENTITLEMENT',
        activePackage: bestPackage,
        singlePaymentAvailable: true,
        policyNote: `شما دارای بسته فعال «${bestPackage.title}» با ${bestPackage.remainingCapacity} ظرفیت انتشار معتبر هستید.`,
      };
    }

    return {
      canPublish: true,
      settlementMethod: 'SINGLE_PAYMENT',
      activePackage: null,
      singlePaymentAvailable: true,
      policyNote: 'بسته اشتراک فعالی یافت نشد؛ انتشار این آگاهی از طریق پرداخت تکی انجام می‌پذیرد.',
    };
  }

  /**
   * Transaction Safety Check: Form Opening
   * Guarantees zero side-effects on packages or transactions.
   */
  public onFormOpen(accountId: string): { status: 'SAFE'; unitsConsumed: 0 } {
    // Explicitly no-op to adhere to Section 9 (Transaction Safety)
    return { status: 'SAFE', unitsConsumed: 0 };
  }

  /**
   * Transaction Safety Check: Draft Creation / Intent Selection
   * Guarantees zero side-effects when selecting 'OFFER' or 'DEMAND'.
   */
  public onDraftIntentSelected(intent: ListingIntent): { status: 'DRAFT_SAVED'; unitsConsumed: 0 } {
    // Explicitly no-op to adhere to Section 10 (Draft Support)
    return { status: 'DRAFT_SAVED', unitsConsumed: 0 };
  }

  /**
   * Final Publication Settlement
   * Consumes exactly ONE unit from the package, OR confirms single payment.
   */
  public executePublicationSettlement(params: {
    listingId: string;
    accountId: string;
    method: PublicationSettlementMethod;
    packageId?: string;
  }): { success: boolean; settlement: ListingPublicationSettlement; remainingCapacity?: number; error?: string } {
    const { listingId, accountId, method, packageId } = params;

    // Check if this listing was already settled to prevent double consumption
    if (this.settlementsStore.has(listingId)) {
      const existing = this.settlementsStore.get(listingId)!;
      if (existing.isEntitlementConsumed) {
        return {
          success: false,
          settlement: existing,
          error: 'این آگاهی قبلاً منتشر شده و تسویه گردیده است (جلوگیری از کسر مضاعف).',
        };
      }
    }

    if (method === 'PACKAGE_ENTITLEMENT') {
      const pkg = packageId ? this.packagesStore.get(packageId) : Array.from(this.packagesStore.values())[0];
      if (!pkg || pkg.remainingCapacity <= 0 || pkg.status !== 'ACTIVE') {
        return {
          success: false,
          settlement: {
            listingId,
            method: 'PACKAGE_ENTITLEMENT',
            isEntitlementConsumed: false,
          },
          error: 'ظرفیت بسته به اتمام رسیده یا بسته منقضی شده است.',
        };
      }

      // Exactly ONE unit consumed
      pkg.remainingCapacity -= 1;
      if (pkg.remainingCapacity === 0) {
        pkg.status = 'EXHAUSTED';
      }

      const consumptionRecord: PackageEntitlementConsumption = {
        id: `cns-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        packageId: pkg.id,
        listingId,
        consumedByAccountId: accountId,
        consumedAt: new Date().toISOString(),
        unitsConsumed: 1,
      };
      this.consumptionsStore.push(consumptionRecord);

      const settlement: ListingPublicationSettlement = {
        listingId,
        method: 'PACKAGE_ENTITLEMENT',
        packageId: pkg.id,
        isEntitlementConsumed: true,
        consumedAt: consumptionRecord.consumedAt,
      };
      this.settlementsStore.set(listingId, settlement);

      return {
        success: true,
        settlement,
        remainingCapacity: pkg.remainingCapacity,
      };
    } else {
      // Single payment flow
      const tx: ListingPaymentTransaction = {
        id: `tx-${Date.now()}`,
        listingId,
        payerAccountId: accountId,
        amount: null, // Left null until price rules are defined by business
        status: 'SUCCESSFUL',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.paymentTransactionsStore.push(tx);

      const settlement: ListingPublicationSettlement = {
        listingId,
        method: 'SINGLE_PAYMENT',
        paymentTransactionId: tx.id,
        isEntitlementConsumed: true,
        consumedAt: tx.paidAt,
      };
      this.settlementsStore.set(listingId, settlement);

      return {
        success: true,
        settlement,
      };
    }
  }

  /**
   * Retrieve settlement audit info for any listing
   */
  public getListingSettlement(listingId: string): ListingPublicationSettlement | undefined {
    return this.settlementsStore.get(listingId);
  }
}

export const entitlementService = new EntitlementService();
