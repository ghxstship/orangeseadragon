/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Table not yet in generated types until migration runs
/**
 * Addresses API Service
 * CRUD operations for normalized address management
 */

import { BaseService } from "../base-service";

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AddressType = 'general' | 'billing' | 'shipping' | 'venue' | 'warehouse' | 'office' | 'home' | 'event';

export interface Address {
  id: string;
  organization_id: string;
  address_type: AddressType;
  label?: string;
  street_line_1: string;
  street_line_2?: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  country_code: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  verified_at?: string;
  verification_source?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressInsert = Omit<Address, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'verified_at'>;
export type AddressUpdate = Partial<AddressInsert>;

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class AddressService extends BaseService<Address> {
  constructor() {
    super({
      table: "addresses",
      defaultOrder: { column: "created_at", ascending: false },
    });
  }

  protected buildSearchFilter(search: string): string {
    return `street_line_1.ilike.%${search}%,city.ilike.%${search}%,label.ilike.%${search}%`;
  }

  async listByType(addressType: AddressType, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        address_type: addressType,
        is_active: true,
      },
    });
  }

  async listByCity(city: string, organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .ilike("city", `%${city}%`)
        .eq("is_active", true)
        .order("label", { ascending: true });

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async listByCountry(countryCode: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        country_code: countryCode,
        is_active: true,
      },
    });
  }

  async getFormatted(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("formatted_addresses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async markVerified(id: string, source: string = 'manual') {
    return this.update(id, {
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_source: source,
    } as Partial<Address>);
  }

  async geocode(id: string, latitude: number, longitude: number) {
    return this.update(id, {
      latitude,
      longitude,
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_source: 'geocoding',
    } as Partial<Address>);
  }

  async deactivate(id: string) {
    return this.update(id, { is_active: false } as Partial<Address>);
  }

  async activate(id: string) {
    return this.update(id, { is_active: true } as Partial<Address>);
  }

  formatSingleLine(address: Address): string {
    const parts = [
      address.street_line_1,
      address.street_line_2,
      address.city,
      [address.state_province, address.postal_code].filter(Boolean).join(' '),
      address.country_code !== 'US' ? address.country : null,
    ].filter(Boolean);
    return parts.join(', ');
  }

  formatMultiLine(address: Address): string {
    const lines = [
      address.street_line_1,
      address.street_line_2,
      [address.city, [address.state_province, address.postal_code].filter(Boolean).join(' ')].filter(Boolean).join(', '),
      address.country_code !== 'US' ? address.country : null,
    ].filter(Boolean);
    return lines.join('\n');
  }

  async findNearby(latitude: number, longitude: number, radiusMiles: number, organizationId: string) {
    // Haversine formula approximation using bounding box
    const latDelta = radiusMiles / 69.0; // ~69 miles per degree latitude
    const lonDelta = radiusMiles / (69.0 * Math.cos(latitude * Math.PI / 180));

    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .not("latitude", "is", null)
        .gte("latitude", latitude - latDelta)
        .lte("latitude", latitude + latDelta)
        .gte("longitude", longitude - lonDelta)
        .lte("longitude", longitude + lonDelta);

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      // Calculate actual distances and filter
      const withDistances = (data || []).map((addr: Address) => {
        const distance = this.calculateDistance(
          latitude, longitude,
          addr.latitude!, addr.longitude!
        );
        return { ...addr, distance_miles: distance };
      }).filter((addr: Address & { distance_miles: number }) => addr.distance_miles <= radiusMiles)
        .sort((a: { distance_miles: number }, b: { distance_miles: number }) => a.distance_miles - b.distance_miles);

      return { success: true, data: { items: withDistances, pagination: { total: withDistances.length } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const addressService = new AddressService();
