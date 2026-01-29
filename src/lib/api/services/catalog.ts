/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Catalog Items API Service
 * CRUD operations for product catalog (asset master data)
 */

import { BaseService } from "../base-service";
import type { CatalogItem } from "@/lib/schema/consolidated-types";

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG ITEMS SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class CatalogItemService extends BaseService<CatalogItem> {
  constructor() {
    super({
      table: "catalog_items",
      defaultOrder: { column: "name", ascending: true },
    });
  }

  protected buildSearchFilter(search: string): string {
    return `name.ilike.%${search}%,sku.ilike.%${search}%,manufacturer.ilike.%${search}%,model.ilike.%${search}%`;
  }

  async getBySku(sku: string, organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .eq("sku", sku)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: false, error: { code: "NOT_FOUND", message: "Catalog item not found" } };
        }
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async listByCategory(categoryId: string, organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        category_id: categoryId,
        is_active: true,
      },
    });
  }

  async listRentable(organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        is_rentable: true,
        is_active: true,
      },
    });
  }

  async listPurchasable(organizationId: string) {
    return this.list({
      filters: {
        organization_id: organizationId,
        is_purchasable: true,
        is_active: true,
      },
    });
  }

  async listByManufacturer(manufacturer: string, organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("*")
        .eq("organization_id", organizationId)
        .ilike("manufacturer", `%${manufacturer}%`)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      return { success: true, data: { items: data || [], pagination: { total: data?.length || 0 } } };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getWithAssets(id: string) {
    try {
      const { data, error } = await this.table()
        .select(`
          *,
          assets(
            id,
            asset_tag,
            serial_number,
            name,
            status,
            condition,
            location_id
          )
        `)
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

  async updatePricing(id: string, unitCost?: number, rentalRate?: number) {
    const updates: Partial<CatalogItem> = {};
    if (unitCost !== undefined) updates.default_unit_cost = unitCost;
    if (rentalRate !== undefined) updates.default_rental_rate = rentalRate;
    return this.update(id, updates);
  }

  async deactivate(id: string) {
    return this.update(id, { is_active: false } as Partial<CatalogItem>);
  }

  async activate(id: string) {
    return this.update(id, { is_active: true } as Partial<CatalogItem>);
  }

  async getManufacturers(organizationId: string) {
    try {
      const { data, error } = await this.table()
        .select("manufacturer")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .not("manufacturer", "is", null);

      if (error) {
        return { success: false, error: { code: error.code, message: error.message } };
      }

      // Get unique manufacturers
      const manufacturers = [...new Set((data || []).map((d: { manufacturer: string }) => d.manufacturer))];
      return { success: true, data: manufacturers };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }
}

export const catalogItemService = new CatalogItemService();
