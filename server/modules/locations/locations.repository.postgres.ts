import { db } from '../../../src/db/index.ts';
import { businesses, listings, listingLocations, locations } from '../../../src/db/schema.ts';
import { eq, isNotNull } from 'drizzle-orm';
import {
  BusinessLocationItem,
  LocationsRepositoryPort,
} from './locations.repository.port.ts';

// Known industrial cluster fallback coordinates for major textile hubs in Iran
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'تهران': { lat: 35.6997, lng: 51.4085 },
  'اصفهان': { lat: 32.6546, lng: 51.6680 },
  'کاشان': { lat: 33.9850, lng: 51.4100 },
  'تبریز': { lat: 38.0800, lng: 46.2919 },
  'یزد': { lat: 31.8974, lng: 54.3569 },
  'قزوین': { lat: 36.2797, lng: 50.0049 },
  'مشهد': { lat: 36.2972, lng: 59.6067 },
  'شیراز': { lat: 29.5918, lng: 52.5837 },
  'قم': { lat: 34.6401, lng: 50.8764 },
  'اراک': { lat: 34.0954, lng: 49.7013 },
};

export class PostgresLocationsRepository implements LocationsRepositoryPort {
  async getBusinessLocations(): Promise<BusinessLocationItem[]> {
    const allBusinesses = await db.select().from(businesses);

    // Find linked locations from listings
    const businessLocationsMap = new Map<string, { lat: number; lng: number }>();

    const linkedRows = await db
      .select({
        businessId: listings.businessId,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(listings)
      .innerJoin(listingLocations, eq(listings.id, listingLocations.listingId))
      .innerJoin(locations, eq(listingLocations.locationId, locations.id))
      .where(isNotNull(locations.latitude));

    for (const row of linkedRows) {
      if (row.latitude && row.longitude && !businessLocationsMap.has(row.businessId)) {
        businessLocationsMap.set(row.businessId, {
          lat: Number(row.latitude),
          lng: Number(row.longitude),
        });
      }
    }

    return allBusinesses.map((biz) => {
      const explicitCoords = businessLocationsMap.get(biz.id);
      const defaultCoords = CITY_COORDINATES[biz.city] || CITY_COORDINATES['تهران'];

      return {
        businessId: biz.id,
        name: biz.name,
        latitude: explicitCoords ? explicitCoords.lat : defaultCoords.lat,
        longitude: explicitCoords ? explicitCoords.lng : defaultCoords.lng,
        city: biz.city,
        province: biz.province,
        address: biz.address,
        isVerified: biz.isVerified,
      };
    });
  }
}

export const locationsRepository = new PostgresLocationsRepository();
